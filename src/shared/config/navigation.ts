export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
}

export const ENTITY_NAVIGATION: NavigationItem[] = [
  { path: "/expanses", label: "Пространство" },
  { path: "/projects", label: "Проекты" },
  // CLI_INJECT_NAVIGATION
];
