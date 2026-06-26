"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import type { IAuction } from "@/types";
import { ImageUploader } from "./ImageUploader";
import { ExcelUploader } from "./ExcelUploader";

interface AuctionFormProps {
  initialData?: IAuction;
  auctionId?: string;
}

const EMPTY_FORM = {
  title: "",
  brand: "",
  model: "",
  condition: "refurbished" as const,
  imei: "",
  batchId: "",
  description: "",
  images: [] as string[],
  category: "individual" as const,
  quantity: 1,
  bulkWinnerType: "winner_takes_all" as const,
  topNWinners: 1,
  baseBidPrice: 1000,
  minIncrement: 100,
  buyNowPrice: "",
  warranty: "",
  excelFile: "",
  startTime: "",
  endTime: "",
  sellerSource: "warehouse" as const,
  deliveryCharges: 0,
  specs: { ram: "", storage: "", processor: "", battery: "", display: "", camera: "", os: "", color: "" },
};

const DUMMY_PRESETS = [
  {
    label: "iPhone 14 Pro",
    data: {
      title: "Apple iPhone 14 Pro 256GB Space Black – Refurbished",
      brand: "Apple",
      model: "iPhone 14 Pro",
      condition: "refurbished" as const,
      imei: "354723112345678",
      batchId: "",
      description: "Excellent condition iPhone 14 Pro sourced from Flipkart liquidation. Minor cosmetic marks, fully functional. Battery health 91%. Comes with original box and cable.",
      images: [] as string[],
      category: "individual" as const,
      quantity: 1,
      bulkWinnerType: "winner_takes_all" as const,
      topNWinners: 1,
      baseBidPrice: 42000,
      minIncrement: 500,
      buyNowPrice: "58000",
      sellerSource: "flipkart_liquidation" as const,
      deliveryCharges: 99,
      specs: { ram: "6GB", storage: "256GB", processor: "A16 Bionic", battery: "3200mAh", display: "6.1\" OLED ProMotion", camera: "48MP + 12MP + 12MP", os: "iOS 17", color: "Space Black" },
    },
  },
  {
    label: "Samsung S23 Ultra",
    data: {
      title: "Samsung Galaxy S23 Ultra 512GB Phantom Black – Open Box",
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      condition: "open_box" as const,
      imei: "356123987654321",
      batchId: "",
      description: "Open box Samsung Galaxy S23 Ultra. Never activated. All original accessories included. Sourced from warehouse overstock.",
      images: [] as string[],
      category: "individual" as const,
      quantity: 1,
      bulkWinnerType: "winner_takes_all" as const,
      topNWinners: 1,
      baseBidPrice: 55000,
      minIncrement: 1000,
      buyNowPrice: "78000",
      sellerSource: "warehouse" as const,
      deliveryCharges: 0,
      specs: { ram: "12GB", storage: "512GB", processor: "Snapdragon 8 Gen 2", battery: "5000mAh", display: "6.8\" Dynamic AMOLED", camera: "200MP + 12MP + 10MP + 10MP", os: "Android 14", color: "Phantom Black" },
    },
  },
  {
    label: "Bulk Lot – Xiaomi",
    data: {
      title: "Xiaomi Redmi Note 12 Bulk Lot – 10 Units Mixed Storage",
      brand: "Xiaomi",
      model: "Redmi Note 12",
      condition: "used" as const,
      imei: "",
      batchId: "BATCH-XMI-2024-007",
      description: "Bulk lot of 10 Xiaomi Redmi Note 12 units from dealer stock. Mix of 64GB and 128GB variants. Cosmetic wear expected. All units power on and pass basic diagnostics.",
      images: [] as string[],
      category: "bulk" as const,
      quantity: 10,
      bulkWinnerType: "winner_takes_all" as const,
      topNWinners: 1,
      baseBidPrice: 25000,
      minIncrement: 500,
      buyNowPrice: "40000",
      sellerSource: "dealer" as const,
      deliveryCharges: 299,
      specs: { ram: "4GB / 6GB", storage: "64GB / 128GB", processor: "Snapdragon 685", battery: "5000mAh", display: "6.67\" AMOLED", camera: "50MP + 8MP + 2MP", os: "Android 13 (MIUI 14)", color: "Mixed" },
    },
  },
];

// datetime-local inputs need local time strings (no timezone suffix).
// IST = UTC+5:30, so we add 330 minutes to UTC before slicing.
function toISTInputString(date: Date): string {
  const istMs = date.getTime() + (5 * 60 + 30) * 60 * 1000;
  return new Date(istMs).toISOString().slice(0, 16);
}

