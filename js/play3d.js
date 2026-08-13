/* =====================================================================
   play3d.js — "PLAY ROUTE 3D ANIMATION"
   ---------------------------------------------------------------------
   • Mặc định bản đồ 2D thuần (pitch 0). Bấm Play → chuyển cảnh mượt
     sang 3D (pitch 55°), bật khối nhà 3D.
   • Linh vật bám theo ĐÚNG geometry coordinates mà Directions API trả về
     (chạy theo từng khúc cua của con đường thật, không cắt góc).
   • Camera tracking: bám sau linh vật, bearing xoay theo hướng đi.
   • Dừng 2–3 giây tại mỗi địa điểm, hiện popup tên, rồi đi tiếp.
   • Thoát 3D → xoá linh vật, trả pitch về 0.
   ---------------------------------------------------------------------
   Linh vật: nếu CONFIG.MODEL_URL trỏ tới file .glb/.gltf → dùng Three.js
   custom layer. Nếu không có model → tự động dùng Marker Chibi 2D hoạt
   hoạ (DOM marker xoay theo hướng chạy). Cả hai đều đi trên cùng path.
   ===================================================================== */

const Play3D = {
  active: false,
  paused: false,
  speedMul: 1,
  rafId: null,

  path: [],            // [[lng,lat], …] toàn tuyến (geometry thực tế)
  cum: [],             // quãng đường cộng dồn (m) tại từng đỉnh
  totalM: 0,
  travelled: 0,        // mét đã đi
  stopAt: [],          // { dist, place } — mốc dừng tại từng địa điểm
  nextStop: 0,
  waitingUntil: 0,

  threeLayer: null,
  mascotMarker: null,
  arrivePopup: null,
  savedView: null,

  /* -------------------------------------------------------- bật/tắt nút */
  enableButton(on) {
    const btn = document.getElementById('btn-play3d');
    btn.disabled = !on;
    btn.title = on ? 'Chạy mô phỏng lịch trình 3D' : 'Hãy tính tuyến đường trước đã';
  },

  /* ==================================================================
     KHỞI ĐỘNG
     ================================================================== */
  /* Có ẩn các địa điểm ngoài lịch trình khi ở 3D không (mặc định: có) */
  hideOthers: true,

  /* Áp/gỡ chế độ ẩn. Chỉ ẩn pin KHÔNG nằm trong lịch trình đang chạy. */
  applyHideOthers() {
    const on = this.active && this.hideOthers;
    document.body.classList.toggle('hide-others-3d', on);
    const keep = new Set(Planner.orderedIds());
    Planner.markers.forEach(({ el }, id) => {
      el.classList.toggle('off-route', on && !keep.has(id));
    });
  },

  toggleHideOthers() {
    this.hideOthers = !this.hideOthers;
    const b = document.getElementById('btn-hide-others');
    if (b) {
      b.classList.toggle('on', this.hideOthers);
      b.textContent = this.hideOthers ? t('play.hideothers') : t('play.showall');
    }
    this.applyHideOthers();
    Mascot.say(this.hideOthers
      ? t('mascot.hidden')
      : t('mascot.shown'));
  },

  async start() {
    if (this.active) return;
    if (!Routing.route) { Toast.show(t('msg.need2'), 'err'); return; }

    const map = Planner.map;
    this.active = true;
    this.paused = false;
    this.travelled = 0;
    this.nextStop = 0;
    this.waitingUntil = 0;

    /* --- 1. Chuẩn bị path từ geometry API --- */
    this.path = Routing.route.coords.slice();
    this.buildCumulative();
    this.buildStops();

    /* --- 2. Lưu view 2D hiện tại để khôi phục khi thoát --- */
    this.savedView = {
      center: map.getCenter(), zoom: map.getZoom(),
      pitch: map.getPitch(), bearing: map.getBearing()
    };

    /* --- 3. UI --- */
    document.getElementById('btn-play3d').classList.add('hidden');
    document.getElementById('btn-exit3d').classList.remove('hidden');
    // Đóng thẻ RPG 2D còn mở để không che HUD khi vào 3D
    Planner.popup?.remove(); Planner.popup = null;
    this.applyHideOthers();
    document.getElementById('play-hud').classList.remove('hidden');
    document.getElementById('brand-sub').textContent = t('app.subtitle3d');
    Mascot.say(t('play.start'));

    /* --- 4. Chuyển cảnh 2D → 3D mượt mà --- */
    setBuildings3D(map, true);
    const start = this.path[0];
    const bearing0 = this.bearingAt(0);
    map.easeTo({
      center: start, zoom: CONFIG.ZOOM_3D, pitch: CONFIG.PITCH_3D,
      bearing: bearing0, duration: 2200, essential: true
    });

    /* --- 5. Tạo linh vật --- */
    await this.spawnMascot(start, bearing0);

    /* --- 6. Bắt đầu vòng lặp sau khi camera đã nghiêng xong --- */
    setTimeout(() => {
      this.lastTs = performance.now();
      this.loop();
    }, 2300);
  },

  /* ------------------------------ quãng đường cộng dồn theo từng đỉnh */
  buildCumulative() {
    this.cum = [0];
    for (let i = 1; i < this.path.length; i++) {
      const d = turf.distance(this.path[i - 1], this.path[i], { units: 'meters' });
      this.cum.push(this.cum[i - 1] + d);
    }
    this.totalM = this.cum[this.cum.length - 1] || 1;
  },

  /* ------------- mốc dừng: chiếu từng địa điểm lên quãng đường tuyến */
  buildStops() {
    this.stopAt = [];
    let acc = 0;
    Routing.route.legs.forEach((leg, i) => {
      acc += leg.distance;
      this.stopAt.push({ dist: acc, place: leg.to, index: i + 1 });
    });
  },

  /* ==================================================================
     LINH VẬT: Three.js GLB  hoặc  Marker Chibi 2D
     ================================================================== */
  async spawnMascot(lngLat, bearing) {
    const map = Planner.map;

    if (CONFIG.MODEL_URL && window.THREE && THREE.GLTFLoader) {
      try { await this.addThreeLayer(lngLat, bearing); return; }
      catch (e) { console.warn('Không load được model 3D, chuyển sang Chibi 2D:', e); }
    }

    // ---- Fallback: Marker Chibi 2D hoạt hoạ ----
    const el = document.createElement('div');
    el.id = 'mascot-runner';
    el.style.cssText = 'width:56px;height:56px;will-change:transform;filter:drop-shadow(0 8px 10px rgba(120,30,80,.45));';
    el.innerHTML = `<img src="assets/icons/mascot-ride.svg" alt=""
        style="width:100%;height:100%;object-fit:contain;transform-origin:50% 50%">`;
    this.mascotMarker = new GL.Marker({ element: el, anchor: 'center', rotationAlignment: 'map', pitchAlignment: 'map' })
      .setLngLat(lngLat).addTo(map);
    this.mascotMarker.setRotation(bearing);
  },

  /* ------------------- Three.js custom layer (khi có file .glb/.gltf) */
  addThreeLayer(lngLat, bearing) {
    return new Promise((resolve, reject) => {
      const map = Planner.map;
      const self = this;
      const origin = GL.MercatorCoordinate.fromLngLat(lngLat, 0);
      const scale = origin.meterInMercatorCoordinateUnits();

      const layer = {
        id: 'mascot-3d',
        type: 'custom',
        renderingMode: '3d',

        onAdd(m, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          this.scene.add(new THREE.AmbientLight(0xffe9f4, 1.15));
          const key = new THREE.DirectionalLight(0xffffff, 1.0);
          key.position.set(0.6, -0.9, 1); this.scene.add(key);
          const rim = new THREE.DirectionalLight(0xffb3d4, 0.7);
          rim.position.set(-0.8, 0.7, 0.6); this.scene.add(rim);

          this.root = new THREE.Group();
          this.scene.add(this.root);

          new THREE.GLTFLoader().load(
            CONFIG.MODEL_URL,
            gltf => {
              const model = gltf.scene;
              model.scale.setScalar(CONFIG.MODEL_SCALE);
              self.mixer = gltf.animations?.length
                ? new THREE.AnimationMixer(model) : null;
              if (self.mixer) self.mixer.clipAction(gltf.animations[0]).play();
              this.root.add(model);
              resolve();
            },
            undefined,
            err => reject(err)
          );

          this.renderer = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true });
          this.renderer.autoClear = false;
        },

        render(gl, matrix) {
          // vị trí hiện tại của linh vật trong hệ toạ độ Mercator
          const pos = self.currentPos || lngLat;
          const brg = self.currentBearing ?? bearing;
          const mc = GL.MercatorCoordinate.fromLngLat(pos, 0);

          const rotX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
          const rotZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), -brg * Math.PI / 180);

          const l = new THREE.Matrix4()
            .makeTranslation(mc.x, mc.y, mc.z)
            .scale(new THREE.Vector3(scale, -scale, scale))
            .multiply(rotX).multiply(rotZ);

          this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(l);
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
          map.triggerRepaint();
        },

        onRemove() { this.renderer?.dispose?.(); }
      };

      this.threeLayer = layer;
      map.addLayer(layer);
    });
  },

  /* ==================================================================
     VÒNG LẶP ANIMATION
     ================================================================== */
  loop() {
    if (!this.active) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTs) / 1000, 0.1);   // giây
    this.lastTs = now;

    if (!this.paused) {
      /* --- đang dừng tại địa điểm? --- */
      if (this.waitingUntil > now) {
        this.rafId = requestAnimationFrame(() => this.loop());
        return;
      }

      /* --- tiến lên theo mét --- */
      const mps = this.currentMps();
      this.travelled = Math.min(this.travelled + mps * dt, this.totalM);

      /* --- tới mốc dừng? --- */
      const stop = this.stopAt[this.nextStop];
      if (stop && this.travelled >= stop.dist - 1) {
        this.travelled = stop.dist;
        this.nextStop++;
        this.arrive(stop);
        this.waitingUntil = now + CONFIG.STOP_SECONDS * 1000;
      }

      this.updateMascot();
      this.updateHud();

      /* --- kết thúc --- */
      if (this.travelled >= this.totalM - 0.5) {
        this.finish();
        return;
      }
    }
    this.rafId = requestAnimationFrame(() => this.loop());
  },

  /* --------------- nội suy vị trí + hướng trên geometry đường thật */
  posAt(meters) {
    const cum = this.cum;
    let lo = 0, hi = cum.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= meters) lo = mid; else hi = mid;
    }
    const seg = cum[hi] - cum[lo] || 1;
    const t = Math.max(0, Math.min(1, (meters - cum[lo]) / seg));
    const a = this.path[lo], b = this.path[hi];
    return {
      lngLat: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
      bearing: turf.bearing(a, b),
      idx: lo
    };
  },

  bearingAt(meters) { return this.posAt(meters).bearing; },

  updateMascot() {
    const map = Planner.map;
    const { lngLat, bearing } = this.posAt(this.travelled);

    // làm mượt hướng quay (tránh giật khi vào cua gắt)
    if (this.currentBearing == null) this.currentBearing = bearing;
    let diff = ((bearing - this.currentBearing + 540) % 360) - 180;
    this.currentBearing += diff * 0.16;
    this.currentPos = lngLat;

    if (this.mascotMarker) {
      this.mascotMarker.setLngLat(lngLat);
      this.mascotMarker.setRotation(this.currentBearing);
    }

    /* ---------- CAMERA TRACKING: bám sau linh vật ---------- */
    // đặt camera lùi lại phía sau ~70 m theo hướng đi
    const behind = turf.destination(
      turf.point(lngLat), 0.055, this.currentBearing + 180, { units: 'kilometers' }
    ).geometry.coordinates;

    map.jumpTo({
      center: behind,
      bearing: this.currentBearing,
      pitch: CONFIG.PITCH_3D,
      zoom: CONFIG.ZOOM_3D
    });
  },

  updateHud() {
    const pct = (this.travelled / this.totalM) * 100;
    document.getElementById('play-bar-fill').style.width = pct.toFixed(1) + '%';
    const nx = this.stopAt[this.nextStop];
    document.getElementById('play-leg').innerHTML = nx
      ? `Đang tới <b>${escapeHtml(shorten(nx.place.diaDiem, 28))}</b> — ` +
        `còn ${((nx.dist - this.travelled) / 1000).toFixed(1)} km`
      : 'Sắp về đích rồi! 🏁';
  },

  /* --------------------------------- dừng lại & hiện popup tên địa điểm */
  arrive(stop) {
    const map = Planner.map;
    this.arrivePopup?.remove();
    this.arrivePopup = new GL.Popup({
      offset: 34, closeButton: false, closeOnClick: false, className: 'arrive-popup'
    })
      .setLngLat([stop.place.lng, stop.place.lat])
      .setHTML(`<div class="arrive-card">📍 ${escapeHtml(stop.place.diaDiem)}
          <small>Điểm ${stop.index + 1} • ${escapeHtml(stop.place.khungGio || 'giờ linh hoạt')}</small>
        </div>`)
      .addTo(map);

    const m = Planner.markers.get(stop.place.id);
    if (m) { m.el.classList.add('pulse'); setTimeout(() => m.el.classList.remove('pulse'), 2500); }

    Mascot.say(t('play.arrive', { name: escapeHtml(shorten(stop.place.diaDiem, 24)), s: CONFIG.STOP_SECONDS }));
    setTimeout(() => this.arrivePopup?.remove(), CONFIG.STOP_SECONDS * 1000 - 200);
  },

  finish() {
    document.getElementById('play-leg').innerHTML = '🏁 Hoàn thành lịch trình! Tuyệt vời ⭐';
    document.getElementById('play-bar-fill').style.width = '100%';
    Mascot.say(t('play.finish'));
    cancelAnimationFrame(this.rafId);
    setTimeout(() => { if (this.active) this.stop(); }, 3200);
  },

  /* ==================================================================
     THOÁT 3D → TRẢ VỀ 2D THUẦN
     ================================================================== */
  stop() {
    if (!this.active) return;
    this.active = false;
    cancelAnimationFrame(this.rafId);

    const map = Planner.map;

    this.mascotMarker?.remove(); this.mascotMarker = null;
    this.arrivePopup?.remove(); this.arrivePopup = null;
    if (this.threeLayer && map.getLayer('mascot-3d')) map.removeLayer('mascot-3d');
    this.threeLayer = null;
    this.currentBearing = null;

    setBuildings3D(map, false);

    // Hiện lại toàn bộ marker khi về 2D
    document.body.classList.remove('hide-others-3d');
    Planner.markers.forEach(({ el }) => el.classList.remove('off-route'));

    document.getElementById('btn-play3d').classList.remove('hidden');
    document.getElementById('btn-exit3d').classList.add('hidden');
    document.getElementById('play-hud').classList.add('hidden');
    document.getElementById('brand-sub').textContent = t('app.subtitle');

    // ⚠️ QUAN TRỌNG: trả bản đồ về 2D thuần
    map.easeTo({ pitch: CONFIG.PITCH_2D, bearing: 0, duration: 1400, essential: true });
    setTimeout(() => Routing.fitRoute(), 300);

    Mascot.say(t('mascot.back2d'));
  },

  togglePause() {
    this.paused = !this.paused;
    document.getElementById('btn-pause').textContent = this.paused ? '▶' : '⏸';
    if (!this.paused) this.lastTs = performance.now();
  },

  /* ---------------- TỐC ĐỘ: 2 chế độ ----------------
     - 'cinema': tua nhanh theo bội số, tới 20x (mặc định, để quay màn hình)
     - 'real'  : chạy đúng vận tốc thật km/h, thời gian = thời gian đi thật  */
  speedMode: 'cinema',
  CINEMA_STEPS: [1, 2, 5, 10, 20],
  REAL_STEPS: [30, 60, 80],
  realKmh: 30,

  /* Vận tốc hiện hành (m/s) — loop() gọi hàm này */
  currentMps() {
    return this.speedMode === 'real'
      ? this.realKmh / 3.6
      : (CONFIG.PLAY_SPEED_KMH * this.speedMul) / 3.6;
  },

  speedLabel() {
    return this.speedMode === 'real'
      ? '🛵 ' + this.realKmh + ' km/h'
      : '⏩ ' + this.speedMul + 'x';
  },

  syncSpeedUI() {
    const b = document.getElementById('btn-speed');
    if (b) b.textContent = this.speedLabel();
    const m = document.getElementById('btn-speedmode');
    if (m) m.textContent = this.speedMode === 'real' ? t('play.mode.real') : t('play.mode.cinema');
  },

  cycleSpeed() {
    if (this.speedMode === 'real') {
      const st = this.REAL_STEPS;
      this.realKmh = st[(st.indexOf(this.realKmh) + 1) % st.length];
    } else {
      const st = this.CINEMA_STEPS;
      this.speedMul = st[(st.indexOf(this.speedMul) + 1) % st.length];
    }
    this.syncSpeedUI();
  },

  /* Đổi qua lại giữa tua nhanh và vận tốc thật */
  toggleSpeedMode() {
    this.speedMode = this.speedMode === 'real' ? 'cinema' : 'real';
    this.syncSpeedUI();
    Mascot.say(this.speedMode === 'real'
      ? t('mascot.speedreal', { kmh: this.realKmh })
      : t('mascot.speedcinema', { x: this.speedMul }));
  }
};
