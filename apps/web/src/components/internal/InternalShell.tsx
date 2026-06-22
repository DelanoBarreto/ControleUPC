import Link from "next/link";
import {
  Archive,
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  Layers3,
  Settings,
  Upload
} from "lucide-react";

type InternalShellProps = {
  active: "prestacao" | "modelos" | "importacoes" | "anexos" | "pendencias" | "exportacoes" | "relatorios" | "administracao";
  children: React.ReactNode;
  contexto?: {
    municipio?: string;
    exercicio?: string;
    upc?: string;
    usuario?: string;
  };
};

const menu = [
  { key: "prestacao", label: "Prestacao", href: "/dashboard", icon: ClipboardList },
  { key: "modelos", label: "Modelos da IN", href: "/modelos/modelo-01", icon: Layers3 },
  { key: "importacoes", label: "Importacao SIM", href: "/importacoes", icon: Upload },
  { key: "anexos", label: "Anexos", href: "/anexos", icon: Archive },
  { key: "pendencias", label: "Pendencias", href: "/dashboard", icon: FileSpreadsheet },
  { key: "exportacoes", label: "Exportacoes", href: "/dashboard", icon: FileSpreadsheet },
  { key: "relatorios", label: "Relatorios", href: "/dashboard", icon: BarChart3 },
  { key: "administracao", label: "Administracao", href: "/dashboard", icon: Settings }
] as const;

export function InternalShell({ active, children, contexto }: InternalShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <header className="flex h-12 items-center justify-between bg-[var(--azul-institucional)] px-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid size-7 place-items-center rounded-[4px] border border-white/40 text-[11px] font-semibold">
            UPC
          </div>
          <div className="text-sm font-medium">Controle UPC</div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>{contexto?.municipio || "Municipio nao selecionado"}</span>
          <span>{contexto?.exercicio || "Exercicio"}</span>
          <span className="max-w-[360px] truncate">{contexto?.upc || "UPC nao selecionada"}</span>
          <span>{contexto?.usuario || "Administrador"}</span>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-48px)] grid-cols-[260px_1fr]">
        <aside className="border-r border-[var(--border-default)] bg-[var(--bg-panel)] px-4 py-4">
          <div className="mb-6 px-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">Area logada</p>
            <h1 className="mt-1 text-[20px] font-medium text-[var(--text-primary)]">Prestacao da IN</h1>
          </div>

          <nav className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <Link
                  className={`flex h-10 items-center gap-3 rounded-[6px] px-3 text-sm font-medium ${
                    isActive
                      ? "bg-[var(--azul-institucional-bg-suave)] text-[var(--azul-institucional)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-page)]"
                  }`}
                  href={item.href}
                  key={item.key}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[6px] border border-[var(--border-default)] bg-[#fff8ef] p-4">
            <p className="text-sm font-medium text-[var(--alerta)]">IN 01/2025</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
              Use o checklist da prestacao para abrir modelos, anexos e pendencias.
            </p>
          </div>
        </aside>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
