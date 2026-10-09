import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { useRef } from "react";
import type { ExpanseProject } from "@/entities/board";
import { uploadProjectImage } from "@/entities/project";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ProjectImageUpload({ project }: { project: ExpanseProject }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => uploadProjectImage(project.projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) mutation.mutate(file);
        }}
      />
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Добавить картинку"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {mutation.isPending ? <Spinner className="size-3" /> : <ImagePlus />}
      </Button>
    </>
  );
}
