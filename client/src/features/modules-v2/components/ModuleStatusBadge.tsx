export function ModuleStatusBadge({ status }: { status: string }) {
  const colors: any = {
    draft: "gray",
    ready: "orange",
    active: "green",
    archived: "red",
  };

  return <span style={{ color: colors[status] }}>{status.toUpperCase()}</span>;
}
