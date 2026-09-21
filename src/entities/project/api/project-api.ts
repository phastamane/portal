import {
  projectControllerHandleProjectCreate,
  projectControllerHandleProjectList,
  projectControllerHandleProjectUpdate,
  projectControllerHandleProjectDelete,
  useProjectControllerHandleProjectList,
} from "@/shared/model/petstore";
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
} from "@/shared/model/schemas";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type ProjectListResponse = Awaited<
  ReturnType<typeof projectControllerHandleProjectList>
>;
type ProjectRow = ProjectListResponse["data"]["data"]["project"][number];
type ProjectListParams = Parameters<typeof useProjectControllerHandleProjectList>[0];
type ProjectFormValues = z.infer<typeof ProjectCreateSchema>;
type ProjectCreateResponse = Awaited<
  ReturnType<typeof projectControllerHandleProjectCreate>
>;
type ProjectUpdateValues = z.infer<typeof ProjectUpdateSchema>;

export const projectConfig = defineTableConfig<
  ProjectListResponse,
  ProjectRow,
  ProjectListParams,
  ProjectFormValues,
  ProjectCreateResponse,
  ProjectUpdateValues
>({
  entityName: "Проекты",
  table: {
    useHook: (params) => useProjectControllerHandleProjectList(params),
    getRows: (res) => res.data.data.project,
    getTotalCount: (res) =>
      (res.data as { meta?: { count?: number } }).meta?.count,
    getRowId: (row) => row.projectId,
    columns: [
      { header: "ID", accessorKey: "projectId" },
      { header: "Название", accessorKey: "title" },
      { header: "URL", accessorKey: "url" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
  form: {
    schema: ProjectCreateSchema,
    mutationFn: (data) =>
      projectControllerHandleProjectCreate({ expanseId: data.expanseId, title: data.title, url: data.url }),
    fields: [
      {
        name: "expanseId",
        label: "ID",
        type: "text",
        placeholder: "Введите значение",
      },
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
    ],
  },
  update: {
    schema: ProjectUpdateSchema,
    fields: [
      {
        name: "title",
        label: "Название",
        type: "text",
        placeholder: "Введите значение",
      },
    ],
    mutationFn: (id, data) =>
      projectControllerHandleProjectUpdate(id, {
        data: { project: data },
      }),
    // Поля списка и поля обновления могут называться по-разному — сверьте маппинг.
    getDefaultValues: (row) => ({ title: row.title }),
  },
  delete: {
    mutationFn: (id) => projectControllerHandleProjectDelete(id),
    confirmLabel: (row) =>
      `Запись ${row.projectId} будет удалена безвозвратно.`,
  },
});
