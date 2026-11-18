// =====================================================================
//  벤슨 관리자 앱 — 공통 앱 기능 (모든 관리자 화면에서 불러 쓰기)
//  <script type="module" src="app-shell.js"></script> 한 줄이면:
//   · 앱(서비스 워커) 등록  · 홈 화면 설치 안내(안드로이드/아이폰/카카오톡 인앱)
//   · data-app-install 버튼 → 설치, data-app-reload 버튼 → 새로고침(앱 실행 중에만 표시)
// =====================================================================
const APP_TITLE = "벤슨 관리자";

export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const ua = navigator.userAgent;
const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const inAppBrowser = /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i.test(ua);
const DISMISS_KEY = "benson_app_install_dismissed";
const dismissed = () => { try { return Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now(); } catch (_) { return false; } };

/* ---------- 서비스 워커 ---------- */
if ("serviceWorker" in navigator) {
  (async () => {
    try {
      // 예전 케이크 전용 앱 등록(admin.html 범위)이 남아 있으면 정리
      for (const r of await navigator.serviceWorker.getRegistrations()) {
        if (r.scope.endsWith("admin.html")) await r.unregister();
      }
      await navigator.serviceWorker.register("sw.js", { scope: "./" });
    } catch (e) { console.warn("앱 등록 실패", e); }
  })();
}

/* ---------- 설치 안내 ---------- */
const style = document.createElement("style");
style.textContent = `
  .bx-sheet { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: 60;
    max-width: 460px; margin: 0 auto; padding: 16px; border-radius: 16px; background: #fff; color: #1E2B38;
    box-shadow: 0 10px 30px rgba(20,32,45,.28); display: grid; grid-template-columns: 48px 1fr; gap: 4px 12px;
    font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif; word-break: keep-all; }
  .bx-sheet[hidden] { display: none !important; }
  .bx-sheet img { grid-row: span 2; width: 48px; height: 48px; border-radius: 12px; }
  .bx-sheet b { font-size: 15px; font-weight: 800; }
  .bx-sheet p { margin: 0; font-size: 13px; line-height: 1.55; color: #5E6E7F; }
  .bx-sheet p b { font-size: 13px; color: #1E2B38; }
  .bx-row { grid-column: 1 / -1; display: flex; gap: 8px; margin-top: 10px; }
  .bx-row button { flex: 1; min-height: 44px; border-radius: 12px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
  .bx-go { border: 0; background: #22364A; color: #fff; }
  .bx-go[hidden] { display: none; }
  .bx-later { border: 1.5px solid #D6E0EC; background: #fff; color: #5E6E7F; }
  .bx-row button:focus-visible { outline: 3px solid #7EA9DB; outline-offset: 2px; }
  .bx-share { display: inline-block; width: 15px; height: 15px; vertical-align: -2px; }`;
document.head.appendChild(style);

const sheet = document.createElement("div");
sheet.className = "bx-sheet"; sheet.hidden = true;
sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-labelledby", "bxTitle");
sheet.innerHTML = `
  <img src="icon-192.png" alt="" width="48" height="48">
  <b id="bxTitle">홈 화면에 ‘${APP_TITLE}’ 앱 설치</b>
  <p id="bxText"></p>
  <div class="bx-row"><button type="button" class="bx-later" id="bxLater">나중에</button><button type="button" class="bx-go" id="bxGo">설치하기</button></div>`;
document.body.appendChild(sheet);
const $ = (id) => document.getElementById(id);
const SHARE = '<svg class="bx-share" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="공유 버튼"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

let deferredPrompt = null;
function openSheet(mode) {
  if (isStandalone()) return;
  const text = $("bxText"), go = $("bxGo");
  go.hidden = false;
  if (mode === "android") { text.textContent = "설치하면 브라우저 없이 아이콘 하나로 바로 들어올 수 있어요."; go.textContent = "설치하기"; }
  else if (mode === "pc") { text.textContent = "크롬·엣지 주소창 오른쪽의 설치 아이콘(모니터 모양)을 누르면 PC에도 앱처럼 설치돼요."; go.textContent = "확인"; }
  else if (mode === "inapp") { text.textContent = "카카오톡 등 앱 안의 브라우저에서는 설치가 안 돼요. 오른쪽 위 메뉴에서 ‘다른 브라우저로 열기’(아이폰은 Safari)를 눌러 주세요."; go.hidden = true; }
  else { text.innerHTML = `${SHARE} <b>공유</b> 버튼 → <b>홈 화면에 추가</b>를 누르면 설치돼요.`; go.textContent = "확인"; }
  sheet.hidden = false;
}
const installBtns = () => document.querySelectorAll("[data-app-install]");
const showInstallBtns = (on) => installBtns().forEach((b) => { b.hidden = !on; });

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); deferredPrompt = e;
  showInstallBtns(true);
  if (!dismissed()) openSheet("android");
});
window.addEventListener("appinstalled", () => { deferredPrompt = null; showInstallBtns(false); sheet.hidden = true; });

$("bxGo").onclick = async () => {
  sheet.hidden = true;
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  try { await deferredPrompt.userChoice; } catch (_) {}
  deferredPrompt = null;
};
$("bxLater").onclick = () => {
  sheet.hidden = true;
  try { localStorage.setItem(DISMISS_KEY, String(Date.now() + 3 * 86400000)); } catch (_) {}   // 3일간 다시 안 띄움
};

function wireButtons() {
  installBtns().forEach((b) => {
    b.addEventListener("click", () => deferredPrompt ? $("bxGo").onclick() : openSheet(inAppBrowser ? "inapp" : isIOS ? "ios" : "pc"));
  });
  document.querySelectorAll("[data-app-reload]").forEach((b) => { b.hidden = !isStandalone(); b.addEventListener("click", () => location.reload()); });
  if (!isStandalone() && (isIOS || inAppBrowser)) {
    showInstallBtns(true);
    if (!dismissed()) setTimeout(() => openSheet(inAppBrowser ? "inapp" : "ios"), 800);
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireButtons); else wireButtons();
