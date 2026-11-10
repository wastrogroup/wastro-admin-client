import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "accent" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`ui-button ui-button-${variant} ${className}`.trim()}
      {...props}
    />
  );
}
