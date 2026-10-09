import {
  useEnvironmentControllerHandleEnvironmentList,
  useExpanseControllerHandleExpanseList,
} from "@/shared/model/petstore";

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
  environmentId: string;
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

  const projects = asArray(raw.projects)
    .map(mapProject)
    .filter((project): project is ExpanseProject => project !== null);

  return {
    environmentId: String(
      raw.environmentId ?? raw.id ?? projects[0]?.environmentId ?? "",
    ),
    stage,
    projects,
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

function parseEnvironmentIds(body: unknown): Map<string, string> {
  const ids = new Map<string, string>();
  if (!isRecord(body)) return ids;

  const data = isRecord(body.data) ? body.data : body;
  for (const raw of asArray(data.environment)) {
    if (!isRecord(raw)) continue;
    const environmentId = String(raw.environmentId ?? raw.id ?? "");
    const expanseId = String(raw.expanseId ?? "");
    const stage = raw.stage;
    if (!environmentId || !expanseId || typeof stage !== "string") continue;
    ids.set(`${expanseId}:${stage}`, environmentId);
  }

  return ids;
}

function withEnvironmentIds(
  expanses: Expanse[],
  ids: Map<string, string>,
): Expanse[] {
  return expanses.map((expanse) => ({
    ...expanse,
    environment: expanse.environment.map((environment) => ({
      ...environment,
      environmentId:
        environment.environmentId ||
        ids.get(`${expanse.expanseId}:${environment.stage}`) ||
        "",
    })),
  }));
}

export function useExpanses() {
  const query = useExpanseControllerHandleExpanseList({ skip: 0, take: 50 });
  const environmentQuery = useEnvironmentControllerHandleEnvironmentList({
    skip: 0,
    take: 200,
  });
  const parsed = parseExpanseList(query.data?.data);
  const environmentIds = parseEnvironmentIds(environmentQuery.data?.data);

  return {
    expanses: withEnvironmentIds(parsed.expanses, environmentIds),
    count: parsed.count,
    isLoading: query.isLoading || environmentQuery.isLoading,
    isError: query.isError || (query.data != null && query.data.status !== 200),
  };
}
