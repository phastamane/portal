import { Skeleton } from "@/components/ui/skeleton";
import { useExpanses } from "@/entities/board/api/board-api";
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
          className="space-y-3 rounded-xl border bg-card p-4"
        >
          <h2 className="inline-flex max-w-full items-center rounded-lg bg-primary/20 px-3 py-1.5 text-lg font-semibold tracking-tight text-primary-foreground">
            {expanse.title}
          </h2>
          {expanse.environment.length === 0 ? (
            <p className="text-sm text-muted-foreground">Сред пока нет</p>
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
