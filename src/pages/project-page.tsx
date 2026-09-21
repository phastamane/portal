import { projectConfig } from "@/entities/project/api/project-api";
import DynamicList from "@/shared/ui/dynamic-list";

export function ProjectPage() {
  return (
    <div className="space-y-4">
      <DynamicList config={projectConfig} />
    </div>
  );
}
