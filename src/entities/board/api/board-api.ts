import { useExpanseControllerHandleExpanseList } from "@/shared/model/petstore";

export type ExpanseStage = "DEV" | "TEST" | "PREPROD" | "PROD";

export type ExpanseProject = {
  projectId: string;
  environmentId: string;
  title: string;
  url: string;
  images: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpanseEnvironment = {
  stage: ExpanseStage;
  projects: ExpanseProject[];
};

export type Expanse = {
  expanseId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  environment: ExpanseEnvironment[];
};

const STAGES: ExpanseStage[] = ["DEV", "TEST", "PREPROD", "PROD"];

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapProject(raw: unknown): ExpanseProject | null {
  if (!isRecord(raw)) return null;
  const projectId = String(raw.projectId ?? "");
  if (!projectId) return null;

  return {
    projectId,
    environmentId: String(raw.environmentId ?? ""),
    title: String(raw.title ?? "Без названия"),
    url: String(raw.url ?? ""),
    images: typeof raw.images === "string" ? raw.images : null,
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

function mapEnvironment(raw: unknown): ExpanseEnvironment | null {
  if (!isRecord(raw)) return null;
  const stage = raw.stage;
  if (
    stage !== "DEV" &&
    stage !== "TEST" &&
    stage !== "PREPROD" &&
    stage !== "PROD"
  ) {
    return null;
  }

  return {
    stage,
    projects: asArray(raw.projects)
      .map(mapProject)
      .filter((project): project is ExpanseProject => project !== null),
  };
}

function mapExpanse(raw: unknown): Expanse | null {
  if (!isRecord(raw)) return null;
  const expanseId = String(raw.expanseId ?? raw.id ?? "");
  if (!expanseId) return null;

  return {
    expanseId,
    title: String(raw.title ?? "Без названия"),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
    environment: asArray(raw.environment)
      .map(mapEnvironment)
      .filter((environment): environment is ExpanseEnvironment => environment !== null)
      .sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)),
  };
}

function parseExpanseList(body: unknown): { expanses: Expanse[]; count: number } {
  if (!isRecord(body)) return { expanses: [], count: 0 };

  const data = isRecord(body.data) ? body.data : body;
  const expanses = asArray(data.expanses)
    .map(mapExpanse)
    .filter((expanse): expanse is Expanse => expanse !== null);
  const meta = isRecord(body.meta) ? body.meta : {};
  const count = typeof meta.count === "number" ? meta.count : expanses.length;

  return { expanses, count };
}

export function useExpanses() {
  const query = useExpanseControllerHandleExpanseList({ skip: 0, take: 50 });
  const parsed = parseExpanseList(query.data?.data);

  return {
    expanses: parsed.expanses,
    count: parsed.count,
    isLoading: query.isLoading,
    isError: query.isError || (query.data != null && query.data.status !== 200),
  };
}
