import Link from "next/link";
import { Gavel } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="text-[#FFE500]" size={22} />
              <span className="text-white font-bold text-lg">CashBid</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's Hidden Mobile Auction Platform. Verified devices, IMEI checked, 10-point quality assured.
            </p>
            <p className="text-sm text-gray-500 mt-3">Bid More. Pay Less.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Auctions</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/auctions?status=live",     label: "Live Auctions" },
                { href: "/auctions?status=upcoming", label: "Upcoming"      },
                { href: "/auctions?brand=Apple",     label: "iPhone"        },
                { href: "/auctions?brand=Samsung",   label: "Samsung"       },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">My Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/dashboard",        label: "Dashboard"   },
                { href: "/dashboard/orders", label: "My Orders"   },
                { href: "/dashboard/wallet", label: "Wallet"      },
                { href: "/dashboard/invite", label: "Invite & Earn" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CashBid. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
