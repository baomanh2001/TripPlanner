/* ===================================================================
   i18n.js — Song ngữ EN / VI
   Mặc định: English. Người dùng bấm nút EN|VI để đổi, lựa chọn được
   nhớ trong localStorage nên lần sau vào là đúng ngôn ngữ đã chọn.

   Cách dùng:
     - HTML:  <span data-i18n="key">…</span>
              <input data-i18n-ph="key">        (placeholder)
              <button data-i18n-title="key">    (tooltip)
     - JS:    t('key')  hoặc  t('key', {n: 5})
   =================================================================== */

const I18N = {
  en: {
    /* ---------- Mascot lines (arrays) ---------- */
    'lines.hello': [
      'Hello traveller! I\'m <b>Mochi</b> 🐰 — your Đà Lạt guide!',
      'Ready to pack up for Đà Lạt? 🌸',
      'Click 🎁 <b>Sample Data</b> to unlock 93 places!'
    ],
    'lines.loaded': [
      'Treasure map loaded! Drag cards into your itinerary 🎒',
      'That\'s a lot of spots! Filter by <b>Recommendation A</b> to go faster 💡'
    ],
    'lines.idle': [
      'Try not to stack more than 4 places per slot — Đà Lạt gets busy on weekends 🚗',
      'Tip: grade <b>A</b> places are the most worth visiting in this dataset!',
      'Outdoor scenery in the morning, view cafés in the late afternoon 🌇',
      'Do read the ⚠️ Cons box — many spots get tour crowds after 8:30 am!',
      'You can drag and drop to reorder places within a day ✨',
      'Đà Lạt rain comes out of nowhere — keep a poncho handy ☔'
    ],
    'lines.empty': [
      'Your itinerary is completely empty 🥲 Drop a few places in!'
    ],

    'msg.asking': 'Asking the routing API for real roads… hang on! 🛵',
    'mascot.tip.a': 'This one is <b>really worth visiting</b> 💖',
    'mascot.tip.b': 'This one <b>depends on your taste</b> 🤔',
    'mascot.tip.cons': 'Do read the ⚠️ Cons box before you go!',
    'mascot.tip.hours': '<b>{name}</b>! Best hours: {hours} ⏰',
    'mascot.flexible': 'flexible',
    'play.start': 'Adventure time! Hold on tight 🛵💨',
    'play.arrive': 'Arrived at <b>{name}</b>! Resting {s}s 🌸',
    'play.finish': 'Trip complete! Hit 📸 Export to save the memory 💖',

    /* ---------- Boot ---------- */
    'boot.title': 'Travel Map',
    'boot.msg': 'Summoning the pastel pink map…',
    'boot.style': 'Mixing pastel pink colours for the map…',
    'boot.data': 'Summoning 93 Đà Lạt places…',
    'boot.ready': 'Ready!',

    /* ---------- Top bar ---------- */
    'app.subtitle': 'RPG Trip Planner • Easy Mode',
    'app.subtitle3d': 'RPG Trip Planner • 🎬 3D Cinematic Mode',
    'btn.excel': 'Import Excel',
    'btn.excel.title': 'Load your own .xlsx file',
    'btn.demo': 'Sample Data',
    'btn.demo.title': 'Use the built-in Đà Lạt dataset',
    'btn.play3d': 'Play Route 3D',
    'btn.play3d.title': 'Build the route first to enable 3D',
    'btn.exit3d': 'Exit 3D',
    'btn.cinema': 'Cinema Mode',
    'btn.cinema.title': 'Hide both sidebars for screen recording (key C)',
    'btn.export': 'Export Travel Map',
    'btn.help.title': 'Help',

    /* ---------- Left sidebar ---------- */
    'side.places': '🎒 Backpack — Places',
    'search.ph': '🔍 Search place names…',
    'filter.group': '🏷️ All groups',
    'filter.area': '📍 All areas',
    'filter.rec': '⭐ All recommendations',
    'filter.rec.a': 'A – Highly recommended',
    'filter.rec.b': 'B – Depends on taste',
    'filter.rec.c': 'C – Consider carefully',
    'filter.rec.d': 'D – Needs verification',
    'filter.cost': '💰 All costs',
    'cost.free': 'Free',
    'cost.low': 'Low',
    'cost.mid': 'Medium',
    'cost.high': 'High',
    'list.empty': 'No data yet. Click <b>🎁 Sample Data</b> or <b>📗 Import Excel</b>.',
    'list.nomatch': 'No places found 🥲<br>Try removing some filters!',

    /* ---------- Map controls ---------- */
    'map.fit': 'Fit all pins in view',
    'map.reset2d': 'Back to pure 2D (pitch 0°)',
    'map.labels': 'Toggle name labels',
    'hud.dist': 'Real road distance',
    'hud.time': 'Travel time',
    'profile.driving': '🏍️ Motorbike / Car',
    'profile.walking': '🚶 Walking',
    'profile.cycling': '🚲 Cycling',

    /* ---------- Play HUD ---------- */
    'play.starting': 'Departing…',
    'play.pause.title': 'Pause / resume',
    'play.speed.title': 'Change speed',
    'play.speedmode.title': 'Fast-forward (multiplier) ↔ real speed (km/h)',
    'play.mode.cinema': '🎬 Cinematic',
    'play.mode.real': '🛵 Realistic',
    'play.hudoff': '📹 Hide HUD',
    'play.hudon': '👁️ Show HUD',
    'play.hudoff.title': 'Hide panels for screen recording (key H)',
    'play.hideothers': '🙈 Hide others',
    'play.showall': '👁️ Show all',
    'play.hideothers.title': 'Hide/show places not in your itinerary',

    /* ---------- Right sidebar ---------- */
    'side.plan': '📅 Travel Journal',
    'plan.clear.title': 'Clear the whole itinerary',
    'plan.day': 'Day',
    'plan.all': 'All',
    'plan.dayminus': 'Remove one day',
    'plan.dayplus': 'Add one day',
    'plan.oneday': 'Day trip',
    'plan.nights': '{d} days {n} nights',
    'plan.morning': 'Morning',
    'plan.afternoon': 'Afternoon',
    'plan.evening': 'Evening',
    'plan.drophere': 'Drag places here ✨',
    'plan.count': '{n} places',
    'btn.route': '🛣️ Build real route',
    'btn.savejson': '💾 Save JSON',

    /* ---------- Popup card ---------- */
    'card.food': '🍜 Food & Drink',
    'card.travel': '🏞️ Sightseeing',
    'card.stay': '🏠 Accommodation',
    'card.other': '🎡 Other',
    'card.noreviews': 'no data',
    'card.trust': ' • Trust: ',
    'card.area': '📍 Area',
    'card.cost': '💰 Cost',
    'card.hours': '⏰ Best hours',
    'card.duration': '⏳ Duration',
    'card.suitable': '👥 Suitable for',
    'card.pros': '✨ PROS',
    'card.cons': '⚠️ CONS / WARNINGS',
    'card.quest': '🎯 3D2N RECOMMENDATION',
    'card.expand': '▾ Show pros / cons',
    'card.collapse': '▴ Collapse',
    'card.geowarn': '&nbsp;& coordinate warning',
    'card.add': '➕ Add to itinerary',
    'card.zoom': '🔍 Zoom in',
    'card.approx': 'Approximate coordinates',
    'card.geonote': '📍 Coordinates <b>estimated from {note}</b> — open the Maps link to verify.',
    'card.area.generic': 'the area',

    /* ---------- Toasts & messages ---------- */
    'msg.reading': '📗 Reading Excel file…',
    'msg.norows': 'No valid rows in that file 😢',
    'msg.loaded': 'Loaded {n} places ({c} with coordinates) ✅',
    'msg.nocoord': '{n} places have no coordinates — add <b>Lat</b> / <b>Lng</b> columns to your Excel.',
    'msg.readerr': 'Error reading file: ',
    'msg.demofail': 'Could not load sample data 😢 Try the 📗 Import Excel button.',
    'msg.need2': 'You need at least 2 places in the itinerary 🗺️',
    'msg.routing': '⏳ Calling the Directions API…',
    'msg.routeok': 'Real road route calculated ✅',
    'msg.maxdays': 'Maximum is 14 days 😅',
    'msg.mindays': 'You need at least one day 😄',
    'msg.dupe': 'That place is already in this slot 😉',
    'msg.cleared': 'Itinerary cleared — starting fresh! 🧹',
    'msg.capturing': '📸 Capturing the map…',
    'msg.saved': 'PNG saved! 🎉',
    'msg.confirmday': 'Day {d} has {n} places. Delete this day?',

    /* ---------- Route warnings ---------- */
    'warn.caronly': 'ℹ️ The public OSRM server only has car data — walking/cycling times are <b>estimates</b>.',
    'warn.fallback': '⚠️ Some legs could not reach the Directions API, so straight lines were drawn.',
    'warn.ok': '✅ Itinerary looks reasonable, all legs are close together!',
    'warn.long': '{a} → {b}: {km} km — quite far (> {max} km).',
    'warn.min': ' min',

    /* ---------- Mascot ---------- */
    'mascot.title': 'Click for a tip',
    'mascot.play3d.on': 'Camera tilting to 3D — enjoy the ride! 🎬',
    'mascot.back2d': 'Back to <b>pure 2D</b> (pitch 0°) to save your GPU 🧭',
    'mascot.cinema': 'Recording mode 📹 — press <b>Esc</b> or <b>C</b> to exit',
    'mascot.hidden': 'Hid the places outside your itinerary 🙈',
    'mascot.shown': 'Showing all places again 👁️',
    'mascot.added': '<b>{name}</b> added to Day {d}! ✨',
    'mascot.dayadded': 'Added <b>Day {d}</b> — now a <b>{label}</b> trip 🎒',
    'mascot.dayremoved': 'Removed a day — now <b>{label}</b> ✨',
    'mascot.viewall': 'Viewing <b>all {n} days</b> 🗓️',
    'mascot.export': 'Cheese~ 📷 Exporting your itinerary image!',
    'mascot.speedreal': 'Running at a real <b>{kmh} km/h</b> — tap the speed button for 30/60/80 🛵',
    'mascot.speedcinema': 'Fast-forward mode <b>{x}x</b> to save time 🎬',

    /* ---------- Overlay / export ---------- */
    'overlay.title': '🌸 Đà Lạt Itinerary',
    'overlay.sub': 'Anime Travel Map',
    'legend.title': '🧭 Legend',
    'legend.food': 'Food & Drink',
    'legend.travel': 'Sightseeing / Nature',
    'legend.stay': 'Accommodation',
    'legend.other': 'Other',
    'legend.route': 'Real road route',
    'overlay.nostats': '{n} places • no route yet',
    'overlay.stats': '{km} km • {time} • {n} stops',
    'export.watermark': 'Đà Lạt Anime Travel Map · compiled from Google review data',

    /* ---------- Help modal ---------- */
    'help.title': '📖 Adventurer’s Handbook',
    'help.1': '<b>Load data:</b> click <i>🎁 Sample Data</i> (93 Đà Lạt places) or <i>📗 Import Excel</i> with the 14 columns.',
    'help.2': '<b>Plan:</b> drag cards from the <i>Backpack</i> into Day × Morning/Afternoon/Evening.',
    'help.3': '<b>Route:</b> click <i>🛣️ Build real route</i> — it follows actual streets, not straight lines.',
    'help.4': '<b>Simulate:</b> click <i>🎬 Play Route 3D</i> to watch the mascot follow every curve of the road.',
    'help.5': '<b>Export:</b> click <i>📸 Export Travel Map</i> to save a PNG with labels, legend and total km.',
    'help.hint': 'Tip: the map always returns to <b>pure 2D (pitch 0°)</b> when you exit 3D mode.',
    'help.close': 'Close',

    /* ---------- Misc ---------- */
    'cinema.exit': '✕ Exit recording mode',
    'cinema.exit.title': 'Exit recording mode (Esc or C)',
    'hud.restore': '👁️ Show HUD',
    'hud.restore.title': 'Show the control panels again (key H)',
    'lang.switch': 'Tiếng Việt',
    'lang.switch.title': 'Chuyển sang tiếng Việt'
  },

  vi: {
    /* ---------- Lời thoại linh vật (mảng) ---------- */
    'lines.hello': [
      'Xin chào lữ khách! Mình là <b>Mochi</b> 🐰 — hướng dẫn viên Đà Lạt của bạn!',
      'Sẵn sàng lên đồ đi Đà Lạt chưa nào? 🌸',
      'Bấm 🎁 <b>Dữ liệu mẫu</b> để mở khoá 93 địa điểm nhé!'
    ],
    'lines.loaded': [
      'Đã nạp xong bản đồ kho báu! Kéo thẻ vào lịch trình nào 🎒',
      'Nhiều điểm quá! Lọc theo <b>Khuyến nghị A</b> cho nhanh nha 💡'
    ],
    'lines.idle': [
      'Đừng xếp quá 4 điểm/buổi nha, Đà Lạt hay kẹt xe cuối tuần 🚗',
      'Mẹo: điểm hạng <b>A</b> là đáng đi nhất trong bộ dữ liệu đó!',
      'Buổi sáng nên đi cảnh ngoài trời, chiều tối thì cà phê view 🌇',
      'Nhớ đọc ô ⚠️ Nhược điểm — nhiều chỗ đông tour sau 8h30 đó!',
      'Bạn có thể kéo thả để đổi thứ tự điểm trong ngày nhé ✨',
      'Mưa Đà Lạt hay đến bất chợt, thủ sẵn áo mưa nha ☔'
    ],
    'lines.empty': [
      'Lịch trình còn trống trơn kìa 🥲 Thả vài điểm vào đi nào!'
    ],

    'msg.asking': 'Đang hỏi API tuyến đường thực tế… chờ tí nha! 🛵',
    'mascot.tip.a': 'Điểm này <b>rất đáng đi</b> đó nha 💖',
    'mascot.tip.b': 'Điểm này <b>tuỳ gu</b> bạn nhé 🤔',
    'mascot.tip.cons': 'Nhớ đọc kỹ ô ⚠️ Nhược điểm trước khi đi nha!',
    'mascot.tip.hours': '<b>{name}</b> nè! Khung giờ đẹp: {hours} ⏰',
    'mascot.flexible': 'linh hoạt',
    'play.start': 'Bắt đầu chuyến phiêu lưu! Giữ chặt tay lái nha 🛵💨',
    'play.arrive': 'Tới <b>{name}</b> rồi! Nghỉ {s}s 🌸',
    'play.finish': 'Hoàn thành chuyến đi! Bấm 📸 Export để lưu kỷ niệm nhé 💖',

    'boot.title': 'Travel Map',
    'boot.msg': 'Đang triệu hồi bản đồ hồng pastel…',
    'boot.style': 'Đang pha màu hồng pastel cho bản đồ…',
    'boot.data': 'Đang triệu hồi 93 địa điểm Đà Lạt…',
    'boot.ready': 'Sẵn sàng!',

    'app.subtitle': 'RPG Trip Planner • Chế độ dễ dùng',
    'app.subtitle3d': 'RPG Trip Planner • 🎬 Chế độ điện ảnh 3D',
    'btn.excel': 'Nạp Excel',
    'btn.excel.title': 'Nạp file .xlsx của bạn',
    'btn.demo': 'Dữ liệu mẫu',
    'btn.demo.title': 'Dùng bộ dữ liệu Đà Lạt có sẵn',
    'btn.play3d': 'Play Route 3D',
    'btn.play3d.title': 'Tính tuyến đường trước để bật 3D',
    'btn.exit3d': 'Thoát 3D',
    'btn.cinema': 'Quay màn hình',
    'btn.cinema.title': 'Ẩn 2 thanh bên để quay màn hình (phím C)',
    'btn.export': 'Xuất ảnh bản đồ',
    'btn.help.title': 'Hướng dẫn',

    'side.places': '🎒 Túi đồ — Địa điểm',
    'search.ph': '🔍 Tìm tên địa điểm…',
    'filter.group': '🏷️ Tất cả nhóm',
    'filter.area': '📍 Tất cả khu vực',
    'filter.rec': '⭐ Mọi khuyến nghị',
    'filter.rec.a': 'A – Rất nên đi',
    'filter.rec.b': 'B – Tuỳ gu',
    'filter.rec.c': 'C – Cân nhắc',
    'filter.rec.d': 'D – Cần chốt pin',
    'filter.cost': '💰 Mọi chi phí',
    'cost.free': 'Miễn phí',
    'cost.low': 'Thấp',
    'cost.mid': 'Trung bình',
    'cost.high': 'Cao',
    'list.empty': 'Chưa có dữ liệu. Bấm <b>🎁 Dữ liệu mẫu</b> hoặc <b>📗 Nạp Excel</b>.',
    'list.nomatch': 'Không tìm thấy địa điểm nào 🥲<br>Thử bỏ bớt bộ lọc nhé!',

    'map.fit': 'Vừa khung tất cả pin',
    'map.reset2d': 'Về 2D thuần (pitch 0°)',
    'map.labels': 'Bật/tắt nhãn tên',
    'hud.dist': 'Quãng đường thực tế',
    'hud.time': 'Thời gian di chuyển',
    'profile.driving': '🏍️ Xe máy / Ô tô',
    'profile.walking': '🚶 Đi bộ',
    'profile.cycling': '🚲 Xe đạp',

    'play.starting': 'Đang khởi hành…',
    'play.pause.title': 'Tạm dừng / tiếp tục',
    'play.speed.title': 'Đổi tốc độ',
    'play.speedmode.title': 'Tua nhanh (bội số) ↔ vận tốc thật (km/h)',
    'play.mode.cinema': '🎬 Điện ảnh',
    'play.mode.real': '🛵 Thực tế',
    'play.hudoff': '📹 Ẩn HUD',
    'play.hudon': '👁️ Hiện HUD',
    'play.hudoff.title': 'Ẩn bảng điều khiển để quay màn hình (phím H)',
    'play.hideothers': '🙈 Ẩn điểm khác',
    'play.showall': '👁️ Hiện tất cả',
    'play.hideothers.title': 'Ẩn/hiện các địa điểm không nằm trong lịch trình',

    'side.plan': '📅 Nhật ký hành trình',
    'plan.clear.title': 'Xoá toàn bộ lịch trình',
    'plan.day': 'Ngày',
    'plan.all': 'Tất cả',
    'plan.dayminus': 'Bớt 1 ngày',
    'plan.dayplus': 'Thêm 1 ngày',
    'plan.oneday': 'Đi trong ngày',
    'plan.nights': '{d} ngày {n} đêm',
    'plan.morning': 'Sáng',
    'plan.afternoon': 'Chiều',
    'plan.evening': 'Tối',
    'plan.drophere': 'Kéo địa điểm thả vào đây ✨',
    'plan.count': '{n} điểm',
    'btn.route': '🛣️ Tính tuyến đường thực tế',
    'btn.savejson': '💾 Lưu JSON',

    'card.food': '🍜 Ăn uống',
    'card.travel': '🏞️ Tham quan',
    'card.stay': '🏠 Lưu trú',
    'card.other': '🎡 Khác',
    'card.noreviews': 'chưa có dữ liệu',
    'card.trust': ' • Tin cậy: ',
    'card.area': '📍 Khu vực',
    'card.cost': '💰 Chi phí',
    'card.hours': '⏰ Khung giờ đẹp',
    'card.duration': '⏳ Thời lượng',
    'card.suitable': '👥 Phù hợp',
    'card.pros': '✨ ƯU ĐIỂM',
    'card.cons': '⚠️ NHƯỢC ĐIỂM / CẢNH BÁO',
    'card.quest': '🎯 KHUYẾN NGHỊ 3N2Đ',
    'card.expand': '▾ Xem ưu / nhược điểm',
    'card.collapse': '▴ Thu gọn',
    'card.geowarn': '&nbsp;& cảnh báo toạ độ',
    'card.add': '➕ Thêm vào lịch trình',
    'card.zoom': '🔍 Zoom tới',
    'card.approx': 'Toạ độ ước lượng',
    'card.geonote': '📍 Toạ độ <b>ước lượng theo {note}</b> — hãy mở link Maps để xác minh.',
    'card.area.generic': 'khu vực',

    'msg.reading': '📗 Đang đọc file Excel…',
    'msg.norows': 'File không có dòng dữ liệu hợp lệ 😢',
    'msg.loaded': 'Đã nạp {n} địa điểm ({c} có toạ độ) ✅',
    'msg.nocoord': '{n} địa điểm chưa có toạ độ — thêm 2 cột <b>Lat</b> / <b>Lng</b> vào Excel nhé.',
    'msg.readerr': 'Lỗi đọc file: ',
    'msg.demofail': 'Không nạp được dữ liệu mẫu 😢 Hãy dùng nút 📗 Nạp Excel.',
    'msg.need2': 'Cần ít nhất 2 địa điểm trong lịch trình 🗺️',
    'msg.routing': '⏳ Đang gọi Directions API…',
    'msg.routeok': 'Đã tính tuyến đường thực tế ✅',
    'msg.maxdays': 'Tối đa 14 ngày thôi nha 😅',
    'msg.mindays': 'Phải còn ít nhất 1 ngày chứ 😄',
    'msg.dupe': 'Địa điểm đã có trong ô này rồi 😉',
    'msg.cleared': 'Đã dọn sạch lịch trình, làm lại từ đầu nào! 🧹',
    'msg.capturing': '📸 Đang chụp bản đồ…',
    'msg.saved': 'Đã lưu ảnh PNG! 🎉',
    'msg.confirmday': 'Ngày {d} đang có {n} địa điểm. Xoá ngày này?',

    'warn.caronly': 'ℹ️ Máy chủ OSRM công cộng chỉ có dữ liệu ô tô — thời gian đi bộ/xe đạp là <b>ước tính</b>.',
    'warn.fallback': '⚠️ Một số chặng không gọi được Directions API nên tạm vẽ đường thẳng.',
    'warn.ok': '✅ Lịch trình hợp lý, các chặng đều gần nhau!',
    'warn.long': '{a} → {b}: {km} km — khá xa (> {max} km).',
    'warn.min': ' phút',

    'mascot.title': 'Bấm để nghe gợi ý',
    'mascot.play3d.on': 'Camera đang nghiêng sang 3D — thưởng thức chuyến đi nào! 🎬',
    'mascot.back2d': 'Đã về chế độ <b>2D thuần</b> (pitch 0°) cho nhẹ máy 🧭',
    'mascot.cinema': 'Chế độ quay màn hình 📹 — bấm <b>Esc</b> hoặc <b>C</b> để thoát',
    'mascot.hidden': 'Đã ẩn các địa điểm ngoài lịch trình cho dễ nhìn 🙈',
    'mascot.shown': 'Hiện lại toàn bộ địa điểm 👁️',
    'mascot.added': '<b>{name}</b> đã vào lịch trình Ngày {d}! ✨',
    'mascot.dayadded': 'Đã thêm <b>Ngày {d}</b> — giờ là chuyến <b>{label}</b> 🎒',
    'mascot.dayremoved': 'Đã bớt 1 ngày — còn <b>{label}</b> ✨',
    'mascot.viewall': 'Đang xem <b>toàn bộ {n} ngày</b> 🗓️',
    'mascot.export': 'Cheese~ 📷 Đang xuất ảnh lịch trình cho bạn!',
    'mascot.speedreal': 'Chạy đúng vận tốc thật <b>{kmh} km/h</b> — bấm nút tốc độ để đổi 30/60/80 🛵',
    'mascot.speedcinema': 'Chế độ tua nhanh <b>{x}x</b> cho đỡ mất thời gian 🎬',

    'overlay.title': '🌸 Lịch trình Đà Lạt',
    'overlay.sub': 'Anime Travel Map',
    'legend.title': '🧭 Chú giải',
    'legend.food': 'Ăn uống',
    'legend.travel': 'Tham quan / Thiên nhiên',
    'legend.stay': 'Lưu trú',
    'legend.other': 'Khác',
    'legend.route': 'Tuyến đường thực tế',
    'overlay.nostats': '{n} địa điểm • chưa tính tuyến',
    'overlay.stats': '{km} km • {time} • {n} điểm',
    'export.watermark': 'Đà Lạt Anime Travel Map · dữ liệu review Google tổng hợp',

    'help.title': '📖 Sổ tay phiêu lưu',
    'help.1': '<b>Nạp dữ liệu:</b> bấm <i>🎁 Dữ liệu mẫu</i> (93 địa điểm Đà Lạt) hoặc <i>📗 Nạp Excel</i> đúng 14 cột.',
    'help.2': '<b>Xếp lịch:</b> kéo thẻ từ <i>Túi đồ</i> thả vào Ngày × Sáng/Chiều/Tối.',
    'help.3': '<b>Tuyến đường:</b> bấm <i>🛣️ Tính tuyến đường thực tế</i> — đi theo đường phố thật, không phải đường chim bay.',
    'help.4': '<b>Mô phỏng:</b> bấm <i>🎬 Play Route 3D</i> để linh vật chạy theo đúng khúc cua của con đường.',
    'help.5': '<b>Xuất ảnh:</b> bấm <i>📸 Xuất ảnh bản đồ</i> để lưu PNG kèm nhãn + chú giải + tổng km.',
    'help.hint': 'Mẹo: bản đồ luôn về <b>2D thuần (pitch 0°)</b> khi thoát chế độ 3D.',
    'help.close': 'Đóng',

    'cinema.exit': '✕ Thoát chế độ quay',
    'cinema.exit.title': 'Thoát chế độ quay (Esc hoặc C)',
    'hud.restore': '👁️ Hiện HUD',
    'hud.restore.title': 'Hiện lại bảng điều khiển (phím H)',
    'lang.switch': 'English',
    'lang.switch.title': 'Switch to English'
  }
};

