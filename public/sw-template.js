import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
