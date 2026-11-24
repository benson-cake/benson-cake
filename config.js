/* ================================================================
   벤슨 가맹문의 DB — 공통 설정
   접수폼(index.html)과 관리자 화면(admin.html)이 함께 사용합니다.
   ================================================================ */

/* ① Firebase 웹 앱 설정값
   Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성(Config) 값을 붙여넣으세요.
   이 값은 공개되어도 되는 식별값이고, 데이터 보호는 firestore.rules(보안 규칙)가 담당합니다. */
export const firebaseConfig = {
  apiKey: "AIzaSyC_PdN4OWBEAQAXbowvdZArM9gp-J7dS-0",
  authDomain: "benson-franchise.firebaseapp.com",
  projectId: "benson-franchise",
  storageBucket: "benson-franchise.firebasestorage.app",
  messagingSenderId: "583183052933",
  appId: "1:583183052933:web:4b9f4c16f60ea3da6439ec"
};

export const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/10.12.2";

/* ② 개인정보 수집·이용 동의 문구 — 회사 개인정보 처리방침 기준으로 확인 후 수정하세요. */
export const PRIVACY = {
  purpose: "가맹 상담 검토, 상담 진행 여부 및 후속 절차 안내",
  items: "성함, 연락처, 이메일, 연령대, 희망 출점 지역, 투자 가능 금액, 외식업 경험, 지원 사유, 희망 오픈 시기, 운영 참여 계획, 점포 정보, 기타 문의 내용",
  retention: "접수일로부터 1년 (기간이 지나거나 삭제를 요청하시면 지체 없이 파기)"
};

export const FORM_VERSION = 1;

/* ③-1 보관 기간: 접수일로부터 이 기간이 지난 문의는 관리자 화면을 열 때 자동 삭제됩니다. */
export const RETENTION_MONTHS = 12;

/* ③ 선택 항목 — 값(v)은 보안 규칙·등급 기준과 연결되어 있으니 문구(t)만 수정하세요. */
export const AGE = [
  { v: "20", t: "20대" }, { v: "30", t: "30대" }, { v: "40", t: "40대" },
  { v: "50", t: "50대" }, { v: "60", t: "60대 이상" }
];
export const FNB = [
  { v: "owner", t: "외식업 매장을 운영(점주)한 경험이 있음" },
  { v: "staff", t: "외식업 매장에서 근무한 경험이 있음" },
  { v: "none",  t: "경험 없음" }
];
export const OPEN = [
  { v: "m3", t: "3개월 이내" }, { v: "m6", t: "3~6개월" }, { v: "m12", t: "6개월~1년" },
  { v: "y1", t: "1년 이후" }, { v: "nego", t: "협의 가능" }
];
export const OPER = [
  { v: "self", t: "본인 직접 운영" }, { v: "manager", t: "관리자 채용" }, { v: "other", t: "기타" }
];
export const STORE = [
  { v: "none", t: "미확보" }, { v: "reviewing", t: "검토 중" }, { v: "secured", t: "확보 완료" }
];
/* 진행 단계 — 가맹문의 응대 프로세스(STEP 1~5) 기준 */
export const STATUS = [
  { v: "new", t: "미확인" },
  { v: "reviewed", t: "1차 검토 완료" },
  { v: "consult", t: "유선 상담 (STEP 2)" },
  { v: "interview", t: "대면 상담·2차 평가 (STEP 3)" },
  { v: "deliberation", t: "출점 심의 (STEP 4)" },
  { v: "contract", t: "가맹계약 진행 (STEP 5)" },
  { v: "hold", t: "보류 안내 · DB 보관" },
  { v: "closed", t: "종료 (탈락·포기)" }
];
export const STAGES = [                 // 상세 화면 상단 진행 표시
  { t: "1차 평가", vs: ["new", "reviewed"] },
  { t: "유선 상담", vs: ["consult"] },
  { t: "대면·2차 평가", vs: ["interview"] },
  { t: "출점 심의", vs: ["deliberation"] },
  { t: "가맹계약", vs: ["contract"] }
];
export const INACTIVE = ["hold", "closed"];   // 연락 예정·2차 평가 대기 집계에서 제외

