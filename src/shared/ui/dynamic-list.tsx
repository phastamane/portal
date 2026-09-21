import { useDraggable } from "@dnd-kit/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ConfigInterface } from "../model/schemas/configInterface";
import DynamicForm from "./dynamic-form";
import RowActions from "./row-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

function getItemTitle(row: object) {
  if ("title" in row && typeof row.title === "string" && row.title.trim()) {
    return row.title;
  }
  return "Без названия";
}

export default function DynamicList<
  TData,
  TRow extends object,
  TParams,
  TFormValues extends Record<string, unknown>,
  TMutationResponse,
  TUpdateValues extends Record<string, unknown>,
>({
  config,
  excludeIds = [],
}: {
  config: ConfigInterface<
    TData,
    TRow,
    TParams,
    TFormValues,
    TMutationResponse,
    TUpdateValues
  >;
  excludeIds?: string[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: TFormValues) => config.form!.mutationFn(values),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsModalOpen(false);
    },
  });

  const { data, isLoading, isError } = config.table.useHook(
    config.table.params as TParams,
  );
  const items = data
    ? config.table
        .getRows(data)
        .filter((item) => !excludeIds.includes(String(config.table.getRowId(item))))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {config.entityName}
        </h2>

        {config.form && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={<Button />}>Создать</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Добавить запись ({config.entityName})</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={config.form.schema}
                fields={config.form.fields}
                onSubmit={(values) => createMutation.mutate(values)}
                isPending={createMutation.isPending}
                isError={createMutation.isError}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <ul className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-10 w-full" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="text-destructive">Ошибка</div>
      ) : !items.length ? (
        <div>Нет данных</div>
      ) : (
        <div className="flex gap-2 px-2 py-4 border bg-blue-100 rounded-xl">
          {items.map((item) => {
            const id = String(config.table.getRowId(item));
            const title = getItemTitle(item);

            return (
              <DraggableCard key={id} id={id} title={title}>
                <div className="flex min-w-0 flex-col gap-1 rounded-md px-3 py-2 hover:bg-muted/50">
                  <span className="truncate font-medium">{title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {id}
                  </span>
                </div>
                {(config.update || config.delete) && (
                  <RowActions config={config} row={item} />
                )}
              </DraggableCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
function DraggableCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const { ref, isDragging } = useDraggable({
    id,
    data: { title },
  });

  return (
    <div
      className="flex min-w-0 flex-col bg-card border rounded-xl pb-2"
      ref={(element) => ref(element)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {children}
    </div>
  );
}
