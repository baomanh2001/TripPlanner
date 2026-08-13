<div align="center">

# 🌸 Đà Lạt Anime Travel Map

**An anime/kawaii-styled RPG trip planner on a real map — 100% static, no backend.**
**Ứng dụng lập kế hoạch du lịch phong cách anime/kawaii trên bản đồ thật — tĩnh hoàn toàn, không cần backend.**

Plan your trip by dragging places into days & time slots, get **real road routing**,
then watch a chibi mascot drive the route in **3D cinematic mode**.

Kéo thả địa điểm vào từng ngày & buổi, tính **tuyến đường thật trên đường bộ**,
rồi xem linh vật chibi chạy dọc tuyến ở **chế độ 3D điện ảnh**.

![Static](https://img.shields.io/badge/type-static%20site-ff8cbd)
![No backend](https://img.shields.io/badge/backend-none-a78bfa)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-ff6fa5)
![i18n](https://img.shields.io/badge/UI-EN%20%7C%20VI-ffb3d1)
![License](https://img.shields.io/badge/license-MIT-9be7c4)

</div>

---

## 🇬🇧 English

### ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Kawaii map** | Custom pastel-pink MapLibre style, always starts in pure 2D (pitch 0°) |
| 📗 **Excel-driven** | Drop in your own `.xlsx` — parsed in-browser with SheetJS, nothing is uploaded |
| 🍡 **Chibi markers** | Icons auto-picked per category (coffee, noodles, waterfall, hotel…) |
| 🎴 **RPG popup cards** | Rating, pros ✨ / cons ⚠️, best hours, cost, duration — collapsible so it never hides the map |
| 📅 **Flexible itinerary** | Drag & drop into Day × Morning/Afternoon/Evening. **Add or remove days freely (1–14)** |
| 🛣️ **Real road routing** | OSRM road geometry — never straight lines. Real km & minutes, warns on long legs |
| 🎬 **Play Route 3D** | Camera tilts to 55°, mascot follows the *actual* route, pauses at each stop |
| ⏩ **Two speed modes** | Cinematic `1x → 20x`, or realistic `30 / 60 / 80 km/h` |
| 📹 **Recording mode** | Hide both sidebars + HUD for clean screen recordings |
| 🖼️ **Export PNG** | Exports only your planned stops, with auto-arranged non-overlapping labels |
| 🐰 **Mascot companion** | A chibi assistant that reacts to what you do |

### 🚀 Quick start

No build step, no `npm install`. It's plain HTML/CSS/JS.

```bash
git clone https://github.com/<your-username>/dalat-anime-map.git
cd dalat-anime-map

# Pick any static server — you cannot just double-click index.html
python3 -m http.server 8080
#   or: npx serve .
#   or: php -S localhost:8080
```

Then open **<http://localhost:8080>**.

> ⚠️ **Why a server is required**
> The app `fetch()`es `data/places.json`. Opening the file directly (`file://`)
> is blocked by the browser's CORS policy and the map will stay empty.

### 🌐 Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Source: `Deploy from a branch`**, branch `main`, folder `/ (root)`.
3. Wait ~1 minute → your site is at `https://<username>.github.io/<repo>/`.

A `.nojekyll` file is already included so Jekyll won't strip anything.

### 📊 Use your own Excel file

The app expects **14 columns** (Vietnamese headers, kept as-is for compatibility):

| # | Column | Required | Notes |
|---|---|---|---|
| 1 | `STT` | – | Index, auto-numbered if empty |
| 2 | `Nhóm` | – | Category → picks the chibi icon |
| 3 | `Khu vực/cung` | – | Area → feeds the Area filter |
| 4 | `Địa điểm` | ✅ | **Place name. Rows without it are skipped** |
| 5 | `Điểm Google` | – | Rating, e.g. `4.6` |
| 6 | `Lượt đánh giá` | – | Review count — accepts `2.1K`, `1,234` |
| 7 | `Ưu điểm lặp lại trong review Google` | – | Pros → green card |
| 8 | `Nhược điểm/cảnh báo lặp lại trong review Google` | – | Cons → orange card |
| 9 | `Khung giờ đẹp` | – | Best hours, e.g. `07:00-09:00` |
| 10 | `Thời lượng tham quan` | – | Visit duration |
| 11 | `Mức chi phí` | – | Cost: `Thấp` / `Trung bình` / `Cao` |
| 12 | `Google Maps` | – | Link — coords can be extracted from it |
| 13 | `Lat` | ⭐ | Latitude, e.g. `11.9412` |
| 14 | `Lng` | ⭐ | Longitude, e.g. `108.4378` |

📄 **A ready-to-edit template lives at [`data/mau-nhap-lieu.xlsx`](data/mau-nhap-lieu.xlsx)** —
correct headers, 5 filled example rows, and a bilingual tooltip on every header cell.

**Two ways to load it:**

**A. Temporary** — click **📗 Nạp Excel** and pick your file. Parsed locally in your
browser; nothing leaves your machine. Refreshing resets to the bundled dataset.

**B. Permanent** (what you want for your own GitHub Pages site):
1. Replace `data/dia-diem-da-lat.xlsx` with your file.
2. **Delete `data/places.json`** — the app prefers that cache and would ignore your Excel otherwise.
3. Reload.

**What the parser handles for you**
- Header matching ignores spacing/casing; accepts both `Thời lượng` and `Thời lượng tham quan`
- Missing `Lat`/`Lng` → tries to extract coords from the `Google Maps` link (`@11.94,108.43` or `?q=…`)
- Review counts like `2.1K` → `2100`
- Filter dropdowns regenerate from your data
- Empty columns are simply hidden in the popup — no ugly `—` placeholders
- Places with no coordinates stay in the list, get no pin, and are reported in a toast


### 🌍 Bilingual UI (EN / VI)

The whole interface ships in **English by default**. Click the **🇻🇳 VI / 🇬🇧 EN**
button in the top bar to switch instantly — no reload needed. Your choice is
remembered in `localStorage`.

Everything is translated: buttons, filters, day tabs, RPG popup cards, toasts,
route warnings, mascot dialogue, the export overlay, and even CSS-generated text.

**Adding another language** — open `js/i18n.js`, copy the `en` block, translate
the values, and register it:

```js
const I18N = {
  en: { … },
  vi: { … },
  ja: { 'btn.route': 'ルートを作成', … }   // ← your new language
};
```

Then extend the toggle in `setLang()`. Keys fall back to English when missing,
so a partial translation still works.

### ⌨️ Keyboard shortcuts

| Key | Action |
|---|---|
| `C` | Toggle recording mode (hide sidebars + topbar) |
| `H` | Toggle HUD panels |
| `Esc` | Exit recording mode → otherwise exit 3D |
| `Space` | Pause / resume the 3D playback |
| `P` | Start Play Route 3D |
| `E` | Export the travel map PNG |

### 🧩 Tech stack

Everything is loaded from a CDN — there is no bundler and no dependency install.

| Library | Purpose |
|---|---|
| [MapLibre GL JS](https://maplibre.org/) `4.7.1` | Map rendering (free, no API key) |
| [OpenFreeMap](https://openfreemap.org/) | Vector tiles (free, no API key) |
| [OSRM](http://project-osrm.org/) demo server | Real road routing |
| [SheetJS](https://sheetjs.com/) `0.18.5` | Reads `.xlsx` in the browser |
| [SortableJS](https://sortablejs.github.io/Sortable/) `1.15.2` | Drag & drop itinerary |
| [Three.js](https://threejs.org/) `0.128.0` | 3D mascot layer |
| [Turf.js](https://turfjs.org/) `6.5.0` | Geo maths |
| [html2canvas](https://html2canvas.hertzen.com/) `1.4.1` | PNG export |

> **No API keys needed.** MapLibre + OpenFreeMap + OSRM are all key-free, which is why
> this fork uses them instead of Mapbox.

### 📁 Project structure

```
dalat-anime-map/
├── index.html              # Layout & CDN imports
├── css/style.css           # All styling (kawaii theme, RPG cards, HUD)
├── js/
│   ├── i18n.js             # 🌍 EN/VI dictionary + language switching
│   ├── config.js           # ⚙️ Tunables: center, zoom, speeds, column names
│   ├── mapstyle.js         # Pastel map style + 3D buildings layer
│   ├── data.js             # Excel/JSON parsing & normalisation
│   ├── planner.js          # Place list, markers, popups, itinerary, days
│   ├── routing.js          # OSRM calls, route drawing, distance warnings
│   ├── play3d.js           # 3D cinematic playback + mascot movement
│   ├── mascot.js           # Companion dialogue
│   ├── exporter.js         # PNG export + label de-collision, JSON save
│   └── app.js              # Bootstrap & global UI wiring
├── data/
│   ├── dia-diem-da-lat.xlsx    # Dataset: 93 Đà Lạt places (14 columns)
│   ├── mau-nhap-lieu.xlsx      # 📄 Blank-ish template to fill in
│   └── places.json             # Pre-parsed cache (delete to force Excel)
├── assets/icons/           # Chibi PNGs + mascot SVGs
└── .nojekyll               # Required for GitHub Pages
```

### ⚙️ Common tweaks

All in **`js/config.js`**:

```js
CENTER: [108.4419, 11.9404],   // Map centre [lng, lat]
ZOOM: 12.6,
PITCH_3D: 55,                  // 3D camera tilt
PLAY_SPEED_KMH: 260,           // Base cinematic speed (× the multiplier)
WARN_DISTANCE_KM: 10,          // Warn when a leg is longer than this
STOP_SECONDS: 2.5,             // Pause at each stop during playback
DAYS: [1, 2, 3],               // Default number of days (adjustable in the UI)
```

**Using this for a different city?** Change `CENTER`, swap the Excel file, and
delete `places.json`. Nothing else is hard-coded to Đà Lạt.

### 📌 Data accuracy note

The bundled 93-place dataset was compiled from public Google review summaries.
Coordinates were resolved in four tiers:

| Tier | Count | Accuracy |
|---|---|---|
| `verified` | 36 | Exact, manually confirmed |
| `osm` | 12 | Exact, matched to OpenStreetMap POIs |
| `street` | 31 | Approximate — street-level |
| `area` | 12 | Approximate — area centroid |
| `fallback` | 2 | Approximate — district centre |

**48 / 93 (52 %) are exact.** Approximate ones show a small dot badge on the pin and a
warning inside the popup. To fix any of them, edit `Lat`/`Lng` in the XLSX and delete
`places.json`.

### 🙏 Credits & license

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors ·
Tiles by [OpenFreeMap](https://openfreemap.org/) · Routing by [OSRM](http://project-osrm.org/).
Place reviews summarised from public Google Maps data.

Released under the **MIT License** — free to use, modify and share.

---
---

## 🇻🇳 Tiếng Việt

### ✨ Tính năng

| Tính năng | Mô tả |
|---|---|
| 🗺️ **Bản đồ kawaii** | Style hồng pastel tự chế cho MapLibre, luôn khởi động ở **2D thuần (pitch 0°)** |
| 📗 **Chạy bằng Excel** | Nạp file `.xlsx` của bạn — đọc ngay trong trình duyệt bằng SheetJS, không upload đi đâu |
| 🍡 **Marker chibi** | Icon tự chọn theo nhóm (cà phê, bún phở, thác, khách sạn…) |
| 🎴 **Popup thẻ RPG** | Điểm sao, ưu ✨ / nhược ⚠️, khung giờ đẹp, chi phí, thời lượng — thu gọn được nên không che bản đồ |
| 📅 **Lịch trình linh hoạt** | Kéo thả vào Ngày × Sáng/Chiều/Tối. **Thêm hoặc bớt ngày thoải mái (1–14 ngày)** |
| 🛣️ **Tuyến đường thật** | Dùng OSRM lấy hình học đường bộ — không bao giờ vẽ đường thẳng. Km và phút thật, cảnh báo chặng quá dài |
| 🎬 **Play Route 3D** | Camera nghiêng 55°, linh vật chạy theo *đúng* tuyến đường, dừng lại ở từng điểm |
| ⏩ **Hai chế độ tốc độ** | Điện ảnh `1x → 20x`, hoặc thực tế `30 / 60 / 80 km/h` |
| 📹 **Chế độ quay màn hình** | Ẩn 2 sidebar + HUD để quay video cho sạch |
| 🖼️ **Xuất ảnh PNG** | Chỉ xuất các điểm trong lịch trình, nhãn tự dàn không đè lên nhau |
| 🐰 **Linh vật đồng hành** | Trợ lý chibi trò chuyện theo thao tác của bạn |

### 🚀 Chạy thử

Không cần build, không cần `npm install`. Chỉ là HTML/CSS/JS thuần.

```bash
git clone https://github.com/<tên-của-bạn>/dalat-anime-map.git
cd dalat-anime-map

# Chọn một server tĩnh bất kỳ — KHÔNG mở trực tiếp index.html được
python3 -m http.server 8080
#   hoặc: npx serve .
#   hoặc: php -S localhost:8080
```

Rồi mở **<http://localhost:8080>**.

> ⚠️ **Vì sao bắt buộc phải chạy qua server?**
> App dùng `fetch()` để đọc `data/places.json`. Mở thẳng file (`file://`) sẽ bị
> trình duyệt chặn vì CORS, và bản đồ sẽ trống trơn.

### 🌐 Đưa lên GitHub Pages

1. Push thư mục này lên một repository GitHub.
2. Vào **Settings → Pages → Source: `Deploy from a branch`**, chọn nhánh `main`, thư mục `/ (root)`.
3. Đợi khoảng 1 phút → web của bạn ở `https://<tên-của-bạn>.github.io/<tên-repo>/`.

File `.nojekyll` đã có sẵn để Jekyll không xoá mất file nào.

### 📊 Dùng file Excel của riêng bạn

App cần đúng **14 cột** sau:

| # | Cột | Bắt buộc | Ghi chú |
|---|---|---|---|
| 1 | `STT` | – | Số thứ tự, bỏ trống thì app tự đánh |
| 2 | `Nhóm` | – | Quyết định icon chibi |
| 3 | `Khu vực/cung` | – | Dùng cho bộ lọc Khu vực |
| 4 | `Địa điểm` | ✅ | **Tên địa điểm. Dòng thiếu ô này bị bỏ qua** |
| 5 | `Điểm Google` | – | Điểm sao, VD `4.6` |
| 6 | `Lượt đánh giá` | – | Hiểu cả `2.1K`, `1,234` |
| 7 | `Ưu điểm lặp lại trong review Google` | – | Hiện ở thẻ xanh |
| 8 | `Nhược điểm/cảnh báo lặp lại trong review Google` | – | Hiện ở thẻ cam |
| 9 | `Khung giờ đẹp` | – | VD `07:00-09:00` |
| 10 | `Thời lượng tham quan` | – | VD `1-2 giờ` |
| 11 | `Mức chi phí` | – | `Thấp` / `Trung bình` / `Cao` |
| 12 | `Google Maps` | – | Link — app có thể tách toạ độ từ đây |
| 13 | `Lat` | ⭐ | Vĩ độ, VD `11.9412` |
| 14 | `Lng` | ⭐ | Kinh độ, VD `108.4378` |

📄 **File mẫu điền sẵn ở [`data/mau-nhap-lieu.xlsx`](data/mau-nhap-lieu.xlsx)** —
đúng 14 cột, 5 dòng ví dụ, và mỗi ô tiêu đề đều có chú thích song ngữ (rê chuột vào để xem).

**Hai cách nạp:**

**A. Nạp tạm** — bấm **📗 Nạp Excel** rồi chọn file. Đọc ngay trong máy bạn,
không gửi lên mạng. Tải lại trang thì quay về bộ dữ liệu mặc định.

**B. Thay hẳn dữ liệu mặc định** (dùng khi bạn muốn web của mình mở lên là có sẵn):
1. Thay `data/dia-diem-da-lat.xlsx` bằng file của bạn.
2. **Xoá `data/places.json`** — app ưu tiên đọc file cache này trước, còn nó thì sẽ bỏ qua Excel.
3. Tải lại trang.

**App tự xử lý giúp bạn**
- Dò tên cột bỏ qua khác biệt dấu cách/hoa thường; nhận cả `Thời lượng` lẫn `Thời lượng tham quan`
- Thiếu `Lat`/`Lng` → thử tách toạ độ từ link `Google Maps` (dạng `@11.94,108.43` hoặc `?q=…`)
- Hiểu lượt đánh giá kiểu `2.1K` → `2100`
- Danh sách bộ lọc tự sinh lại theo dữ liệu mới
- Cột bỏ trống thì popup tự ẩn mục đó, không hiện `—` trống trơn
- Điểm thiếu toạ độ vẫn nằm trong danh sách, không vẽ pin, và app báo số lượng


### 🌍 Giao diện song ngữ (EN / VI)

Toàn bộ giao diện **mặc định là tiếng Anh**. Bấm nút **🇻🇳 VI / 🇬🇧 EN** trên
thanh trên cùng để đổi ngay lập tức — không cần tải lại trang. Lựa chọn được
nhớ trong `localStorage` nên lần sau vào là đúng ngôn ngữ bạn đã chọn.

Mọi thứ đều được dịch: nút bấm, bộ lọc, tab ngày, thẻ RPG, thông báo, cảnh báo
tuyến đường, lời thoại linh vật, lớp phủ khi xuất ảnh, kể cả chữ sinh từ CSS.

**Thêm ngôn ngữ khác** — mở `js/i18n.js`, copy khối `en`, dịch phần giá trị rồi
khai báo thêm:

```js
const I18N = {
  en: { … },
  vi: { … },
  ja: { 'btn.route': 'ルートを作成', … }   // ← ngôn ngữ mới của bạn
};
```

Sau đó mở rộng nút đổi trong `setLang()`. Khoá nào thiếu sẽ tự lùi về tiếng Anh,
nên dịch dở dang vẫn chạy được.

### ⌨️ Phím tắt

| Phím | Chức năng |
|---|---|
| `C` | Bật/tắt chế độ quay màn hình (ẩn sidebar + topbar) |
| `H` | Ẩn/hiện các bảng HUD |
| `Esc` | Thoát chế độ quay → nếu không thì thoát 3D |
| `Space` | Tạm dừng / tiếp tục khi đang chạy 3D |
| `P` | Bắt đầu Play Route 3D |
| `E` | Xuất ảnh Travel Map |

### 🧩 Công nghệ

Tất cả nạp từ CDN — không có bundler, không cần cài dependency.

| Thư viện | Vai trò |
|---|---|
| [MapLibre GL JS](https://maplibre.org/) `4.7.1` | Vẽ bản đồ (miễn phí, không cần API key) |
| [OpenFreeMap](https://openfreemap.org/) | Vector tiles (miễn phí, không cần key) |
| [OSRM](http://project-osrm.org/) demo | Tính tuyến đường thật |
| [SheetJS](https://sheetjs.com/) `0.18.5` | Đọc `.xlsx` ngay trong trình duyệt |
| [SortableJS](https://sortablejs.github.io/Sortable/) `1.15.2` | Kéo thả lịch trình |
| [Three.js](https://threejs.org/) `0.128.0` | Lớp linh vật 3D |
| [Turf.js](https://turfjs.org/) `6.5.0` | Tính toán không gian |
| [html2canvas](https://html2canvas.hertzen.com/) `1.4.1` | Xuất ảnh PNG |

> **Không cần API key nào cả.** MapLibre + OpenFreeMap + OSRM đều miễn phí và
> không yêu cầu key — đó là lý do bản này dùng chúng thay cho Mapbox.

### 📁 Cấu trúc thư mục

```
dalat-anime-map/
├── index.html              # Bố cục & khai báo CDN
├── css/style.css           # Toàn bộ giao diện (theme kawaii, thẻ RPG, HUD)
├── js/
│   ├── i18n.js             # 🌍 Từ điển EN/VI + chuyển ngôn ngữ
│   ├── config.js           # ⚙️ Chỗ chỉnh: tâm bản đồ, zoom, tốc độ, tên cột
│   ├── mapstyle.js         # Style pastel + lớp nhà 3D
│   ├── data.js             # Đọc & chuẩn hoá Excel/JSON
│   ├── planner.js          # Danh sách, marker, popup, lịch trình, số ngày
│   ├── routing.js          # Gọi OSRM, vẽ tuyến, cảnh báo khoảng cách
│   ├── play3d.js           # Chạy 3D điện ảnh + di chuyển linh vật
│   ├── mascot.js           # Lời thoại linh vật
│   ├── exporter.js         # Xuất PNG + dàn nhãn chống đè, lưu JSON
│   └── app.js              # Khởi động & nối các nút bấm
├── data/
│   ├── dia-diem-da-lat.xlsx    # Dữ liệu 93 địa điểm Đà Lạt (14 cột)
│   ├── mau-nhap-lieu.xlsx      # 📄 File mẫu để bạn tự điền
│   └── places.json             # Cache đã parse sẵn (xoá đi để buộc đọc Excel)
├── assets/icons/           # Ảnh chibi + SVG linh vật
└── .nojekyll               # Bắt buộc cho GitHub Pages
```

### ⚙️ Những chỗ hay chỉnh

Đều nằm trong **`js/config.js`**:

```js
CENTER: [108.4419, 11.9404],   // Tâm bản đồ [kinh độ, vĩ độ]
ZOOM: 12.6,
PITCH_3D: 55,                  // Độ nghiêng camera khi vào 3D
PLAY_SPEED_KMH: 260,           // Tốc độ nền chế độ điện ảnh (nhân với bội số)
WARN_DISTANCE_KM: 10,          // Cảnh báo khi một chặng dài hơn mức này
STOP_SECONDS: 2.5,             // Thời gian dừng ở mỗi điểm khi chạy 3D
DAYS: [1, 2, 3],               // Số ngày mặc định (chỉnh được ngay trên giao diện)
```

**Muốn dùng cho thành phố khác?** Đổi `CENTER`, thay file Excel, và xoá `places.json`.
Không có gì khác bị hard-code riêng cho Đà Lạt.

### 📌 Lưu ý về độ chính xác dữ liệu

Bộ 93 địa điểm kèm theo được tổng hợp từ review Google công khai.
Toạ độ được xác định theo 4 tầng:

| Nguồn | Số lượng | Độ chính xác |
|---|---|---|
| `verified` | 36 | Chính xác, đã kiểm tra tay |
| `osm` | 12 | Chính xác, khớp POI OpenStreetMap |
| `street` | 31 | Ước lượng — cấp con đường |
| `area` | 12 | Ước lượng — tâm khu vực |
| `fallback` | 2 | Ước lượng — tâm quận/huyện |

**48/93 điểm (52 %) là chính xác.** Điểm ước lượng có chấm nhỏ trên pin và một
dòng cảnh báo trong popup. Muốn sửa, chỉ cần chỉnh `Lat`/`Lng` trong file XLSX
rồi xoá `places.json`.

### 🙏 Ghi công & giấy phép

Dữ liệu bản đồ © [OpenStreetMap](https://www.openstreetmap.org/copyright) ·
Tiles bởi [OpenFreeMap](https://openfreemap.org/) · Định tuyến bởi [OSRM](http://project-osrm.org/).
Nội dung review tổng hợp từ dữ liệu Google Maps công khai.

Phát hành theo **giấy phép MIT** — tự do dùng, sửa và chia sẻ.

<div align="center">

**Made with 💖 for the Vietnamese dev & travel community**

</div>