/* 접촉 이력 — 접촉 방법 */
export const CONTACT_METHODS = [
  { v: "call", t: "전화" }, { v: "sms", t: "문자·카톡" }, { v: "mail", t: "메일" },
  { v: "meet", t: "대면 상담" }, { v: "visit", t: "매장·점포 방문" }, { v: "etc", t: "기타" }
];

/* ⑥ 2차 심층 상담평가 기본값 (초안)
   관리자 화면 > 평가 기준에서 항목·배점·확인 포인트를 수정·저장하면 저장된 값이 우선 적용됩니다.
   항목별로 상담 담당자가 1~5점을 매기고, (점수/5 × 배점)의 합을 100점 만점으로 환산합니다. */
export const SCALE = [
  { v: 1, t: "매우 미흡" }, { v: 2, t: "미흡" }, { v: 3, t: "보통" }, { v: 4, t: "우수" }, { v: 5, t: "매우 우수" }
];
export const VERDICT = [
  { v: "pass", t: "심의 상정 (적합)" }, { v: "recheck", t: "보완 후 재상담" }, { v: "fail", t: "부적합 (종료)" }
];
export const DEFAULT_INTERVIEW = {
  targetGrades: ["A", "B"],             // 2차 평가 대상: 1차 등급
  items: [
    { id: "store", label: "실제 매장 운영 경험", weight: 20,
      guide: "운영·근무한 매장의 업종·규모·기간, 본인이 직접 맡은 업무(오픈·마감, 발주·재고, 위생, 고객 응대)" },
    { id: "career", label: "과거 경력", weight: 10,
      guide: "직무·조직 경험, 서비스·관리 경험, 경력 공백과 그 사유" },
    { id: "selfemp", label: "자영업 경험", weight: 10,
      guide: "사업자 운영 기간·업종, 폐업 경험과 사유, 세무·노무 처리 경험" },
    { id: "pnl", label: "매출·손익 관리 능력", weight: 20,
      guide: "매출·원가·인건비·임대료 구조 이해, 손익분기 개념, 자기자본·대출 비중 등 자금 계획" },
    { id: "staff", label: "인력 운영 계획", weight: 20,
      guide: "본인 주당 근무 시간과 오픈 초기 직접 근무 여부(오토운영 여부), 직원 채용·교육·근무표 계획" },
    { id: "area", label: "희망 상권 이해도", weight: 20,
      guide: "상권의 유동 인구·주 고객층·시간대, 경쟁점 파악, 후보 점포 조건(면적·임대료·가시성) 이해" }
  ],
  risks: [
    { id: "auto", label: "오토운영 우려 (본인 근무 계획 불명확)" },
    { id: "debt", label: "자금·채무 우려 (차입 비중 과다, 자금 출처 불명확)" },
    { id: "qsc", label: "운영 기준(QSC)·본사 방침 수용 의지 부족" }
  ],
  bands: { good: 70, ok: 50 }           // 100점 환산: 70 이상 우수, 50 이상 보통, 미만 미흡
};
export const AFFINITY = [            // 우호도: 담당자가 상담·통화 후 직접 표시 (점수에는 반영 안 함)
  { v: "high", t: "높음" }, { v: "mid", t: "보통" }, { v: "low", t: "낮음" }
];
/* 구분 (문의 경로·출처) — 문의마다 관리자 화면에서 바꿀 수 있음
   접수폼 링크로 제출된 문의는 '메일 접수', 링크 뒤에 ?src=homepage 가 붙은 경우만 '홈페이지 접수'로 들어옵니다. */
export const SOURCE = [
  { v: "mail", t: "메일 접수", s: "메일 접수" },
  { v: "network", t: "기존 네트워크 기반 점주", s: "네트워크 점주", hint: "소개자·관계 (예: ○○점 점주 소개)" },
  { v: "br", t: "배스킨라빈스 전환점", s: "BR 전환점", hint: "운영 중인 배스킨라빈스 매장명·운영 기간" },
  { v: "homepage", t: "홈페이지 접수", s: "홈페이지" },
  { v: "etc", t: "기타", s: "기타" }
];

