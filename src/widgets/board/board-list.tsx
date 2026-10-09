import { Skeleton } from "@/components/ui/skeleton";
import { useExpanses } from "@/entities/board/api/board-api";
import { ExpanseDelete } from "@/features/expanse/delete";
import { ExpanseUpdate } from "@/features/expanse/update";
import { EnvironmentField } from "./ui/environment-field";

export function BoardList() {
  const { expanses, isLoading, isError } = useExpanses();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">Не удалось загрузить доску</div>
    );
  }

  if (expanses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">Пространств пока нет</div>
    );
  }

  return (
    <div className="space-y-4">
      {expanses.map((expanse) => (
        <section
          key={expanse.expanseId}
          className="space-y-3 flex flex-col rounded-xl border bg-card p-4"
        >
          <div className="mx-auto flex max-w-full items-center gap-1">
            <h2 className="inline-flex min-w-0 items-center truncate rounded-lg px-3 py-1.5 text-2xl font-extrabold tracking-tight text-accent-foreground">
              {expanse.title}
            </h2>
            <div className="flex shrink-0 items-center">
              <ExpanseUpdate expanse={expanse} />
              <ExpanseDelete expanse={expanse} />
            </div>
          </div>
          {expanse.environment.length === 0 ? (
            <p className="text-sm text-muted-foreground mx-auto">
              Сред пока нет
            </p>
          ) : (
            <div className="space-y-3">
              {expanse.environment.map((environment, index) => (
                <EnvironmentField
                  key={`${expanse.expanseId}-${environment.stage}-${index}`}
                  environment={environment}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
