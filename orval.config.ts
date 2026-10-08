import { defineConfig } from "orval";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
const apiTarget = env.VITE_API_PROXY_TARGET;

if (!apiTarget) {
  throw new Error("VITE_API_PROXY_TARGET must be set in .env");
}

const openApiUrl = `${apiTarget.replace(/\/$/, "")}/documentation-json`;

type OpenApiParameter = {
  name?: string;
  in?: string;
};

type OpenApiDocument = {
  paths?: Record<
    string,
    {
      get?: {
        parameters?: OpenApiParameter[];
      };
    }
  >;
};

// The published spec marks `stage` as a path param on
// GET /environment/{environmentId}/info, but that segment is not in the path.
// The live route is /environment/:environmentId/info, and list already takes
// stage as a query param, so treat this one the same way.
function normalizeSpec(spec: OpenApiDocument) {
  const parameters =
    spec.paths?.["/environment/{environmentId}/info"]?.get?.parameters;

  for (const parameter of parameters ?? []) {
    if (parameter.name === "stage" && parameter.in === "path") {
      parameter.in = "query";
    }
  }

  return spec;
}

export default defineConfig(async () => {
  const response = await fetch(openApiUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to load OpenAPI spec: ${response.status} ${openApiUrl}`,
    );
  }

  const spec = normalizeSpec((await response.json()) as OpenApiDocument);

  return {
    petstore: {
      output: {
        mode: "single",
        target: "./src/shared/model/petstore.ts",
        schemas: { path: "./src/shared/model/schemas", type: "zod" },
        client: "react-query",
        mock: true,
        formatter: "prettier",
        override: {
          mutator: {
            path: "./src/shared/api/fetcher.ts",
            name: "customFetch",
          },

          query: {
            useQuery: true,
            useMutation: false,
            useSuspenseQuery: true,
            useSuspenseInfiniteQuery: true,
            useInfinite: true,
            useInfiniteQueryParam: "skip",
            useInvalidate: true,
          },
        },
      },
      input: {
        target: spec,
      },
    },
  };
});
