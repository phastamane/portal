import DynamicList from "@/shared/ui/dynamic-list";
import { expanseConfig } from "@/entities/expanse/api/expanse-api";

export function ExpansePage() {
  return (
    <div className="space-y-4">
      <DynamicList config={expanseConfig} />
    </div>
  );
}
