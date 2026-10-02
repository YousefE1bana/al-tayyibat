import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
interface PwaState {
  canInstall: boolean;
  iosHelp: boolean;
  offlineReady: boolean;
  offline: boolean;
  waiting: ServiceWorker | null;
  install(): Promise<void>;
  update(): void;
  updating: boolean;
  error: string;
}
const PwaContext = createContext<PwaState | null>(null);
const standaloneQuery = "(display-mode: standalone)";
const isStandalone = () => window.matchMedia(standaloneQuery).matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function PwaProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(isStandalone);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const requestedUpdate = useRef(false);

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      if (!isStandalone()) setInstallEvent(event as InstallEvent);
    };
    const installedNow = () => { setInstalled(true); setInstallEvent(null); };
    const displayMode = window.matchMedia(standaloneQuery);
    const modeChanged = () => setInstalled(isStandalone());
    const onlineChanged = () => setOffline(!navigator.onLine);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installedNow);
    window.addEventListener("online", onlineChanged);
    window.addEventListener("offline", onlineChanged);
    displayMode.addEventListener("change", modeChanged);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installedNow);
      window.removeEventListener("online", onlineChanged);
      window.removeEventListener("offline", onlineChanged);
      displayMode.removeEventListener("change", modeChanged);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    const cleanups: Array<() => void> = [];
    const controllerChanged = () => {
      setOfflineReady(true);
      if (requestedUpdate.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
          scope: import.meta.env.BASE_URL, updateViaCache: "none",
        });
        if (disposed) return;
        const reportWaiting = () => { if (registration?.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting); };
        reportWaiting();
        const updateFound = () => {
          const worker = registration?.installing;
          if (!worker) return;
          const changed = () => { if (worker.state === "installed") reportWaiting(); };
          worker.addEventListener("statechange", changed);
          cleanups.push(() => worker.removeEventListener("statechange", changed));
        };
        registration.addEventListener("updatefound", updateFound);
        cleanups.push(() => registration?.removeEventListener("updatefound", updateFound));
        // Check again when returning to the guide; no polling, tracking or backend.
        const checkUpdate = () => { if (document.visibilityState === "visible" && navigator.onLine) void registration?.update().catch(() => {}); };
        document.addEventListener("visibilitychange", checkUpdate);
        cleanups.push(() => document.removeEventListener("visibilitychange", checkUpdate));
        await navigator.serviceWorker.ready;
        if (!disposed) setOfflineReady(Boolean(navigator.serviceWorker.controller));
      } catch {
        // Installation/caching can be unavailable (private mode, offline first visit).
        // The ordinary online guide continues to work without a permission prompt.
      }
    };
    // Register after the page's critical resources; never compete with first paint.
    const start = () => { void register(); };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      disposed = true;
      window.removeEventListener("load", start);
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChanged);
      cleanups.forEach(cleanup => cleanup());
    };
  }, []);

  const install = async () => {
    if (!installEvent || installed) return;
    setError("");
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } catch { setError("تعذّر فتح طلب التثبيت. يمكنك المحاولة من قائمة المتصفح."); }
    finally { setInstallEvent(null); }
  };
  const update = () => {
    if (!waiting || updating) return;
    setError("");
    if (waiting.state === "redundant") { window.location.reload(); return; }
    requestedUpdate.current = true;
    setUpdating(true);
    waiting.postMessage({ type: "SKIP_WAITING" });
  };
  return <PwaContext.Provider value={{ canInstall: !installed && Boolean(installEvent), iosHelp: !installed && isIos(), offlineReady, offline, waiting, install, update, updating, error }}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error("PWA controls require PwaProvider");
  return value;
}
