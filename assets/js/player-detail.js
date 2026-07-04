/* ================================================================
   player-detail.js — URLのslugを読み取り選手詳細を表示
   players/detail.html から呼ばれる。パスは ../data/players.json
   ================================================================ */

(function () {
  var POSITION_LABEL = { AT: 'AT', MF: 'MF', SSDM: 'SSDM' , DF: 'DF', G: 'G（ゴーリー）' };
  var GRADE_LABEL    = { 1: '1回生', 2: '2回生', 3: '3回生', 4: '4回生' };

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getSlug() {
    var params = new URLSearchParams(location.search);
    return params.get('slug') || '';
  }

  function setMeta(name) {
    document.title = (name || '選手詳細') + ' | DOLAX 同志社大学体育会男子ラクロス部';
  }

  function showError(msg) {
    var main = document.getElementById('playerDetail');
    if (main) main.innerHTML =
      '<div style="padding:80px 0;text-align:center;">' +
        '<div style="font-family:var(--font-heading);font-size:32px;letter-spacing:.2em;color:rgba(20,35,63,.15);">NOT FOUND</div>' +
        '<p style="margin-top:16px;color:var(--muted);font-size:14px;">' + esc(msg) + '</p>' +
        '<a href="../roster.html" style="display:inline-block;margin-top:32px;font-family:Montserrat,sans-serif;font-weight:700;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 36px;background:var(--navy);color:#fff;text-decoration:none;">← Rosterへ戻る</a>' +
      '</div>';
  }

  function render(p) {
    setMeta(p.name);

    var photoSrc = p.photo ? '../' + p.photo : '';
    var photoHtml = photoSrc
      ? '<img id="pdPhoto" src="' + esc(photoSrc) + '" alt="' + esc(p.name) + '">'
      : '';

    var numberHtml = (p.number !== null && p.number !== '')
      ? '<div class="pd-number">#<span>' + esc(p.number) + '</span></div>'
      : '';

    var posHtml = p.position
      ? '<span class="pd-tag pd-tag--pos">' + esc(POSITION_LABEL[p.position] || p.position) + '</span>'
      : '';
    var roleHtml = p.role
      ? '<span class="pd-tag pd-tag--role">' + esc(p.role) + '</span>'
      : '';

    function row(label, val) {
      if (!val) return '';
      return '<tr><th>' + label + '</th><td>' + esc(val) + '</td></tr>';
    }

    var profileRows =
    row('学部',         p.faculty)         +
    row('学科',         p.department)      +
    row('出身校',       p.school)          +
    row('出身地',       p.hometown)        +
    row('経験スポーツ', p.experienceSports);

    var commentHtml = p.comment
      ? '<div class="pd-comment"><blockquote>' + esc(p.comment) + '</blockquote></div>'
      : '';

    var profileUrlHtml = (p.profileUrl && p.profileUrl !== '#')
      ? '<a href="' + esc(p.profileUrl) + '" class="pd-ext-link" target="_blank" rel="noopener noreferrer">プロフィールを見る →</a>'
      : '';

    var html =
      '<div class="pd-hero">' +

        /* ── 写真 ── */
        '<div class="pd-photo-wrap">' +
          '<div class="pd-photo-inner">' +
            (photoHtml
              ? photoHtml + '<div class="pd-photo-ph is-hidden" id="pdPh"></div>'
              : '<div class="pd-photo-ph" id="pdPh"></div>'
            ) +
          '</div>' +
        '</div>' +

        /* ── 基本情報 ── */
        '<div class="pd-hero-info">' +
          numberHtml +
          '<h1 class="pd-name">' + esc(p.name) + '</h1>' +
          (p.nameEn ? '<div class="pd-name-en">' + esc(p.nameEn) + '</div>' : '') +
          '<div class="pd-grade">' + esc(GRADE_LABEL[p.grade] || p.grade + '回生') + '</div>' +
          '<div class="pd-tags">' + posHtml + roleHtml + '</div>' +
        '</div>' +

      '</div>' + /* /pd-hero */

      /* ── プロフィール表 ── */
      (profileRows
        ? '<div class="pd-section"><h2 class="pd-section-title">Profile</h2><table class="pd-table">' + profileRows + '</table></div>'
        : '') +

      /* ── コメント ── */
      (commentHtml
        ? '<div class="pd-section">' + commentHtml + '</div>'
        : '') +

      /* ── 写真3枚 ── */
      (function () {
        var photos = Array.isArray(p.photos) ? p.photos.filter(function (s) { return s; }) : [];
        if (!photos.length) return '';
        return '<div class="pd-section"><h2 class="pd-section-title">Photos</h2>' +
          '<div class="pd-photos">' +
          photos.map(function (src) {
            return '<div class="pd-photo-item"><img src="' + esc(src) + '" alt="' + esc(p.name) + '" loading="lazy"></div>';
          }).join('') +
          '</div></div>';
      })() +

      /* ── 外部リンク ── */
      (profileUrlHtml
        ? '<div class="pd-section">' + profileUrlHtml + '</div>'
        : '') +

      /* ── 戻るボタン ── */
      '<div class="pd-back">' +
        '<a href="../roster.html" class="pd-back-btn">← Rosterへ戻る</a>' +
      '</div>';

    var container = document.getElementById('playerDetail');
    if (container) container.innerHTML = html;

    /* 写真エラー処理 */
    var imgEl = document.getElementById('pdPhoto');
    var phEl  = document.getElementById('pdPh');
    if (imgEl && phEl) {
      imgEl.addEventListener('error', function () {
        imgEl.classList.add('is-hidden');
        phEl.classList.remove('is-hidden');
      });
    }
  }

  function matchSlug(p, slug) {
    if (p.grade === 4 && p.number !== null && p.number !== '') {
      if ('grade4-' + p.number === slug) return true;
    }
    return p.slug && p.slug === slug;
  }

  function init() {
    var slug = getSlug();
    if (!slug) { showError('slugが指定されていません。'); return; }

    fetch('../data/players.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var players = Array.isArray(data) ? data : (data.players || []);
        var player  = players.find(function (p) { return matchSlug(p, slug); });
        if (!player) { showError('選手が見つかりませんでした（slug: ' + slug + '）'); return; }
        render(player);
      })
      .catch(function (err) {
        showError('データの読み込みに失敗しました。npx serve で確認してください。');
        console.error('[player-detail]', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
