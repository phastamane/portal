import { DragDropProvider } from "@dnd-kit/react";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "../sidebar/ui/sidebar";

export function MainLayout() {
  return (
    <div className="flex h-screen w-full bg-muted/20">
      <Sidebar />
      <DragDropProvider>
        <main className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </DragDropProvider>
    </div>
  );
}
