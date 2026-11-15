// Service Worker: notifiche (anche push) e apertura del link al clic
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  const d = e.data ? e.data.json() : { title: "Cispu PS5", body: "Nuova offerta!" };
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: "icon-192.png", data: { url: d.url } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.notification.data && e.notification.data.url) e.waitUntil(clients.openWindow(e.notification.data.url));
});
