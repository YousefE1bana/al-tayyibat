import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { validateContent } from "./lib/validate";
import "./fonts.css";
import "./index.css";
import { PwaProvider } from "./pwa/PwaProvider";

// Fail loudly in development if the content database has broken references.
validateContent();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PwaProvider><App /></PwaProvider>
    </ErrorBoundary>
  </StrictMode>,
);
