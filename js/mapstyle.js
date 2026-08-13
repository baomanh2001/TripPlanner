/* =====================================================================
   mapstyle.js — CUSTOM MAP STYLE PHONG CÁCH ANIME / KAWAII
   ---------------------------------------------------------------------
   Bảng màu:
     • Nền đất       : hồng pastel  #ffeaf3 → #ffdcec
     • Công viên/cây : xanh mint pastel #d7f5e6
     • Đường giao thông: trắng #ffffff, viền tím nhạt #d9c8ff
     • Sông/hồ/biển  : hồng đậm nhẹ #ff9dc4
     • Nhà cửa       : hồng phấn #ffd9e8
   Style tuân theo spec MapLibre/Mapbox Style Spec v8, dùng vector tile
   OpenFreeMap (schema OpenMapTiles) → không cần API key.
   ===================================================================== */

const ANIME_COLORS = {
  land:        '#ffeaf3',
  landAlt:     '#ffe0ee',
  green:       '#d9f6e8',
  greenDark:   '#c2eeda',
  sand:        '#fff2e0',
  water:       '#ff9dc4',
  waterDeep:   '#f57fb0',
  waterLine:   '#ffc4dd',
  building:    '#ffd9e8',
  buildingLine:'#f7b9d3',
  roadMajor:   '#ffffff',
  roadMinor:   '#fffaFD',
  roadCase:    '#dcc9ff',
  roadCaseBig: '#c9b0ff',
  rail:        '#c9b6ff',
  boundary:    '#e3a9c8',
  label:       '#8c3f68',
  labelHalo:   '#ffffff',
  waterLabel:  '#b33f79'
};

function buildAnimeStyle() {
  const C = ANIME_COLORS;
  return {
    version: 8,
    name: 'Dalat Anime Kawaii',
    glyphs: CONFIG.GLYPHS,
    sources: {
      openmaptiles: { type: 'vector', url: CONFIG.VECTOR_TILES }
    },
    layers: [

      /* ---------- NỀN ĐẤT HỒNG PASTEL ---------- */
      { id: 'background', type: 'background',
        paint: { 'background-color': C.land } },

      { id: 'landcover-sand', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
        filter: ['==', ['get', 'class'], 'sand'],
        paint: { 'fill-color': C.sand, 'fill-opacity': 0.75 } },

      { id: 'landcover-green', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'scrub', 'forest']]],
        paint: { 'fill-color': C.green, 'fill-opacity': 0.85 } },

      { id: 'landuse-residential', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood']]],
        paint: { 'fill-color': C.landAlt, 'fill-opacity': 0.85 } },

      { id: 'landuse-park', type: 'fill', source: 'openmaptiles', 'source-layer': 'park',
        paint: { 'fill-color': C.greenDark, 'fill-opacity': 0.6 } },

      /* ---------- SÔNG HỒ HỒNG ĐẬM NHẸ ---------- */
      { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water',
        paint: {
          'fill-color': ['interpolate', ['linear'], ['zoom'], 6, C.waterDeep, 12, C.water],
          'fill-opacity': 0.92
        } },

      { id: 'waterway', type: 'line', source: 'openmaptiles', 'source-layer': 'waterway',
        paint: {
          'line-color': C.water,
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.7, 16, 4]
        } },

      /* ---------- NHÀ CỬA HỒNG PHẤN ---------- */
      { id: 'building', type: 'fill', source: 'openmaptiles', 'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-color': C.building,
          'fill-outline-color': C.buildingLine,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, 0.9]
        } },

      /* Khối 3D — CHỈ hiện khi pitch > 0 (chế độ Play 3D bật layer này) */
      { id: 'building-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building',
        minzoom: 14, layout: { visibility: 'none' },
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'render_height'],
            0, '#ffe3ef', 20, '#ffcfe3', 60, '#e9c4ff'],
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.85
        } },

      /* ---------- ĐƯỜNG GIAO THÔNG: viền tím nhạt + lõi trắng ---------- */
      // Casing (viền)
      { id: 'road-minor-case', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        minzoom: 12,
        filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track', 'path']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': C.roadCase,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.4, 16, 6, 20, 20]
        } },

      { id: 'road-secondary-case', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['secondary', 'tertiary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': C.roadCase,
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.6, 13, 6, 18, 24]
        } },

      { id: 'road-primary-case', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': C.roadCaseBig,
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 2, 13, 9, 18, 32]
        } },

      // Fill (lõi trắng / tím rất nhạt)
      { id: 'road-minor', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        minzoom: 12,
        filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track', 'path']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': C.roadMinor,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.6, 16, 3.6, 20, 15]
        } },

      { id: 'road-secondary', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['secondary', 'tertiary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': C.roadMajor,
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.8, 13, 3.8, 18, 18]
        } },

      { id: 'road-primary', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': C.roadMajor,
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 13, 6, 18, 24]
        } },

      { id: 'rail', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'rail'], minzoom: 11,
        paint: {
          'line-color': C.rail,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 18, 3],
          'line-dasharray': [3, 2]
        } },

      /* ---------- RANH GIỚI ---------- */
      { id: 'boundary', type: 'line', source: 'openmaptiles', 'source-layer': 'boundary',
        filter: ['<=', ['get', 'admin_level'], 6],
        paint: { 'line-color': C.boundary, 'line-width': 1.1, 'line-dasharray': [4, 3], 'line-opacity': 0.65 } },

      /* ---------- NHÃN CHỮ ---------- */
      { id: 'label-water', type: 'symbol', source: 'openmaptiles', 'source-layer': 'water_name',
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']],
          'text-font': ['Noto Sans Italic'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 16, 14]
        },
        paint: { 'text-color': C.waterLabel, 'text-halo-color': C.labelHalo, 'text-halo-width': 1.6 } },

      { id: 'label-road', type: 'symbol', source: 'openmaptiles', 'source-layer': 'transportation_name',
        minzoom: 14,
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'symbol-placement': 'line',
          'text-size': 10.5
        },
        paint: { 'text-color': '#a05b83', 'text-halo-color': C.labelHalo, 'text-halo-width': 1.8 } },

      { id: 'label-place', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'village', 'suburb', 'neighbourhood']]],
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'],
            8, ['case', ['==', ['get', 'class'], 'city'], 15, 11],
            14, ['case', ['==', ['get', 'class'], 'city'], 22, 14]],
          'text-transform': 'none'
        },
        paint: { 'text-color': C.label, 'text-halo-color': C.labelHalo, 'text-halo-width': 2.2 } }
    ]
  };
}

/* Bật/tắt khối nhà 3D — dùng khi vào/thoát Play Route 3D */
function setBuildings3D(map, on) {
  if (map.getLayer('building-3d')) {
    map.setLayoutProperty('building-3d', 'visibility', on ? 'visible' : 'none');
  }
}
