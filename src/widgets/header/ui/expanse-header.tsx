import { Skeleton } from "@/components/ui/skeleton";
import { expanseConfig } from "@/entities/expanse/api/expanse-api";
import { useExpanseControllerHandleExpanseList } from "@/shared/model/petstore";

export function ExpanseHeader() {
  const query = useExpanseControllerHandleExpanseList();
  const expanses =
    query.data?.status === 200 ? expanseConfig.table.getRows(query.data) : [];
  const failed = query.isError || (query.data != null && query.data.status !== 200);

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 overflow-x-auto border-b bg-background px-4">
      {query.isLoading ? (
        Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-6 w-24 shrink-0 rounded-full" />
        ))
      ) : failed ? (
        <span className="text-xs text-destructive">
          Не удалось загрузить пространства
        </span>
      ) : expanses.length === 0 ? (
        <span className="text-xs text-muted-foreground">
          Пространств пока нет
        </span>
      ) : (
        expanses.map((expanse) => (
          <span
            key={expanse.expanseId}
            className="inline-flex h-6 shrink-0 items-center rounded-full border bg-muted/40 px-2.5 text-xs font-medium"
            title={expanse.title}
          >
            {expanse.title}
          </span>
        ))
      )}
    </header>
  );
}
