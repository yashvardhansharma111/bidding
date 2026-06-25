import { AuctionForm } from "@/components/admin/AuctionForm";

export default function NewAuctionPage() {
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Create New Auction</h1>
      <AuctionForm />
    </div>
  );
}
