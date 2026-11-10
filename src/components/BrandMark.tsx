type BrandMarkProps = {
  size?: number;
  variant?: "light" | "dark" | "brand";
  className?: string;
};

/** Circular W icon used as the compact brand mark. */
export function BrandMark({ size = 40, variant = "brand", className = "" }: BrandMarkProps) {
  const fill = variant === "brand" ? "#111111" : variant === "dark" ? "#111111" : "#FFFFFF";
  const ring = variant === "brand" ? "#C7FF00" : "#C7FF00";
  const mark = variant === "light" ? "#111111" : "#FFFFFF";

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="19" fill={fill} />
      <circle cx="20" cy="20" r="17.5" fill="none" stroke={ring} strokeWidth="1.5" />
      <path
        d="M10.5 13.5 L15.2 27.5 L20 17.8 L24.8 27.5 L29.5 13.5"
        fill="none"
        stroke={mark}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
