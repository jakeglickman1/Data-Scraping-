import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const Panel = ({ title, subtitle, actions, children }: PanelProps) => (
  <section className="panel">
    {(title || actions) && (
      <header className="panel__header">
        <div>
          {title && <h2>{title}</h2>}
          {subtitle && <p className="panel__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
    )}
    <div className="panel__body">{children}</div>
  </section>
);
