/* ================================================================
   roster-filter.js — roster.html セクション／年次フィルター
   ================================================================ */

var currentSection = 'players';
var currentYear    = '4';

function applyFilter() {
  var vis = 0;
  document.querySelectorAll('.player-card').forEach(function (card) {
    var isStaff  = card.classList.contains('staff-card');
    var isCoach  = card.classList.contains('coach-card');
    var isPlayer = !isStaff && !isCoach;
    var show = false;
    if      (currentSection === 'players' && isPlayer) show = currentYear === 'all' || card.dataset.year === currentYear;
    else if (currentSection === 'staff'   && isStaff)  show = true;
    else if (currentSection === 'coaches' && isCoach)  show = true;
    card.classList.toggle('is-hidden', !show);
    if (show) vis++;
  });
  document.querySelectorAll('.year-group-header').forEach(function (hdr) {
    var show = currentSection === 'players' && (currentYear === 'all' || hdr.dataset.year === currentYear);
    hdr.classList.toggle('is-hidden', !show);
  });
  var visEl = document.getElementById('visCount');
  if (visEl) visEl.textContent = vis;

  // タブの状態をURLに保存（戻ったとき復元するため）
  var params = new URLSearchParams(window.location.search);
  params.set('section', currentSection);
  params.set('year', currentYear);
  history.replaceState(null, '', '?' + params.toString());
}

function switchTab(section, year, btn) {
  currentSection = section;
  currentYear    = year;
  document.querySelectorAll('.stab').forEach(function (t) { t.classList.remove('active'); });
  btn.classList.add('active');
  applyFilter();
}

/* ── ページ読み込み時にURLのパラメータを復元 ── */
function restoreState() {
  var params = new URLSearchParams(window.location.search);
  var section = params.get('section') || 'players';
  var year    = params.get('year')    || '4';
  var slug    = params.get('from')    || '';

  currentSection = section;
  currentYear    = year;

  // タブのアクティブ状態を復元
  document.querySelectorAll('.stab').forEach(function (btn) {
    if (btn.dataset.section === section && btn.dataset.year === year) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  applyFilter();

  // 戻ってきた選手の位置にスクロール
  if (slug) {
    setTimeout(function () {
      var card = document.querySelector('a[href*="slug=' + slug + '"]');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }
}

/* ── イベントリスナー ── */
document.querySelectorAll('.stab').forEach(function (btn) {
  btn.addEventListener('click', function () {
    switchTab(btn.dataset.section, btn.dataset.year || 'all', btn);
  });
});

/* ── 選手カードのリンクにfromパラメータを追加 ── */
function addFromParam() {
  document.querySelectorAll('a.player-card[href*="detail.html"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var url = new URL(link.href);
      var slug = url.searchParams.get('slug');
      var params = new URLSearchParams(window.location.search);
      params.set('from', slug);
      history.replaceState(null, '', '?' + params.toString());
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  restoreState();
});

// render-roster.jsが描画完了後にfromParamを設定
window.addEventListener('rosterRendered', function () {
  addFromParam();
  restoreState();
});
