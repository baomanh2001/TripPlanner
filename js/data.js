/* =====================================================================
   data.js — ĐỌC EXCEL BẰNG SHEETJS + CHUẨN HOÁ + PHÂN LOẠI ICON
   ===================================================================== */

const DataStore = {
  places: [],          // toàn bộ địa điểm đã chuẩn hoá
  byId: new Map()
};

/* ------------------------------------------------------- tiện ích text */
function stripAccents(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}
function hasWord(text, kw) {
  return new RegExp('(?<![a-z0-9])' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z0-9])').test(text);
}

/* ------------------------------------------ phân loại Nhóm → cat/icon */
const KW_STAY = ['luu tru', 'villa', 'homestay', 'b&b', 'khach san', 'hotel', 'resort', 'glamping', 'camping'];
const KW_FOOD = ['an uong', 'am thuc', 'ca phe', 'cafe', 'coffee', 'nuong', 'lau', 'banh', 'kem',
  'trang mieng', 'bun', 'com', 'mon', 'mua qua', 'bbq', 'suon', 'nha hang', 'do uong',
  'sua', 'bar', 'beer', 'buffet', 'hai san', 'an sang', 'xiu mai', 'quan an', 'tiem'];
const KW_FOOD_RAW = ['quán', 'chợ', 'ăn', 'cà phê', 'quà', 'phở', 'chè'];

function classifyCat(nhom, ten) {
  const tn = stripAccents(nhom);
  const td = stripAccents(nhom + ' ' + ten);
  const raw = (nhom + ' ' + ten).toLowerCase();
  if (KW_STAY.some(k => hasWord(td, stripAccents(k)))) return 'stay';
  if (KW_FOOD.some(k => hasWord(tn, stripAccents(k)))) return 'food';
  if (KW_FOOD.some(k => hasWord(td, stripAccents(k)))) return 'food';
  if (KW_FOOD_RAW.some(k => new RegExp('(?<![a-zà-ỹ])' + k + '(?![a-zà-ỹ])').test(raw))) return 'food';
  return 'travel';
}

function pickIcon(cat, nhom, ten) {
  const t = stripAccents(nhom + ' ' + ten);
  const any = arr => arr.some(k => hasWord(t, k));
  if (cat === 'stay') return 'stay';
  if (cat === 'food') {
    if (any(['ca phe', 'cafe', 'coffee', 'tra', 'tra sua'])) return 'cafe';
    if (any(['kem', 'banh', 'trang mieng', 'ngot', 'sua chua'])) return 'dessert';
    if (any(['nuong', 'bbq', 'lau', 'suon', 'thit', 'buffet', 'hai san'])) return 'grill';
    if (any(['store', 'mua qua', 'dac san', 'langfarm'])) return 'gift';
    return 'noodle';
  }
  if (any(['thac', 'ho', 'suoi', 'nui', 'doi', 'rung', 'thien nhien', 'hoang hon',
    'binh minh', 'langbiang', 'ngam canh', 'cam trai'])) return 'mountain';
  if (any(['chua', 'thien vien', 'nha tho', 'tam linh', 'ton giao', 'van hoa'])) return 'temple';
  if (any(['hoa', 'vuon', 'garden', 'nong trai', 'farm', 'dau', 'sinh thai',
    'nong nghiep', 'doi che', 'vuon thu'])) return 'flower';
  return 'camera';
}

/* --------------------------------------- parse "24,7K" / "1.696" → số */
function parseReviewCount(s) {
  s = String(s || '').trim();
  const m = s.match(/^([\d.,]+)\s*([KkMm])?$/);
  if (!m) return null;
  if (m[2]) {
    const base = parseFloat(m[1].replace(',', '.'));
    return Math.round(base * (m[2].toLowerCase() === 'k' ? 1e3 : 1e6));
  }
  return parseInt(m[1].replace(/[.,]/g, ''), 10) || null;
}

/* --------------------------- trích toạ độ từ link Google Maps nếu có */
function coordsFromGmapUrl(url) {
  if (!url) return null;
  let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);            // .../@11.94,108.44,15z
  if (m) return [parseFloat(m[1]), parseFloat(m[2])];
  m = url.match(/[?&]query=(-?\d+\.\d+)(?:%2C|,)\s*(-?\d+\.\d+)/); // ?query=11.94,108.44
  if (m) return [parseFloat(m[1]), parseFloat(m[2])];
  m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return [parseFloat(m[1]), parseFloat(m[2])];
  return null;
}

