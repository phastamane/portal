import {
  expanseControllerHandleExpanseCreate,
  expanseControllerHandleExpanseList,
  expanseControllerHandleExpanseUpdate,
  expanseControllerHandleExpanseDelete,
  useExpanseControllerHandleExpanseList,
} from "@/shared/model/petstore";
import {
  ExpanseCreateSchema,
  ExpanseUpdateSchema,
} from "@/shared/model/schemas";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type ExpanseListResponse = Awaited<
  ReturnType<typeof expanseControllerHandleExpanseList>
>;
type ExpanseRow = {
  expanseId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};
type ExpanseListBody = {
  data: { expanses: ExpanseRow[] };
  meta?: { count?: number };
};
type ExpanseListParams = Parameters<typeof useExpanseControllerHandleExpanseList>[0];
type ExpanseFormValues = z.infer<typeof ExpanseCreateSchema>;
type ExpanseCreateResponse = Awaited<
  ReturnType<typeof expanseControllerHandleExpanseCreate>
>;
type ExpanseUpdateValues = z.infer<typeof ExpanseUpdateSchema>;

export const expanseConfig = defineTableConfig<
  ExpanseListResponse,
  ExpanseRow,
  ExpanseListParams,
  ExpanseFormValues,
  ExpanseCreateResponse,
  ExpanseUpdateValues
>({
  entityName: "Пространство",
  table: {
    useHook: (params) => useExpanseControllerHandleExpanseList(params),
    getRows: (res) => {
      const body = res.data as unknown as ExpanseListBody;
      return body.data.expanses;
    },
    getTotalCount: (res) => {
      const body = res.data as unknown as ExpanseListBody;
      return body.meta?.count;
    },

    getRowId: (row) => row.expanseId,
    columns: [
      { header: "ID", accessorKey: "expanseId" },
      { header: "Название", accessorKey: "title" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
  form: {
    schema: ExpanseCreateSchema,
    mutationFn: (data) => expanseControllerHandleExpanseCreate(data),
    fields: [
      {
        name: "title",
        label: "Название",
        type: "text",
        placeholder: "Введите значение",
      },
    ],
  },
  update: {
    schema: ExpanseUpdateSchema,
    fields: [
      {
        name: "title",
        label: "Название",
        type: "text",
        placeholder: "Введите значение",
      },
    ],
    mutationFn: (id, data) =>
      expanseControllerHandleExpanseUpdate(id, data),
    // Поля списка и поля обновления могут называться по-разному — сверьте маппинг.
    getDefaultValues: (row) => ({ title: row.title }),
  },
  delete: {
    mutationFn: (id) => expanseControllerHandleExpanseDelete(id),
    confirmLabel: (row) =>
      `Запись ${row.expanseId} будет удалена безвозвратно.`,
  },
});