export function AuctionForm({ initialData, auctionId }: AuctionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(() => {
    if (!initialData) return EMPTY_FORM;
    return {
      ...EMPTY_FORM,
      ...initialData,
      startTime: toISTInputString(new Date(initialData.startTime)),
      endTime: toISTInputString(new Date(initialData.endTime)),
      buyNowPrice: initialData.buyNowPrice?.toString() || "",
      images: initialData.images.length ? initialData.images : [],
      excelFile: initialData.excelFile || "",
      specs: { ...EMPTY_FORM.specs, ...initialData.specs },
    };
  });
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const setSpec = (key: string, value: string) => setForm((f) => ({ ...f, specs: { ...f.specs, [key]: value } }));

  const fillDummy = (preset: (typeof DUMMY_PRESETS)[number]) => {
    const now = new Date();
    const start = new Date(now.getTime() + 10 * 60 * 1000);
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    setForm((f) => ({
      ...f,
      ...(preset.data as any),
      images: f.images,
      startTime: toISTInputString(start),
      endTime: toISTInputString(end),
    }));
    setDemoOpen(false);
    toast.success(`Filled with "${preset.label}" demo data`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        images: form.images.filter(Boolean),
        buyNowPrice: form.buyNowPrice ? parseFloat(form.buyNowPrice as string) : undefined,
        warranty: form.warranty?.trim() || undefined,
        excelFile: form.excelFile || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };

      if (auctionId) {
        await axios.put(`/api/auctions/${auctionId}`, payload);
        toast.success("Auction updated!");
      } else {
        await axios.post("/api/auctions", payload);
        toast.success("Auction created!");
        router.push("/admin/auctions");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save auction");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2874F0] transition-colors";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
  const selectCls = `${inputCls} bg-white`;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Demo fill */}
      {!auctionId && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setDemoOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-[#2874F0] text-[#2874F0] text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <span>⚡</span> Fill with Demo Data
          </button>
          {demoOpen && (
            <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[220px]">
              {DUMMY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => fillDummy(preset)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2874F0] transition-colors border-b border-gray-50 last:border-0"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900 mb-2">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input required type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="iPhone 14 Pro 256GB Space Black" />
          </div>
          <div>
            <label className={labelCls}>Brand *</label>
            <select required value={form.brand} onChange={(e) => set("brand", e.target.value)} className={selectCls}>
              <option value="">Select brand</option>
              {["Apple","Samsung","OnePlus","Xiaomi","Oppo","Vivo","Realme","Nokia","Google","Sony"].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Model *</label>
            <input required type="text" value={form.model} onChange={(e) => set("model", e.target.value)} className={inputCls} placeholder="iPhone 14 Pro" />
          </div>
          <div>
            <label className={labelCls}>Condition *</label>
            <select required value={form.condition} onChange={(e) => set("condition", e.target.value)} className={selectCls}>
              <option value="new">New</option>
              <option value="open_box">Open Box</option>
              <option value="refurbished">Refurbished</option>
              <option value="used">Used</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>IMEI (optional)</label>
            <input type="text" value={form.imei} onChange={(e) => set("imei", e.target.value)} className={inputCls} placeholder="For individual phones" />
          </div>
          <div>
            <label className={labelCls}>Batch ID (optional)</label>
            <input type="text" value={form.batchId} onChange={(e) => set("batchId", e.target.value)} className={inputCls} placeholder="For bulk lots" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Description *</label>
          <textarea required value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={`${inputCls} resize-none`} placeholder="Detailed description of the phone(s)..." />
        </div>
        <div>
          <label className={labelCls}>Seller Source *</label>
          <select required value={form.sellerSource} onChange={(e) => set("sellerSource", e.target.value)} className={selectCls}>
            <option value="flipkart_liquidation">Flipkart Liquidation</option>
            <option value="warehouse">Warehouse Stock</option>
            <option value="dealer">Dealer</option>
            <option value="customer_resale">Customer Resale</option>
          </select>
        </div>
      </section>

      {/* Specs */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Specifications</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "ram", placeholder: "e.g. 8GB" },
            { key: "storage", placeholder: "e.g. 256GB" },
            { key: "processor", placeholder: "e.g. A16 Bionic" },
            { key: "battery", placeholder: "e.g. 4000mAh" },
            { key: "display", placeholder: "e.g. 6.1 OLED" },
            { key: "camera", placeholder: "e.g. 48MP + 12MP" },
            { key: "os", placeholder: "e.g. iOS 17" },
            { key: "color", placeholder: "e.g. Space Black" },
          ].map(({ key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{key}</label>
              <input type="text" value={(form.specs as any)[key]} onChange={(e) => setSpec(key, e.target.value)} className={`${inputCls} py-2`} placeholder={placeholder} />
            </div>
          ))}
        </div>

        {/* Warranty */}
        <div className="mt-4">
          <label className={labelCls}>Warranty</label>
          <select
            value={form.warranty}
            onChange={(e) => set("warranty", e.target.value)}
            className={inputCls}
          >
            <option value="">No Warranty</option>
            <option value="Under Brand Warranty">Under Brand Warranty</option>
            <option value="1 Month Remaining">1 Month Remaining</option>
            <option value="2 Months Remaining">2 Months Remaining</option>
            <option value="3 Months Remaining">3 Months Remaining</option>
            <option value="6 Months Remaining">6 Months Remaining</option>
            <option value="9 Months Remaining">9 Months Remaining</option>
            <option value="12 Months Remaining">12 Months Remaining</option>
            <option value="18 Months Remaining">18 Months Remaining</option>
            <option value="24 Months Remaining">24 Months Remaining</option>
          </select>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Images</h2>
        <ImageUploader
          value={form.images}
          onChange={(urls) => set("images", urls)}
          maxFiles={8}
        />
      </section>

      {/* Bulk Excel Upload */}
      {form.category === "bulk" && (
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Bulk Lot Excel Sheet</h2>
          <p className="text-xs text-gray-400 mb-4">
            Upload an Excel/CSV file listing all items in this bulk lot (IMEI numbers, conditions, storage, etc.)
          </p>
          <ExcelUploader
            value={form.excelFile}
            onChange={(url) => set("excelFile", url)}
          />
        </section>
      )}

      {/* Auction Settings */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900 mb-2">Auction Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category *</label>
            <select required value={form.category} onChange={(e) => set("category", e.target.value)} className={selectCls}>
              <option value="individual">Individual Phone</option>
              <option value="bulk">Bulk Lot</option>
            </select>
          </div>
          {form.category === "bulk" && (
            <>
              <div>
                <label className={labelCls}>Quantity *</label>
                <input required type="number" min={2} value={form.quantity} onChange={(e) => set("quantity", parseInt(e.target.value))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Winner Type</label>
                <select value={form.bulkWinnerType} onChange={(e) => set("bulkWinnerType", e.target.value)} className={selectCls}>
                  <option value="winner_takes_all">Winner Takes All</option>
                  <option value="top_n_bidders">Top N Bidders</option>
                </select>
              </div>
              {form.bulkWinnerType === "top_n_bidders" && (
                <div>
                  <label className={labelCls}>Number of Winners</label>
                  <input type="number" min={2} value={form.topNWinners} onChange={(e) => set("topNWinners", parseInt(e.target.value))} className={inputCls} />
                </div>
              )}
            </>
          )}
          <div>
            <label className={labelCls}>Base Bid Price (₹) *</label>
            <input required type="number" min={1} value={form.baseBidPrice} onChange={(e) => set("baseBidPrice", parseFloat(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Min Increment (₹) *</label>
            <input required type="number" min={1} value={form.minIncrement} onChange={(e) => set("minIncrement", parseFloat(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>
              {(form.category === "bulk" || form.condition === "refurbished")
                ? "Fixed Sale Price (₹) *"
                : "Buy Now Price (₹)"}
            </label>
            {(form.category === "bulk" || form.condition === "refurbished") && (
              <p className="text-xs text-orange-600 mb-1">Required — this is the final price, no bidding will occur</p>
            )}
            <input
              type="number"
              required={form.category === "bulk" || form.condition === "refurbished"}
              value={form.buyNowPrice}
              onChange={(e) => set("buyNowPrice", e.target.value)}
              className={inputCls}
              placeholder={(form.category === "bulk" || form.condition === "refurbished") ? "Enter fixed price" : "Optional"}
            />
          </div>
          <div>
            <label className={labelCls}>Delivery Charges (₹)</label>
            <input type="number" min={0} value={form.deliveryCharges} onChange={(e) => set("deliveryCharges", parseFloat(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Start Time *</label>
            <input required type="datetime-local" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Time *</label>
            <input required type="datetime-local" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#2874F0] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {auctionId ? "Save Changes" : "Create Auction"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
