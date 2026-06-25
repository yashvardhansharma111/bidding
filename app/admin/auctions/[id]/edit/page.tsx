"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { AuctionForm } from "@/components/admin/AuctionForm";
import type { IAuction } from "@/types";

export default function EditAuctionPage() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<IAuction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/auctions/${id}`).then(({ data }) => setAuction(data.data.auction)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Edit Auction</h1>
      {auction && <AuctionForm initialData={auction} auctionId={id} />}
    </div>
  );
}
