/* ================================================================
   메일 회신 붙여넣기 → 문의 데이터 자동 채우기
   기존 안내 메일(1~10번 질문 + "답변:") 형식을 읽습니다.
   자동 인식 결과는 관리자가 확인·수정한 뒤 등록하는 것을 전제로 합니다.
   ================================================================ */
import { REGIONS, SOURCE } from "./config.js";

export function fmtPhone(v) {
  const d = String(v || "").replace(/\D/g, "").slice(0, 11);
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

const KEYS = ["name", "age", "region", "invest", "fnb", "motive", "open", "oper", "store", "etc"];
const TITLE_RE = [/성함|연락처|이름/, /연령|나이/, /지역|상권/, /투자|예산|금액/, /외식|F\s*&\s*B|경험/i,
  /사유|동기|지원/, /오픈|개점|시기/, /운영/, /점포|매장|상가/, /기타|문의/];

const norm = s => String(s).replace(/\s+/g, "");
const TEMPLATE = new Set([
  "시·군·구 또는 희망 상권을 기재해 주세요. 복수 지역도 가능합니다.",
  "보증금·권리금 등을 포함한 총예산을 기재해 주세요.",
  "업종, 주요 업무, 기간을 기재해 주세요.",
  "벤슨을 선택하신 이유와 창업 동기를 간단히 작성해 주세요.",
  "미확보 / 검토 중 / 확보 완료 중 선택해 주세요.",
  "확보 또는 검토 중인 점포가 있다면 소재지와 면적도 함께 기재해 주세요."
].map(norm));

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* 앞 글자가 한글이 아닐 때만 일치 (예: '서구'가 '강서구'에 걸리지 않게) */
function findWord(text, word) {
  const m = new RegExp(`(^|[^가-힣])${reEsc(word)}`).exec(text);
  return m ? m.index + m[1].length : -1;
}

/* ---------- 지역 ---------- */
const SIDO_ALIASES = Object.entries({
  "서울": ["서울특별시", "서울시", "서울"], "부산": ["부산광역시", "부산시", "부산"], "대구": ["대구광역시", "대구시", "대구"],
  "인천": ["인천광역시", "인천시", "인천"], "광주": ["광주광역시"], "대전": ["대전광역시", "대전시", "대전"],
  "울산": ["울산광역시", "울산시", "울산"], "세종": ["세종특별자치시", "세종시", "세종"], "경기": ["경기도", "경기"],
  "강원": ["강원특별자치도", "강원도", "강원"], "충북": ["충청북도", "충북"], "충남": ["충청남도", "충남"],
  "전북": ["전북특별자치도", "전라북도", "전북"], "전남": ["전라남도", "전남"], "경북": ["경상북도", "경북"],
  "경남": ["경상남도", "경남"], "제주": ["제주특별자치도", "제주도"]
}).flatMap(([s, list]) => list.map(a => [s, a])).sort((a, b) => b[1].length - a[1].length);

const SIDO_WORDS = new Set(SIDO_ALIASES.map(([, a]) => a).concat(["광주", "세종"]));
const stemOf = w => {
  if (!w) return null;
  const st = w.replace(/[시군구]$/, "");
  return st.length >= 2 && st !== w && !SIDO_WORDS.has(st) ? st : null;
};
const ENTRIES = Object.entries(REGIONS).flatMap(([sido, list]) => list.map(full => {
  const p = full.split(" ");
  const last = p[p.length - 1], city = p.length > 1 ? p[0] : null;
  return { sido, full, last, city, lastStem: stemOf(last), cityStem: stemOf(city) };
}));

function findSido(text) {
  for (const [sido, alias] of SIDO_ALIASES) if (findWord(text, alias) >= 0) return { sido, alias };
  return null;
}

function findPlaces(text, sido) {
  const groups = new Map();                       // 일치한 글자 → 후보들
  for (const e of ENTRIES) {
    if (sido && e.sido !== sido) continue;
    let word = null, score = 0, at = -1;
    if ((at = findWord(text, e.full)) >= 0) { word = e.full; score = 3; }
    else if (e.last !== e.full && (at = findWord(text, e.last)) >= 0) { word = e.last; score = 2; }
    else if (e.lastStem && (at = findWord(text, e.lastStem)) >= 0) { word = e.lastStem; score = 1.6; }
    else if (e.city && (at = findWord(text, e.city)) >= 0) { word = e.city; score = 1; }
    else if (e.cityStem && (at = findWord(text, e.cityStem)) >= 0) { word = e.cityStem; score = 0.9; }
    if (!word) continue;
    const g = groups.get(word) || { word, score, at, list: [] };
    g.list.push(e); groups.set(word, g);
  }
  let arr = [...groups.values()];
  arr = arr.filter(g => !arr.some(o => o !== g && o.score > g.score && o.word.includes(g.word)));
  return arr.sort((a, b) => a.at - b.at);
}

export function parseRegions(text) {
  const warnings = [], regions = [];
  const parts = String(text || "").split(/[\/,\n;|，]/).map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    let sd = findSido(part);
    let places = findPlaces(part, sd?.sido);
    if (sd && !places.length) {                    // 시·도 오인식 대비: 제한 없이 다시 찾기
      const any = findPlaces(part, null);
      if (any.length === 1 && any[0].list.length === 1) { places = any; sd = null; }
    }
    let rest = part;
    if (sd) rest = rest.replace(sd.alias, " ");
    places.forEach(g => { rest = rest.replace(g.word, " "); });
    rest = rest.replace(/\s+/g, " ").split(" ").filter(w => !/^(지역|선호|희망|등|\(?등\)?)$/.test(w)).join(" ")
      .replace(/\(\s*\)/g, "").replace(/^[\s:：\-–—~·,.]+|[\s:：\-–—~·,]+$/g, "").trim();

    if (!places.length) {
      if (sd) {
        const only = REGIONS[sd.sido].length === 1 ? REGIONS[sd.sido][0] : "";
        regions.push({ sido: sd.sido, sigungu: only, area: rest.slice(0, 60) });
        if (!only) warnings.push(`'${part}': 시·군·구를 찾지 못해 '${sd.sido}'만 넣었습니다.`);
      } else if (regions.length) {
        const prev = regions[regions.length - 1];
        prev.area = [prev.area, part].filter(Boolean).join(" ").slice(0, 60);
      } else if (part.length >= 2) {
        warnings.push(`'${part}': 지역을 인식하지 못했습니다. 직접 선택해 주세요.`);
      }
      continue;
    }
    places.forEach((g, i) => {
      const e = g.list[0];
      if (g.list.length > 1 && new Set(g.list.map(x => x.sido)).size > 1)
        warnings.push(`'${g.word}'는 여러 시·도에 있어 '${e.sido}'로 넣었습니다. 확인해 주세요.`);
      const area = i === 0 && places.length === 1 ? rest : "";
      if (g.score < 1.5) {
        regions.push({ sido: e.sido, sigungu: "", area: `${g.word} ${area}`.trim().slice(0, 60) });
        warnings.push(`'${g.word}': 구가 적혀 있지 않아 시까지만 넣었습니다.`);
      } else {
        regions.push({ sido: e.sido, sigungu: e.full, area: area.slice(0, 60) });
      }
    });
  }
  if (regions.length > 3) warnings.push(`희망 지역이 ${regions.length}곳이라 앞의 3곳만 넣었습니다.`);
  return { regions: regions.slice(0, 3), warnings };
}

