import { Card } from "../components/ui/Card";
import { StateMessage } from "../components/ui/StateMessage";
import { Table, type TableColumn } from "../components/ui/Table";

type ModulePlaceholderPageProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

type PlaceholderRow = {
  id: string;
  name: string;
  status: string;
};

const columns: TableColumn<PlaceholderRow>[] = [
  { key: "name", header: "Name", render: (row) => row.name },
  { key: "status", header: "Status", render: (row) => row.status },
];

export function ModulePlaceholderPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: ModulePlaceholderPageProps) {
  const rows: PlaceholderRow[] = [];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Module</p>
          <h1>{title}</h1>
          <p className="subtitle">{description}</p>
        </div>
      </header>

      <Card title={`${title} list`}>
        {rows.length === 0 ? (
          <StateMessage
            variant="empty"
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <Table columns={columns} rows={rows} rowKey={(row) => row.id} />
        )}
      </Card>
    </div>
  );
}
