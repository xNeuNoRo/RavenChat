import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "./lib/react-query.ts";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {/* Proveedor global de notificaciones */}
        <Toaster theme="dark" position="top-center" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
