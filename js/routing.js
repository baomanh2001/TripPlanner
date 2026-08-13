/* =====================================================================
   routing.js — TUYẾN ĐƯỜNG THỰC TẾ (REAL-WORLD ROUTING)
   ---------------------------------------------------------------------
   • KHÔNG dùng đường chim bay. Mọi tuyến đều gọi Directions API và
     nhận về geometry bám theo mạng lưới đường giao thông.
   • Hỗ trợ 3 nhà cung cấp: OSRM (mặc định, free) | Mapbox | ORS.
   • Trả về: geometry [[lng,lat],…], distance (m), duration (s) từng chặng.
   ===================================================================== */

const Routing = {
  route: null,        // { legs:[{from,to,coords,distance,duration}], coords, distance, duration }
  loading: false,
  profile: CONFIG.PROFILE,

  /* ------------------------------------------------- gọi API 1 chặng */
  async fetchLeg(a, b) {
    const prof = CONFIG.PROFILE_MAP[CONFIG.ROUTER][this.profile];

    /* ---------- 1) OSRM (miễn phí, không cần key) ---------- */
    if (CONFIG.ROUTER === 'osrm') {
      const url = `${CONFIG.OSRM_URL}/route/v1/${prof}/` +
        `${a.lng},${a.lat};${b.lng},${b.lat}` +
        `?overview=full&geometries=geojson&steps=false&alternatives=false`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('OSRM HTTP ' + r.status);
      const j = await r.json();
      if (j.code !== 'Ok' || !j.routes?.length) throw new Error('OSRM: ' + (j.code || 'no route'));
      const rt = j.routes[0];
      // ⚠️ Máy chủ OSRM demo công cộng CHỈ chạy profile ô tô. Với đi bộ/xe đạp
      // ta hiệu chỉnh thời gian theo tốc độ trung bình thực tế ở Đà Lạt (đồi dốc).
      const k = CONFIG.OSRM_TIME_FACTOR[this.profile] ?? 1;
      return { coords: rt.geometry.coordinates, distance: rt.distance, duration: rt.duration * k,
               estimated: k !== 1 };
    }

    /* ---------- 2) MAPBOX DIRECTIONS API ---------- */
    if (CONFIG.ROUTER === 'mapbox') {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${prof}/` +
        `${a.lng},${a.lat};${b.lng},${b.lat}` +
        `?geometries=geojson&overview=full&steps=false&access_token=${CONFIG.MAPBOX_TOKEN}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('Mapbox HTTP ' + r.status);
      const j = await r.json();
      if (!j.routes?.length) throw new Error('Mapbox: no route');
      const rt = j.routes[0];
      return { coords: rt.geometry.coordinates, distance: rt.distance, duration: rt.duration };
    }

    /* ---------- 3) OPENROUTESERVICE ---------- */
    const r = await fetch(`${CONFIG.ORS_URL}/${prof}/geojson`, {
      method: 'POST',
      headers: { 'Authorization': CONFIG.ORS_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates: [[a.lng, a.lat], [b.lng, b.lat]] })
    });
    if (!r.ok) throw new Error('ORS HTTP ' + r.status);
    const j = await r.json();
    const f = j.features?.[0];
    if (!f) throw new Error('ORS: no route');
    return {
      coords: f.geometry.coordinates,
      distance: f.properties.summary.distance,
      duration: f.properties.summary.duration
    };
  },

  /* ------------------------------------ tính toàn bộ tuyến của lịch trình */
  async build() {
    const places = Planner.orderedPlaces();
    if (places.length < 2) {
      Toast.show(t('msg.need2'), 'err');
      return null;
    }
    if (this.loading) return null;
    this.loading = true;

    const btn = document.getElementById('btn-route');
    const label = btn.innerHTML;
    btn.innerHTML = t('msg.routing');
    btn.disabled = true;
    Mascot.say(t('msg.asking'));

    const legs = [];
    try {
      for (let i = 0; i < places.length - 1; i++) {
        const a = places[i], b = places[i + 1];
        let leg;
        try {
          leg = await this.fetchLeg(a, b);
        } catch (err) {
          console.warn('Leg lỗi, dùng fallback đường thẳng:', err);
          // Fallback CHỈ khi API chết — có đánh dấu để cảnh báo người dùng
          leg = {
            coords: [[a.lng, a.lat], [b.lng, b.lat]],
            distance: turf.distance([a.lng, a.lat], [b.lng, b.lat], { units: 'meters' }),
            duration: null, fallback: true
          };
        }
        legs.push({ from: a, to: b, ...leg });
        await new Promise(r => setTimeout(r, 120));   // lịch sự với API công cộng
      }

      const coords = [];
      legs.forEach((l, i) => coords.push(...(i ? l.coords.slice(1) : l.coords)));

      this.route = {
        legs, coords,
        places,
        distance: legs.reduce((s, l) => s + l.distance, 0),
        duration: legs.reduce((s, l) => s + (l.duration || 0), 0),
        anyFallback: legs.some(l => l.fallback),
        estimatedTime: legs.some(l => l.estimated)
      };

      this.draw();
      this.renderHud();
      this.renderLegLabels();
      Play3D.enableButton(true);

      Mascot.say(`Xong! Tổng <b>${(this.route.distance / 1000).toFixed(1)} km</b> · ` +
        `<b>${Math.round(this.route.duration / 60)} phút</b> chạy xe 🛣️`);
      Toast.show(t('msg.routeok'), 'ok');
    } finally {
      this.loading = false;
      btn.innerHTML = label;
      btn.disabled = Planner.orderedIds().length < 2;
    }
    return this.route;
  },

  /* ------------------------------------------------ vẽ tuyến lên bản đồ */
  draw() {
    const map = Planner.map;
    const data = { type: 'Feature', geometry: { type: 'LineString', coordinates: this.route.coords } };

    if (map.getSource('route')) {
      map.getSource('route').setData(data);
      this.fitRoute();
      return;
    }

    // lineMetrics: true là BẮT BUỘC để dùng line-gradient (line-progress)
    map.addSource('route', { type: 'geojson', lineMetrics: true, data });

    // 1) Lớp bóng mờ phía dưới
    map.addLayer({
      id: 'route-glow', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ff5fa2', 'line-width': 16, 'line-opacity': 0.22, 'line-blur': 6 }
    });

    // 2) Tuyến chính — gradient hồng → tím
    map.addLayer({
      id: 'route-line', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-gradient': ['interpolate', ['linear'], ['line-progress'],
          0, '#ff5fa2', 0.5, '#c05fd0', 1, '#7c5cf0'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 16, 8]
      }
    });

    // 3) Vạch trắng chạy trên tuyến cho vibe game
    map.addLayer({
      id: 'route-dash', type: 'line', source: 'route',
      layout: { 'line-cap': 'butt' },
      paint: { 'line-color': '#ffffff', 'line-width': 2.2, 'line-dasharray': [0, 4, 3], 'line-opacity': 0.9 }
    });

    this.animateDash();
    this.fitRoute();
  },

  animateDash() {
    const seq = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5],
      [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1]];
    let i = 0;
    setInterval(() => {
      const map = Planner.map;
      if (map && map.getLayer('route-dash')) {
        map.setPaintProperty('route-dash', 'line-dasharray', seq[i % seq.length]);
        i++;
      }
    }, 90);
  },

  fitRoute() {
    if (!this.route) return;
    const b = new GL.LngLatBounds();
    this.route.coords.forEach(c => b.extend(c));
    Planner.map.fitBounds(b, { padding: { top: 90, bottom: 120, left: 70, right: 70 }, duration: 1200, pitch: CONFIG.PITCH_2D });
  },

  /* ------------------------------------------- HUD + CẢNH BÁO LỊCH TRÌNH */
  renderHud() {
    const hud = document.getElementById('route-hud');
    hud.classList.remove('hidden');
    document.getElementById('hud-dist').textContent = (this.route.distance / 1000).toFixed(1) + ' km';
    document.getElementById('hud-time').textContent = fmtDuration(this.route.duration);

    const box = document.getElementById('hud-warnings');
    box.innerHTML = '';
    const warns = this.warnings();
    warns.forEach(w => {
      const el = document.createElement('div');
      el.className = 'warn' + (w.hard ? ' hard' : '');
      el.innerHTML = w.text;
      box.appendChild(el);
    });
    if (this.route.estimatedTime) {
      const el = document.createElement('div');
      el.className = 'warn';
      el.innerHTML = t('warn.caronly');
      box.appendChild(el);
    }
    if (this.route.anyFallback) {
      const el = document.createElement('div');
      el.className = 'warn hard';
      el.innerHTML = t('warn.fallback');
      box.appendChild(el);
    }
    // cập nhật overlay export
    document.getElementById('overlay-stats').textContent =
      t('overlay.stats', { km: (this.route.distance / 1000).toFixed(1), time: fmtDuration(this.route.duration), n: this.route.places.length });
  },

  warnings() {
    if (!this.route) return [];
    const out = [];
    this.route.legs.forEach((l, i) => {
      const km = l.distance / 1000;
      const min = (l.duration || 0) / 60;
      if (km > CONFIG.HARD_DISTANCE_KM) {
        out.push({
          hard: true,
          text: `🚨 <b>${shorten(l.from.diaDiem, 16)} → ${shorten(l.to.diaDiem, 16)}</b>: ${km.toFixed(1)} km — quá xa, nên tách sang ngày khác.`
        });
      } else if (km > CONFIG.WARN_DISTANCE_KM) {
        out.push({
          text: '⚠️ ' + t('warn.long', { a: '<b>' + shorten(l.from.diaDiem, 16) + '</b>', b: '<b>' + shorten(l.to.diaDiem, 16) + '</b>', km: km.toFixed(1), max: CONFIG.WARN_DISTANCE_KM })
        });
      }
      if (min > CONFIG.WARN_DURATION_MIN) {
        out.push({
          text: `⏱️ Chặng ${i + 1} mất ~${Math.round(min)} phút di chuyển — cân nhắc đổi thứ tự.`
        });
      }
    });
    if (!out.length) out.push({ text: t('warn.ok') });
    return out;
  },

  /* Ghi km/phút xen giữa các thẻ trong sidebar lịch trình */
  renderLegLabels() {
    document.querySelectorAll('.leg-info').forEach(e => e.remove());
    if (!this.route) return;
    const items = [...document.querySelectorAll('.plan-item')];
    this.route.legs.forEach(leg => {
      const el = items.find(i => i.dataset.id === leg.from.id);
      if (!el) return;
      const km = leg.distance / 1000;
      const info = document.createElement('div');
      info.className = 'leg-info' + (km > CONFIG.WARN_DISTANCE_KM ? ' warn-leg' : '');
      info.innerHTML = `↓ ${km.toFixed(1)} km · ${fmtDuration(leg.duration)}${km > CONFIG.WARN_DISTANCE_KM ? ' ⚠️' : ''}`;
      el.after(info);
    });
  },

  /* Xoá tuyến khi lịch trình thay đổi */
  invalidate() {
    this.route = null;
    const map = Planner.map;
    if (map?.getSource('route')) {
      map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
    }
    document.getElementById('route-hud')?.classList.add('hidden');
    document.querySelectorAll('.leg-info').forEach(e => e.remove());
    Play3D.enableButton(false);
  }
};

function fmtDuration(sec) {
  if (!sec) return '—';
  const m = Math.round(sec / 60);
  if (m < 60) return m + t('warn.min');
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}
