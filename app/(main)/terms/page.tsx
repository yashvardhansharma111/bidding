import type { Metadata } from "next";
import type React from "react";
import { Shield, RotateCcw, Package, Gavel, Wallet, Truck, AlertTriangle, CheckCircle } from "lucide-react";

interface ContentBlock {
  subtitle?: string;
  text?: string;
  list?: string[];
}

export const metadata: Metadata = {
  title: "Terms & Conditions — CashBid",
  description: "CashBid Terms & Conditions, Warranty Policy, and Platform Rules.",
};

const sections: {
  icon: React.ElementType;
  number: string;
  title: string;
  color: string;
  bg: string;
  content: ContentBlock[];
}[] = [
  {
    icon: Gavel,
    number: "1",
    title: "Auction Devices (Hidden Bidding)",
    color: "text-blue-600",
    bg: "bg-blue-50",
    content: [
      {
        subtitle: "Warranty",
        text: "All Auction Devices are covered by a 2-Day Check Warranty from the date of delivery.",
      },
      {
        subtitle: "Return Eligibility",
        text: "A return request may be accepted if:",
        list: [
          "Device does not power on",
          "Display is not functional",
          "Touchscreen is not functional",
          "Device has a major issue not disclosed in the listing",
        ],
      },
      {
        subtitle: "Warranty Void Conditions",
        text: "Warranty will be void if:",
        list: [
          "CashBid security seal is removed or damaged",
          "Device is physically damaged after delivery",
          "Device has water/liquid damage",
          "Device has been opened, repaired, or modified",
          "IMEI or serial number has been altered",
        ],
      },
    ],
  },
  {
    icon: RotateCcw,
    number: "2",
    title: "Refurbished Devices",
    color: "text-green-600",
    bg: "bg-green-50",
    content: [
      {
        subtitle: "Fixed Price Products",
        text: "Refurbished devices are sold at fixed prices and are not part of the bidding system.",
      },
      {
        subtitle: "Delivery Warranty Only",
        text: "CashBid guarantees only that:",
        list: ["Device powers on", "Display is functional upon delivery"],
      },
      {
        subtitle: "Return Eligibility",
        text: "Returns will only be accepted if:",
        list: [
          "Device is dead on arrival (DOA)",
          "Display is non-functional upon delivery",
        ],
      },
      {
        subtitle: "No Further Warranty",
        text: "After delivery verification, no return, no refund, and no warranty will be applicable.",
      },
    ],
  },
  {
    icon: Package,
    number: "3",
    title: "Bulk Lots / Wholesale Lots",
    color: "text-orange-600",
    bg: "bg-orange-50",
    content: [
      {
        subtitle: "Fixed Price Bulk Inventory",
        text: "Bulk lots may contain Grade A, B, C, or D devices as mentioned in the listing.",
      },
      {
        subtitle: "Sold As Is, Where Is",
        text: "All Bulk Lots are sold on an \"As Is, Where Is\" basis with:",
        list: [
          "No Coverage",
          "No Warranty",
          "No Return",
          "No Refund",
          "No Exchange",
        ],
      },
      {
        subtitle: "Buyer's Responsibility",
        text: "Buyers are advised to review lot details carefully before purchase.",
      },
    ],
  },
  {
    icon: Shield,
    number: "4",
    title: "Hidden Bidding Rules",
    color: "text-purple-600",
    bg: "bg-purple-50",
    content: [
      {
        text: "",
        list: [
          "All bids placed are final",
          "Hidden bids are not visible to other users",
          "Highest valid bid at auction end wins",
          "CashBid reserves the right to cancel suspicious or fraudulent bids",
        ],
      },
    ],
  },
  {
    icon: CheckCircle,
    number: "5",
    title: "Winner Payment Policy",
    color: "text-teal-600",
    bg: "bg-teal-50",
    content: [
      {
        text: "",
        list: [
          "Winning bidder must complete payment within 24 hours",
          "Failure to complete payment may result in account suspension",
          "CashBid reserves the right to relist the device",
        ],
      },
    ],
  },
  {
    icon: Wallet,
    number: "6",
    title: "Wallet Policy",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    content: [
      {
        text: "",
        list: [
          "Users must maintain the required wallet balance to participate in auctions",
          "Wallet balance remains in the user's account for future use",
          "Wallet balances are non-withdrawable",
          "Wallet credits may be used for eligible discounts and platform benefits",
        ],
      },
    ],
  },
  {
    icon: Shield,
    number: "7",
    title: "Device Condition",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    content: [
      {
        text: "All devices are sold according to the description, images, and condition stated in the listing. Buyers must review device condition, storage variant, battery information (if available), and grade information before placing bids or orders.",
      },
    ],
  },
  {
    icon: Truck,
    number: "8",
    title: "Shipping & Delivery",
    color: "text-blue-600",
    bg: "bg-blue-50",
    content: [
      {
        text: "",
        list: [
          "Orders will be shipped through approved courier partners",
          "Delivery timelines may vary by location",
          "Risk of loss transfers to the buyer upon successful delivery",
        ],
      },
    ],
  },
  {
    icon: AlertTriangle,
    number: "9",
    title: "Fraud Prevention",
    color: "text-red-600",
    bg: "bg-red-50",
    content: [
      {
        text: "CashBid reserves the right to suspend accounts, cancel transactions, and reject bids in cases of fraud, misuse, fake orders, or suspicious activity.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2874F0] rounded-2xl mb-4">
          <Shield size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Terms &amp; Conditions</h1>
        <p className="text-gray-400 text-sm mt-2">Last Updated: August 2026</p>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
          Welcome to CashBid. By using our platform, you agree to the following terms and conditions.
        </p>
      </div>

      {/* Quick nav */}
      <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Contents</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {sections.map((s) => (
            <a
              key={s.number}
              href={`#section-${s.number}`}
              className="text-sm text-[#2874F0] hover:underline flex items-center gap-1.5"
            >
              <span className="w-5 h-5 rounded-full bg-[#2874F0] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {s.number}
              </span>
              {s.title}
            </a>
          ))}
          <a href="#section-10" className="text-sm text-[#2874F0] hover:underline flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#2874F0] text-white text-[10px] font-bold flex items-center justify-center shrink-0">10</span>
            Acceptance
          </a>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.number}
              id={`section-${section.number}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Section header */}
              <div className={`${section.bg} px-5 py-4 flex items-center gap-3 border-b border-gray-100`}>
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon size={18} className={section.color} />
                </div>
                <div>
                  <span className={`text-xs font-bold ${section.color} uppercase tracking-wide`}>
                    Section {section.number}
                  </span>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">{section.title}</h2>
                </div>
              </div>

              {/* Section content */}
              <div className="px-5 py-4 space-y-4">
                {section.content.map((block, i) => (
                  <div key={i}>
                    {block.subtitle && (
                      <p className="text-sm font-bold text-gray-800 mb-1">{block.subtitle}</p>
                    )}
                    {block.text && (
                      <p className="text-sm text-gray-600 leading-relaxed">{block.text}</p>
                    )}
                    {block.list && (
                      <ul className="mt-2 space-y-1.5">
                        {block.list.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2874F0] mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Section 10: Acceptance */}
        <div id="section-10" className="bg-gradient-to-br from-[#0f172a] to-[#2874F0] rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-[#FFE500]" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">Section 10</span>
              <h2 className="font-bold text-white text-base leading-tight">Acceptance</h2>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            By registering, bidding, purchasing, or using CashBid, users acknowledge and agree to all Terms &amp; Conditions, Warranty Policies, and Platform Rules stated above.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 mt-8">
        &copy; {new Date().getFullYear()} CashBid. All rights reserved. &nbsp;·&nbsp; cashbid.in
      </p>
    </div>
  );
}
