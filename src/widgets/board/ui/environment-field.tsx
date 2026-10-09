import type { ExpanseEnvironment } from "@/entities/board";
import { ProjectCreate } from "./project-create";
import { ProjectItem } from "./project-item";

export function EnvironmentField({
  environment,
}: {
  environment: ExpanseEnvironment;
}) {
  return (
    <div className="space-y-2 pl-1">
      <div className="flex items-center gap-2 ">
        <span className=" inline-flex h-6 w-full items-center rounded-md bg-chart-5 px-2  font-semibold tracking-wide">
          {environment.stage}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2 rounded-md bg-chart-4 p-2">
        <ProjectCreate
          environmentId={environment.environmentId}
          stage={environment.stage}
        />
        {environment.projects.map((project) => (
          <ProjectItem key={project.projectId} project={project} />
        ))}
      </div>
    </div>
  );
}
