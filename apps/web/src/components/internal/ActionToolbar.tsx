type ActionToolbarProps = {
  children: React.ReactNode;
};

export function ActionToolbar({ children }: ActionToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-default)] bg-[var(--bg-panel)] px-4 py-3">
      {children}
    </div>
  );
}

export function PrimaryActionButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-9 items-center gap-2 rounded-[6px] bg-[var(--azul-institucional)] px-3 text-sm font-medium text-white hover:bg-[var(--azul-institucional-hover)] disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`}
    />
  );
}

export function SecondaryActionButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-panel)] px-3 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`}
    />
  );
}
