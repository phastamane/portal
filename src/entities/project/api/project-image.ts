import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { API_BASE_URL } from "@/shared/api/base-url";
import { getToken } from "@/shared/lib/token";
import {
  getFileControllerHandlerFileCreateUrl,
  getFileControllerHandlerFileInfoQueryKey,
} from "@/shared/model/petstore";

export function getProjectImageUrl(images: string) {
  return `${API_BASE_URL}/files/${encodeURIComponent(images)}`;
}

function withAuthHeaders() {
  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set("jwt", token);
  }
  return headers;
}

function httpError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

export async function uploadProjectImage(projectId: string, file: File) {
  const formData = new FormData();
  formData.append("images", file);

  const res = await fetch(
    `${API_BASE_URL}${getFileControllerHandlerFileCreateUrl(projectId)}`,
    {
      method: "PATCH",
      headers: withAuthHeaders(),
      body: formData,
    },
  );

  if (!res.ok) {
    throw httpError("Не удалось загрузить изображение", res.status);
  }
}

export async function getProjectImage(
  images: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const res = await fetch(getProjectImageUrl(images), {
    method: "GET",
    headers: withAuthHeaders(),
    signal,
  });

  if (!res.ok) {
    throw httpError("Не удалось загрузить изображение", res.status);
  }

  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error("Пустое изображение");
  }

  return blob;
}

export function useProjectImage(images: string | null) {
  const query = useQuery({
    queryKey: getFileControllerHandlerFileInfoQueryKey(images ?? ""),
    queryFn: ({ signal }) => getProjectImage(images!, signal),
    enabled: Boolean(images),
    staleTime: 5 * 60 * 1000,
  });

  const objectUrl = useMemo(
    () => (query.data ? URL.createObjectURL(query.data) : null),
    [query.data],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return {
    imageUrl: objectUrl,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
