type StatusBadgeProps = {
  tone?: "neutral" | "success" | "warning" | "accent";
  children: string;
};

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>;
}
