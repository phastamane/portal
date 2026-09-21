import { useState } from "react";
import DynamicList from "@/shared/ui/dynamic-list";
import { expanseConfig } from "@/entities/expanse/api/expanse-api";
import { useDragDropMonitor, useDroppable } from "@dnd-kit/react";

export function ExpansePage() {
  const [dropped, setDropped] = useState<{ id: string; title: string }[]>([]);
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: "droppable",
  });

  useDragDropMonitor({
    onDragEnd(event) {
      if (event.canceled) return;

      const { source, target } = event.operation;
      if (!source || target?.id !== "droppable") return;

      const id = String(source.id);
      const title =
        typeof source.data?.title === "string" ? source.data.title : id;

      setDropped((prev) =>
        prev.some((item) => item.id === id) ? prev : [...prev, { id, title }],
      );
    },
  });

  return (
    <div className="space-y-4">
      <DynamicList
        config={expanseConfig}
        excludeIds={dropped.map((item) => item.id)}
      />
      <div
        className={`space-y-2 border p-8 ${isDropTarget ? "bg-primary" : "bg-card"}`}
        ref={(element) => dropRef(element)}
      >
        {dropped.length === 0
          ? "Перетащите сюда"
          : dropped.map((item) => (
              <div key={item.id} className="rounded-xl border bg-card px-3 py-2">
                {item.title}
              </div>
            ))}
      </div>
    </div>
  );
}
