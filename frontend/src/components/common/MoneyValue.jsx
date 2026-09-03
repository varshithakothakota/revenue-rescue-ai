import React from "react";

/**
 * Format amounts into Indian Lakhs / Crores / Thousands
 * ₹18.7L, ₹6.42L, ₹74,300, ₹1.2Cr
 */
export function formatINR(val, compact = true) {
  if (val === null || val === undefined || isNaN(val)) return "₹0";
  const num = Number(val);
  
  if (compact) {
    if (Math.abs(num) >= 10000000) {
      const cr = num / 10000000;
      return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)}Cr`;
    }
    if (Math.abs(num) >= 100000) {
      const l = num / 100000;
      return `₹${l % 1 === 0 ? l : l.toFixed(2)}L`;
    }
  }
  
  // Standard Indian comma separator
  const parts = num.toFixed(0).split(".");
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `₹${formatted}`;
}

export function MoneyValue({ amount, compact = false, className = "", highlight = false }) {
  return (
    <span
      className={`font-mono font-medium tabular-nums tracking-tight ${
        highlight ? "text-[#2B4BF2] font-semibold" : "text-slate-900"
      } ${className}`}
      data-testid="money-value"
    >
      {formatINR(amount, compact)}
    </span>
  );
}

export default MoneyValue;
