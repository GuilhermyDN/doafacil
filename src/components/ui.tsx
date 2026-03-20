import React from "react";

type BadgeColor = "green" | "blue" | "amber" | "coral" | "gray";

const badgeColors: Record<BadgeColor, { bg: string; text: string }> = {
  green: { bg: "#E1F5EE", text: "#085041" },
  blue:  { bg: "#E6F1FB", text: "#0C447C" },
  amber: { bg: "#FAEEDA", text: "#633806" },
  coral: { bg: "#FAECE7", text: "#712B13" },
  gray:  { bg: "#EDECE8", text: "#444441" },
};

export const Badge = ({ children, color = "green" }: { children: React.ReactNode; color?: BadgeColor }) => {
  const c = badgeColors[color];
  return (
    <span
      style={{ background: c.bg, color: c.text }}
      className="text-xs font-medium px-2.5 py-0.5 rounded-full inline-block"
    >
      {children}
    </span>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

export const Stat = ({
  label, value, sub, color,
}: {
  label: string; value: string; sub?: string; color?: string;
}) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-2xl font-semibold" style={{ color: color ?? "#1A1A18" }}>{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
  </div>
);
