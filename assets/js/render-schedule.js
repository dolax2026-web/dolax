/* ================================================================
   render-schedule.js — data/schedule.json からカレンダーを動的生成
   ================================================================ */

(function () {

  var IG_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">' +
    '<rect x="3" y="3" width="18" height="18" rx="5"/>' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>' +
    '</svg>';

  var MONTH_JA = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW_JA   = ['日','月','火','水','木','金','土'];
  var TEAM_LABEL = { a: 'A', b: 'B', c: 'C' };
  var TEAM_LABEL_FULL = { a: 'A TEAM', b: 'B TEAM', c: 'C TEAM' };

  function esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function parseDateParts(str) {
    var p = String(str || '').split('.');
    if (p.length !== 3) return null;
    var y = parseInt(p[0],10), m = parseInt(p[1],10), d = parseInt(p[2],10);
    if (isNaN(y)||isNaN(m)||isNaN(d)) return null;
    return { y:y, m:m, d:d };
  }

  function parseDateNum(str) {
    var p = parseDateParts(str);
    return p ? p.y*10000+p.m*100+p.d : 0;
  }

  function getToday() {
    var d = new Date();
    return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  }

  /* ── index.html の NEXT GAME / LATEST RESULT を更新 ── */
  var SVG_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
  var SVG_PIN   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>';

  function renderIndexCards(matches) {
    var ngMeta    = document.getElementById('ngMeta');
    var ngMatchup = document.getElementById('ngMatchup');
    var ngSub     = document.getElementById('ngSub');
    var lrMeta    = document.getElementById('lrMeta');
    var lrMatchup = document.getElementById('lrMatchup');
    var lrSub     = document.getElementById('lrSub');
    if (!ngMeta && !lrMeta) return;

    var today = getToday();

    var upcoming = matches
      .filter(function(m){ return (m.type==='scheduled'||m.type==='result') && parseDateNum(m.date)>=today && !m.result; })
      .sort(function(a,b){ return parseDateNum(a.date)-parseDateNum(b.date); });

    var results = matches
      .filter(function(m){ return m.type==='result' || (m.type==='scheduled' && parseDateNum(m.date)<today); })
      .sort(function(a,b){ return parseDateNum(b.date)-parseDateNum(a.date); });

    if (ngMeta && upcoming.length) {
      var ng = upcoming[0];
      var catLabel = TEAM_LABEL_FULL[(ng.team||'').toLowerCase()] || (ng.team||'').toUpperCase();
      ngMeta.innerHTML =
        '<span class="mc-date">'+esc(ng.date)+(ng.dayOfWeek?' '+esc(ng.dayOfWeek):'')+' </span>'+
        '<span class="mc-cat">'+esc(catLabel)+'</span>';
      ngMatchup.innerHTML =
        '<div class="mc-team mc-team--home">同志社大学</div>'+
        '<div class="mc-center"><span class="mc-vs-text">VS</span></div>'+
        '<div class="mc-team mc-team--away">'+esc(ng.opponent)+'</div>';
      var subHtml='';
      if(ng.time)  subHtml+='<div class="mc-detail">'+SVG_CLOCK+esc(ng.time)+'</div>';
      if(ng.venue) subHtml+='<div class="mc-detail">'+SVG_PIN+esc(ng.venue)+'</div>';
      if(!ng.time&&!ng.venue) subHtml='<div class="mc-detail" style="color:rgba(255,255,255,.4)">日時・会場は決定次第掲載</div>';
      ngSub.innerHTML=subHtml;
    }

    if (lrMeta && results.length) {
      var lr = results[0];
      var lrCat = TEAM_LABEL_FULL[(lr.team||'').toLowerCase()] || (lr.team||'').toUpperCase();
      var res = (lr.result||'').toLowerCase();
      var badgeCls = res==='win'?'mc-result-badge--win':res==='draw'?'mc-result-badge--draw':'mc-result-badge--lose';
      var badgeTxt = res==='win'?'WIN':res==='draw'?'DRAW':'LOSE';
      lrMeta.innerHTML =
        '<span class="mc-date">'+esc(lr.date)+(lr.dayOfWeek?' '+esc(lr.dayOfWeek):'')+' </span>'+
        '<span class="mc-cat">'+esc(lrCat)+'</span>';
      var lrIsSpecial = lr.result && lr.result!=='win' && lr.result!=='lose' && lr.result!=='draw';
      var lrScoreHtml = lrIsSpecial
        ? '<span class="mc-vs-text">'+esc(lr.result)+'</span>'
        : '<div class="mc-score">'+
            '<span class="mc-score-num">'+(lr.homeScore!==null?lr.homeScore:'?')+'</span>'+
            '<span class="mc-score-sep">—</span>'+
            '<span class="mc-score-num">'+(lr.awayScore!==null?lr.awayScore:'?')+'</span>'+
          '</div>';
      lrMatchup.innerHTML =
        '<div class="mc-team mc-team--home">同志社大学</div>'+
        '<div class="mc-center">'+lrScoreHtml+'</div>'+
        '<div class="mc-team mc-team--away">'+esc(lr.opponent)+'</div>';
      lrSub.innerHTML='<span class="mc-result-badge '+badgeCls+'">'+badgeTxt+'</span>';
    }
  }

  /* ── カレンダー生成 ── */
  function buildCalendar(matches, currentCat) {
    var container = document.getElementById('calendar-container');
    if (!container) return;

    var filtered = currentCat === 'all'
      ? matches
      : matches.filter(function(m){ return (m.team||'').toLowerCase() === currentCat; });

    /* 試合を日付ごとにマップ */
    var byDate = {};
    filtered.forEach(function(m) {
      var key = m.date;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(m);
    });

    /* 月の範囲を取得 */
    var months = [];
    matches.forEach(function(m) {
      var p = parseDateParts(m.date);
      if (!p) return;
      var key = p.y + '-' + p.m;
      if (months.indexOf(key) === -1) months.push(key);
    });
    months.sort();

    if (!months.length) {
      container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);">試合データがありません</div>';
      return;
    }

    var today = getToday();
    var html = '';

    months.forEach(function(mk) {
      var parts = mk.split('-');
      var y = parseInt(parts[0],10);
      var m = parseInt(parts[1],10);

      html += '<div class="cal-month">';
      html += '<div class="cal-month-title">';
      html += '<span class="cal-month-ja">'+MONTH_JA[m-1]+'</span>';
      html += '<span class="cal-month-en">'+MONTH_EN[m-1]+' '+y+'</span>';
      html += '</div>';

      html += '<div class="cal-grid">';

      /* 曜日ヘッダー */
      DOW_JA.forEach(function(dow, i) {
        var cls = i===0?' cal-dow-sun':i===6?' cal-dow-sat':'';
        html += '<div class="cal-dow'+cls+'">'+dow+'</div>';
      });

      /* 月初の曜日 */
      var firstDay = new Date(y, m-1, 1).getDay();
      for (var i=0; i<firstDay; i++) {
        html += '<div class="cal-cell cal-cell--empty"></div>';
      }

      /* 日付セル */
      var daysInMonth = new Date(y, m, 0).getDate();
      for (var d=1; d<=daysInMonth; d++) {
        var dateStr = y + '.' + m + '.' + (d < 10 ? '0'+d : d);
        var dateNum = y*10000+m*100+d;
        var dow = new Date(y, m-1, d).getDay();
        var cellClass = 'cal-cell';
        if (dow === 0) cellClass += ' cal-cell--sun';
        if (dow === 6) cellClass += ' cal-cell--sat';
        if (dateNum === today) cellClass += ' cal-cell--today';

        html += '<div class="'+cellClass+'">';
        html += '<div class="cal-day">'+(d<10?'0'+d:d)+'</div>';

        /* その日の試合 */
        var dayMatches = byDate[dateStr] || [];
        dayMatches.forEach(function(match) {
          var team = (match.team||'').toLowerCase();
          var res = (match.result||'').toLowerCase();
          var isResult = match.type === 'result';
          var isSpecial = match.result && res!=='win' && res!=='lose' && res!=='draw';

          var evClass = 'cal-event cal-event--'+team;
          if (isResult) {
            if (res==='win') evClass += ' cal-event--win';
            else if (isSpecial) evClass += ' cal-event--cancel';
            else evClass += ' cal-event--lose';
          }

          var label = TEAM_LABEL[team]||team.toUpperCase();
          var scoreText = '';
          if (isResult && !isSpecial) {
            scoreText = ' '+match.homeScore+'-'+match.awayScore;
          } else if (isSpecial) {
            scoreText = ' '+match.result;
          }

          html += '<div class="'+evClass+'" title="'+esc(match.opponent)+'">';
          html += '<span class="cal-event-team">'+label+'</span>';
          html += '<span class="cal-event-name">'+esc(match.opponent)+scoreText+'</span>';
          html += '</div>';
        });

        html += '</div>';
      }

      /* 月末の空白 */
      var lastDay = new Date(y, m-1, daysInMonth).getDay();
      for (var j=lastDay+1; j<7; j++) {
        html += '<div class="cal-cell cal-cell--empty"></div>';
      }

      html += '</div>';
      html += '</div>';
    });

    container.innerHTML = html;
  }

  /* ── メインレンダリング ── */
  function render(matches) {
    renderIndexCards(matches);

    var container = document.getElementById('calendar-container');
    if (!container) return;

    var currentCat = 'all';

    buildCalendar(matches, currentCat);

    /* カテゴリタブ */
    document.querySelectorAll('.cat-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.cat-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        currentCat = btn.dataset.cat || 'all';
        buildCalendar(matches, currentCat);
      });
    });

    if (typeof filterGames === 'function') filterGames();
  }

  function loadSchedule() {
    fetch('data/schedule.json')
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(data){
        var matches = Array.isArray(data) ? data : (data.matches || []);
        render(matches);
      })
      .catch(function(){
        var c = document.getElementById('calendar-container');
        if (c) c.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);">データを読み込めませんでした。</div>';
      });
  }

  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded', loadSchedule);
  } else {
    loadSchedule();
  }
})();
