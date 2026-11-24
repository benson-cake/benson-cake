// 고객 화면(신청 완료·예약 확인)에서 함께 쓰는 기능: 예약 내용 공유
// 확정 문자를 보내지 않는 대신, 고객이 예약 내용을 직접 저장해 두도록 돕습니다.
import { STORE_PHONES, PREORDER_DISCOUNT_RATE } from "./config.js";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export const prettyDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${m}월 ${d}일(${WEEK[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`;
};

export const itemsOf = (r) => (Array.isArray(r.items) && r.items.length ? r.items : [{ name: r.cake, qty: r.qty }]);

export const payNote = () =>
  `매장에서 휴대폰 번호 뒷자리 4자리를 말씀해 주시면 사전예약가(${PREORDER_DISCOUNT_RATE}% 할인)로 결제해 드려요.`;

/** 공유·복사용 예약 요약 문구 */
export function reservationText(r, statusUrl) {
  const tel = STORE_PHONES[r.store];
  return [
    "[벤슨] 크리스마스 케이크 픽업 예약",
    `예약번호: ${r.code}`,
    `픽업 매장: ${r.store}${tel ? ` (${tel})` : ""}`,
    `픽업 일시: ${prettyDate(r.pickupDate)} ${r.pickupTime}`,
    `주문 상품 (총 ${r.qty}개)`,
    ...itemsOf(r).map((i) => `- ${i.name} ${i.qty}개`),
    "",
    `결제: ${payNote()}`,
    tel ? `취소·변경: 매장(${tel})으로 연락해 주세요.` : "취소·변경: 예약한 매장으로 연락해 주세요.",
    `예약 확인: ${statusUrl}`
  ].join("\n");
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (_) {
    try {
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove();
      return ok;
    } catch (_) { return false; }
  }
}

/** 공유 시트(카카오톡 나에게 보내기 등). 지원하지 않으면 문구를 복사합니다.
 *  반환값: "shared" | "cancelled" | "copied" | "failed" */
export async function shareReservation(r, statusUrl) {
  const text = reservationText(r, statusUrl);
  if (navigator.share) {
    try { await navigator.share({ title: "벤슨 케이크 픽업 예약", text }); return "shared"; }
    catch (err) { if (err && err.name === "AbortError") return "cancelled"; }
  }
  return (await copyText(text)) ? "copied" : "failed";
}

/** 공유 버튼을 연결하고, 결과 안내 문구를 noteEl에 보여 줍니다. */
export function wireSaveButtons({ shareBtn, noteEl, getRow, statusUrl }) {
  const say = (t) => { if (!noteEl) return; noteEl.textContent = t; noteEl.hidden = !t; };
  if (shareBtn) shareBtn.onclick = async () => {
    const r = getRow(); if (!r) return;
    const res = await shareReservation(r, statusUrl);
    if (res === "copied") say("예약 내용을 복사했어요. 카카오톡 ‘나와의 채팅’이나 메모에 붙여 넣어 두세요.");
    else if (res === "failed") say("복사하지 못했어요. 이 화면을 캡처해 두세요.");
    else say("");
  };
}
