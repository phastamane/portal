const TOKEN_KEY = "jwt";

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (jwt: string): void => {
  localStorage.setItem(TOKEN_KEY, jwt);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
