"use client";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownTimerProps {
  endTime: string | Date;
  label?: string;
  large?: boolean;
}

export function CountdownTimer({ endTime, label = "Ends in", large = false }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, total } = useCountdown(endTime);
  const isUrgent = total > 0 && total < 3600000; // < 1 hour

  if (total <= 0) {
    return (
      <div className={`text-red-600 font-bold ${large ? "text-xl" : "text-sm"}`}>
        Auction Ended
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-gray-500 font-medium">{label}</p>}
      <div className="flex items-center gap-1">
        {days > 0 && (
          <>
            <TimeBox value={days} unit="d" large={large} urgent={isUrgent} />
            <span className={`font-bold ${isUrgent ? "text-red-500" : "text-gray-400"} ${large ? "text-2xl" : "text-base"}`}>:</span>
          </>
        )}
        <TimeBox value={hours} unit="h" large={large} urgent={isUrgent} />
        <span className={`font-bold ${isUrgent ? "text-red-500" : "text-gray-400"} ${large ? "text-2xl" : "text-base"}`}>:</span>
        <TimeBox value={minutes} unit="m" large={large} urgent={isUrgent} />
        <span className={`font-bold ${isUrgent ? "text-red-500" : "text-gray-400"} ${large ? "text-2xl" : "text-base"}`}>:</span>
        <TimeBox value={seconds} unit="s" large={large} urgent={isUrgent} />
      </div>
    </div>
  );
}

function TimeBox({ value, unit, large, urgent }: { value: number; unit: string; large: boolean; urgent: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded ${large ? "min-w-[52px]" : "min-w-[36px]"} ${urgent ? "bg-red-50" : "bg-gray-50"} px-2 py-1`}>
      <span className={`font-bold tabular-nums leading-none ${large ? "text-2xl" : "text-base"} ${urgent ? "text-red-600" : "text-gray-900"}`}>
        {value.toString().padStart(2, "0")}
      </span>
      <span className={`text-[10px] ${urgent ? "text-red-400" : "text-gray-400"} uppercase`}>{unit}</span>
    </div>
  );
}