/* ④ 시·도 / 시·군·구 (2026년 11월 기준: 인천 제물포·영종·서해·검단구, 화성시 4개 구 반영)
   일반구가 있는 시는 '시 + 구'로 나눴습니다. 목록에 없으면 신청자가 직접 입력할 수 있습니다. */
export const REGIONS = {
  "서울": ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"],
  "부산": ["강서구","금정구","기장군","남구","동구","동래구","부산진구","북구","사상구","사하구","서구","수영구","연제구","영도구","중구","해운대구"],
  "대구": ["군위군","남구","달서구","달성군","동구","북구","서구","수성구","중구"],
  "인천": ["강화군","검단구","계양구","남동구","미추홀구","부평구","서해구","연수구","영종구","옹진군","제물포구"],
  "광주": ["광산구","남구","동구","북구","서구"],
  "대전": ["대덕구","동구","서구","유성구","중구"],
  "울산": ["남구","동구","북구","울주군","중구"],
  "세종": ["세종시"],
  "경기": ["가평군","고양시 덕양구","고양시 일산동구","고양시 일산서구","과천시","광명시","광주시","구리시","군포시","김포시","남양주시","동두천시","부천시 소사구","부천시 오정구","부천시 원미구","성남시 분당구","성남시 수정구","성남시 중원구","수원시 권선구","수원시 영통구","수원시 장안구","수원시 팔달구","시흥시","안산시 단원구","안산시 상록구","안성시","안양시 동안구","안양시 만안구","양주시","양평군","여주시","연천군","오산시","용인시 기흥구","용인시 수지구","용인시 처인구","의왕시","의정부시","이천시","파주시","평택시","포천시","하남시","화성시 동탄구","화성시 만세구","화성시 병점구","화성시 효행구"],
  "강원": ["강릉시","고성군","동해시","삼척시","속초시","양구군","양양군","영월군","원주시","인제군","정선군","철원군","춘천시","태백시","평창군","홍천군","화천군","횡성군"],
  "충북": ["괴산군","단양군","보은군","영동군","옥천군","음성군","제천시","증평군","진천군","청주시 상당구","청주시 서원구","청주시 청원구","청주시 흥덕구","충주시"],
  "충남": ["계룡시","공주시","금산군","논산시","당진시","보령시","부여군","서산시","서천군","아산시","예산군","천안시 동남구","천안시 서북구","청양군","태안군","홍성군"],
  "전북": ["고창군","군산시","김제시","남원시","무주군","부안군","순창군","완주군","익산시","임실군","장수군","전주시 덕진구","전주시 완산구","정읍시","진안군"],
  "전남": ["강진군","고흥군","곡성군","광양시","구례군","나주시","담양군","목포시","무안군","보성군","순천시","신안군","여수시","영광군","영암군","완도군","장성군","장흥군","진도군","함평군","해남군","화순군"],
  "경북": ["경산시","경주시","고령군","구미시","김천시","문경시","봉화군","상주시","성주군","안동시","영덕군","영양군","영주시","영천시","예천군","울릉군","울진군","의성군","청도군","청송군","칠곡군","포항시 남구","포항시 북구"],
  "경남": ["거제시","거창군","고성군","김해시","남해군","밀양시","사천시","산청군","양산시","의령군","진주시","창녕군","창원시 마산합포구","창원시 마산회원구","창원시 성산구","창원시 의창구","창원시 진해구","통영시","하동군","함안군","함양군","합천군"],
  "제주": ["서귀포시","제주시"]
};

/* ⑤ 등급 분류 기본값 (초안)
   관리자 화면 > 등급 기준에서 수정·저장하면 저장된 값이 우선 적용됩니다.
   점포 확보·오픈 시기는 점수에 넣지 않고 참고용으로만 보여 줍니다. */
