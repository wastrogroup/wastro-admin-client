type StateMessageProps = {
  title: string;
  description?: string;
  variant?: "loading" | "empty" | "error";
};

export function StateMessage({
  title,
  description,
  variant = "empty",
}: StateMessageProps) {
  return (
    <div className={`ui-state ui-state-${variant}`} role="status">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
