/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, NetworkOnly, Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig &
  typeof globalThis & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Audio streaming must bypass SW caching entirely
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/audio/"),
      handler: new NetworkOnly(),
    },
    // Book files (EPUB/PDF) — streaming, can't cache
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/books/file/"),
      handler: new NetworkOnly(),
    },
    // Book covers — stable images, aggressive cache
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/books/cover/"),
      handler: new CacheFirst({
        cacheName: "book-covers",
        matchOptions: { ignoreSearch: true },
      }),
    },
    // Epub user data — must be fresh
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/epub/"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
