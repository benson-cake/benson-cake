// 벤슨 관리자 앱 — 서비스 워커
// - 관리자 화면은 항상 최신 파일을 먼저 받아오고(네트워크 우선), 인터넷이 끊겼을 때만 저장해 둔 화면을 보여 줍니다.
// - 고객용 페이지(예약·완료·상태 확인)는 건드리지 않습니다.
// - 예약 등 업무 데이터(Firebase)는 저장하지 않습니다.
const CACHE = "benson-app-v2";
const CUSTOMER_PAGES = ["", "index.html", "complete.html", "status.html"];
const PRECACHE = ["./app.html", "./app-menu.js", "./app-shell.js", "./app.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                 // Firebase·폰트 등 외부 요청은 그대로
  const file = url.pathname.split("/").pop();
  if (CUSTOMER_PAGES.includes(file)) return;                        // 고객 화면은 그대로
  if (/\.(jpg|jpeg)$/i.test(file)) return;                          // 케이크 사진 등은 그대로
  const key = new Request(url.origin + url.pathname);               // ?쿼리는 무시하고 저장
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
        return res;
      })
      .catch(async () => (await caches.match(key)) || (req.mode === "navigate" ? caches.match("./app.html") : Response.error()))
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "./app.html";
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const win = all.find((c) => new URL(c.url).pathname.endsWith(target.replace("./", "/")));
    if (win) return win.focus();
    return self.clients.openWindow(target);
  })());
});
