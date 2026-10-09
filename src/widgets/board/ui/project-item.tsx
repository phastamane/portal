import type { ExpanseProject } from "@/entities/board/api/board-api";

export function ProjectItem({ project }: { project: ExpanseProject }) {
  const className = "block truncate py-0.5 text-sm";

  if (!project.url) {
    return <div className={className}>{project.title}</div>;
  }

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      className={`${className} hover:underline`}
    >
      {project.title}
    </a>
  );
}
