/* ================================================================
   render-roster.js — data/players.json からロスターを動的生成
   ================================================================ */

(function () {
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getSlug(p) {
    if (p.slug && p.slug.trim() !== '') return p.slug;
    if (p.number !== null && p.number !== undefined && p.number !== '') {
      return 'grade' + p.grade + '-' + p.number;
    }
    if (p.section === 'staff' || p.section === 'coach' || p.section === 'coaches') {
      var role = (p.staffRole || 'staff').toLowerCase();
      var nameKey = (p.nameEn || p.name || '').replace(/\s+/g, '-').toLowerCase();
      if (nameKey) return 'staff-grade' + p.grade + '-' + role + '-' + nameKey;
    }
    var nameKey2 = (p.nameEn || p.name || '').replace(/\s+/g, '-').toLowerCase();
    if (nameKey2) return 'grade' + p.grade + '-' + nameKey2;
    return '';
  }

  function buildCard(p) {
    var isStaff = p.section === 'staff' || p.section === 'coach' || p.section === 'coaches';
    var slug = getSlug(p);
    var hasDetail = !!slug;
    var tag  = hasDetail ? 'a' : 'div';
    var cls  = 'player-card' + (isStaff ? ' staff-card' : '') + (hasDetail ? ' has-detail' : '');

    // 詳細ページのURLに現在のタブ情報を含める
    var params = new URLSearchParams(window.location.search);
    var section = params.get('section') || 'players';
    var year    = params.get('year')    || '4';
    var href = hasDetail
      ? ' href="players/detail.html?slug=' + esc(slug) + '&back_section=' + esc(section) + '&back_year=' + esc(year) + '"'
      : '';

    var roleBadge = (p.role && !isStaff)
      ? '<div class="player-role leader">' + esc(p.role) + '</div>'
      : '';

    var staffBadge = isStaff
      ? '<div class="staff-role-badge">' + esc(p.staffRole) + '</div>'
      : '';

    var photoInner = p.photo
      ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;z-index:1;" onerror="this.style.display=\'none\'">'
      : '';

    var numContent;
    if (isStaff) {
      numContent = '<span>' + esc(p.staffRole) + '</span>';
    } else if (p.number !== null && p.number !== undefined && p.number !== '') {
      numContent = '#' + esc(p.number);
    } else {
      numContent = '<span>' + esc(p.grade) + '回生</span>';
    }
    var hasRole = !isStaff && p.role;
    var numClass = 'player-num' + (hasRole ? '' : ' no-role');
    var gradeLabel = p.grade + '回生';
    var detailArrow = hasDetail
      ? '<div class="player-detail-arrow"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l4 4-4 4"/></svg></div>'
      : '';

    return (
      '<' + tag + ' class="' + cls + '"' + href + ' data-year="' + p.grade + '" data-slug="' + esc(slug) + '">' +
        '<div class="player-photo">' +
          roleBadge +
          photoInner +
          '<div class="img-slot light">' +
            '<span class="slot-label">' + esc(p.name) + '</span>' +
          '</div>' +
          staffBadge +
        '</div>' +
        '<div class="' + numClass + '">' + numContent + '</div>' +
        '<div class="player-info">' +
          '<div class="player-pos">' + esc(gradeLabel) + '</div>' +
          '<div class="player-name">' + esc(p.name) + '</div>' +
          detailArrow +
        '</div>' +
      '</' + tag + '>'
    );
  }

  function render(players) {
    var grid = document.getElementById('rosterFullGrid');
    if (!grid) return;

    var grades = [4, 3, 2, 1];
    var html = '';

    grades.forEach(function (g) {
      var group = players.filter(function (p) { return p.grade === g; });
      if (group.length === 0) return;
      var count = group.length;
      html +=
        '<div class="year-group-header" data-year="' + g + '">' +
          '<span class="yh-label">' + g + '回生</span>' +
          '<span class="yh-count">' + count + '名</span>' +
        '</div>';
      group.forEach(function (p) { html += buildCard(p); });
    });

    grid.innerHTML = html;

    var playerCount = players.filter(function (p) {
      return p.section === 'player';
    }).length;
    var tcEl = document.getElementById('totalCount');
    if (tcEl) tcEl.textContent = playerCount;

    // roster-filter.jsに描画完了を通知
    window.dispatchEvent(new Event('rosterRendered'));
  }

  function loadPlayers() {
    fetch('data/players.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var players = Array.isArray(data) ? data : (data.players || []);
        render(players);
      })
      .catch(function () {
        var grid = document.getElementById('rosterFullGrid');
        if (grid) {
          grid.innerHTML =
            '<div class="roster-load-error">' +
              '<div class="roster-load-error-title">LOAD ERROR</div>' +
              '<div class="roster-load-error-sub">データの読み込みに失敗しました。</div>' +
            '</div>';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPlayers);
  } else {
    loadPlayers();
  }
})();
