import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ExpanseProject } from "@/entities/board/api/board-api";
import { projectConfig } from "@/entities/project/api/project-api";
import { ProjectUpdateSchema } from "@/shared/model/schemas";
import DynamicForm from "@/shared/ui/dynamic-form";

type ProjectUpdateValues = {
  title: string;
  url: string;
};

export function ProjectUpdate({ project }: { project: ExpanseProject }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: ProjectUpdateValues) =>
      projectConfig.update!.mutationFn(project.projectId, values),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Изменить проект"
          />
        }
      >
        <PenLine />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Изменить проект</DialogTitle>
        </DialogHeader>
        <DynamicForm
          schema={ProjectUpdateSchema}
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
          defaultValues={{ title: project.title, url: project.url }}
          onSubmit={(values) => mutation.mutate(values)}
          isPending={mutation.isPending}
          isError={mutation.isError}
        />
      </DialogContent>
    </Dialog>
  );
}
