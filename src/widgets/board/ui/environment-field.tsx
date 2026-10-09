import type { ExpanseEnvironment } from "@/entities/board/api/board-api";
import { ProjectItem } from "./project-item";

export function EnvironmentField({
  environment,
}: {
  environment: ExpanseEnvironment;
}) {
  return (
    <div className="space-y-2 pl-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Среда</span>
        <span className="inline-flex h-6 items-center rounded-md bg-muted px-2 text-xs font-semibold tracking-wide">
          {environment.stage}
        </span>
      </div>
      {environment.projects.length === 0 ? (
        <p className="pl-4 text-xs text-muted-foreground">Проектов нет</p>
      ) : (
        <div className="space-y-0.5 pl-4">
          {environment.projects.map((project) => (
            <ProjectItem key={project.projectId} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
