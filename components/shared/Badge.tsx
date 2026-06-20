import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "live" | "upcoming" | "ended" | "cancelled" | "new" | "refurbished" | "used" | "open_box";
  className?: string;
}

const variantMap: Record<string, string> = {
  live: "bg-green-100 text-green-800 border-green-200",
  upcoming: "bg-blue-100 text-blue-800 border-blue-200",
  ended: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  new: "bg-emerald-100 text-emerald-800 border-emerald-200",
  refurbished: "bg-orange-100 text-orange-800 border-orange-200",
  used: "bg-yellow-100 text-yellow-800 border-yellow-200",
  open_box: "bg-purple-100 text-purple-800 border-purple-200",
};

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border",
        variant ? variantMap[variant] : "bg-gray-100 text-gray-700 border-gray-200",
        className
      )}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      )}
      {children}
    </span>
  );
}