/* ---------- 금액 (만원) ---------- */
export function parseInvest(text) {
  const s = String(text || "").replace(/[_\s]/g, "");
  if (!s) return { v: 0 };
  const rg = s.match(/(\d+(?:\.\d+)?)(억)?(?:초반|초|중반|후반)?[~\-–](\d+(?:\.\d+)?)억/);
  if (rg) return { v: Math.round(parseFloat(rg[1]) * 10000), range: true };
  const m = s.match(/(\d+(?:\.\d+)?)억(?:(\d[\d,]*)(천만|천|만)?)?/);
  if (m) {
    let v = parseFloat(m[1]) * 10000;
    if (m[2]) { const n = Number(m[2].replace(/,/g, "")); v += (m[3] === "천" || m[3] === "천만") ? n * 1000 : n; }
    return { v: Math.round(v) };
  }
  const d = s.match(/\d[\d,]*/);
  if (!d) return { v: 0 };
  const n = Number(d[0].replace(/,/g, ""));
  if (/만/.test(s)) return { v: n };
  if (n >= 1000000) return { v: Math.round(n / 10000) };
  return { v: n, warn: true };
}

/* ---------- 오픈 시기 ---------- */
export function parseOpen(text, today = new Date()) {
  const t = String(text || "");
  if (!t.trim()) return { v: "" };
  const y0 = today.getFullYear();
  const yr = v => { const n = Number(v); return n < 100 ? 2000 + n : n; };
  const years = [...t.matchAll(/(20\d{2})\s*년?|(?<!\d)(2[4-9])\s*년/g)].map(m => ({ at: m.index, y: yr(m[1] || m[2]) }));
  const yearAt = (idx, own) => {
    if (own) return yr(own);
    const prev = years.filter(x => x.at < idx).pop();
    if (prev) return prev.y;
    if (/내년/.test(t)) return y0 + 1;
    return null;
  };
  const spans = [];
  const push = (y, m1, m2) => spans.push({ start: new Date(y, m1 - 1, 1), end: new Date(y, m2, 0) });
  for (const m of t.matchAll(/(?:(20\d{2}|2[4-9])\s*년?\s*)?(상반기|하반기)/g)) {
    const y = yearAt(m.index, m[1]) ?? y0; m[2] === "상반기" ? push(y, 1, 6) : push(y, 7, 12);
  }
  for (const m of t.matchAll(/(?:(20\d{2}|2[4-9])\s*년?\s*)?([1-4])\s*분기/g)) {
    const y = yearAt(m.index, m[1]) ?? y0, q = Number(m[2]); push(y, q * 3 - 2, q * 3);
  }
  for (const m of t.matchAll(/(?:(20\d{2})\s*년?\s*)?(\d{1,2})\s*월/g)) {
    const mo = Number(m[2]); if (mo < 1 || mo > 12) continue;
    let y = yearAt(m.index, m[1]); if (y == null) y = mo >= today.getMonth() + 1 ? y0 : y0 + 1;
    push(y, mo, mo);
  }
  if (!spans.length) for (const y of years) push(y.y, 1, 12);
  const mm = t.match(/(\d{1,2})\s*개월/);
  if (mm) { const n = Number(mm[1]); const s = new Date(today); const e = new Date(today); e.setMonth(e.getMonth() + n); spans.push({ start: s, end: e }); }
  if (/즉시|바로|빠른\s*시일|빠르게|빨리|ASAP/i.test(t)) spans.push({ start: today, end: today });

  if (!spans.length) {
    if (/협의|미정|무관|상관\s*없/.test(t)) return { v: "nego" };
    return { v: "", warn: `오픈 시기 '${t}'를 인식하지 못했습니다. 직접 선택해 주세요.` };
  }
  spans.sort((a, b) => a.start - b.start);
  const s = spans[0];
  const months = ((s.start.getTime() + s.end.getTime()) / 2 - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  const v = months <= 3 ? "m3" : months <= 6 ? "m6" : months <= 12 ? "m12" : "y1";
  return { v, months: Math.round(months * 10) / 10 };
}

/* ---------- 외식업 경험 분류 ---------- */
export function classifyFnb(text) {
  const f = String(text || "").trim();
  if (!f) return { v: "" };
  if (/^(없음|없습니다|해당\s*없음)/.test(f) || /^(무|x|-|N)$/i.test(f) || /경험\s*(이|은)?\s*없/.test(f)) return { v: "none" };
  const family = /(부모|아버지|어머니|아빠|엄마|친형|형이|형님|누나|언니|오빠|동생|가족|배우자|남편|아내|친척)/.test(f);
  if (family && !/(본인|직접|동업)/.test(f))
    return { v: "none", warn: `외식업 경험 '${f}'는 가족 경험으로 보여 '경험 없음'으로 넣었습니다. 확인해 주세요.` };
  if (/운영|점주|창업|사장|오너|대표|자영업|동업/.test(f)) return { v: "owner" };
  if (/근무|매니저|점장|직원|알바|아르바이트|스태프|크루|바리스타|경력|\d+\s*(년|개월)/.test(f)) return { v: "staff" };
  return { v: "", warn: `외식업 경험 '${f}'의 구분(운영/근무/없음)을 직접 골라 주세요.` };
}

/* ---------- 전체 ---------- */
export function parseMail(raw, today = new Date()) {
  const warnings = [];
  const lines = String(raw || "").replace(/\r/g, "").split("\n").map(l => l.replace(/^\s*>+\s?/, ""));
  const sec = {};
  let cur = null, expect = 1;
  for (const line of lines) {
    const m = expect <= 10 && line.match(/^\s*(\d{1,2})\s*[.)．]\s*(.*)$/);
    if (m && Number(m[1]) === expect && TITLE_RE[expect - 1].test(m[2])) {
      cur = KEYS[expect - 1]; sec[cur] = [];
      const c = m[2].search(/[:：]/);
      if (c >= 0 && m[2].slice(c + 1).trim()) sec[cur].push(m[2].slice(c + 1));
      expect++; continue;
    }
    if (cur) sec[cur].push(line);
  }
  const found = expect - 1;
  if (found < 10) warnings.push(found
    ? `질문 ${found + 1}번부터 찾지 못했습니다. 빠진 항목은 직접 입력해 주세요.`
    : "질문 번호(1~10)를 찾지 못했습니다. 메일 본문의 1~10번 부분을 붙여넣었는지 확인해 주세요.");

  /* 기타 문의 뒤에 붙은 서명·이전 메일 잘라내기 */
  if (sec.etc) {
    const out = []; let blank = 0;
    for (const l of sec.etc) {
      if (/^\s*(-{3,}|_{3,}|From:|보낸\s*사람|원본\s*메일|-----Original|On .+wrote:)/i.test(l)) break;
      blank = l.trim() ? 0 : blank + 1;
      if (blank >= 2 && out.some(x => x.trim())) break;
      out.push(l);
    }
    sec.etc = out;
  }

  const clean = arr => (arr || [])
    .map(l => l.replace(/^\s*답변\s*[:：]?\s*/, "").replace(/_{2,}/g, " ").trim())
    .filter(l => l && !/^예시\s*[:：]/.test(l) && !TEMPLATE.has(norm(l)) && !/(기재|작성|선택)해\s*주세요\.?$/.test(l))
    .join("\n").trim();
  const T = Object.fromEntries(KEYS.map(k => [k, clean(sec[k])]));
  const d = {};

  // 1. 성함·연락처·이메일
  const pm = T.name.match(/0\d{1,2}[-.\s)]*\d{3,4}[-.\s]*\d{4}/);
  const em = T.name.match(/[^\s@/,()<>]+@[^\s@/,()<>]+\.[^\s@/,()<>]+/);
  d.phone = pm ? fmtPhone(pm[0]) : "";
  d.email = em ? em[0] : "";
  const rest = T.name.replace(pm?.[0] || "\u0000", " ").replace(em?.[0] || "\u0000", " ");
  d.name = (rest.match(/[가-힣]{2,5}/g) || []).find(w => !["성함", "연락처", "이메일", "답변", "휴대폰", "전화", "번호"].includes(w)) || "";
  if (!d.name) warnings.push("성함을 찾지 못했습니다.");
  if (!d.phone) warnings.push("연락처를 찾지 못했습니다.");

  // 2. 연령대
  const am = T.age.match(/([2-6])0\s*대/), an = T.age.match(/(\d{2})\s*세/);
  d.ageBand = am ? am[1] + "0" : an ? String(Math.min(60, Math.max(20, Math.floor(Number(an[1]) / 10) * 10))) : "";
  if (!d.ageBand) warnings.push("연령대를 찾지 못했습니다.");

  // 3. 희망 지역
  const rg = parseRegions(T.region);
  d.regions = rg.regions; warnings.push(...rg.warnings);
  if (!d.regions.length) warnings.push("희망 지역을 넣지 못했습니다. 직접 선택해 주세요.");

  // 4. 투자 금액
  const iv = parseInvest(T.invest);
  d.investment = iv.v;
  if (!iv.v) warnings.push("투자 가능 금액을 찾지 못했습니다.");
  else if (iv.warn) warnings.push(`투자 금액 '${T.invest}'의 단위를 확인해 주세요. (만원으로 넣었습니다)`);

  // 5. 외식업 경험
  const fc = classifyFnb(T.fnb);
  d.fnbExp = fc.v; d.fnbDetail = fc.v === "none" ? "" : T.fnb;
  if (!T.fnb) warnings.push("외식업 경험 답변이 없습니다.");
  else if (fc.warn) warnings.push(fc.warn);

  // 6. 지원 사유
  d.motive = T.motive.slice(0, 2000);

  // 7. 오픈 시기
  const op = parseOpen(T.open, today);
  d.openTiming = op.v; d.openTimingNote = T.open.slice(0, 100);
  if (op.warn) warnings.push(op.warn);

  // 8. 운영 참여
  const o = T.oper, self = /직접|본인/.test(o), mgr = /관리자|채용|오토|위탁/.test(o);
  d.operation = !o ? "" : self && !mgr ? "self" : mgr && !self ? "manager" : "other";
  d.operationNote = d.operation === "other" ? o.slice(0, 200) : "";
  if (!o) warnings.push("운영 참여 계획 답변이 없습니다.");

  // 9. 점포
  const s = T.store;
  d.store = !s ? "" : /미\s*확보|없음|미정|아직/.test(s) ? "none"
    : /검토|알아보|물색|협의\s*중/.test(s) ? "reviewing"
    : /확보|계약|보유/.test(s) ? "secured" : "";
  if (!d.store) warnings.push("점포 확보 여부를 확인해 주세요.");
  const ar = s.match(/(\d+(?:\.\d+)?)\s*평/), sq = s.match(/(\d+(?:\.\d+)?)\s*(㎡|m2|제곱미터)/);
  d.storeArea = ar ? ar[1] : sq ? (Number(sq[1]) / 3.3058).toFixed(1) : "";
  d.storeAddress = d.store && d.store !== "none"
    ? s.replace(/확보\s*완료|확보|검토\s*중|검토|계약\s*완료|계약/g, " ").replace(ar?.[0] || sq?.[0] || "\u0000", " ")
        .replace(/\s+/g, " ").replace(/^[\s:/,\-()]+|[\s:/,\-()]+$/g, "").slice(0, 200)
    : "";

  // 10. 기타
  d.etc = T.etc.slice(0, 2000);

  return { data: d, warnings, found };
}

