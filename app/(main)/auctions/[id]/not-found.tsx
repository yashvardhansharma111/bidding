import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Auction Not Found</h1>
      <p className="text-gray-500 mb-6">This auction may have been removed or the link is incorrect.</p>
      <Link href="/auctions" className="bg-[#2874F0] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
        Browse Auctions
      </Link>
    </div>
  );
}