/* =====================================================================
   CHUẨN HOÁ 1 DÒNG EXCEL → object dùng chung
   ===================================================================== */
function normalizeRow(row, index) {
  const C = CONFIG.COLS;
  const get = key => {
    if (row[key] !== undefined) return String(row[key]).trim();
    // dò cột gần đúng (phòng khi header lệch dấu cách)
    const target = stripAccents(key).replace(/\s+/g, '');
    for (const k of Object.keys(row)) {
      if (stripAccents(k).replace(/\s+/g, '') === target) return String(row[k]).trim();
    }
    return '';
  };

  // Chấp nhận nhiều biến thể tên cột (file rút gọn 14 cột vs file cũ 16/21 cột)
  const getAny = (...keys) => { for (const k of keys) { const v = get(k); if (v) return v; } return ''; };

  const ten = get(C.diaDiem);
  if (!ten) return null;

  const nhom = get(C.nhom);
  const cat = classifyCat(nhom, ten);
  const gmap = get(C.gmap);

  let lat = parseFloat(get(C.lat));
  let lng = parseFloat(get(C.lng));
  if (!isFinite(lat) || !isFinite(lng)) {
    const fromUrl = coordsFromGmapUrl(gmap);
    if (fromUrl) { lat = fromUrl[0]; lng = fromUrl[1]; }
  }

  const rec = get(C.khuyenNghi);
  const score = parseFloat(String(get(C.diemGoogle)).replace(',', '.'));

  return {
    id: 'p' + (get(C.stt) || index),
    stt: parseInt(get(C.stt), 10) || index + 1,
    nhom,
    khuVuc: get(C.khuVuc),
    diaDiem: ten,
    diemGoogle: isFinite(score) ? score : null,
    luotDanhGia: get(C.luot),
    luotSo: parseReviewCount(get(C.luot)),
    doTinCay: get(C.tinCay),   // cột tuỳ chọn — file 14 cột không có
    uuDiem: get(C.uuDiem),
    nhuocDiem: get(C.nhuocDiem),
    khungGio: get(C.khungGio),
    thoiLuong: getAny(C.thoiLuong, 'Thời lượng', 'Thời lượng tham quan'),
    chiPhi: get(C.chiPhi),
    phuHop: get(C.phuHop),
    khuyenNghi: rec,
    grade: /^[ABCD]/i.test(rec) ? rec[0].toUpperCase() : '',
    googleMaps: gmap,
    nguon: get(C.nguon),
    cat,
    icon: pickIcon(cat, nhom, ten),
    lat: isFinite(lat) ? lat : null,
    lng: isFinite(lng) ? lng : null,
    geoSrc: get('Nguồn toạ độ') || (isFinite(lat) ? 'excel' : 'none'),
    geoNote: get('Ghi chú toạ độ') || '',
    approx: /^(1|true|x|có)$/i.test(get('Toạ độ ước lượng'))
  };
}

/* =====================================================================
   ĐỌC FILE EXCEL (.xlsx/.xls/.csv) BẰNG SHEETJS
   ===================================================================== */
function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được file.'));
    reader.onload = e => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
        resolve(rows);
      } catch (err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

/* Đọc file .xlsx đặt sẵn trong repo (data/…) qua fetch */
async function readExcelUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
}

/* =====================================================================
   NẠP DỮ LIỆU VÀO STORE
   ===================================================================== */
function loadRows(rawRows) {
  const list = [];
  rawRows.forEach((r, i) => {
    const o = normalizeRow(r, i);
    if (o) list.push(o);
  });
  DataStore.places = list;
  DataStore.byId = new Map(list.map(p => [p.id, p]));
  return list;
}

/* Nạp trực tiếp từ places.json (đã có sẵn toạ độ) */
function loadPlacesJson(arr) {
  const list = arr.map((o, i) => ({
    id: 'p' + (o.stt || i),
    ...o,
    grade: o.grade || (/^[ABCD]/i.test(o.khuyenNghi || '') ? o.khuyenNghi[0].toUpperCase() : '')
  }));
  DataStore.places = list;
  DataStore.byId = new Map(list.map(p => [p.id, p]));
  return list;
}

/* Thống kê nhanh để đổ vào bộ lọc */
function uniqueValues(list, key) {
  return [...new Set(list.map(p => (p[key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
}