/* ================================================================
   엑셀 표 붙여넣기 → 문의 여러 건 일괄 등록
   ================================================================ */

/* 엑셀에서 복사한 표(탭 구분) 읽기. 셀 안 줄바꿈("...")도 처리 */
export function parseTSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  const s = String(text || "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"' && cell === "") q = true;
    else if (c === "\t") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(x => String(x).trim()));
}

/* 연령: '40대', '20대 후반', '50 초반', '32살', '87년생' */
export function parseAge(text, ref = new Date()) {
  const t = String(text || "").trim();
  if (!t) return { v: "" };
  let m = t.match(/([2-6])0\s*대/) || t.match(/([2-6])0\s*(초|중|후)/);
  if (m) return { v: m[1] + "0" };
  m = t.match(/(\d{2})\s*(살|세)/);
  if (m) return { v: String(Math.min(60, Math.max(20, Math.floor(Number(m[1]) / 10) * 10))) };
  m = t.match(/(\d{2}|\d{4})\s*년생/);
  if (m) {
    let y = Number(m[1]); if (y < 100) y += y > (ref.getFullYear() % 100) ? 1900 : 2000;
    const age = ref.getFullYear() - y;                       // 만 나이에 가까운 값
    const band = String(Math.min(60, Math.max(20, Math.floor(age / 10) * 10)));
    return { v: band, warn: `'${t}' → ${band}대(${ref.getFullYear()}년 기준 약 ${age}세)로 넣었습니다.` };
  }
  if (/^6\d|이상/.test(t)) return { v: "60" };
  return { v: "", warn: `연령 '${t}'를 인식하지 못했습니다.` };
}