/* Ngôn ngữ hiện tại — MẶC ĐỊNH LÀ 'en' */
let LANG = 'en';

/* Dịch một khoá, thay {biến} nếu có */
function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) ?? I18N.en[key] ?? key;
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

/* Quét DOM và áp bản dịch cho mọi phần tử có data-i18n* */
function applyI18n(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });
  scope.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  scope.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.documentElement.lang = LANG;
}

/* Đổi ngôn ngữ và vẽ lại toàn bộ giao diện động */
function setLang(lang) {
  LANG = (lang === 'vi') ? 'vi' : 'en';
  try { localStorage.setItem('dalat_lang', LANG); } catch (e) { /* ignore */ }

  applyI18n();
  // Chuỗi nằm trong CSS content: -> truyền qua biến CSS
  document.documentElement.style.setProperty('--drop-hint', JSON.stringify(t('plan.drophere')));

  const btn = document.getElementById('btn-lang');
  if (btn) {
    btn.textContent = LANG === 'en' ? '🇻🇳 VI' : '🇬🇧 EN';
    btn.title = t('lang.switch.title');
  }

  /* Vẽ lại những phần sinh động bằng JS.
     LƯU Ý: các module khai báo bằng `const` ở top-level nên KHÔNG nằm trên
     `window` — phải tham chiếu trực tiếp và bọc typeof để tránh ReferenceError
     khi i18n.js chạy trước lúc chúng được định nghĩa. */
  // Sinh lại 2 dropdown lọc (JS ghi đè option đầu tiên nên phải dựng lại)
  if (typeof fillFilters === 'function' && typeof DataStore !== 'undefined' && DataStore.places?.length) {
    const g = document.getElementById('filter-group'), a = document.getElementById('filter-area');
    const gv = g?.value, av = a?.value;
    fillFilters(DataStore.places);
    if (g && gv) g.value = gv;
    if (a && av) a.value = av;
  }
  if (typeof Planner !== 'undefined' && Planner.map) {
    Planner.renderList();
    Planner.buildDayUI();
    Planner.renderPlan();
    Planner.refreshMarkerStyles();
    if (Planner.popup && Planner.lastPlace) Planner.openPopup(Planner.lastPlace);
  }
  if (typeof Routing !== 'undefined' && Routing.route) {
    Routing.renderHud();
    Routing.renderLegLabels();
  }
  if (typeof Play3D !== 'undefined') Play3D.syncSpeedUI?.();
  if (typeof Exporter !== 'undefined' && typeof DataStore !== 'undefined') Exporter.syncOverlay?.();

  const sub = document.getElementById('brand-sub');
  if (sub) {
    const in3d = (typeof Play3D !== 'undefined') && Play3D.active;
    sub.textContent = t(in3d ? 'app.subtitle3d' : 'app.subtitle');
  }
}

/* Khôi phục lựa chọn đã lưu (nếu chưa từng chọn thì giữ English) */
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('dalat_lang'); } catch (e) { /* ignore */ }
  LANG = (saved === 'vi') ? 'vi' : 'en';
  applyI18n();
  document.documentElement.style.setProperty('--drop-hint', JSON.stringify(t('plan.drophere')));
  const btn = document.getElementById('btn-lang');
  if (btn) {
    btn.textContent = LANG === 'en' ? '🇻🇳 VI' : '🇬🇧 EN';
    btn.title = t('lang.switch.title');
    btn.addEventListener('click', () => setLang(LANG === 'en' ? 'vi' : 'en'));
  }
}
