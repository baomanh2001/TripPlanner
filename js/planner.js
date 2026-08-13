/* =====================================================================
   planner.js — DANH SÁCH, MARKER CHIBI, POPUP RPG, KÉO-THẢ LỊCH TRÌNH
   ===================================================================== */

/* Nhãn buổi theo ngôn ngữ hiện tại */
function SLOT_LABEL(s) {
  return { 'Sáng': t('plan.morning'), 'Chiều': t('plan.afternoon'), 'Tối': t('plan.evening') }[s] || s;
}

const Planner = {
  map: null,
  markers: new Map(),        // id -> { marker, el }
  plan: {},                  // { "1|Sáng": [id,...] }
  activeDay: '1',
  popup: null,
  showLabels: true,

  /* ---------------------------------------------------------- khởi tạo */
  init(map) {
    this.map = map;
    CONFIG.DAYS.forEach(d => CONFIG.SLOTS.forEach(s => { this.plan[`${d}|${s}`] = []; }));
    this.restore();
    this.syncDaysFromPlan();   // kế hoạch đã lưu có thể nhiều hơn 3 ngày
    this.initSortable();       // gắn nguồn kéo (#place-list) một lần duy nhất
    this.buildDayUI();         // sinh tab + khối ngày theo CONFIG.DAYS
    this.bindTabs();
    this.bindDayConfig();
    this.bindFilters();
  },

  key: (d, s) => `${d}|${s}`,

  /* ==================================================================
     A. DANH SÁCH ĐỊA ĐIỂM (SIDEBAR TRÁI)
     ================================================================== */
  renderList() {
    const box = document.getElementById('place-list');
    const q = (document.getElementById('search-place').value || '').trim().toLowerCase();
    const fg = document.getElementById('filter-group').value;
    const fa = document.getElementById('filter-area').value;
    const fr = document.getElementById('filter-rec').value;
    const fc = document.getElementById('filter-cost').value;

    const list = DataStore.places.filter(p => {
      if (q && !stripAccents(p.diaDiem).includes(stripAccents(q))) return false;
      if (fg && p.nhom !== fg) return false;
      if (fa && p.khuVuc !== fa) return false;
      if (fr && p.grade !== fr) return false;
      if (fc && !(p.chiPhi || '').toLowerCase().includes(fc.toLowerCase())) return false;
      return true;
    });

    document.getElementById('count-places').textContent = list.length;

    // Ghi lại tập kết quả lọc để đồng bộ marker trên bản đồ
    this.filteredIds = new Set(list.map(p => p.id));
    this.isFiltering = Boolean(q || fg || fa || fr || fc);
    this.applyFilterToMarkers();

    box.innerHTML = '';

    if (!list.length) {
      box.innerHTML = `<div class="empty-hint">${t('list.nomatch')}</div>`;
      return;
    }

    list.forEach(p => box.appendChild(this.placeCard(p)));
  },

  placeCard(p) {
    const el = document.createElement('div');
    el.className = 'place-card';
    el.dataset.id = p.id;
    el.innerHTML = `
      <div class="pc-icon"><img src="${CONFIG.ICONS[p.icon]}" alt="" loading="lazy"></div>
      <div class="pc-body">
        <div class="pc-name">${escapeHtml(p.diaDiem)}</div>
        <div class="pc-meta">
          ${p.diemGoogle ? `<span class="tag star">⭐ ${p.diemGoogle}</span>` : ''}
          ${p.grade ? `<span class="tag grade-${p.grade}">${p.grade}</span>` : ''}
          <span class="tag">${escapeHtml(shorten(p.khuVuc, 18))}</span>
        </div>
      </div>
      <button class="pc-add" title="Thêm vào ${this.activeDay === 'all' ? 'Ngày 1' : 'Ngày ' + this.activeDay}">+</button>`;

    el.addEventListener('click', ev => {
      if (ev.target.classList.contains('pc-add')) {
        ev.stopPropagation();
        const day = this.activeDay === 'all' ? '1' : this.activeDay;
        this.addToPlan(p.id, day, 'Sáng');
        Mascot.say(`Đã thêm <b>${escapeHtml(shorten(p.diaDiem, 26))}</b> vào Ngày ${day} 🎒`);
        return;
      }
      this.focusPlace(p.id, true);
    });
    return el;
  },

  /* ==================================================================
     B. MARKER CHIBI 2D TRÊN BẢN ĐỒ
     ================================================================== */
  renderMarkers() {
    this.markers.forEach(m => m.marker.remove());
    this.markers.clear();

    DataStore.places.forEach(p => {
      if (p.lat == null || p.lng == null) return;

      const el = document.createElement('div');
      el.className = 'chibi-marker';
      el.dataset.id = p.id;
      el.innerHTML = `
        <div class="chibi-pin"><img src="${CONFIG.ICONS[p.icon]}" alt="">${p.approx ? `<span class="approx-dot" title="${t('card.approx')}">~</span>` : ''}</div>
        <div class="chibi-label">${escapeHtml(shorten(p.diaDiem, 22))}</div>`;

      el.addEventListener('click', e => { e.stopPropagation(); this.openPopup(p); });

      const marker = new GL.Marker({ element: el, anchor: 'center' })
        .setLngLat([p.lng, p.lat]).addTo(this.map);

      this.markers.set(p.id, { marker, el });
    });

    this.refreshMarkerStyles();
  },

  /* Ẩn hẳn pin không khớp bộ lọc.
     Điểm đã nằm trong Nhật ký hành trình thì LUÔN hiện, dù bị lọc ra. */
  applyFilterToMarkers() {
    if (!this.markers || !this.markers.size) return;
    const keep = new Set(this.orderedIds());          // điểm trong lịch trình
    const filtering = this.isFiltering;
    this.markers.forEach(({ el }, id) => {
      const hide = filtering && !this.filteredIds.has(id) && !keep.has(id);
      el.classList.toggle('filtered-out', hide);
    });
  },

  /* Đổi màu/độ mờ pin theo Ngày–Buổi đang chọn */
  refreshMarkerStyles() {
    const inPlan = new Map();          // id -> { slot, order }
    let order = 0;
    const days = this.activeDay === 'all' ? CONFIG.DAYS : [this.activeDay];
    days.forEach(d => CONFIG.SLOTS.forEach(s => {
      (this.plan[this.key(d, s)] || []).forEach(id => inPlan.set(id, { slot: s, order: ++order }));
    }));

    const filtering = inPlan.size > 0;

    this.markers.forEach(({ el }, id) => {
      const info = inPlan.get(id);
      el.querySelector('.chibi-order')?.remove();
      if (info) {
        el.dataset.slot = info.slot;
        el.classList.remove('dimmed');
        const badge = document.createElement('div');
        badge.className = 'chibi-order';
        badge.textContent = info.order;
        el.appendChild(badge);
      } else {
        delete el.dataset.slot;
        el.classList.toggle('dimmed', filtering);
      }
    });

    // Điểm vừa thêm vào lịch trình phải hiện lại dù đang bị lọc
    this.applyFilterToMarkers();

    // Nếu đang chạy 3D, giữ nguyên trạng thái ẩn điểm ngoài lịch trình
    if (window.Play3D?.active) Play3D.applyHideOthers();
  },

  /* ==================================================================
     C. POPUP THẺ GAME RPG
     ================================================================== */
  openPopup(p) {
    this.lastPlace = p;          // nhớ để mở lại khi đổi ngôn ngữ
    if (this.popup) this.popup.remove();
    // anchor 'top' => thẻ RPG luôn mở XUỐNG DƯỚI marker cho dễ căn khung
    this.popup = new GL.Popup({
      offset: 26, closeButton: true, maxWidth: '280px',
      focusAfterOpen: false, anchor: 'top'
    })
      .setLngLat([p.lng, p.lat])
      .setHTML(this.rpgCardHtml(p))
      .addTo(this.map);

    // Đẩy marker lên phía trên để thẻ RPG mở xuống mà vẫn nằm trọn trong khung
    const h = this.map.getContainer().clientHeight;
    this.map.easeTo({
      center: [p.lng, p.lat],
      offset: [0, -(h / 2 - 150)],
      duration: 550
    });

    // nút trong popup
    setTimeout(() => {
      document.querySelector('.rpg-add-btn')?.addEventListener('click', () => {
        const day = this.activeDay === 'all' ? '1' : this.activeDay;
        this.addToPlan(p.id, day, guessSlot(p.khungGio));
        Mascot.say(t('mascot.added', { name: escapeHtml(shorten(p.diaDiem, 24)), d: day }));
      });
      document.querySelector('.rpg-fly-btn')?.addEventListener('click', () => {
        this.map.flyTo({ center: [p.lng, p.lat], zoom: 16, pitch: CONFIG.PITCH_2D, duration: 900 });
      });
      // Mở/thu gọn phần ưu–nhược điểm để thẻ không che mất bản đồ
      const tgl = document.querySelector('.rpg-toggle');
      tgl?.addEventListener('click', () => {
        const card = tgl.closest('.rpg-card');
        const open = card.classList.toggle('expanded');
        tgl.textContent = open ? t('card.collapse') : t('card.expand');
      });
    }, 0);

    Mascot.say(pickOne([
      t('mascot.tip.hours', { name: escapeHtml(shorten(p.diaDiem, 22)), hours: escapeHtml(p.khungGio || t('mascot.flexible')) }),
      (p.grade === 'A' ? t('mascot.tip.a') : t('mascot.tip.b')),
      t('mascot.tip.cons')
    ]));
  },

  rpgCardHtml(p) {
    const stars = p.diemGoogle ? '⭐'.repeat(Math.round(p.diemGoogle)) : '';
    const catLabel = { food: t('card.food'), travel: t('card.travel'), stay: t('card.stay') }[p.cat] || t('card.other');

    return `
    <div class="rpg-card">
      <div class="rpg-head">
        <div class="rpg-title">${escapeHtml(p.diaDiem)}</div>
        <div class="rpg-sub">${catLabel} • ${escapeHtml(p.nhom)}</div>
      </div>

      <div class="rpg-rating">
        <span class="rpg-score">${p.diemGoogle ?? '—'}</span>
        <div>
          <div class="rpg-stars">${stars}</div>
          <div class="rpg-reviews">${escapeHtml(p.luotDanhGia || t('card.noreviews'))}${p.doTinCay ? t('card.trust') + escapeHtml(p.doTinCay) : ''}</div>
        </div>
        ${p.googleMaps ? `<a class="rpg-gmap" href="${p.googleMaps}" target="_blank" rel="noopener">🗺️ Maps</a>` : ''}
      </div>

      <div class="rpg-stats">
        ${[[t('card.area'), p.khuVuc], [t('card.cost'), p.chiPhi],
           [t('card.hours'), p.khungGio], [t('card.duration'), p.thoiLuong]]
          .filter(([, v]) => v)
          .map(([k, v]) => `<div class="stat"><b>${k}</b><span>${escapeHtml(v)}</span></div>`).join('')}
        ${p.phuHop ? `<div class="stat wide"><b>${t('card.suitable')}</b><span>${escapeHtml(p.phuHop)}</span></div>` : ''}
      </div>

      <div class="rpg-more">
        <div class="rpg-cards">
          ${p.uuDiem ? `<div class="pro-card"><h5>${t('card.pros')}</h5>${escapeHtml(p.uuDiem)}</div>` : ''}
          ${p.nhuocDiem ? `<div class="con-card"><h5>${t('card.cons')}</h5>${escapeHtml(p.nhuocDiem)}</div>` : ''}
        </div>

        ${p.approx ? `<div class="geo-warn">📍 ${t('card.geonote', { note: escapeHtml(p.geoNote || t('card.area.generic')) })}</div>` : ''}

        ${p.khuyenNghi ? `<div class="rpg-quest">
          <h5>${t('card.quest')}</h5><p>${escapeHtml(p.khuyenNghi)}</p></div>` : ''}
      </div>

      ${(p.uuDiem || p.nhuocDiem || p.khuyenNghi || p.approx)
        ? `<button class="rpg-toggle" type="button">${t('card.expand')}${p.approx ? t('card.geowarn') : ''}</button>` : ''}

      <div class="rpg-foot">
        <button class="rpg-add-btn">${t('card.add')}</button>
        <button class="rpg-fly-btn">${t('card.zoom')}</button>
      </div>

      ${p.nguon ? `<small class="rpg-src">Nguồn: ${p.nguon.split(' | ').map(u =>
        `<a href="${u}" target="_blank" rel="noopener">${shorten(u.replace(/^https?:\/\//, ''), 42)}</a>`).join(' · ')}</small>` : ''}
    </div>`;
  },

  focusPlace(id, openPopup) {
    const p = DataStore.byId.get(id);
    if (!p || p.lat == null) return;
    this.map.flyTo({ center: [p.lng, p.lat], zoom: 15.4, pitch: CONFIG.PITCH_2D, duration: 900 });
    document.querySelectorAll('.place-card').forEach(c => c.classList.toggle('is-active', c.dataset.id === id));
    const m = this.markers.get(id);
    if (m) { m.el.classList.add('pulse'); setTimeout(() => m.el.classList.remove('pulse'), 2400); }
    if (openPopup) this.openPopup(p);
  },

  /* ==================================================================
     D. LỊCH TRÌNH — KÉO THẢ (SortableJS)
     ================================================================== */
  /* ==================================================================
     A2. SỐ NGÀY LINH HOẠT — sinh tab + khối ngày từ CONFIG.DAYS
     ================================================================== */

  /* "3 ngày 2 đêm" — n đêm = n ngày - 1 (tối thiểu 0) */
  tripLabel() {
    const d = CONFIG.DAYS.length;
    return d <= 1 ? t('plan.oneday') : t('plan.nights', { d, n: d - 1 });
  },

  buildDayUI() {
    const tabs = document.getElementById('day-tabs');
    const area = document.getElementById('plan-area');
    const ICON = { 'Sáng': '🌅', 'Chiều': '☀️', 'Tối': '🌙' };

    tabs.innerHTML = CONFIG.DAYS.map(d =>
      `<button class="day-tab${String(d) === String(this.activeDay) ? ' active' : ''}" data-day="${d}">${t('plan.day')} ${d}</button>`
    ).join('') + `<button class="day-tab${this.activeDay === 'all' ? ' active' : ''}" data-day="all">${t('plan.all')}</button>`;

    area.innerHTML = CONFIG.DAYS.map(d => {
      const hide = (this.activeDay !== 'all' && String(d) !== String(this.activeDay)) ? ' hidden' : '';
      const slots = CONFIG.SLOTS.map(s => `
        <div class="slot" data-day="${d}" data-slot="${s}">
          <div class="slot-head"><span>${ICON[s] || '•'} ${SLOT_LABEL(s)}</span><small class="slot-meta">${t('plan.count', { n: 0 })}</small></div>
          <div class="drop-zone" data-day="${d}" data-slot="${s}"></div>
        </div>`).join('');
      return `<div class="day-block${hide}" data-day="${d}">
        <h3 class="day-title">🌤️ ${t('plan.day')} ${d}</h3>${slots}</div>`;
    }).join('');

    // Bảo đảm mọi ô ngày–buổi đều có mảng
    CONFIG.DAYS.forEach(d => CONFIG.SLOTS.forEach(s => {
      const k = this.key(d, s);
      if (!this.plan[k]) this.plan[k] = [];
    }));

    const lbl = document.getElementById('day-count-label');
    if (lbl) lbl.textContent = this.tripLabel();
    const minus = document.getElementById('btn-day-minus');
    if (minus) minus.disabled = CONFIG.DAYS.length <= 1;
    const plus = document.getElementById('btn-day-plus');
    if (plus) plus.disabled = CONFIG.DAYS.length >= 14;

    this.initSortable(true);   // gắn lại drag&drop cho các drop-zone mới
  },

  addDay() {
    if (CONFIG.DAYS.length >= 14) { Toast.show(t('msg.maxdays'), 'err'); return; }
    const next = CONFIG.DAYS.length + 1;
    CONFIG.DAYS.push(next);
    CONFIG.SLOTS.forEach(s => { this.plan[this.key(next, s)] = []; });
    this.activeDay = String(next);
    this.buildDayUI();
    this.renderPlan();
    this.persist();
    Mascot.say(t('mascot.dayadded', { d: next, label: this.tripLabel() }));
  },

  removeDay() {
    const n = CONFIG.DAYS.length;
    if (n <= 1) { Toast.show(t('msg.mindays'), 'err'); return; }
    const used = CONFIG.SLOTS.reduce((t, s) => t + (this.plan[this.key(n, s)] || []).length, 0);
    if (used && !confirm(t('msg.confirmday', { d: n, n: used }))) return;
    CONFIG.SLOTS.forEach(s => { delete this.plan[this.key(n, s)]; });
    CONFIG.DAYS.pop();
    if (String(this.activeDay) === String(n)) this.activeDay = String(CONFIG.DAYS.length);
    this.buildDayUI();
    this.renderPlan();
    this.refreshMarkerStyles();
    this.persist();
    Routing.invalidate();
    Mascot.say(t('mascot.dayremoved', { label: this.tripLabel() }));
  },

  /* Khôi phục số ngày từ dữ liệu đã lưu (plan có thể có ngày 4,5,…) */
  syncDaysFromPlan() {
    let max = 1;
    Object.keys(this.plan).forEach(k => {
      const d = parseInt(String(k).split('|')[0], 10);
      if (isFinite(d) && (this.plan[k] || []).length) max = Math.max(max, d);
    });
    if (max > CONFIG.DAYS.length) {
      CONFIG.DAYS = Array.from({ length: max }, (_, i) => i + 1);
    }
  },

  initSortable(rebind) {
    // Nguồn kéo: danh sách địa điểm (clone, không xoá khỏi list).
    // Chỉ tạo MỘT LẦN — buildDayUI() gọi lại hàm này với rebind=true,
    // tạo trùng Sortable trên cùng element sẽ sinh item ma khi kéo.
    if (!rebind) {
      Sortable.create(document.getElementById('place-list'), {
        group: { name: 'places', pull: 'clone', put: false },
        sort: false,
        animation: 170,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen'
      });
    }

    // Đích thả: từng ô Ngày × Buổi (element mới sau mỗi lần sinh lại UI)
    document.querySelectorAll('.drop-zone').forEach(zone => {
      if (zone._sortable) zone._sortable.destroy();
      zone._sortable = Sortable.create(zone, {
        group: { name: 'places', pull: true, put: true },
        animation: 170,
        ghostClass: 'sortable-ghost',
        onAdd: evt => {
          const id = evt.item.dataset.id;
          evt.item.remove();                       // bỏ node clone thô
          const { day, slot } = zone.dataset;
          this.addToPlan(id, day, slot, evt.newIndex);
        },
        onUpdate: () => this.syncFromDom(),
        onRemove: () => this.syncFromDom()
      });
    });
  },

  addToPlan(id, day, slot, index) {
    const k = this.key(day, slot);
    if (!this.plan[k]) this.plan[k] = [];
    // không cho trùng trong cùng ô
    if (this.plan[k].includes(id)) { Toast.show(t('msg.dupe')); return; }
    if (index == null || index > this.plan[k].length) this.plan[k].push(id);
    else this.plan[k].splice(index, 0, id);
    this.renderPlan();
    this.persist();
    Routing.invalidate();
  },

  removeFromPlan(id, day, slot) {
    const k = this.key(day, slot);
    this.plan[k] = (this.plan[k] || []).filter(x => x !== id);
    this.renderPlan();
    this.persist();
    Routing.invalidate();
  },

  /* Đọc lại thứ tự thật từ DOM sau khi kéo-thả trong/giữa các ô */
  syncFromDom() {
    document.querySelectorAll('.drop-zone').forEach(zone => {
      const { day, slot } = zone.dataset;
      this.plan[this.key(day, slot)] =
        [...zone.querySelectorAll('.plan-item')].map(el => el.dataset.id);
    });
    this.renderPlan();
    this.persist();
    Routing.invalidate();
  },

  renderPlan() {
    let n = 0;
    CONFIG.DAYS.forEach(d => CONFIG.SLOTS.forEach(s => {
      const zone = document.querySelector(`.drop-zone[data-day="${d}"][data-slot="${s}"]`);
      if (!zone) return;
      const ids = this.plan[this.key(d, s)] || [];
      zone.innerHTML = '';
      ids.forEach(id => {
        const p = DataStore.byId.get(id);
        if (!p) return;
        n++;
        const item = document.createElement('div');
        item.className = 'plan-item';
        item.dataset.id = id;
        item.innerHTML = `
          <span class="pi-order">${ids.indexOf(id) + 1}</span>
          <span class="pi-icon"><img src="${CONFIG.ICONS[p.icon]}" alt=""></span>
          <span class="pi-name" title="${escapeHtml(p.diaDiem)}">${escapeHtml(p.diaDiem)}</span>
          <button class="pi-del" title="Xoá">✕</button>`;
        item.querySelector('.pi-del').addEventListener('click', e => {
          e.stopPropagation(); this.removeFromPlan(id, d, s);
        });
        item.addEventListener('click', () => this.focusPlace(id, true));
        zone.appendChild(item);
      });
      const meta = zone.parentElement.querySelector('.slot-meta');
      if (meta) meta.textContent = t('plan.count', { n: ids.length });
    }));

    this.refreshMarkerStyles();
    Routing.renderLegLabels();
    document.getElementById('btn-route').disabled = this.orderedIds().length < 2;
  },

  /* Danh sách id theo đúng thứ tự Ngày → Buổi → vị trí */
  orderedIds() {
    const days = this.activeDay === 'all' ? CONFIG.DAYS : [this.activeDay];
    const out = [];
    days.forEach(d => CONFIG.SLOTS.forEach(s => out.push(...(this.plan[this.key(d, s)] || []))));
    return out;
  },

  orderedPlaces() {
    return this.orderedIds().map(id => DataStore.byId.get(id))
      .filter(p => p && p.lat != null && p.lng != null);
  },

  clearPlan() {
    CONFIG.DAYS.forEach(d => CONFIG.SLOTS.forEach(s => { this.plan[this.key(d, s)] = []; }));
    this.renderPlan(); this.persist(); Routing.invalidate();
    Mascot.say(t('msg.cleared'));
  },

  /* ------------------------------------------------------------ tabs */
  bindTabs() {
    document.getElementById('day-tabs').addEventListener('click', e => {
      const btn = e.target.closest('.day-tab');
      if (!btn) return;
      document.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.activeDay = btn.dataset.day;
      document.querySelectorAll('.day-block').forEach(b => {
        b.classList.toggle('hidden', this.activeDay !== 'all' && b.dataset.day !== this.activeDay);
      });
      this.refreshMarkerStyles();
      Routing.invalidate();
      Mascot.say(this.activeDay === 'all'
        ? t('mascot.viewall', { n: CONFIG.DAYS.length })
        : `Đang xem <b>Ngày ${this.activeDay}</b> — pin đổi màu theo buổi rồi đó!`);
    });
  },

  bindFilters() {
    ['search-place', 'filter-group', 'filter-area', 'filter-rec', 'filter-cost']
      .forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener(id === 'search-place' ? 'input' : 'change', () => this.renderList());
      });
  },

  bindDayConfig() {
    document.getElementById('btn-day-plus')?.addEventListener('click', () => this.addDay());
    document.getElementById('btn-day-minus')?.addEventListener('click', () => this.removeDay());
  },

  /* ---------------------------------------------------- localStorage */
  persist() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY,
        JSON.stringify({ plan: this.plan, days: CONFIG.DAYS.length }));
    } catch (e) { /* ignore */ }
  },
  restore() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.days && d.days >= 1 && d.days <= 14) {
          CONFIG.DAYS = Array.from({ length: d.days }, (_, i) => i + 1);
        }
        if (d.plan) Object.assign(this.plan, d.plan);
      }
    } catch (e) { /* ignore */ }
  }
};

/* =========================== tiện ích chung ========================= */
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function shorten(s, n) {
  s = String(s ?? '');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function pickOne(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* Đoán buổi từ "Khung giờ đẹp" (07:30–09:30 → Sáng) */
function guessSlot(khungGio) {
  const m = String(khungGio || '').match(/(\d{1,2}):(\d{2})/);
  if (!m) return 'Sáng';
  const h = parseInt(m[1], 10);
  if (h < 11) return 'Sáng';
  if (h < 17) return 'Chiều';
  return 'Tối';
}

/* Toast nhỏ */
const Toast = {
  show(msg, type = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = msg;
    document.getElementById('toast-wrap').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, 2600);
    setTimeout(() => el.remove(), 3100);
  }
};
