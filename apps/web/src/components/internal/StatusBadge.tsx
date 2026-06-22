type StatusBadgeProps = {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "info";
};

const variantClasses = {
  neutral: "border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-secondary)]",
  success: "border-[var(--sucesso-bg)] bg-[var(--sucesso-bg)] text-[var(--sucesso)]",
  warning: "border-[var(--alerta-bg)] bg-[var(--alerta-bg)] text-[var(--alerta)]",
  danger: "border-[var(--erro-bg)] bg-[var(--erro-bg)] text-[var(--erro)]",
  info: "border-[var(--azul-institucional-bg-suave)] bg-[var(--azul-institucional-bg-suave)] text-[var(--azul-institucional)]"
};

export function StatusBadge({ children, variant = "neutral" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-[6px] border px-2 py-1 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
