import { getToken, removeToken } from "../lib/token";
import { API_BASE_URL } from "./base-url";

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const headers = new Headers(options?.headers);

  const token = getToken();
  if (token) {
    // OpenAPI security scheme: apiKey header named "jwt".
    headers.set("jwt", token);
  }

  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  if (res.status === 401) {
    removeToken();
  }

  const data = body ? JSON.parse(body) : {};

  return {
    data,
    status: res.status,
    headers: res.headers,
  } as T;
};
