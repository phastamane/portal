import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { expanseConfig } from "@/entities/expanse/api/expanse-api";
import { projectConfig } from "@/entities/project/api/project-api";
import { cn } from "@/lib/utils";
import {
  useExpanseControllerHandleExpanseList,
  useProjectControllerHandleProjectList,
} from "@/shared/model/petstore";
import { ProjectCreateSchema } from "@/shared/model/schemas";
import type { FormField } from "@/shared/model/schemas/configInterface";
import DynamicForm from "@/shared/ui/dynamic-form";
import DynamicList from "@/shared/ui/dynamic-list";
import { useDragDropMonitor, useDraggable, useDroppable } from "@dnd-kit/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const EXPENSE_DROP_PREFIX = "expanse:";

type BoardProject = {
  id: string;
  title: string;
  url: string;
  expanseId: string;
};

const projectInExpanseSchema = ProjectCreateSchema.omit({ expanseId: true });
type ProjectInExpanseValues = {
  title: string;
  url: string;
};

export function BoardPage() {
  const [moves, setMoves] = useState<Record<string, string>>({});
  const expanseQuery = useExpanseControllerHandleExpanseList();
  const projectQuery = useProjectControllerHandleProjectList();

  const expanses = expanseQuery.data
    ? expanseConfig.table.getRows(expanseQuery.data).map((row) => ({
        id: String(expanseConfig.table.getRowId(row)),
        title: row.title,
      }))
    : [];

  const projects: BoardProject[] = projectQuery.data
    ? projectConfig.table.getRows(projectQuery.data).map((row) => ({
        id: String(projectConfig.table.getRowId(row)),
        title: row.title,
        url: row.url,
        expanseId: row.expanseId,
      }))
    : [];

  const expanseIds = useMemo(
    () => new Set(expanses.map((item) => item.id)),
    [expanses],
  );

  const placed = useMemo(() => {
    const byExpanse = new Map<string, BoardProject[]>();
    const placedIds: string[] = [];
    const projectExpanse = new Map<string, string>();

    for (const project of projects) {
      const expanseId = moves[project.id] ?? project.expanseId;
      if (!expanseIds.has(expanseId)) continue;

      const bucket = byExpanse.get(expanseId) ?? [];
      bucket.push(project);
      byExpanse.set(expanseId, bucket);
      placedIds.push(project.id);
      projectExpanse.set(project.id, expanseId);
    }

    return { byExpanse, placedIds, projectExpanse };
  }, [expanseIds, moves, projects]);

  const projectExpanseRef = useRef(placed.projectExpanse);
  projectExpanseRef.current = placed.projectExpanse;
  const expanseIdsRef = useRef(expanseIds);
  expanseIdsRef.current = expanseIds;

  useDragDropMonitor({
    onDragEnd(event) {
      if (event.canceled) return;

      const { source, target } = event.operation;
      if (!source || !target) return;

      const projectId = String(source.id);
      if (projectId.startsWith(EXPENSE_DROP_PREFIX)) return;

      const targetId = String(target.id);
      const expanseId = targetId.startsWith(EXPENSE_DROP_PREFIX)
        ? targetId.slice(EXPENSE_DROP_PREFIX.length)
        : projectExpanseRef.current.get(targetId);

      if (!expanseId || !expanseIdsRef.current.has(expanseId)) return;
      if (projectExpanseRef.current.get(projectId) === expanseId) return;

      setMoves((current) => ({ ...current, [projectId]: expanseId }));
    },
  });

  return (
    <div className="flex flex-col space-y-6">
      <DynamicList config={projectConfig} excludeIds={placed.placedIds} />

      {expanseQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-56 w-full" />
          ))}
        </div>
      ) : expanseQuery.isError ? (
        <div className="text-destructive">
          Не удалось загрузить пространства
        </div>
      ) : expanses.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-muted-foreground">
          Пространств пока нет
        </div>
      ) : (
        <div className="grid grid-rows-1 gap-4 ">
          {expanses.map((expanse) => (
            <ExpanseTile
              key={expanse.id}
              id={expanse.id}
              title={expanse.title}
              projects={placed.byExpanse.get(expanse.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpanseTile({
  id,
  title,
  projects,
}: {
  id: string;
  title: string;
  projects: BoardProject[];
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `${EXPENSE_DROP_PREFIX}${id}`,
  });

  return (
    <section
      ref={(element) => ref(element)}
      className={cn(
        "flex min-h-56 flex-col gap-3 rounded-xl border p-4 transition-colors",
        isDropTarget ? "border-primary bg-primary/20" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">{projects.length}</span>
      </div>
      <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
        <CreateProjectButton expanseId={id} />
        {projects.map((project) => (
          <BoardProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            url={project.url}
          />
        ))}
      </div>
    </section>
  );
}

function BoardProjectCard({
  id,
  title,
  url,
}: {
  id: string;
  title: string;
  url: string;
}) {
  const { ref, isDragging } = useDraggable({
    id,
    data: { title },
  });

  return (
    <div
      ref={(element) => ref(element)}
      className="flex min-h-28 flex-col justify-between gap-2 rounded-xl border bg-background p-3"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="text-sm font-medium">{title}</span>
      <span className="truncate text-xs text-muted-foreground">{url}</span>
    </div>
  );
}

const projectInExpanseFields: FormField<ProjectInExpanseValues>[] = (
  projectConfig.form?.fields ?? []
).flatMap((field) =>
  field.name === "title" || field.name === "url"
    ? [{ ...field, name: field.name }]
    : [],
);

function CreateProjectButton({ expanseId }: { expanseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: ProjectInExpanseValues) =>
      projectConfig.form!.mutationFn({ ...values, expanseId }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsOpen(false);
    },
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) createMutation.reset();
      }}
    >
      <DialogTrigger
        className="flex min-h-28 items-center justify-center rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        aria-label="Создать проект"
      >
        <Plus />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить проект</DialogTitle>
        </DialogHeader>
        <DynamicForm
          schema={projectInExpanseSchema}
          fields={projectInExpanseFields}
          onSubmit={(values) => createMutation.mutate(values)}
          isPending={createMutation.isPending}
          isError={createMutation.isError}
        />
      </DialogContent>
    </Dialog>
  );
}
