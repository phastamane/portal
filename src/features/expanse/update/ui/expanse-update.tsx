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
import { expanseConfig } from "@/entities/expanse";
import { ExpanseUpdateSchema } from "@/shared/model/schemas";
import DynamicForm from "@/shared/ui/dynamic-form";

type ExpanseUpdateValues = {
  title?: string;
};

export function ExpanseUpdate({
  expanse,
}: {
  expanse: { expanseId: string; title: string };
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: ExpanseUpdateValues) =>
      expanseConfig.update!.mutationFn(expanse.expanseId, values),
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
            size="icon-sm"
            aria-label="Изменить пространство"
          />
        }
      >
        <PenLine />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Изменить пространство</DialogTitle>
        </DialogHeader>
        <DynamicForm
          schema={ExpanseUpdateSchema}
          fields={expanseConfig.update!.fields}
          defaultValues={{ title: expanse.title }}
          onSubmit={(values) => mutation.mutate(values)}
          isPending={mutation.isPending}
          isError={mutation.isError}
        />
      </DialogContent>
    </Dialog>
  );
}
