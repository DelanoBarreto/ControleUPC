type DenseTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type DenseTableProps<T> = {
  columns: DenseTableColumn<T>[];
  rows: T[];
  emptyText?: string;
  rowKey: (row: T) => string;
};

export function DenseTable<T>({ columns, rows, emptyText = "Nenhum registro encontrado.", rowKey }: DenseTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-[6px] border border-[var(--border-default)]">
      <table className="w-full min-w-[760px] border-collapse bg-[var(--bg-panel)] text-sm">
        <thead className="bg-[var(--bg-page)]">
          <tr>
            {columns.map((column) => (
              <th
                className={`border-b border-[var(--border-default)] px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)] ${column.className ?? ""}`}
                key={column.key}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-sm text-[var(--text-secondary)]" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr className="hover:bg-[var(--bg-page)]" key={rowKey(row)}>
                {columns.map((column) => (
                  <td
                    className={`border-b border-[var(--border-default)] px-3 py-2 align-middle text-[var(--text-primary)] ${column.className ?? ""}`}
                    key={column.key}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