export const DEFAULT_GRADING = {
  minInvest: 18000,                                   // 만원. 미만이면 점수와 관계없이 C
  investTiers: [ { min: 25000, score: 30 }, { min: 18000, score: 20 } ],
  regionScore: { p1: 30, p2: 20, other: 10 },
  regionKeywords: { p1: [], p2: [] },                 // 2027 우선 출점 1·2순위 상권
  fnb:   { owner: 15, staff: 8, none: 0 },
  oper:  { self: 10, manager: 4, other: 4 },
  age:   { "20": 10, "30": 15, "40": 15, "50": 10, "60": 5 },   // 임시 초안 — 내부 기준으로 수정
  cut:   { A: 75, B: 50 }
};

/* ---------------- 공통 함수 ---------------- */

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const label = (list, v) => (list.find(o => o.v === v) || {}).t || "-";

export const toDate = t => !t ? null : typeof t.toDate === "function" ? t.toDate() : t instanceof Date ? t : null;

/* 만원 → "1억 8,000만원" */
export function manToText(v) {
  v = Math.round(Number(v) || 0);
  const e = Math.floor(v / 10000), m = v % 10000;
  if (!e) return `${m.toLocaleString("ko-KR")}만원`;
  return m ? `${e}억 ${m.toLocaleString("ko-KR")}만원` : `${e}억원`;
}

/* 만원 → "1.8억" (목록용) */
export function manToShort(v) {
  v = Number(v) || 0;
  if (v < 10000) return `${v.toLocaleString("ko-KR")}만`;
  return (v / 10000).toFixed(2).replace(/\.?0+$/, "") + "억";
}

/* 희망 지역 → "경기 성남시 분당구 (서현역 상권)" */
export function regionLabel(r = {}) {
  const base = [r.sido, r.sigungu].filter(Boolean).join(" ");
  if (!r.area) return base;
  return r.sigungu ? `${base} (${r.area})` : `${base} ${r.area}`;
}
const regionText = (r = {}) => [r.sido, r.sigungu, r.area].filter(Boolean).join(" ").replace(/\s+/g, " ");

export const parseKeywords = text =>
  String(text || "").split(/[,\n]/).map(s => s.trim().replace(/\s+/g, " ")).filter(Boolean);

/* 저장된 기준을 기본값과 합쳐 빠진 값이 없게 정리 */
export function mergeGrading(src = {}) {
  const d = DEFAULT_GRADING;
  const num = (v, f) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v))) ? f : Number(v);
  const map = (def, s = {}) => Object.fromEntries(Object.keys(def).map(k => [k, num(s?.[k], def[k])]));
  const kws = v => Array.isArray(v) ? v.map(String).map(s => s.trim()).filter(Boolean) : parseKeywords(v);
  return {
    minInvest: num(src.minInvest, d.minInvest),
    investTiers: Array.isArray(src.investTiers)
      ? src.investTiers.map(t => ({ min: num(t?.min, 0), score: num(t?.score, 0) }))
      : d.investTiers.map(t => ({ ...t })),
    regionScore: map(d.regionScore, src.regionScore),
    regionKeywords: { p1: kws(src.regionKeywords?.p1), p2: kws(src.regionKeywords?.p2) },
    fnb: map(d.fnb, src.fnb),
    oper: map(d.oper, src.oper),
    age: map(d.age, src.age),
    cut: { A: num(src.cut?.A, d.cut.A), B: num(src.cut?.B, d.cut.B) }
  };
}

const maxOf = obj => Math.max(0, ...Object.values(obj).map(Number));
export function maxScore(cfg) {
  return Math.max(0, ...cfg.investTiers.map(t => t.score)) + maxOf(cfg.regionScore)
    + maxOf(cfg.fnb) + maxOf(cfg.oper) + maxOf(cfg.age);
}

