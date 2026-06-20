"use client";
import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/utils/formatters";

export function useCountdown(endTime: string | Date) {
  const [time, setTime] = useState(() => getTimeRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(endTime);
      setTime(remaining);
      if (remaining.total <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return time;
}