/* 날짜: '8/28(금)', '2026-08-28', '2026.8.28', '8월 28일'
   연도가 없으면 요일이 맞는 해(올해·작년)를, 요일도 없으면 미래가 아닌 가장 가까운 해를 고릅니다. */
const WD = { "일": 0, "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6 };
export function parseKDate(text, today = new Date()) {
  const t = String(text || "").trim();
  if (!t) return null;
  let m = t.match(/(20\d{2})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  m = t.match(/(\d{1,2})\s*[\/.월]\s*(\d{1,2})/);
  if (!m) return null;
  const mo = Number(m[1]) - 1, d = Number(m[2]);
  const w = t.match(/[(（]\s*([일월화수목금토])/);
  const ys = [today.getFullYear(), today.getFullYear() - 1, today.getFullYear() + 1];
  if (w) { const y = ys.find(y => new Date(y, mo, d).getDay() === WD[w[1]]); if (y) return new Date(y, mo, d, 12); }
  const y = new Date(today.getFullYear(), mo, d) <= today ? today.getFullYear() : today.getFullYear() - 1;
  return new Date(y, mo, d, 12);
}

/* 회신·접촉 방법 글자 → 접촉 방법 값 */
export function replyMethod(text) {
  const t = String(text || "");
  if (/메일|mail/i.test(t)) return "mail";
  if (/유선|전화|통화|콜/.test(t)) return "call";
  if (/문자|카톡|카카오|sms/i.test(t)) return "sms";
  if (/대면|미팅|면담|면접/.test(t)) return "meet";
  if (/방문|답사/.test(t)) return "visit";
  return "etc";
}

/* 구분 글자 → 구분 값 (모르는 글자면 빈 값) */
export function sourceFrom(text) {
  const t = String(text || "").replace(/\s+/g, "");
  if (!t) return "";
  if (/배스킨|베스킨|BR|비알|전환/i.test(t)) return "br";
  if (/네트워크|기존점주|점주소개|지인|소개|추천|인맥/.test(t)) return "network";
  if (/홈페이지|홈피|웹사이트/.test(t)) return "homepage";
  if (/메일|이메일|링크|접수폼/.test(t)) return "mail";
  if (/^기타$/.test(t)) return "etc";
  return "";
}

/* 제목 행 → 항목 */
const COLS = [
  ["date", /접수\s*일|문의\s*일|날짜|일자/],
  ["kind", /^\s*(구분|유입|유입\s*경로|문의\s*경로|접수\s*경로|경로|채널)\s*$/],
  ["name", /성명|성함|이름/],
  ["age", /연령|나이/],
  ["open", /출점\s*시기|오픈\s*시기|시기/],
  ["region", /지역|상권/],
  ["invest", /투자|예산/],
  ["storeInfo", /물건\s*정보|점포\s*정보|소재지/],
  ["storeHas", /물건|점포/],
  ["fnb", /에프앤비|F\s*&\s*B|외식|경험/i],
  ["motive", /동기|사유/],
  ["note", /비고|메모|특이/],
  ["replyDate", /회신\s*일|연락\s*일/],
  ["replyMethod", /회신\s*방법|연락\s*방법/],
  ["phone", /연락처|전화|휴대폰|핸드폰/],
  ["email", /이메일|메일/]
];
export function mapHeader(header) {
  const map = []; let reply = 0;
  header.forEach((h, i) => {
    const t = String(h || "").trim();
    const hit = COLS.find(([, re]) => re.test(t));
    if (!t) map.push(null);
    else if (!hit) map.push({ key: "extra", label: t });
    else if (hit[0] === "replyDate") { reply++; map.push({ key: "replyDate", n: reply, label: t }); }
    else if (hit[0] === "replyMethod") map.push({ key: "replyMethod", n: Math.max(reply, 1), label: t });
    else map.push({ key: hit[0], label: t });
  });
  return map;
}

/* 표 전체 → 등록할 문의 목록 */
export function tableToInquiries(rows, today = new Date()) {
  const hi = rows.findIndex(r => r.some(c => /성명|성함|이름/.test(String(c))));
  if (hi < 0) return { error: "제목 행(접수일, 성명 …)을 찾지 못했습니다. 제목 행부터 함께 복사해 붙여넣어 주세요." };
  const map = mapHeader(rows[hi]);
  const used = map.filter(Boolean);
  const items = [];
  rows.slice(hi + 1).forEach((r, ri) => {
    const cell = key => { const i = map.findIndex(m => m && m.key === key); return i < 0 ? "" : clean(r[i]); };
    const name = cell("name");
    if (!name) return;
    const w = [];
    const date = parseKDate(cell("date"), today);
    if (!date) w.push("접수일을 읽지 못해 오늘 날짜로 넣었습니다.");
    const age = parseAge(cell("age"), date || today); if (age.warn) w.push(age.warn);
    const regionRaw = cell("region");
    const rg = parseRegions(regionRaw); w.push(...rg.warnings);
    const openRaw = cell("open"), op = parseOpen(openRaw, today);
    const iv = parseInvest(cell("invest"));
    if (cell("invest") && !iv.v) w.push(`투자비 '${cell("invest")}'를 읽지 못했습니다.`);
    if (iv.range) w.push(`투자비 '${cell("invest")}'는 범위라 낮은 값(${iv.v.toLocaleString("ko-KR")}만원)으로 넣었습니다.`);
    const fnbRaw = cell("fnb"), fc = classifyFnb(fnbRaw); if (fc.warn) w.push(fc.warn);
    const has = cell("storeHas"), info = cell("storeInfo");
    const store = /^(유|있음|보유|확보|O|Y)/i.test(has) ? "secured" : /검토/.test(has) ? "reviewing"
      : info ? "reviewing" : has ? "none" : "";
    // 메모: 비고 + 회신 기록 + 인식하지 못한 열
    const memo = [];
    const note = cell("note"); if (note) memo.push(note);
    const replies = {};
    map.forEach((m, i) => {
      if (!m) return; const v = clean(r[i]); if (!v) return;
      if (m.key === "replyDate") (replies[m.n] ||= {}).date = v;
      else if (m.key === "replyMethod") (replies[m.n] ||= {}).method = v;
      else if (m.key === "extra") memo.push(`${m.label}: ${v}`);
    });
    // 회신 기록 → 접촉 이력 (날짜를 읽지 못하면 메모에 남김)
    const contacts = [];
    Object.keys(replies).sort().forEach(n => {
      const rp = replies[n], at = parseKDate(rp.date, today);
      if (at) contacts.push({ at, method: replyMethod(rp.method), noAnswer: false,
        summary: `${n}차 회신 (기존 엑셀 기록)`, next: "", nextAt: "" });
      else memo.push(`${n}차 회신: ${[rp.date, rp.method].filter(Boolean).join(" ")}`);
    });
    const phone = fmtPhone(cell("phone"));
    if (!phone) w.push("연락처가 없습니다.");
    items.push({
      row: hi + ri + 2,
      warnings: w,
      date: date || today,
      data: {
        source: sourceFrom(cell("kind")),
        sourceNote: (() => {                          // 구분 원문이 정해진 이름과 다르면 상세에 남김
          const raw = cell("kind"), v = sourceFrom(raw), lb = SOURCE.find(x => x.v === v);
          return raw && (!lb || (raw !== lb.t && raw !== lb.s)) ? raw.slice(0, 100) : "";
        })(),
        name: name.slice(0, 30), phone, email: cell("email").slice(0, 120), ageBand: age.v,
        regions: rg.regions, regionNote: regionRaw.slice(0, 200),
        investment: iv.v,
        fnbExp: fc.v, fnbDetail: fnbRaw.slice(0, 1000),
        motive: cell("motive").slice(0, 2000),
        openTiming: op.v, openTimingNote: openRaw.slice(0, 100),
        operation: "", operationNote: "",
        store, storeAddress: info.slice(0, 200), storeArea: "",
        etc: "", memo: memo.join("\n").slice(0, 2000),
        contacts,
        status: contacts.some(c => c.method === "call") ? "consult" : Object.keys(replies).length ? "reviewed" : "new"
      }
    });
  });
  return { items, columns: used };
}
function clean(v) {
  const t = String(v ?? "").replace(/\s+/g, " ").trim();
  return /^[-–—]+$/.test(t) ? "" : t;
}
