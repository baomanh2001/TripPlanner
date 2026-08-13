/* =====================================================================
   config.js — Cấu hình toàn cục
   ---------------------------------------------------------------------
   ĐỔI Ở ĐÂY LÀ ĐỦ, không cần sửa file khác.
   ===================================================================== */

const CONFIG = {

  /* -----------------------------------------------------------------
     1. ENGINE BẢN ĐỒ
     - Mặc định 'maplibre'  : MIỄN PHÍ 100%, KHÔNG cần token, deploy
                              GitHub Pages là chạy ngay.
     - Đổi 'mapbox'         : dùng Mapbox GL JS. Khi đó phải:
                              (a) thay 2 thẻ CDN maplibre trong index.html
                                  bằng CDN mapbox-gl,
                              (b) điền MAPBOX_TOKEN bên dưới.
       => API hai thư viện gần như giống hệt nhau nên code không đổi.
  ----------------------------------------------------------------- */
  ENGINE: 'maplibre',
  MAPBOX_TOKEN: '',                 // pk.eyJ1Ijoi...

  /* -----------------------------------------------------------------
     2. NGUỒN TILE cho map style Anime
     OpenFreeMap: miễn phí, không cần key, dữ liệu OpenStreetMap.
  ----------------------------------------------------------------- */
  VECTOR_TILES: 'https://tiles.openfreemap.org/planet',
  GLYPHS: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',

  /* -----------------------------------------------------------------
     3. ROUTING — tuyến đường THỰC TẾ theo mạng lưới đường
     - 'osrm'   : máy chủ demo công cộng, miễn phí, không key (mặc định)
     - 'mapbox' : Mapbox Directions API (cần MAPBOX_TOKEN)
     - 'ors'    : OpenRouteService (cần ORS_KEY, free 2000 req/ngày)
  ----------------------------------------------------------------- */
  ROUTER: 'osrm',
  OSRM_URL: 'https://router.project-osrm.org',
  ORS_KEY: '',
  ORS_URL: 'https://api.openrouteservice.org/v2/directions',

  /* Máy chủ OSRM demo chỉ có profile ô tô → hệ số quy đổi thời gian
     cho đi bộ (~4.5 km/h) và xe đạp (~13 km/h) trên địa hình đồi Đà Lạt.
     Dùng Mapbox/ORS thì các hệ số này bị bỏ qua vì API trả đúng theo profile. */
  OSRM_TIME_FACTOR: { driving: 1, walking: 6.2, cycling: 2.4 },

  /* Hồ sơ di chuyển mặc định */
  PROFILE: 'driving',               // driving | walking | cycling

  /* Ánh xạ profile sang từng nhà cung cấp */
  PROFILE_MAP: {
    osrm:   { driving:'driving',            walking:'foot',            cycling:'bike' },
    mapbox: { driving:'driving',            walking:'walking',         cycling:'cycling' },
    ors:    { driving:'driving-car',        walking:'foot-walking',    cycling:'cycling-regular' }
  },

  /* -----------------------------------------------------------------
     4. CAMERA / BẢN ĐỒ
  ----------------------------------------------------------------- */
  CENTER: [108.4419, 11.9404],      // Hồ Xuân Hương, Đà Lạt
  ZOOM: 12.6,
  MIN_ZOOM: 9,
  MAX_ZOOM: 18,
  PITCH_2D: 0,                      // ⚠️ 2D THUẦN — mặc định luôn là 0
  PITCH_3D: 55,                     // pitch khi Play Route 3D
  ZOOM_3D: 16.2,

  /* -----------------------------------------------------------------
     5. NGƯỠNG CẢNH BÁO LỊCH TRÌNH
  ----------------------------------------------------------------- */
  WARN_DISTANCE_KM: 10,             // > 10 km giữa 2 điểm liên tiếp
  WARN_DURATION_MIN: 30,            // > 30 phút di chuyển
  HARD_DISTANCE_KM: 25,             // cảnh báo đỏ

  /* -----------------------------------------------------------------
     6. MÔ PHỎNG 3D
  ----------------------------------------------------------------- */
  PLAY_SPEED_KMH: 260,              // tốc độ "phim tua nhanh" của linh vật
  STOP_SECONDS: 2.5,                // dừng 2-3 giây tại mỗi địa điểm
  MODEL_URL: '',                    // ví dụ 'assets/models/mascot.glb' (tùy chọn)
  MODEL_SCALE: 12,

  /* -----------------------------------------------------------------
     7. DỮ LIỆU
  ----------------------------------------------------------------- */
  DEMO_JSON: 'data/places.json',
  DEMO_XLSX: 'data/dia-diem-da-lat.xlsx',

  /* Tên cột Excel — đúng theo file gốc */
  COLS: {
    stt:        'STT',
    nhom:       'Nhóm',
    khuVuc:     'Khu vực/cung',
    diaDiem:    'Địa điểm',
    diemGoogle: 'Điểm Google',
    luot:       'Lượt đánh giá',
    tinCay:     'Độ tin cậy dữ liệu',
    uuDiem:     'Ưu điểm lặp lại trong review Google',
    nhuocDiem:  'Nhược điểm/cảnh báo lặp lại trong review Google',
    khungGio:   'Khung giờ đẹp',
    thoiLuong:  'Thời lượng tham quan',
    chiPhi:     'Mức chi phí',
    phuHop:     'Phù hợp',
    khuyenNghi: 'Khuyến nghị 3N2Đ',
    gmap:       'Google Maps',
    nguon:      'Nguồn tổng hợp review',
    lat:        'Lat',
    lng:        'Lng'
  },

  /* Icon Chibi theo loại */
  ICONS: {
    cafe:'assets/icons/cafe.png',       grill:'assets/icons/grill.png',
    noodle:'assets/icons/noodle.png',   dessert:'assets/icons/dessert.png',
    gift:'assets/icons/gift.png',       stay:'assets/icons/stay.png',
    mountain:'assets/icons/mountain.png',camera:'assets/icons/camera.png',
    flower:'assets/icons/flower.png',   temple:'assets/icons/temple.png'
  },

  DAYS:  [1, 2, 3],
  SLOTS: ['Sáng', 'Chiều', 'Tối'],
  SLOT_COLOR: { 'Sáng':'#ffb020', 'Chiều':'#2fb98a', 'Tối':'#7c5cf0' },

  STORAGE_KEY: 'dalat-anime-map:v1'
};

/* Thư viện GL đang dùng — code phía dưới chỉ gọi qua biến GL này */
const GL = window.maplibregl || window.mapboxgl;
if (CONFIG.ENGINE === 'mapbox' && window.mapboxgl && CONFIG.MAPBOX_TOKEN) {
  window.mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;
}
