// =====================================================================
//  벤슨 케이크 사전예약 — 설정 파일
//  이 파일 하나만 고치면 예약 페이지·확인 페이지·관리자 페이지에 모두 반영됩니다.
//  [필수] 표시된 항목은 배포 전에 반드시 채워 주세요.
// =====================================================================

// [필수] Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹) > SDK 구성 및 구성에서 복사
export const firebaseConfig = {
  apiKey: "AIzaSyCyMzGasfMzq5tfDPwVWEZvKDWzgI7wwIk",
  authDomain: "benson-cake-preorder.firebaseapp.com",
  projectId: "benson-cake-preorder",
  storageBucket: "benson-cake-preorder.firebasestorage.app",
  messagingSenderId: "780596595296",
  appId: "1:780596595296:web:3e74f4164f73350e175105"
};

// 메타 픽셀 ID (광고 담당에게 받기). 비워 두면 픽셀을 불러오지 않습니다.
export const META_PIXEL_ID = "";

// 브랜드 이미지 (같은 저장소에 올린 파일 이름 또는 전체 주소). 비워 두면 글자로 표시합니다.
export const BRAND = {
  logoUrl: "",        // 예: "logo.png" (흰색 로고 권장)
  heroImageUrl: ""    // 예: "cake.png" (배경이 투명한 케이크 사진 권장)
};

// 참여 매장 (직영 전 매장). 이름을 바꾸면 매장 계정의 매장명도 같이 바꿔야 합니다.
export const STORES = [
  "벤슨 63빌딩", "벤슨 서울대입구역점", "벤슨 을지로3가점", "벤슨 크리머리 서울",
  "벤슨 서현점", "벤슨 위례점", "벤슨 강남역점", "벤슨 잠실새내점", "벤슨 둔촌점",
  "벤슨 청량리역", "벤슨 미사점", "벤슨 반포점", "벤슨 화곡점", "벤슨 그랑서울",
  "벤슨 신림점", "벤슨 대치점", "벤슨 동부이촌점", "벤슨 마포점", "벤슨 목동점",
  "벤슨 이태원점", "벤슨 스타필드 수원", "벤슨 갤러리아 명품관", "벤슨 천호역점",
  "벤슨 롯데월드몰", "벤슨 용산역", "벤슨 서울역", "벤슨 선릉역"
];

// 예약 가능 케이크 (POS 등록명·정상가 기준). price는 화면 표시용이며, 비워 두면 가격 없이 이름만 보입니다.
export const CAKES = [
  { name: "땡큐베리 스트로베리 케이크", price: 39000 },
  { name: "해피UP 저지밀크 케이크",     price: 39000 },
  { name: "벨지안 초콜릿 티라미수",     price: 39000 },
  { name: "피스타치오베리가든",         price: 39000 },
  { name: "초콜릿 기프트박스 화이트",   price: 39000 },
  { name: "잇츠마이 버스데이 케이크",   price: 43000 }
];

export const MAX_QTY = 5;            // 한 번에 예약 가능한 최대 수량
export const MIN_DAYS_AHEAD = 1;     // 최소 1일 전 예약 → 내일부터 선택 가능
export const MAX_DAYS_AHEAD = 30;    // 며칠 뒤까지 예약받을지 (프로모션 기간에 맞춰 조정)

// 픽업 시간 선택 범위. 매장별 운영시간이 달라도 매장이 확인 후 확정하는 구조라 공통 범위로 둡니다.
export const PICKUP_TIME = { start: "10:00", end: "21:00", stepMin: 30 };

// [필수] 개인정보 수집·이용 동의 고지 (개인정보 보호법 제15조 제2항의 4가지 항목)
//        보유 기간은 사내 개인정보 담당자 확인 후 확정해 주세요.
export const PRIVACY = {
  purpose: "케이크 픽업 사전예약 접수, 예약 확인 및 확정 안내 연락",
  items: "이름, 휴대폰번호, 픽업 매장, 픽업 희망 일시, 주문 상품·수량, 요청사항",
  retention: "픽업일로부터 1개월 후 파기 (확인 필요)",
  refusal: "동의를 거부할 수 있습니다. 다만 거부하시면 사전예약 신청을 할 수 없습니다."
};

// 매장에서 보내는 문자 문구. {중괄호} 부분은 예약 정보로 자동으로 바뀝니다.
// 사용 가능: {name} {store} {datetime} {cake} {qty} {code} {link}
export const MESSAGES = {
  confirmed:
`[벤슨] {name}님, 케이크 픽업 예약이 확정되었습니다.

픽업 매장: {store}
픽업 일시: {datetime}
상품: {cake} {qty}개
예약번호: {code}

방문하셔서 휴대폰 번호 뒷자리를 말씀해 주시면 사전예약 할인가로 결제해 드립니다.
예약 확인: {link}`,

  reschedule:
`[벤슨] {name}님, 요청하신 {datetime} 픽업이 어려워 연락드립니다.
가능하신 픽업 날짜와 시간을 이 번호로 답장해 주시면 다시 확정해 드리겠습니다.
예약번호: {code}`
};
