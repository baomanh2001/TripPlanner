/* =====================================================================
   app.js — ĐIỀU PHỐI TOÀN BỘ ỨNG DỤNG
   Khởi tạo bản đồ 2D Anime → nạp dữ liệu → gắn sự kiện UI.
   ===================================================================== */

let MAP = null;

/* ---------------------------------------------------------- Boot bar */
function boot(pct, msg) {
  const bar = document.getElementById('boot-bar-fill');
  const txt = document.getElementById('boot-msg');
  if (bar) bar.style.width = pct + '%';
  if (msg && txt) txt.textContent = msg;
  if (pct >= 100) setTimeout(() => document.getElementById('boot-screen').classList.add('done'), 420);
}

/* ===================================================================
   1. KHỞI TẠO BẢN ĐỒ — LUÔN 2D THUẦN (PITCH 0°)
   =================================================================== */
function initMap() {
  initLang();          // áp ngôn ngữ (mặc định English) trước khi vẽ UI
  boot(20, t('boot.style'));

  MAP = new GL.Map({
    container: 'map',
    style: buildAnimeStyle(),
    center: CONFIG.CENTER,
    zoom: CONFIG.ZOOM,
    minZoom: CONFIG.MIN_ZOOM,
    maxZoom: CONFIG.MAX_ZOOM,
    pitch: CONFIG.PITCH_2D,        // ⚠️ 2D thuần
    bearing: 0,
    antialias: true,
    attributionControl: true,
    preserveDrawingBuffer: true    // BẮT BUỘC để html2canvas/export đọc được canvas
  });

  MAP.addControl(new GL.NavigationControl({ visualizePitch: false }), 'top-left');
  MAP.addControl(new GL.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-right');

  // Khoá pitch khi ở chế độ 2D — tránh lỡ tay nghiêng bản đồ
  MAP.on('pitchend', () => {
    if (!Play3D.active && MAP.getPitch() !== 0) {
      MAP.easeTo({ pitch: 0, duration: 400 });
    }
  });

  MAP.on('load', async () => {
    boot(55, t('boot.style'));
    Planner.init(MAP);
    Mascot.init();
    bindUI();
    Play3D.enableButton(false);

    // Tự động nạp bộ dữ liệu Đà Lạt kèm theo repo
    await loadDemo(true);
    boot(100, t('boot.ready'));
  });

  MAP.on('error', e => console.warn('Map error:', e?.error?.message || e));
}

/* ===================================================================
   2. NẠP DỮ LIỆU
   =================================================================== */
async function loadDemo(silent) {
  boot(75, t('boot.data'));
  try {
    // Ưu tiên places.json (nhanh, đã có toạ độ). Không có thì đọc .xlsx.
    let list;
    try {
      const res = await fetch(CONFIG.DEMO_JSON);
      if (!res.ok) throw new Error('no json');
      list = loadPlacesJson(await res.json());
    } catch (e) {
      const rows = await readExcelUrl(CONFIG.DEMO_XLSX);
      list = loadRows(rows);
    }
    afterDataLoaded(list, silent);
  } catch (err) {
    console.error(err);
    Toast.show(t('msg.demofail'), 'err');
    boot(100);
  }
}

function afterDataLoaded(list, silent) {
  fillFilters(list);
  Planner.renderList();
  Planner.renderMarkers();
  Planner.renderPlan();
  fitAll();

  const withCoords = list.filter(p => p.lat != null).length;
  if (!silent) {
    Toast.show(t('msg.loaded', { n: list.length, c: withCoords }), 'ok');
  }
  Mascot.say(pickOne(Mascot.LINES.loaded));

  if (withCoords < list.length) {
    console.warn(`${list.length - withCoords} địa điểm thiếu toạ độ (cần cột Lat/Lng hoặc link Maps có @lat,lng).`);
  }
}

function fillFilters(list) {
  const g = document.getElementById('filter-group');
  const a = document.getElementById('filter-area');
  g.innerHTML = `<option value="" data-i18n="filter.group">${t('filter.group')}</option>`;
  a.innerHTML = `<option value="" data-i18n="filter.area">${t('filter.area')}</option>`;
  uniqueValues(list, 'nhom').forEach(v => g.add(new Option(v, v)));
  uniqueValues(list, 'khuVuc').forEach(v => a.add(new Option(shorten(v, 34), v)));
}

function fitAll() {
  const pts = DataStore.places.filter(p => p.lat != null);
  if (!pts.length) return;
  const b = new GL.LngLatBounds();
  pts.forEach(p => b.extend([p.lng, p.lat]));
  MAP.fitBounds(b, { padding: 70, duration: 1100, pitch: CONFIG.PITCH_2D, maxZoom: 14 });
}

/* ===================================================================
   3. GẮN SỰ KIỆN GIAO DIỆN
   =================================================================== */
function bindUI() {

  /* --- Nạp Excel từ máy --- */
  document.getElementById('file-excel').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      Toast.show(t('msg.reading'));
      const rows = await readExcelFile(file);
      const list = loadRows(rows);
      if (!list.length) { Toast.show(t('msg.norows'), 'err'); return; }
      Routing.invalidate();
      afterDataLoaded(list, false);
      const noCoord = list.filter(p => p.lat == null).length;
      if (noCoord) {
        Toast.show(t('msg.nocoord', { n: noCoord }), 'err');
      }
    } catch (err) {
      console.error(err);
      Toast.show(t('msg.readerr') + err.message, 'err');
    } finally {
      e.target.value = '';
    }
  });

  /* --- Dữ liệu mẫu --- */
  document.getElementById('btn-demo').addEventListener('click', () => { Routing.invalidate(); loadDemo(false); });

  /* --- Tính tuyến đường thực tế --- */
  document.getElementById('btn-route').addEventListener('click', () => Routing.build());

  /* --- Đổi phương tiện --- */
  document.getElementById('hud-profile').addEventListener('change', e => {
    Routing.profile = e.target.value;
    Toast.show('Đã đổi phương tiện, đang tính lại tuyến…');
    Routing.build();
  });

  /* --- Play / Exit 3D --- */
  document.getElementById('btn-play3d').addEventListener('click', () => Play3D.start());
  document.getElementById('btn-exit3d').addEventListener('click', () => Play3D.stop());
  document.getElementById('btn-pause').addEventListener('click', () => Play3D.togglePause());
  document.getElementById('btn-speed').addEventListener('click', () => Play3D.cycleSpeed());
  document.getElementById('btn-hide-others').addEventListener('click', () => Play3D.toggleHideOthers());
  document.getElementById('btn-speedmode').addEventListener('click', () => Play3D.toggleSpeedMode());
  document.getElementById('btn-cinema').addEventListener('click', () => setCinema(true));
  document.getElementById('cinema-exit').addEventListener('click', () => setCinema(false));
  document.getElementById('btn-hud-off').addEventListener('click',
    () => setHud(document.body.classList.contains('hud-off')));
  document.getElementById('hud-restore').addEventListener('click', () => setHud(true));

  /* --- Export --- */
  document.getElementById('btn-export').addEventListener('click', () => Exporter.run());
  document.getElementById('btn-save-plan').addEventListener('click', () => Exporter.savePlanJson());

  /* --- Điều khiển bản đồ --- */
  document.getElementById('btn-fit').addEventListener('click', () => {
    Routing.route ? Routing.fitRoute() : fitAll();
  });
  document.getElementById('btn-reset2d').addEventListener('click', () => {
    if (Play3D.active) Play3D.stop();
    else MAP.easeTo({ pitch: 0, bearing: 0, duration: 700 });
    Toast.show('Bản đồ về 2D thuần (pitch 0°) 🧭');
  });
  document.getElementById('btn-labels').addEventListener('click', e => {
    Planner.showLabels = !Planner.showLabels;
    document.body.classList.toggle('labels-off', !Planner.showLabels);
    e.currentTarget.classList.toggle('on', Planner.showLabels);
  });
  // Mặc định TẮT nhãn cho map đỡ rối; bật lại bằng nút 🏷️ (khi export tự bật)
  Planner.showLabels = false;
  document.body.classList.add('labels-off');

  /* --- Xoá lịch trình --- */
  document.getElementById('btn-clear-plan').addEventListener('click', () => {
    if (confirm('Xoá toàn bộ lịch trình?')) Planner.clearPlan();
  });

  /* --- Modal hướng dẫn --- */
  const modal = document.getElementById('modal-help');
  document.getElementById('btn-help').addEventListener('click', () => modal.classList.remove('hidden'));
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.hasAttribute('data-close')) modal.classList.add('hidden');
  });

  /* --- Phím tắt --- */
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,select,textarea')) return;
    if (e.key === 'Escape') {
      modal.classList.add('hidden');
      if (document.body.classList.contains('cinema')) { setCinema(false); return; }
      if (Play3D.active) Play3D.stop();
    }
    if (e.key.toLowerCase() === 'c') setCinema(!document.body.classList.contains('cinema'));
    if (e.key.toLowerCase() === 'h') setHud(document.body.classList.contains('hud-off'));
    if (e.key === ' ' && Play3D.active) { e.preventDefault(); Play3D.togglePause(); }
    if (e.key.toLowerCase() === 'p' && !Play3D.active) Play3D.start();
    if (e.key.toLowerCase() === 'e') Exporter.run();
  });
}

/* Bật/tắt chế độ quay màn hình: ẩn 2 sidebar + topbar */
function setCinema(on) {
  document.body.classList.toggle('cinema', on);
  // Bản đồ đổi kích thước -> phải báo MapLibre vẽ lại, nếu không marker lệch
  requestAnimationFrame(() => { MAP.resize(); requestAnimationFrame(() => MAP.resize()); });
  setTimeout(() => MAP.resize(), 260);
  setTimeout(() => { MAP.resize(); Planner.refreshMarkerStyles(); }, 600);
  if (on) Mascot.say(t('mascot.cinema'));
}

/* Bật/tắt các bảng HUD (route, play, điều khiển, linh vật) */
function setHud(show) {
  document.body.classList.toggle('hud-off', !show);
  const b = document.getElementById('btn-hud-off');
  if (b) b.textContent = show ? t('play.hudoff') : t('play.hudon');
}

/* ===================================================================
   4. START
   =================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  if (!GL) {
    document.getElementById('boot-msg').textContent = 'Không tải được thư viện bản đồ 😢 Kiểm tra kết nối mạng.';
    return;
  }
  boot(8, 'Đang khởi động engine…');
  initMap();
});
