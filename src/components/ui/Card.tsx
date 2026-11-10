import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, actions, children, className = "" }: CardProps) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {(title || actions) && (
        <header className="ui-card-header">
          {title ? <h2>{title}</h2> : <span />}
          {actions}
        </header>
      )}
      <div className="ui-card-body">{children}</div>
    </section>
  );
}
