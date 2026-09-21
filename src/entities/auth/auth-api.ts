import { setToken } from "@/shared/lib/token";
import { managerControllerHandleManagerAuth } from "@/shared/model/petstore";

type AuthPayload = Parameters<typeof managerControllerHandleManagerAuth>[0];

function readJwt(value: unknown, depth = 0): string | undefined {
  if (depth > 4 || typeof value !== "object" || value === null) {
    return undefined;
  }

  const rec = value as Record<string, unknown>;
  if (typeof rec.jwt === "string" && rec.jwt.length > 0) {
    return rec.jwt;
  }

  return readJwt(rec.meta, depth + 1) ?? readJwt(rec.data, depth + 1);
}

export const authApi = async (payload: AuthPayload): Promise<boolean> => {
  try {
    const res = await managerControllerHandleManagerAuth(payload);
    const jwt = readJwt(res);
    if (!jwt) return false;
    setToken(jwt);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
