type DataPanelProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function DataPanel({ children, className = "", title, description, actions }: DataPanelProps) {
  return (
    <section className={`rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-panel)] ${className}`}>
      {(title || description || actions) ? (
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] px-4 py-3">
          <div>
            {title ? <h2 className="text-[15px] font-medium text-[var(--text-primary)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}
