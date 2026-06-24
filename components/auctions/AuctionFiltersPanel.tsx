"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface AuctionFiltersPanelProps {
  currentFilters: Record<string, string>;
}

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme", "Nokia"];
const STATUSES = [
  { value: "live",     label: "Live Now"  },
  { value: "upcoming", label: "Upcoming"  },
  { value: "ended",    label: "Ended"     },
];
const RAM_OPTIONS     = ["2GB", "4GB", "6GB", "8GB", "12GB", "16GB"];
const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB"];

export function AuctionFiltersPanel({ currentFilters }: AuctionFiltersPanelProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [local, setLocal] = useState(currentFilters);
  const [mobileOpen, setMobileOpen] = useState(false);

  const apply = (updates: Record<string, string>) => {
    const merged = { ...local, ...updates };
    setLocal(merged);
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`${pathname}?${params.toString()}`);
  };

  const clear = () => {
    setLocal({});
    router.push(pathname);
  };

  const toggle = (key: string, value: string) => {
    apply({ [key]: local[key] === value ? "" : value });
  };

  const hasFilters = Object.values(local).some(Boolean);

  const activeFilterCount = Object.values(local).filter(Boolean).length;

  return (
    <div>
      {/* Mobile toggle */}
      <button
        className="lg:hidden w-full flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-3"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-[#2874F0] text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-5 ${!mobileOpen ? "hidden lg:block" : ""}`}>
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <SlidersHorizontal size={16} />
          Filters
        </div>
        {hasFilters && (
          <button onClick={clear} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>
      {/* Mobile clear button */}
      {hasFilters && (
        <div className="lg:hidden flex justify-end">
          <button onClick={clear} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        </div>
      )}

      {/* Status */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
        <div className="space-y-1.5">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggle("status", value)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${local.status === value ? "bg-[#2874F0] text-white" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Brand</p>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => toggle("brand", brand)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${local.brand === brand ? "bg-[#2874F0] text-white border-[#2874F0]" : "border-gray-200 text-gray-600 hover:border-[#2874F0]"}`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">RAM</p>
        <div className="flex flex-wrap gap-1.5">
          {RAM_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => toggle("ram", r)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${local.ram === r ? "bg-[#2874F0] text-white border-[#2874F0]" : "border-gray-200 text-gray-600 hover:border-[#2874F0]"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Storage */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Storage</p>
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => toggle("storage", s)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${local.storage === s ? "bg-[#2874F0] text-white border-[#2874F0]" : "border-gray-200 text-gray-600 hover:border-[#2874F0]"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Range (₹)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={local.minPrice || ""}
            onChange={(e) => setLocal({ ...local, minPrice: e.target.value })}
            onBlur={(e) => apply({ minPrice: e.target.value })}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-[#2874F0]"
          />
          <input
            type="number"
            placeholder="Max"
            value={local.maxPrice || ""}
            onChange={(e) => setLocal({ ...local, maxPrice: e.target.value })}
            onBlur={(e) => apply({ maxPrice: e.target.value })}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-[#2874F0]"
          />
        </div>
      </div>
    </div>
    </div>
  );
}
