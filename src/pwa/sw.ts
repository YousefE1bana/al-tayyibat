/// <reference lib="webworker" />
import { clientsClaim, setCacheNameDetails } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { pwa } from "../config/pwa";

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> };
const base = import.meta.env.BASE_URL;
setCacheNameDetails({ prefix: "al-tayyibat", suffix: base.replace(/\//g, "-") });
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();
registerRoute(new NavigationRoute(createHandlerBoundToURL(`${base}index.html`), {
  allowlist: [new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:index\\.html)?$`)],
}));
registerRoute(({ url, request }) => request.destination === "image" && url.origin === self.location.origin && url.pathname.startsWith(`${base}images/foods/`),
  new CacheFirst({ cacheName: pwa.foodCache.name, plugins: [
    new CacheableResponsePlugin({ statuses: [200] }),
    new ExpirationPlugin({ maxEntries: pwa.foodCache.maxEntries, maxAgeSeconds: pwa.foodCache.maxAgeSeconds, purgeOnQuotaError: true }),
  ] }),
);
// Updates wait until the user explicitly accepts them in the application.
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});
