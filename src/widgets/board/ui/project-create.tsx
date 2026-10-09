import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { ExpanseStage } from "@/entities/board";
import { projectConfig } from "@/entities/project";
import { ProjectCreateSchema } from "@/shared/model/schemas";
import DynamicForm from "@/shared/ui/dynamic-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProjectCreateFields = {
  title: string;
  url: string;
};

const ProjectCreateFieldsSchema = ProjectCreateSchema.pick({
  title: true,
  url: true,
});

export function ProjectCreate({
  environmentId,
  stage,
}: {
  environmentId: string;
  stage: ExpanseStage;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: ProjectCreateFields) =>
      projectConfig.form!.mutationFn({
        environmentId,
        title: values.title,
        url: values.url,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            disabled={!environmentId}
            aria-label={`Добавить проект в ${stage}`}
            className="flex min-h-32 min-w-0 items-center justify-center rounded-md border border-dashed bg-card/60 transition-colors hover:border-primary disabled:pointer-events-none disabled:opacity-50"
          />
        }
      >
        <Plus className="size-8 text-muted-foreground" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить проект ({stage})</DialogTitle>
        </DialogHeader>
        <DynamicForm
          schema={ProjectCreateFieldsSchema}
          fields={[
            {
              name: "title",
              label: "Название",
              type: "text",
              placeholder: "Введите значение",
            },
            {
              name: "url",
              label: "URL",
              type: "text",
              placeholder: "Введите значение",
            },
          ]}
          defaultValues={{ title: "", url: "" }}
          onSubmit={(values) => mutation.mutate(values)}
          isPending={mutation.isPending}
          isError={mutation.isError}
        />
      </DialogContent>
    </Dialog>
  );
}
