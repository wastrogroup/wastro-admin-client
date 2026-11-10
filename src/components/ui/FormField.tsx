import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
};

export function FormField({ label, hint, error, id, className = "", ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={fieldId}>
      <span className="ui-field-label">{label}</span>
      <input id={fieldId} className={error ? "has-error" : undefined} {...props} />
      {hint ? <span className="ui-field-hint">{hint}</span> : null}
      {error ? <span className="ui-field-error">{error}</span> : null}
    </label>
  );
}
