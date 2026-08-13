/* =====================================================================
   mascot.js — LINH VẬT HƯỚNG DẪN (INTERACTIVE COMPANION)
   Thoại động phản ứng theo hành động của người dùng.
   ===================================================================== */

const Mascot = {
  timer: null,
  idleTimer: null,

  /* Lời thoại lấy từ i18n để đổi theo ngôn ngữ */
  get LINES() {
    return {
      hello: t('lines.hello'),
      loaded: t('lines.loaded'),
      idle: t('lines.idle'),
      empty: t('lines.empty')
    };
  },


  init() {
    document.getElementById('mascot-body').addEventListener('click', () => {
      this.say(pickOne(this.LINES.idle));
    });
    this.say(pickOne(this.LINES.hello), 6000);
    this.startIdle();
  },

  say(html, ms = 5200) {
    const bubble = document.getElementById('mascot-bubble');
    document.getElementById('mascot-text').innerHTML = html;
    bubble.classList.remove('hidden');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => bubble.classList.add('hidden'), ms);
    this.startIdle();
  },

  startIdle() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      const empty = Planner.orderedIds?.().length === 0;
      this.say(pickOne(empty && DataStore.places.length ? this.LINES.empty : this.LINES.idle));
    }, 30000);
  }
};