/* 2차 평가 기준: 저장된 값을 기본값과 합쳐 정리 */
export function mergeInterview(src = {}) {
  const d = DEFAULT_INTERVIEW;
  const n = (v, f) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v))) ? f : Number(v);
  const items = Array.isArray(src.items) && src.items.length
    ? src.items.filter(it => it && it.id).map(it => ({ id: String(it.id), label: String(it.label || "").trim() || "(이름 없음)",
        weight: Math.max(0, n(it.weight, 0)), guide: String(it.guide || "") }))
    : d.items.map(it => ({ ...it }));
  const risks = Array.isArray(src.risks)
    ? src.risks.filter(r => r && r.id && String(r.label || "").trim()).map(r => ({ id: String(r.id), label: String(r.label).trim() }))
    : d.risks.map(r => ({ ...r }));
  const tg = Array.isArray(src.targetGrades) ? src.targetGrades.filter(g => ["A", "B", "C"].includes(g)) : [...d.targetGrades];
  return { targetGrades: tg, items, risks,
    bands: { good: n(src.bands?.good, d.bands.good), ok: n(src.bands?.ok, d.bands.ok) } };
}

export const bandOf = (score, cfg) => score >= cfg.bands.good ? "good" : score >= cfg.bands.ok ? "ok" : "low";
export const BAND = { good: "우수", ok: "보통", low: "미흡" };

/* 2차 평가 계산: 항목별 (점수/5 × 배점) 합계를 100점 만점으로 환산 */
export function computeEval2(ev, cfg) {
  if (!ev) return null;
  const scores = ev.scores || {};
  const items = cfg.items.map(it => {
    const s = Number(scores[it.id]) || 0;
    return { ...it, s, pts: s ? it.weight * s / 5 : 0 };
  });
  const sumW = items.reduce((a, i) => a + i.weight, 0);
  const total = sumW ? Math.round(items.reduce((a, i) => a + i.pts, 0) / sumW * 100) : 0;
  const unscored = items.filter(i => !i.s).length;
  const risks = cfg.risks.filter(r => ev.risks?.[r.id]);
  return { items, total, unscored, band: bandOf(total, cfg), risks,
    verdict: VERDICT.some(v => v.v === ev.verdict) ? ev.verdict : "" };
}

/* 보관 기한: 접수일 + RETENTION_MONTHS */
export function expiryOf(createdAt) {
  const d = toDate(createdAt);
  if (!d) return null;
  const e = new Date(d); e.setMonth(e.getMonth() + RETENTION_MONTHS);
  return e;
}

/* 등급 계산: 항목별 점수 → 합계 → 필수 조건 확인 → A/B/C */
export function computeGrade(inq, cfg) {
  const items = [];
  const inv = Number(inq.investment) || 0;

  const tiers = [...cfg.investTiers].sort((a, b) => b.min - a.min);
  const tier = tiers.find(t => inv >= t.min);
  items.push({ label: "투자 여력", score: tier ? tier.score : 0,
    max: Math.max(0, ...tiers.map(t => t.score)), note: manToText(inv) });

  const texts = (inq.regions || []).map(regionText).concat(inq.regionNote ? [String(inq.regionNote)] : []);
  const hit = list => list.find(k => texts.some(t => t.includes(k))) || null;
  const k1 = hit(cfg.regionKeywords.p1), k2 = k1 ? null : hit(cfg.regionKeywords.p2);
  const rs = cfg.regionScore, noRegion = !texts.some(t => t.trim());
  items.push({ label: "희망 지역", max: maxOf(rs),
    score: k1 ? rs.p1 : k2 ? rs.p2 : noRegion ? 0 : rs.other,
    note: k1 ? `1순위 상권 (${k1})` : k2 ? `2순위 상권 (${k2})` : noRegion ? "미입력" : "우선 출점 상권 외" });

  const opt = (lbl, map, list, v) => items.push({ label: lbl, score: Number(map[v] ?? 0), max: maxOf(map), note: label(list, v) });
  opt("외식업 경험", cfg.fnb, FNB, inq.fnbExp);
  opt("운영 참여", cfg.oper, OPER, inq.operation);
  opt("연령대", cfg.age, AGE, inq.ageBand);

  const total = items.reduce((s, i) => s + i.score, 0);
  const mustFail = inv < cfg.minInvest;
  const grade = mustFail ? "C" : total >= cfg.cut.A ? "A" : total >= cfg.cut.B ? "B" : "C";
  return { items, total, maxTotal: items.reduce((s, i) => s + i.max, 0), grade, mustFail,
           regionTier: k1 ? "p1" : k2 ? "p2" : "other" };
}
