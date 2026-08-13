/* =====================================================================
   exporter.js — EXPORT BẢN ĐỒ 2D THÀNH ẢNH PNG (html2canvas)
   ---------------------------------------------------------------------
   Ảnh xuất ra gồm: nền bản đồ Anime + nhãn tên địa điểm + tuyến đường
   thực tế + bảng chú giải (Legend) + tổng km/thời gian.
   Lưu ý kỹ thuật: canvas WebGL của MapLibre/Mapbox không được
   html2canvas đọc trực tiếp → phải chụp canvas GL riêng rồi ghép với
   lớp HTML (marker, label, overlay) chụp bởi html2canvas.
   ===================================================================== */

const Exporter = {

  async run() {
    const map = Planner.map;
    const wrap = document.getElementById('map-wrap');
    const overlay = document.getElementById('map-overlay');

    // Đảm bảo đang ở 2D thuần trước khi chụp
    if (Play3D.active) Play3D.stop();
    if (map.getPitch() !== 0) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 500 });
      await sleep(650);
    }

    // Căn khung cho vừa toàn bộ tuyến / tất cả pin trước khi chụp
    await this.frameAll(map);

    Toast.show(t('msg.capturing'));
    Mascot.say(t('mascot.export'));

    // Bật overlay tiêu đề + legend, và BẬT nhãn tên địa điểm cho ảnh
    const labelsWereOff = document.body.classList.contains('labels-off');
    document.body.classList.remove('labels-off');

    // CHỈ giữ lại các điểm nằm trong Nhật ký hành trình
    const planIds = Planner.orderedIds();
    const planOnly = planIds.length > 0;
    if (planOnly) {
      const keep = new Set(planIds);
      Planner.markers.forEach(({ el }, id) => {
        el.classList.toggle('export-hidden', !keep.has(id));
      });
    }
    overlay.classList.add('show');
    document.getElementById('overlay-sub').textContent =
      new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!Routing.route) {
      document.getElementById('overlay-stats').textContent =
        t('overlay.nostats', { n: DataStore.places.length });
    }

    // Ẩn nền đục để lớp HTML không phủ kín ảnh bản đồ WebGL
    document.body.classList.add('exporting');

    // Buộc map vẽ xong 1 frame để canvas có nội dung
    map.triggerRepaint();
    await new Promise(r => map.once('idle', r));
    await sleep(150);

    // Dàn nhãn tên địa điểm sao cho KHÔNG đè lên nhau
    const placedLabels = this.layoutLabels(map, planOnly ? planIds : null);
    await sleep(60);

    const scale = Math.min(2, window.devicePixelRatio || 1);
    const wrapRect = wrap.getBoundingClientRect();
    const w = Math.round(wrapRect.width), h = Math.round(wrapRect.height);

    // 1) Ảnh nền: canvas WebGL của bản đồ (đặt đúng vị trí trong khung)
    const glCanvas = map.getCanvas();
    const glRect = glCanvas.getBoundingClientRect();
    const gx = (glRect.left - wrapRect.left) * scale;
    const gy = (glRect.top - wrapRect.top) * scale;
    const gw = glRect.width * scale;
    const gh = glRect.height * scale;

    // 2) Lớp HTML (markers, labels, overlay) — bỏ qua canvas GL
    const htmlCanvas = await html2canvas(wrap, {
      backgroundColor: null,
      scale,
      useCORS: true,
      logging: false,
      width: w,
      height: h,
      ignoreElements: el => el.tagName === 'CANVAS'
        || el.id === 'map-controls' || el.id === 'route-hud' || el.id === 'play-hud'
        || el.classList?.contains('maplibregl-ctrl-top-left')
        || el.classList?.contains('mapboxgl-ctrl-top-left')
    });

    // 3) Ghép 2 lớp
    const out = document.createElement('canvas');
    out.width = Math.round(w * scale);
    out.height = Math.round(h * scale);
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffeaf3';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(glCanvas, gx, gy, gw, gh);
    ctx.drawImage(htmlCanvas, 0, 0, out.width, out.height);

    // 4) Khung viền kawaii
    ctx.strokeStyle = '#ff8cbd';
    ctx.lineWidth = 8 * scale;
    ctx.strokeRect(0, 0, out.width, out.height);

    // 5) Watermark nhỏ
    ctx.font = `${13 * scale}px Quicksand, sans-serif`;
    ctx.fillStyle = 'rgba(140,63,104,.72)';
    ctx.textAlign = 'left';
    ctx.fillText(t('export.watermark'), 16 * scale, out.height - 14 * scale);

    overlay.classList.remove('show');
    document.body.classList.remove('exporting');
    if (labelsWereOff) document.body.classList.add('labels-off');
    // Trả marker + nhãn về trạng thái bình thường
    Planner.markers.forEach(({ el }) => el.classList.remove('export-hidden'));
    this.resetLabels();

    // 6) Tải xuống PNG
    out.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `dalat-travel-map-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      Toast.show(t('msg.saved'), 'ok');
    }, 'image/png');
  },

  /* Căn khung: đảm bảo mọi pin + tuyến đều nằm trọn trong ảnh */
  async frameAll(map) {
    const b = new (GL.LngLatBounds)();
    let has = false;
    const plan = Planner.orderedPlaces();
    if (Routing.route) { Routing.route.coords.forEach(c => { b.extend(c); has = true; }); }
    else if (plan.length) { plan.forEach(p => { if (p.lat != null) { b.extend([p.lng, p.lat]); has = true; } }); }
    else { DataStore.places.forEach(p => { if (p.lat != null) { b.extend([p.lng, p.lat]); has = true; } }); }
    if (!has) return;
    map.fitBounds(b, {
      padding: { top: 110, bottom: 130, left: 90, right: 110 },
      pitch: 0, bearing: 0, duration: 900, maxZoom: 16
    });
    await new Promise(r => map.once('moveend', r));
    await sleep(250);
  },

  /* ------------------------------------------------------------------
     Dàn nhãn tên địa điểm quanh pin sao cho không chồng lên nhau.
     Thử 8 vị trí quanh pin, chọn chỗ đầu tiên không đụng nhãn đã đặt.
     Trả về số nhãn đặt được.
     ------------------------------------------------------------------ */
  layoutLabels(map, onlyIds) {
    const wrap = document.getElementById('map-wrap').getBoundingClientRect();
    const keep = onlyIds ? new Set(onlyIds) : null;

    // Ứng viên: [dx, dy, transform] quanh tâm pin (pin rộng 46px)
    const CAND = [
      [0,   32, 'translate(-50%, 0)'],       // dưới
      [0,  -32, 'translate(-50%, -100%)'],   // trên
      [32,   0, 'translate(0, -50%)'],       // phải
      [-32,  0, 'translate(-100%, -50%)'],   // trái
      [28,  28, 'translate(0, 0)'],          // dưới-phải
      [-28, 28, 'translate(-100%, 0)'],      // dưới-trái
      [28, -28, 'translate(0, -100%)'],      // trên-phải
      [-28,-28, 'translate(-100%, -100%)'],  // trên-trái
      [0,   52, 'translate(-50%, 0)'],       // xa hơn: dưới
      [0,  -52, 'translate(-50%, -100%)'],   // xa hơn: trên
      [52,   0, 'translate(0, -50%)'],
      [-52,  0, 'translate(-100%, -50%)']
    ];

    const taken = [];
    const hit = (a, b) => !(a.r < b.l || a.l > b.r || a.bo < b.t || a.t > b.bo);

    // Ưu tiên theo thứ tự lịch trình để điểm số 1,2,3… chắc chắn có nhãn
    const entries = [];
    Planner.markers.forEach((m, id) => {
      if (keep && !keep.has(id)) return;
      if (m.el.classList.contains('export-hidden')) return;
      if (m.el.classList.contains('filtered-out')) return;
      entries.push([id, m]);
    });
    if (keep) {
      const order = onlyIds.reduce((o, id, i) => (o[id] = i, o), {});
      entries.sort((a, b) => (order[a[0]] ?? 999) - (order[b[0]] ?? 999));
    }

    // QUAN TRỌNG: coi mọi PIN là vùng cấm, nếu không nhãn sẽ đè lên
    // icon và che mất badge số thứ tự.
    entries.forEach(([, m]) => {
      const r = m.el.getBoundingClientRect();
      taken.push({
        l: r.left - wrap.left - 2, t: r.top - wrap.top - 2,
        r: r.right - wrap.left + 2, bo: r.bottom - wrap.top + 2
      });
    });

    let placed = 0;
    entries.forEach(([, m]) => {
      const lab = m.el.querySelector('.chibi-label');
      if (!lab) return;
      lab.style.cssText = '';                       // reset trước khi đo
      lab.classList.add('export-label');
      const pin = m.el.getBoundingClientRect();
      const cx = pin.left + pin.width / 2 - wrap.left;
      const cy = pin.top + pin.height / 2 - wrap.top;
      const lw = lab.offsetWidth || 90;
      const lh = lab.offsetHeight || 18;

      let done = false;
      for (const [dx, dy, tf] of CAND) {
        // Tính hộp bao theo transform tương ứng
        let l = cx + dx, t = cy + dy;
        if (tf.includes('-50%,') || tf.includes('-50%, 0')) l -= lw / 2;
        if (tf.includes('-100%,')) l -= lw;
        if (tf.includes(' -50%)')) t -= lh / 2;
        if (tf.includes(' -100%)')) t -= lh;
        const box = { l, t, r: l + lw, bo: t + lh };

        // Không cho nhãn tràn ra ngoài khung ảnh
        if (box.l < 4 || box.t < 4 || box.r > wrap.width - 4 || box.bo > wrap.height - 4) continue;
        if (taken.some(o => hit(box, o))) continue;

        lab.style.position = 'absolute';
        lab.style.left = (pin.width / 2 + dx) + 'px';
        lab.style.top = (pin.height / 2 + dy) + 'px';
        lab.style.transform = tf;
        lab.style.bottom = 'auto';
        lab.style.right = 'auto';
        taken.push(box);
        placed++; done = true;
        break;
      }
      // Hết chỗ -> ẩn nhãn này để ảnh không rối
      if (!done) lab.style.display = 'none';
    });
    return placed;
  },

  resetLabels() {
    document.querySelectorAll('.chibi-label').forEach(l => {
      l.style.cssText = '';
      l.classList.remove('export-label');
    });
  },

  /* Cập nhật lại overlay khi đổi ngôn ngữ */
  syncOverlay() {
    const st = document.getElementById('overlay-stats');
    if (st && !Routing.route) st.textContent = t('overlay.nostats', { n: DataStore.places.length });
  },

  /* Xuất lịch trình ra JSON để lưu/chia sẻ */
  savePlanJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: Routing.profile,
      plan: Object.fromEntries(Object.entries(Planner.plan).map(([k, ids]) => [
        k, ids.map(id => {
          const p = DataStore.byId.get(id);
          return p ? { stt: p.stt, diaDiem: p.diaDiem, lat: p.lat, lng: p.lng, googleMaps: p.googleMaps } : null;
        }).filter(Boolean)
      ])),
      route: Routing.route ? {
        totalKm: +(Routing.route.distance / 1000).toFixed(2),
        totalMinutes: Math.round(Routing.route.duration / 60),
        legs: Routing.route.legs.map(l => ({
          from: l.from.diaDiem, to: l.to.diaDiem,
          km: +(l.distance / 1000).toFixed(2),
          minutes: l.duration ? Math.round(l.duration / 60) : null
        }))
      } : null
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lich-trinh-da-lat-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    Toast.show('Đã lưu lịch trình JSON 💾', 'ok');
  }
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
