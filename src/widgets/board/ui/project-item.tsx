import type { ExpanseProject } from "@/entities/board";
import { useProjectImage } from "@/entities/project";
import { ProjectDelete } from "./project-delete";
import { ProjectImageUpload } from "./project-image-upload";
import { ProjectUpdate } from "./project-update";

export function ProjectItem({ project }: { project: ExpanseProject }) {
  const { imageUrl } = useProjectImage(project.images);

  return (
    <div className="cursor-pointer group relative isolate flex min-h-32 min-w-0 flex-col justify-end overflow-hidden rounded-md border bg-card px-3 py-2 pr-12">
      {imageUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </>
      ) : null}
      <div className="absolute top-1 right-1 z-10 flex items-center">
        <ProjectImageUpload project={project} />
        <ProjectUpdate project={project} />
        <ProjectDelete project={project} />
      </div>
      <div className="relative z-10 min-w-0">
        <span
          className={`block truncate font-medium ${imageUrl ? "text-accent-foreground drop-shadow" : ""}`}
        >
          {project.title}
        </span>
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className={`block truncate text-xs hover:underline ${
              imageUrl ? "text-white/80" : "text-muted-foreground"
            }`}
          >
            {project.url}
          </a>
        ) : null}
      </div>
    </div>
  );
}
