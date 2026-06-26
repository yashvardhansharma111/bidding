import Link from "next/link";
import { Gavel, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="text-[#FFE500]" size={22} />
              <span className="text-white font-bold text-lg">CashBid</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's Hidden Mobile Auction Platform. Verified devices, IMEI checked, 10-point quality assured.
            </p>
            <p className="text-sm text-gray-500 mt-3 italic">Bid More. Pay Less.</p>

            {/* Support email */}
            <a
              href="mailto:cashbidindia.support@gmail.com"
              className="inline-flex items-center gap-2 mt-4 text-sm text-[#FFE500] hover:text-yellow-300 transition-colors"
            >
              <Mail size={14} />
              cashbidindia.support@gmail.com
            </a>
          </div>

          {/* Auctions */}
          <div>
            <h4 className="text-white font-semibold mb-4">Auctions</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/auctions?status=live",           label: "Live Auctions" },
                { href: "/auctions?status=upcoming",       label: "Upcoming"      },
                { href: "/auctions?condition=refurbished", label: "Refurbished"   },
                { href: "/auctions?category=bulk",         label: "Bulk Lots"     },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">My Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/dashboard",        label: "Dashboard"    },
                { href: "/dashboard/orders", label: "My Orders"    },
                { href: "/dashboard/wallet", label: "Wallet"       },
                { href: "/dashboard/invite", label: "Invite & Earn"},
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
              </li>
              <li>
                <a href="mailto:cashbidindia.support@gmail.com" className="hover:text-white transition-colors">Support</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>&copy; {new Date().getFullYear()} CashBid. All rights reserved.</span>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
