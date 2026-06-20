import Link from "next/link";
import { Gavel } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="text-[#FFE500]" size={24} />
              <span className="text-white font-bold text-xl">BidKart</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India&apos;s premier mobile phone auction platform. Bid on new, refurbished, and bulk devices from verified sources.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Auctions</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/auctions?status=live", label: "Live Now" },
                { href: "/auctions?status=upcoming", label: "Upcoming" },
                { href: "/auctions?category=bulk", label: "Bulk Lots" },
                { href: "/auctions?condition=refurbished", label: "Refurbished" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/login", label: "Login" },
                { href: "/register", label: "Register" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/dashboard/orders", label: "My Orders" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} BidKart. All rights reserved. Made with ❤️ for mobile enthusiasts.
        </div>
      </div>
    </footer>
  );
}
