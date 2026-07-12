(function () {
  var MONTH_JA = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var MONTH_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var DOW_JA   = ['日','月','火','水','木','金','土'];
  var TEAM_FULL = { a:'A TEAM', b:'B TEAM', c:'C TEAM', f:'FRESHMAN' };
  var SVG_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
  var SVG_PIN   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  var SVG_IG    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>';

  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function parseDateParts(str){
    var p=String(str||'').split('.');
    if(p.length!==3)return null;
    var y=parseInt(p[0],10),m=parseInt(p[1],10),d=parseInt(p[2],10);
    if(isNaN(y)||isNaN(m)||isNaN(d))return null;
    return{y:y,m:m,d:d};
  }

  function parseDateNum(str){
    var p=parseDateParts(str);
    return p?p.y*10000+p.m*100+p.d:0;
  }

  function getToday(){
    var d=new Date();
    return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  }

  /* ── index.html NEXT GAME / LATEST RESULT ── */
  function renderIndexCards(matches){
    var ngMeta    = document.getElementById('ngMeta');
    var ngMatchup = document.getElementById('ngMatchup');
    var ngSub     = document.getElementById('ngSub');
    var lrMeta    = document.getElementById('lrMeta');
    var lrMatchup = document.getElementById('lrMatchup');
    var lrSub     = document.getElementById('lrSub');
    if(!ngMeta && !lrMeta) return;

    var today = getToday();

    /* NEXT GAME: 今日以降でresultが空のもの */
    var upcoming = matches
      .filter(function(m){ return parseDateNum(m.date) >= today && !m.result; })
      .sort(function(a,b){ return parseDateNum(a.date) - parseDateNum(b.date); });

    /* LATEST RESULT: resultがある、または日付が過ぎたもの */
    var results = matches
      .filter(function(m){ return m.result || parseDateNum(m.date) < today; })
      .sort(function(a,b){ return parseDateNum(b.date) - parseDateNum(a.date); });

    if(ngMeta && upcoming.length){
      var ng = upcoming[0];
      var ngCat = TEAM_FULL[(ng.team||'').toLowerCase()] || (ng.team||'').toUpperCase();
      ngMeta.innerHTML = '<span class="mc-date">'+esc(ng.date)+(ng.dayOfWeek?' '+esc(ng.dayOfWeek):'')+' </span><span class="mc-cat">'+esc(ngCat)+'</span>';
      ngMatchup.innerHTML = '<div class="mc-team mc-team--home">同志社大学</div><div class="mc-center"><span class="mc-vs-text">VS</span></div><div class="mc-team mc-team--away">'+esc(ng.opponent)+'</div>';
      var s='';
      if(ng.time)  s+=SVG_CLOCK+' '+esc(ng.time);
      if(ng.venue) s+=(s?' ':'')+SVG_PIN+' '+esc(ng.venue);
      ngSub.innerHTML = s ? '<div class="mc-detail">'+s+'</div>' : '<div class="mc-detail" style="opacity:.4">日時・会場は決定次第掲載</div>';
    }

    if(lrMeta && results.length){
      var lr = results[0];
      var lrCat = TEAM_FULL[(lr.team||'').toLowerCase()] || (lr.team||'').toUpperCase();
      var res = (lr.result||'').toLowerCase();
      var isWin  = res === 'win';
      var isDraw = res === 'draw';
      var isLose = res === 'lose';
      var isSpecial = lr.result && !isWin && !isDraw && !isLose;

      var badgeCls = isWin ? 'mc-result-badge--win' : isDraw ? 'mc-result-badge--draw' : 'mc-result-badge--lose';
      var badgeTxt = isWin ? 'WIN' : isDraw ? 'DRAW' : isSpecial ? esc(lr.result) : 'LOSE';

      lrMeta.innerHTML = '<span class="mc-date">'+esc(lr.date)+(lr.dayOfWeek?' '+esc(lr.dayOfWeek):'')+' </span><span class="mc-cat">'+esc(lrCat)+'</span>';

      var lrScore;
      if(isSpecial){
        lrScore = '<span class="mc-vs-text">'+esc(lr.result)+'</span>';
      } else {
        lrScore = '<div class="mc-score"><span class="mc-score-num">'+(lr.homeScore!==null?lr.homeScore:'?')+'</span><span class="mc-score-sep">—</span><span class="mc-score-num">'+(lr.awayScore!==null?lr.awayScore:'?')+'</span></div>';
      }
      lrMatchup.innerHTML = '<div class="mc-team mc-team--home">同志社大学</div><div class="mc-center">'+lrScore+'</div><div class="mc-team mc-team--away">'+esc(lr.opponent)+'</div>';
      lrSub.innerHTML = '<span class="mc-result-badge '+badgeCls+'">'+badgeTxt+'</span>';
    }
  }

  /* ── ポップアップ ── */
  function showPopup(match){
    var overlay = document.getElementById('sc-popup-overlay');
    if(!overlay) return;
    var team = (match.team||'').toLowerCase();
    var res  = (match.result||'').toLowerCase();
    var isWin  = res==='win';
    var isDraw = res==='draw';
    var isLose = res==='lose';
    var isResult  = match.type==='result' || !!match.result;
    var isSpecial = match.result && !isWin && !isDraw && !isLose;

    var badgeHtml;
    if(!isResult) badgeHtml='<span class="badge-result badge-tbd">TBD</span>';
    else if(isWin)  badgeHtml='<span class="badge-result badge-win">WIN</span>';
    else if(isDraw) badgeHtml='<span class="badge-result badge-draw">DRAW</span>';
    else if(isSpecial) badgeHtml='<span class="badge-result badge-cancel">'+esc(match.result)+'</span>';
    else badgeHtml='<span class="badge-result badge-lose">LOSE</span>';

    var teamBadge='';
    if(team==='a') teamBadge='<span class="card-team-badge card-team-badge--a">A TEAM</span>';
    else if(team==='b') teamBadge='<span class="card-team-badge card-team-badge--b">B TEAM</span>';
    else if(team==='c') teamBadge='<span class="card-team-badge card-team-badge--c">C TEAM</span>';
    else if(team==='f') teamBadge='<span class="card-team-badge card-team-badge--f">FRESHMAN</span>';

    var scoreHtml;
    if(!isResult) scoreHtml='<div class="score-row"><span class="score-vs">VS</span></div>';
    else if(isSpecial) scoreHtml='<div class="score-row"><span class="score-special">'+esc(match.result)+'</span></div>';
    else scoreHtml='<div class="score-row"><span class="score-num">'+(match.homeScore!==null?match.homeScore:'?')+'</span><span class="score-sep">—</span><span class="score-num">'+(match.awayScore!==null?match.awayScore:'?')+'</span></div>';

    var infoHtml='';
    if(match.time)  infoHtml+='<div class="popup-info-row">'+SVG_CLOCK+' '+esc(match.time)+'</div>';
    if(match.venue) infoHtml+='<div class="popup-info-row">'+SVG_PIN+' '+esc(match.venue)+'</div>';
    var igHtml = match.instagramUrl ? '<a class="popup-ig" href="'+esc(match.instagramUrl)+'" target="_blank" rel="noopener">'+SVG_IG+' Instagram投稿を見る</a>' : '';

    document.getElementById('sc-popup-inner').innerHTML =
      '<div class="popup-head"><div class="popup-head-left">'+badgeHtml+' '+teamBadge+'</div><div class="popup-head-right"><span class="card-date">'+esc(match.date)+(match.dayOfWeek?' '+esc(match.dayOfWeek):'')+'</span></div></div>'+
      '<div class="popup-body"><div class="card-team card-home"><div class="team-name"><span class="card-du-name">同志社大学</span></div></div><div class="card-score">'+scoreHtml+'</div><div class="card-team card-away"><div class="team-name">'+esc(match.opponent)+'</div></div></div>'+
      (infoHtml?'<div class="popup-info">'+infoHtml+'</div>':'')+
      (igHtml?'<div class="popup-foot">'+igHtml+'</div>':'');

    overlay.classList.add('is-active');
  }

  function hidePopup(){
    var o=document.getElementById('sc-popup-overlay');
    if(o) o.classList.remove('is-active');
  }

  /* ── カレンダー ── */
  var _matches=[], _cat='all', _idx=0, _months=[];

  function buildCalendar(){
    var container=document.getElementById('calendar-container');
    if(!container||!_months.length) return;

    var mk=_months[_idx];
    var parts=mk.split('-');
    var y=parseInt(parts[0],10), m=parseInt(parts[1],10);

    var filtered = _cat==='all' ? _matches : _matches.filter(function(m2){ return (m2.team||'').toLowerCase()===_cat; });

    var byDate={};
    filtered.forEach(function(match){ if(!byDate[match.date]) byDate[match.date]=[]; byDate[match.date].push(match); });

    var today=getToday();
    var daysInMonth=new Date(y,m,0).getDate();
    var firstDay=new Date(y,m-1,1).getDay();
    var lastDay=new Date(y,m-1,daysInMonth).getDay();
    var monthMatches=filtered.filter(function(m2){ var p=parseDateParts(m2.date); return p&&p.y===y&&p.m===m; });

    var html='';

    /* ヘッダー */
    html+='<div class="cal-header">';
    html+='<button class="cal-nav-btn" id="cal-prev"'+(_idx===0?' disabled':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M15 18l-6-6 6-6"/></svg></button>';
    html+='<div class="cal-header-center">';
    html+='<div class="cal-month-main">'+MONTH_JA[m-1]+'<span class="cal-year-sub">'+y+'</span></div>';
    html+='<div class="cal-month-en">'+MONTH_EN[m-1]+'</div>';
    html+=(monthMatches.length?'<div class="cal-game-count">'+monthMatches.length+'試合</div>':'<div class="cal-game-count" style="opacity:.4">試合なし</div>');
    html+='</div>';
    html+='<button class="cal-nav-btn" id="cal-next"'+(_idx===_months.length-1?' disabled':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M9 18l6-6-6-6"/></svg></button>';
    html+='</div>';

    /* ドット */
    html+='<div class="cal-month-dots">';
    _months.forEach(function(mk2,i){
      var p2=mk2.split('-');
      html+='<button class="cal-dot'+(i===_idx?' cal-dot--active':'')+'" data-idx="'+i+'" title="'+parseInt(p2[1],10)+'月"></button>';
    });
    html+='</div>';

    /* 曜日 */
    html+='<div class="cal-grid">';
    DOW_JA.forEach(function(dow,i){ html+='<div class="cal-dow'+(i===0?' cal-dow-sun':i===6?' cal-dow-sat':'')+'">'+dow+'</div>'; });

    /* 空白 */
    for(var i=0;i<firstDay;i++) html+='<div class="cal-cell cal-cell--empty"></div>';

    /* 日付 */
    for(var d=1;d<=daysInMonth;d++){
      var dd=d<10?'0'+d:String(d);
      var dateStr=y+'.'+m+'.'+dd;
      var dateNum=y*10000+m*100+d;
      var dow=new Date(y,m-1,d).getDay();
      var cc='cal-cell';
      if(dow===0) cc+=' cal-cell--sun';
      if(dow===6) cc+=' cal-cell--sat';
      if(dateNum===today) cc+=' cal-cell--today';
      var dayM=byDate[dateStr]||[];
      if(dayM.length) cc+=' cal-cell--has-game';
      html+='<div class="'+cc+'"><div class="cal-day-num">'+d+'</div>';
      dayM.forEach(function(match){
        var t=(match.team||'').toLowerCase();
        var r=(match.result||'').toLowerCase();
        var isSp=match.result&&r!=='win'&&r!=='lose'&&r!=='draw';
        var ec='cal-event cal-event--'+t;
        if(match.result){ if(r==='win') ec+=' cal-event--win'; else if(isSp) ec+=' cal-event--cancel'; else ec+=' cal-event--lose'; }
        html+='<div class="'+ec+'" data-match="'+esc(JSON.stringify(match))+'"><span class="cal-ev-team">'+t.toUpperCase()+'</span><span class="cal-ev-name">'+esc(match.opponent)+'</span></div>';
      });
      html+='</div>';
    }
    for(var j=lastDay+1;j<7;j++) html+='<div class="cal-cell cal-cell--empty"></div>';
    html+='</div>';

    /* 試合リスト */
    var sortedMonthMatches=monthMatches.sort(function(a,b){ return parseDateNum(a.date)-parseDateNum(b.date); });
    if(sortedMonthMatches.length){
      html+='<div class="cal-list"><div class="cal-list-title">今月の試合</div>';
      sortedMonthMatches.forEach(function(match){
        var t=(match.team||'').toLowerCase();
        var r=(match.result||'').toLowerCase();
        var isWin2=r==='win', isDraw2=r==='draw', isLose2=r==='lose';
        var isSp2=match.result&&!isWin2&&!isDraw2&&!isLose2;
        var p2=parseDateParts(match.date);
        var dow2=p2?DOW_JA[new Date(p2.y,p2.m-1,p2.d).getDay()]:'';
        var rb='';
        if(!match.result) rb='<span class="list-badge list-badge--tbd">TBD</span>';
        else if(isWin2)   rb='<span class="list-badge list-badge--win">WIN</span>';
        else if(isDraw2)  rb='<span class="list-badge list-badge--draw">DRAW</span>';
        else if(isSp2)    rb='<span class="list-badge list-badge--cancel">'+esc(match.result)+'</span>';
        else              rb='<span class="list-badge list-badge--lose">LOSE</span>';
        var sc2=(!isSp2&&match.result)?'<span class="list-score">'+match.homeScore+' — '+match.awayScore+'</span>':'';
        var venueTime='';
        if(match.time)  venueTime+=esc(match.time);
        if(match.venue) venueTime+=(venueTime?' · ':'')+esc(match.venue);
        html+='<div class="cal-list-item" data-match="'+esc(JSON.stringify(match))+'"><div class="list-date"><span class="list-day">'+(p2?p2.d:'')+'</span><span class="list-dow">'+dow2+'</span></div><div class="list-team-badge list-team-'+t+'">'+t.toUpperCase()+'</div><div class="list-info"><div class="list-opponent">vs '+esc(match.opponent)+'</div>'+(venueTime?'<div class="list-venue">'+venueTime+'</div>':'')+'</div><div class="list-right">'+rb+sc2+'</div></div>';
      });
      html+='</div>';
    }

    container.innerHTML=html;

    document.getElementById('cal-prev')&&document.getElementById('cal-prev').addEventListener('click',function(){ if(_idx>0){_idx--;buildCalendar();} });
    document.getElementById('cal-next')&&document.getElementById('cal-next').addEventListener('click',function(){ if(_idx<_months.length-1){_idx++;buildCalendar();} });
    container.querySelectorAll('.cal-dot').forEach(function(dot){ dot.addEventListener('click',function(){ _idx=parseInt(dot.getAttribute('data-idx'),10); buildCalendar(); }); });
    container.querySelectorAll('[data-match]').forEach(function(el){ el.addEventListener('click',function(){ try{ showPopup(JSON.parse(el.getAttribute('data-match'))); }catch(e){} }); });
  }

  function render(matches){
    renderIndexCards(matches);
    var container=document.getElementById('calendar-container');
    if(!container) return;
    _matches=matches;
    var monthSet={};
    matches.forEach(function(m){ var p=parseDateParts(m.date); if(!p)return; var key=p.y+'-'+p.m; monthSet[key]=true; });
    _months=Object.keys(monthSet).sort();
    if(!_months.length){ container.innerHTML='<div style="padding:40px;text-align:center;">試合データがありません</div>'; return; }
    var today=getToday();
    var tY=Math.floor(today/10000), tM=Math.floor((today%10000)/100);
    var tKey=tY+'-'+tM;
    _idx=_months.indexOf(tKey);
    if(_idx<0) _idx=0;
    _cat='all';
    buildCalendar();
    document.querySelectorAll('.cat-btn').forEach(function(btn){ btn.addEventListener('click',function(){ document.querySelectorAll('.cat-btn').forEach(function(b){ b.classList.remove('active'); }); btn.classList.add('active'); _cat=btn.dataset.cat||'all'; buildCalendar(); }); });
    var overlay=document.getElementById('sc-popup-overlay');
    if(overlay){ overlay.addEventListener('click',function(e){ if(e.target===overlay) hidePopup(); }); }
    var closeBtn=document.getElementById('sc-popup-close');
    if(closeBtn) closeBtn.addEventListener('click',hidePopup);
  }

  function loadSchedule(){
    fetch('data/schedule.json')
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(data){ render(Array.isArray(data)?data:(data.matches||[])); })
      .catch(function(){ var c=document.getElementById('calendar-container'); if(c) c.innerHTML='<div style="padding:40px;text-align:center;">データを読み込めませんでした。</div>'; });
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',loadSchedule); }else{ loadSchedule(); }
})();
