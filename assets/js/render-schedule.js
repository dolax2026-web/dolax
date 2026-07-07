/* ================================================================
   render-schedule.js — data/schedule.json から試合カードを動的生成
   ================================================================ */

(function () {
  var DU_LOGO =
    '<img src="assets/du-logo.png" alt="同志社大学" class="card-du-logo">';

  var IG_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">' +
    '<rect x="3" y="3" width="18" height="18" rx="5"/>' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>' +
    '</svg>';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildSchedCard(m) {
    var dateStr = esc(m.date) + (m.dayOfWeek ? ' ' + esc(m.dayOfWeek) : '');
    var venueHtml = m.venue
      ? '<span class="card-venue">' + esc(m.venue) + '</span>'
      : '<span class="card-tbd-info">会場未定</span>';
    var timeHtml  = m.time
      ? '<span class="card-time">' + esc(m.time) + '</span>'
      : '<span class="card-tbd-info">時間未定</span>';
    var tournHtml = m.tournament
      ? '<span class="card-tournament">' + esc(m.tournament) + '</span>'
      : '';

    return (
      '<div class="sched-card" data-year="' + esc(m.year) + '" data-cat="' + esc(m.team) + '" data-type="scheduled">' +
        '<div class="sched-head">' +
          '<div class="card-head-left">' +
            '<span class="badge-result badge-tbd">TBD</span>' +
            tournHtml +
          '</div>' +
          '<div class="card-head-right">' +
            '<span class="card-date">' + dateStr + '</span>' +
            venueHtml +
            timeHtml +
          '</div>' +
        '</div>' +
        '<div class="sched-body">' +
          '<div class="card-team card-home">' +
            '<div class="team-name">' + DU_LOGO + '<span class="card-du-name">同志社大学</span></div>' +
          '</div>' +
          '<div class="card-score"><div class="score-row"><span class="score-vs">VS</span></div></div>' +
          '<div class="card-team card-away"><div class="team-name">' + esc(m.opponent) + '</div></div>' +
        '</div>' +
      '</div>'
    );
  }

  function buildResultCard(m) {
var res   = (m.result || '').toLowerCase();
var isSpecial = m.result && m.result !== 'win' && m.result !== 'lose' && m.result !== 'draw';
var cardClass = res === 'win'   ? 'game-card result-win'
              : res === 'draw'  ? 'game-card result-draw'
              : isSpecial       ? 'game-card result-cancel'
              : 'game-card result-lose';
var badgeClass = res === 'win'  ? 'badge-result badge-win'
               : res === 'draw' ? 'badge-result badge-draw'
               : isSpecial      ? 'badge-result badge-cancel'
               : 'badge-result badge-lose';
var badgeLabel = res === 'win'  ? 'WIN'
               : res === 'draw' ? 'DRAW'
               : isSpecial      ? esc(m.result)
               : 'LOSE';

    var dateStr  = esc(m.date) + (m.dayOfWeek ? ' ' + esc(m.dayOfWeek) : '');
    var venueHtml = m.venue ? '<span class="card-venue">' + esc(m.venue) + '</span>' : '';

var scoreHtml = isSpecial
  ? '<div class="score-row"><span class="score-special">' + esc(m.result) + '</span></div>'
  : '<div class="score-row">' +
      '<span class="score-num">' + (m.homeScore !== null ? m.homeScore : '?') + '</span>' +
      '<span class="score-sep">&#8212;</span>' +
      '<span class="score-num">' + (m.awayScore !== null ? m.awayScore : '?') + '</span>' +
    '</div>';

    var igHtml = m.instagramUrl
      ? '<div class="card-foot">' +
          '<a class="ig-link" href="' + esc(m.instagramUrl) + '" target="_blank" rel="noopener noreferrer">' +
            IG_SVG + 'Instagram投稿を見る' +
          '</a>' +
        '</div>'
      : '';

    return (
      '<div class="' + cardClass + '" data-year="' + esc(m.year) + '" data-cat="' + esc(m.team) + '" data-type="result">' +
        '<div class="card-head">' +
          '<div class="card-head-left">' +
            '<span class="' + badgeClass + '">' + badgeLabel + '</span>' +
          '</div>' +
          '<div class="card-head-right">' +
            '<span class="card-date">' + dateStr + '</span>' +
            venueHtml +
          '</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-team card-home">' +
            '<div class="team-name">' + DU_LOGO + '<span class="card-du-name">同志社大学</span></div>' +
          '</div>' +
          '<div class="card-score">' + scoreHtml + '</div>' +
          '<div class="card-team card-away"><div class="team-name">' + esc(m.opponent) + '</div></div>' +
        '</div>' +
        igHtml +
      '</div>'
    );
  }

  /* ── 日付を YYYYMMDD の数値に変換（ソート・比較用） ── */
  function parseDateNum(str) {
    var p = String(str || '').split('.');
    if (p.length !== 3) return 0;
    var y = parseInt(p[0], 10), m = parseInt(p[1], 10), d = parseInt(p[2], 10);
    return (isNaN(y) || isNaN(m) || isNaN(d)) ? 0 : y * 10000 + m * 100 + d;
  }

  var SVG_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
  var SVG_PIN   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>';

  var TEAM_LABEL = { a: 'A TEAM', b: 'B TEAM', c: 'C TEAM' };

  /* ── index.html の NEXT GAME / LATEST RESULT カードを更新 ── */
  function renderIndexCards(matches) {
    var ngMeta     = document.getElementById('ngMeta');
    var ngMatchup  = document.getElementById('ngMatchup');
    var ngSub      = document.getElementById('ngSub');
    var lrMeta     = document.getElementById('lrMeta');
    var lrMatchup  = document.getElementById('lrMatchup');
    var lrSub      = document.getElementById('lrSub');
    if (!ngMeta && !lrMeta) return;

    var today = (function () {
      var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    })();

    /* 次の試合: type===scheduled かつ 日付 >= 今日 の中で最も近い */
    var upcoming = matches
      .filter(function (m) { return m.type === 'scheduled' && parseDateNum(m.date) >= today; })
      .sort(function (a, b) { return parseDateNum(a.date) - parseDateNum(b.date); });

    /* 最新結果: type===result の中で最も日付が新しい */
    var results = matches
      .filter(function (m) { return m.type === 'result'; })
      .sort(function (a, b) { return parseDateNum(b.date) - parseDateNum(a.date); });

    /* NEXT GAME */
    if (ngMeta && upcoming.length) {
      var ng = upcoming[0];
      var catLabel = TEAM_LABEL[(ng.team || '').toLowerCase()] || (ng.team || '').toUpperCase();
      ngMeta.innerHTML =
        '<span class="mc-date">' + esc(ng.date) + (ng.dayOfWeek ? ' ' + esc(ng.dayOfWeek) : '') + '</span>' +
        '<span class="mc-cat">' + esc(catLabel) + '</span>';
      ngMatchup.innerHTML =
        '<div class="mc-team mc-team--home">同志社大学</div>' +
        '<div class="mc-center"><span class="mc-vs-text">VS</span></div>' +
        '<div class="mc-team mc-team--away">' + esc(ng.opponent) + '</div>';
      var subHtml = '';
      if (ng.time)  subHtml += '<div class="mc-detail">' + SVG_CLOCK + esc(ng.time)  + '</div>';
      if (ng.venue) subHtml += '<div class="mc-detail">' + SVG_PIN   + esc(ng.venue) + '</div>';
      if (!ng.time && !ng.venue) subHtml = '<div class="mc-detail" style="color:rgba(255,255,255,.4)">日時・会場は決定次第掲載</div>';
      ngSub.innerHTML = subHtml;
    }

    /* LATEST RESULT */
    if (lrMeta && results.length) {
      var lr = results[0];
      var lrCat = TEAM_LABEL[(lr.team || '').toLowerCase()] || (lr.team || '').toUpperCase();
      var res   = (lr.result || '').toLowerCase();
      var badgeCls = res === 'win' ? 'mc-result-badge--win' : res === 'draw' ? 'mc-result-badge--draw' : 'mc-result-badge--lose';
      var badgeTxt = res === 'win' ? 'WIN' : res === 'draw' ? 'DRAW' : 'LOSE';
      lrMeta.innerHTML =
        '<span class="mc-date">' + esc(lr.date) + (lr.dayOfWeek ? ' ' + esc(lr.dayOfWeek) : '') + '</span>' +
        '<span class="mc-cat">' + esc(lrCat) + '</span>';
      lrMatchup.innerHTML =
        '<div class="mc-team mc-team--home">同志社大学</div>' +
        '<div class="mc-center"><div class="mc-score">' +
          '<span class="mc-score-num">' + (lr.homeScore !== null ? lr.homeScore : '?') + '</span>' +
          '<span class="mc-score-sep">—</span>' +
          '<span class="mc-score-num">' + (lr.awayScore !== null ? lr.awayScore : '?') + '</span>' +
        '</div></div>' +
        '<div class="mc-team mc-team--away">' + esc(lr.opponent) + '</div>';
      lrSub.innerHTML = '<span class="mc-result-badge ' + badgeCls + '">' + badgeTxt + '</span>';
    }
  }

  function render(matches) {
    var schedList   = document.getElementById('scheduled-list');
    var resultsList = document.getElementById('results-list');

    /* index.html 上のカードを更新 */
    renderIndexCards(matches);

    if (!schedList || !resultsList) return;

    var schedHtml  = '';
    var resultsHtml = '';

    matches.forEach(function (m) {
      if (m.type === 'scheduled') schedHtml  += buildSchedCard(m);
      if (m.type === 'result')    resultsHtml += buildResultCard(m);
    });

    schedList.innerHTML   = schedHtml;
    resultsList.innerHTML = resultsHtml;

    if (typeof initTeamBadges === 'function') initTeamBadges();
    if (typeof filterGames    === 'function') filterGames();
  }

  function loadSchedule() {
    fetch('data/schedule.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var matches = Array.isArray(data) ? data : (data.matches || []);
        render(matches);
      })
      .catch(function () {
        ['scheduled-list', 'results-list'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.innerHTML = '';
        });
        if (typeof filterGames === 'function') filterGames();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSchedule);
  } else {
    loadSchedule();
  }
})();
