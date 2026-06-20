import { AuctionForm } from "@/components/admin/AuctionForm";

export default function NewAuctionPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Auction</h1>
      <AuctionForm />
    </div>
  );
}
