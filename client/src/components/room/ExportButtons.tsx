import { downloadExport } from "../../services/workflowApi";

export function ExportButtons({ matterId }: { matterId: string }) {
  return (
    <div className="flex flex-wrap gap-2 max-lg:flex-col max-lg:[&>button]:w-full">
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
