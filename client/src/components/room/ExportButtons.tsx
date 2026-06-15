import { downloadExport } from "../../services/workflowApi";

export function ExportButtons({ matterId }: { matterId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => downloadExport(matterId, "pptx")}
      >
        Export PowerPoint
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => downloadExport(matterId, "xlsx")}
      >
        Export Excel
      </button>
    </div>
  );
}
