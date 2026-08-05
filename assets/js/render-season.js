/* ================================================================
   DOLAX – シーズン情報・統計レンダラー  render-season.js
   ================================================================
   ▶ 読み込み元:
       data/season.json  → スローガン・目標・シーズン年度
       data/stats.json   → チーム情報数値・スポンサー数値
   ▶ 更新方法: JSON ファイルを編集するだけでサイト全体に反映
   ▶ 対応ページ: index.html / about.html / roster.html / sponsors.html
   ================================================================ */
(function () {

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  }

  /* count-up 対応で innerHTML を更新 */
  function setHTML(id, html) {
    var el = document.getElementById(id);
    if (el) { el.innerHTML = html; if (window.DOLAX_initCountUp) window.DOLAX_initCountUp(el); }
  }

  /* ── index.html ── */
  function renderIndex(season, stats) {
    /* ヒーロー シーズンタグ */
    setText('heroSeasonTag', season.slogan + ' ' + season.year);

    /* STATSバー */
    var gridHtml = (stats.teamStats || []).map(function (s) {
     var numHtml = s.countUp
        ? '<span class="js-count-up" data-target="' + esc(String(s.value)) + '">' + esc(String(s.value)) + '</span>'
        : esc(String(s.value)).replace(/&lt;br&gt;/g, '<br>');
      return (
        '<div class="stat">' +
          '<div class="num">' + numHtml + '<small>' + esc(s.suffix) + '</small></div>' +
          '<div class="lab">' + esc(s.label) + '</div>' +
        '</div>'
      );
    }).join('');
    setHTML('statsGrid', gridHtml);

    /* Aboutセクション 目標テキスト */
    setText('aboutGoalP', season.indexAboutP || '');

    /* シーズンカード */
    setText('seasonCardYear', season.year + ' Season');
    var goalsHtml = (season.goals || []).map(function (g) {
      return '<div class="goal">' + esc(g) + '</div>';
    }).join('');
    setHTML('seasonGoalsList', goalsHtml);

    /* パートナー数値 */
    var psHtml = (stats.partnerStats || []).map(function (s) {
      return (
        '<div class="partner-stat">' +
          '<div class="ps-num">' +
            (s.prefix ? '<small>' + esc(s.prefix) + '</small>' : '') +
            esc(s.value) +
            '<small>' + esc(s.suffix) + '</small>' +
          '</div>' +
          '<div class="ps-lab">' + esc(s.label) + '</div>' +
          '<div class="ps-en">'  + esc(s.en)    + '</div>' +
        '</div>'
      );
    }).join('');
    setHTML('partnerStats', psHtml);
  }

  /* ── about.html ── */
  function renderAbout(season) {
    /* スローガンセクション */
    setText('sloganKicker',  season.year + ' Season Slogan');
    setText('sloganWord',    season.slogan);
    setText('sloganSub',     season.sloganSub);

    var bodyEl = document.getElementById('sloganBody');
    if (bodyEl) {
      bodyEl.innerHTML = (season.sloganBody || []).map(function (p) {
        return '<p>' + esc(p) + '</p>';
      }).join('');
    }

    /* 概要テーブル 現シーズン目標 */
    setText('outlineGoals', (season.goals || []).join('・'));
  }

  /* ── roster.html ── */
  function renderRoster(season) {
    setText('rosterPageTitle', 'ROSTER ' + season.year);
  }

  /* ── sponsors.html ── */
  function renderSpEmail(site) {
    var emailBtn = document.getElementById('spEmailBtn');
    if (emailBtn && site && site.email) {
      emailBtn.href = 'mailto:' + site.email + '?subject=スポンサーに関するお問い合わせ';
    }
  }

  function renderSponsorStats(stats) {
    var spStats = stats.sponsorPageStats || [];
    if (!spStats.length) return;
    var html = spStats.map(function (s) {
      var numHtml = s.countUp
        ? '<span class="js-count-up" data-target="' + esc(String(s.value)) + '"' +
          (s.separator ? ' data-separator' : '') + '>' + esc(String(s.value)) + '</span>'
        : esc(String(s.value));
      return (
        '<div class="stat-team-card">' +
          '<div class="stat-team-num">' +
            (s.prefix ? esc(s.prefix) : '') +
            numHtml +
            '<span class="stat-sfx">' + esc(s.suffix) + '</span>' +
          '</div>' +
          '<div class="stat-label">'  + esc(s.label) + '</div>' +
          '<div class="stat-platform">' + esc(s.en)  + '</div>' +
        '</div>'
      );
    }).join('');
    setHTML('sponsorStatsRow', html);
  }

  function renderIgStats(stats) {
    var ig = stats.instagramStats;
    if (!ig) return;
    var metaEl = document.getElementById('igStatsMeta');
    if (metaEl) {
      metaEl.innerHTML = '<span class="ig-meta-tag">' + esc(ig.label) + '</span>';
    }
    setText('igStatsDesc', ig.description || '');
    setText('igStatsFootnote', ig.footnote || '');
    var gridEl = document.getElementById('igStatsGrid');
    if (gridEl && Array.isArray(ig.items)) {
      gridEl.innerHTML = ig.items.map(function (item) {
        var numHtml;
        if (item.countUp) {
          numHtml =
            (item.prefix ? '<small>' + esc(item.prefix) + '</small>' : '') +
            '<span class="js-count-up" data-target="' + esc(String(item.value)) + '"' +
            (item.decimals ? ' data-decimals="' + esc(String(item.decimals)) + '"' : '') +
            (item.separator ? ' data-separator' : '') +
            '>' + esc(String(item.value)) + '</span>' +
            (item.suffix ? '<span class="stat-sfx">' + esc(item.suffix) + '</span>' : '');
        } else {
          numHtml = esc(item.value);
        }
        return (
          '<div class="stat-team-card">' +
            '<div class="stat-team-num">' + numHtml + '</div>' +
            '<div class="stat-label">' + esc(item.name) + '</div>' +
            '<div class="stat-platform">' + esc(item.note || '') + '</div>' +
          '</div>'
        );
      }).join('');
      if (window.DOLAX_initCountUp) window.DOLAX_initCountUp(gridEl);
    }
  }

  function renderSponsors(stats, site) {
    renderSpEmail(site);
    renderSponsorStats(stats);
    renderIgStats(stats);
  }

  /* ── メイン ── */
  function main() {
    var hasSeason   = !!document.getElementById('sloganWord') ||
                      !!document.getElementById('heroSeasonTag') ||
                      !!document.getElementById('rosterPageTitle') ||
                      !!document.getElementById('spEmailBtn');
    if (!hasSeason) return;

    var root = (typeof window.DOLAX_ROOT !== 'undefined') ? window.DOLAX_ROOT : '';

    Promise.all([
      fetch(root + 'data/season.json').then(function (r) { return r.json(); }),
      fetch(root + 'data/stats.json').then(function (r) { return r.json(); }),
      fetch(root + 'data/site.json').then(function (r) { return r.json(); }).catch(function () { return {}; })
    ]).then(function (results) {
      var season = results[0];
      var stats  = results[1];
      var site   = results[2];

      if (document.getElementById('heroSeasonTag'))  renderIndex(season, stats);
      if (document.getElementById('sloganWord'))     renderAbout(season);
      if (document.getElementById('rosterPageTitle')) renderRoster(season);
      if (document.getElementById('spEmailBtn'))     renderSponsors(stats, site);
    }).catch(function (e) {
      console.warn('[DOLAX] render-season.js: JSON 読み込み失敗。npx serve で起動してください。', e);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
