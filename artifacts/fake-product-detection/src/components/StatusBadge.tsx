import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export function StatusBadge({ status }: { status: "AUTHENTIC" | "FAKE" | "SUSPICIOUS" }) {
  if (status === "AUTHENTIC") {
    return (
      <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> Authentic
      </Badge>
    );
  }
  if (status === "FAKE") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" /> Fake
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-500 text-black hover:bg-amber-500">
      <AlertTriangle className="h-3 w-3" /> Suspicious
    </Badge>
  );
}
