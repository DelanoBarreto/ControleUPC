type ContextHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function ContextHeader({ eyebrow, title, description, actions }: ContextHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">{eyebrow}</p>
        <h1 className="mt-1 text-[20px] font-medium text-[var(--text-primary)]">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
