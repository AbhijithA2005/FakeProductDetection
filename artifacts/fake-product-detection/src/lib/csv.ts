import type { ScanLog } from "./types";

export function exportScanLogsCSV(scans: ScanLog[]): void {
  const headers = [
    "Scan ID",
    "Product ID",
    "Timestamp",
    "Role",
    "Location",
    "Result",
    "Reason",
    "Device",
  ];
  const rows = scans.map((s) =>
    [
      s.id,
      s.productId,
      s.timestamp,
      s.role,
      s.location,
      s.result,
      s.reason,
      s.deviceInfo,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blocktrust-scan-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
