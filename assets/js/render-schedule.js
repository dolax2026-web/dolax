(function () {
  var MONTH_JA = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var MONTH_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var DOW_JA   = ['日','月','火','水','木','金','土'];
  var TEAM_LABEL_FULL = { a:'A TEAM', b:'B TEAM', c:'C TEAM' };
  var SVG_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
  var SVG_PIN   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  var SVG_IG    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>';

  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function parseDateParts(str){var p=String(str||'').split('.');if(p.length!==3)return null;var y=parseInt(p[0],10),m=parseInt(p[1],10),d=parseInt(p[2],10);if(isNaN(y)||isNaN(m)||isNaN(d))return null;return{y:y,m:m,d:d};}
  function parseDateNum(str){var p=parseDateParts(str);return p?p.y*10000+p.m*100+p.d:0;}
  function getToday(){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}

  /* index.html カード更新 */
  function renderIndexCards(matches){
    var ngMeta=document.getElementById('ngMeta'),ngMatchup=document.getElementById('ngMatchup'),ngSub=document.getElementById('ngSub');
    var lrMeta=document.getElementById('lrMeta'),lrMatchup=document.getElementById('lrMatchup'),lrSub=document.getElementById('lrSub');
    if(!ngMeta&&!lrMeta)return;
    var today=getToday();
    var upcoming=matches.filter(function(m){return(m.type==='scheduled'||m.type==='result')&&parseDateNum(m.date)>=today&&!m.result;}).sort(function(a,b){return parseDateNum(a.date)-parseDateNum(b.date);});
    var results=matches.filter(function(m){return m.type==='result'||(m.type==='scheduled'&&parseDateNum(m.date)<today);}).sort(function(a,b){return parseDateNum(b.date)-parseDateNum(a.date);});
    if(ngMeta&&upcoming.length){var ng=upcoming[0];var cL=TEAM_LABEL_FULL[(ng.team||'').toLowerCase()]||(ng.team||'').toUpperCase();ngMeta.innerHTML='<span class="mc-date">'+esc(ng.date)+(ng.dayOfWeek?' '+esc(ng.dayOfWeek):'')+' </span><span class="mc-cat">'+esc(cL)+'</span>';ngMatchup.innerHTML='<div class="mc-team mc-team--home">同志社大学</div><div class="mc-center"><span class="mc-vs-text">VS</span></div><div class="mc-team mc-team--away">'+esc(ng.opponent)+'</div>';var s='';if(ng.time)s+=SVG_CLOCK+esc(ng.time);if(ng.venue)s+=' '+SVG_PIN+esc(ng.venue);ngSub.innerHTML=s?'<div class="mc-detail">'+s+'</div>':'<div class="mc-detail" style="opacity:.4">日時・会場は決定次第掲載</div>';}
    if(lrMeta&&results.length){var lr=results[0];var lrC=TEAM_LABEL_FULL[(lr.team||'').toLowerCase()]||(lr.team||'').toUpperCase();var res=(lr.result||'').toLowerCase();var bCls=res==='win'?'mc-result-badge--win':res==='draw'?'mc-result-badge--draw':'mc-result-badge--lose';lrMeta.innerHTML='<span class="mc-date">'+esc(lr.date)+(lr.dayOfWeek?' '+esc(lr.dayOfWeek):'')+' </span><span class="mc-cat">'+esc(lrC)+'</span>';var lrSp=lr.result&&res!=='win'&&res!=='lose'&&res!=='draw';var lrSc=lrSp?'<span class="mc-vs-text">'+esc(lr.result)+'</span>':'<div class="mc-score"><span class="mc-score-num">'+(lr.homeScore!==null?lr.homeScore:'?')+'</span><span class="mc-score-sep">—</span><span class="mc-score-num">'+(lr.awayScore!==null?lr.awayScore:'?')+'</span></div>';lrMatchup.innerHTML='<div class="mc-team mc-team--home">同志社大学</div><div class="mc-center">'+lrSc+'</div><div class="mc-team mc-team--away">'+esc(lr.opponent)+'</div>';lrSub.innerHTML='<span class="mc-result-badge '+bCls+'">WIN'==='WIN'?bCls.includes('win')?'WIN':bCls.includes('draw')?'DRAW':'LOSE':'LOSE'+'</span>';}
  }

  /* ポップアップ */
  function showPopup(match){
    var overlay=document.getElementById('sc-popup-overlay');
    if(!overlay)return;
    var team=(match.team||'').toLowerCase();
    var res=(match.result||'').toLowerCase();
    var isResult=match.type==='result';
    var isSpecial=match.result&&res!=='win'&&res!=='lose'&&res!=='draw';
    var badgeHtml='';
    if(isResult){if(res==='win')badgeHtml='<span class="badge-result badge-win">WIN</span>';else if(res==='draw')badgeHtml='<span class="badge-result badge-draw">DRAW</span>';else if(isSpecial)badgeHtml='<span class="badge-result badge-cancel">'+esc(match.result)+'</span>';else badgeHtml='<span class="badge-result badge-lose">LOSE</span>';}else{badgeHtml='<span class="badge-result badge-tbd">TBD</span>';}
    var teamBadge='';
    if(team==='a')teamBadge='<span class="card-team-badge card-team-badge--a">A TEAM</span>';
    else if(team==='b')teamBadge='<span class="card-team-badge card-team-badge--b">B TEAM</span>';
    else if(team==='c')teamBadge='<span class="card-team-badge card-team-badge--c">C TEAM</span>';
    var scoreHtml='';
    if(isResult){if(isSpecial)scoreHtml='<div class="score-row"><span class="score-special">'+esc(match.result)+'</span></div>';else scoreHtml='<div class="score-row"><span class="score-num">'+(match.homeScore!==null?match.homeScore:'?')+'</span><span class="score-sep">—</span><span class="score-num">'+(match.awayScore!==null?match.awayScore:'?')+'</span></div>';}else{scoreHtml='<div class="score-row"><span class="score-vs">VS</span></div>';}
    var infoHtml='';
    if(match.time)infoHtml+='<div class="popup-info-row">'+SVG_CLOCK+' '+esc(match.time)+'</div>';
    if(match.venue)infoHtml+='<div class="popup-info-row">'+SVG_PIN+' '+esc(match.venue)+'</div>';
    var igHtml=match.instagramUrl?'<a class="popup-ig" href="'+esc(match.instagramUrl)+'" target="_blank" rel="noopener">'+SVG_IG+' Instagram投稿を見る</a>':'';
    document.getElementById('sc-popup-inner').innerHTML=
      '<div class="popup-head"><div class="popup-head-left">'+badgeHtml+' '+teamBadge+'</div><div class="popup-head-right"><span class="card-date">'+esc(match.date)+(match.dayOfWeek?' '+esc(match.dayOfWeek):'')+' </span></div></div>'+
      '<div class="popup-body"><div class="card-team card-home"><div class="team-name"><span class="card-du-name">同志社大学</span></div></div><div class="card-score">'+scoreHtml+'</div><div class="card-team card-away"><div class="team-name">'+esc(match.opponent)+'</div></div></div>'+
      (infoHtml?'<div class="popup-info">'+infoHtml+'</div>':'')+
      (igHtml?'<div class="popup-foot">'+igHtml+'</div>':'');
    overlay.classList.add('is-active');
  }
  function hidePopup(){var o=document.getElementById('sc-popup-overlay');if(o)o.classList.remove('is-active');}

  /* カレンダー描画 */
  var _allMatches=[], _currentCat='all', _currentIdx=0, _months=[];

  function buildCalendar(){
    var container=document.getElementById('calendar-container');
    if(!container||!_months.length)return;
    var mk=_months[_currentIdx];
    var parts=mk.split('-');
    var y=parseInt(parts[0],10), m=parseInt(parts[1],10);
    var filtered=_currentCat==='all'?_allMatches:_allMatches.filter(function(m2){return(m2.team||'').toLowerCase()===_currentCat;});
    var byDate={};
    filtered.forEach(function(match){if(!byDate[match.date])byDate[match.date]=[];byDate[match.date].push(match);});
    var today=getToday();
    var daysInMonth=new Date(y,m,0).getDate();
    var firstDay=new Date(y,m-1,1).getDay();
    var lastDay=new Date(y,m-1,daysInMonth).getDay();

    /* カウンター */
    var totalGames=filtered.filter(function(m2){var p=parseDateParts(m2.date);return p&&p.y===y&&p.m===m;}).length;

    var html='';

    /* ヘッダー */
    html+='<div class="cal-header">';
    html+='<button class="cal-nav-btn" id="cal-prev"'+((_currentIdx===0)?' disabled':'')+'>';
    html+='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M15 18l-6-6 6-6"/></svg>';
    html+='</button>';
    html+='<div class="cal-header-center">';
    html+='<div class="cal-month-main">'+MONTH_JA[m-1]+'<span class="cal-year-sub">'+y+'</span></div>';
    html+='<div class="cal-month-en">'+MONTH_EN[m-1]+'</div>';
    html+=(totalGames>0?'<div class="cal-game-count">'+totalGames+'試合</div>':'<div class="cal-game-count" style="opacity:.4">試合なし</div>');
    html+='</div>';
    html+='<button class="cal-nav-btn" id="cal-next"'+((_currentIdx===_months.length-1)?' disabled':'')+'>';
    html+='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M9 18l6-6-6-6"/></svg>';
    html+='</button>';
    html+='</div>';

    /* 月インジケーター */
    html+='<div class="cal-month-dots">';
    _months.forEach(function(mk2,i){
      var p2=mk2.split('-');
      html+='<button class="cal-dot'+(i===_currentIdx?' cal-dot--active':'')+'" data-idx="'+i+'" title="'+parseInt(p2[1],10)+'月"></button>';
    });
    html+='</div>';

    /* 曜日 */
    html+='<div class="cal-grid">';
    DOW_JA.forEach(function(dow,i){
      html+='<div class="cal-dow'+(i===0?' cal-dow-sun':i===6?' cal-dow-sat':'')+'">'+dow+'</div>';
    });

    /* 空白 */
    for(var i=0;i<firstDay;i++) html+='<div class="cal-cell cal-cell--empty"></div>';

    /* 日付 */
    for(var d=1;d<=daysInMonth;d++){
      var dd=d<10?'0'+d:String(d);
      var dateStr=y+'.'+m+'.'+dd;
      var dateNum=y*10000+m*100+d;
      var dow=new Date(y,m-1,d).getDay();
      var cc='cal-cell';
      if(dow===0)cc+=' cal-cell--sun';
      if(dow===6)cc+=' cal-cell--sat';
      if(dateNum===today)cc+=' cal-cell--today';
      var dayMatches=byDate[dateStr]||[];
      if(dayMatches.length)cc+=' cal-cell--has-game';
      html+='<div class="'+cc+'">';
      html+='<div class="cal-day-num">'+d+'</div>';
      dayMatches.forEach(function(match){
        var t=(match.team||'').toLowerCase();
        var r=(match.result||'').toLowerCase();
        var isSp=match.result&&r!=='win'&&r!=='lose'&&r!=='draw';
        var evClass='cal-event cal-event--'+t;
        if(match.type==='result'){if(r==='win')evClass+=' cal-event--win';else if(isSp)evClass+=' cal-event--cancel';else evClass+=' cal-event--lose';}
        html+='<div class="'+evClass+'" data-match="'+esc(JSON.stringify(match))+'">';
        html+='<span class="cal-ev-team">'+t.toUpperCase()+'</span>';
        html+='<span class="cal-ev-name">'+esc(match.opponent)+'</span>';
        html+='</div>';
      });
      html+='</div>';
    }
    for(var j=lastDay+1;j<7;j++) html+='<div class="cal-cell cal-cell--empty"></div>';
    html+='</div>';

    /* 今月の試合リスト */
    var monthMatches=filtered.filter(function(m2){var p=parseDateParts(m2.date);return p&&p.y===y&&p.m===m;}).sort(function(a,b){return parseDateNum(a.date)-parseDateNum(b.date);});
    if(monthMatches.length){
      html+='<div class="cal-list">';
      html+='<div class="cal-list-title">今月の試合</div>';
      monthMatches.forEach(function(match){
        var t=(match.team||'').toLowerCase();
        var r=(match.result||'').toLowerCase();
        var isResult=match.type==='result';
        var isSpecial=match.result&&r!=='win'&&r!=='lose'&&r!=='draw';
        var p=parseDateParts(match.date);
        var dow2=p?DOW_JA[new Date(p.y,p.m-1,p.d).getDay()]:'';
        var resultBadge='';
        if(isResult){if(r==='win')resultBadge='<span class="list-badge list-badge--win">WIN</span>';else if(r==='draw')resultBadge='<span class="list-badge list-badge--draw">DRAW</span>';else if(isSpecial)resultBadge='<span class="list-badge list-badge--cancel">'+esc(match.result)+'</span>';else resultBadge='<span class="list-badge list-badge--lose">LOSE</span>';}else{resultBadge='<span class="list-badge list-badge--tbd">TBD</span>';}
        var scoreStr='';
        if(isResult&&!isSpecial) scoreStr='<span class="list-score">'+match.homeScore+' — '+match.awayScore+'</span>';
        html+='<div class="cal-list-item" data-match="'+esc(JSON.stringify(match))+'">';
        html+='<div class="list-date"><span class="list-day">'+p.d+'</span><span class="list-dow">'+dow2+'</span></div>';
        html+='<div class="list-team-badge list-team-'+t+'">'+t.toUpperCase()+'</div>';
        html+='<div class="list-info"><div class="list-opponent">vs '+esc(match.opponent)+'</div>'+(match.venue?'<div class="list-venue">'+esc(match.venue)+'</div>':'')+'</div>';
        html+='<div class="list-right">'+resultBadge+scoreStr+'</div>';
        html+='</div>';
      });
      html+='</div>';
    }

    container.innerHTML=html;

    document.getElementById('cal-prev')&&document.getElementById('cal-prev').addEventListener('click',function(){if(_currentIdx>0){_currentIdx--;buildCalendar();}});
    document.getElementById('cal-next')&&document.getElementById('cal-next').addEventListener('click',function(){if(_currentIdx<_months.length-1){_currentIdx++;buildCalendar();}});
    container.querySelectorAll('.cal-dot').forEach(function(dot){dot.addEventListener('click',function(){_currentIdx=parseInt(dot.getAttribute('data-idx'),10);buildCalendar();});});
    container.querySelectorAll('[data-match]').forEach(function(el){el.addEventListener('click',function(){try{showPopup(JSON.parse(el.getAttribute('data-match')));}catch(e){}});});
  }

  function render(matches){
    renderIndexCards(matches);
    var container=document.getElementById('calendar-container');
    if(!container)return;
    _allMatches=matches;
    var monthSet={};
    matches.forEach(function(m){var p=parseDateParts(m.date);if(!p)return;var key=p.y+'-'+p.m;monthSet[key]=true;});
    _months=Object.keys(monthSet).sort();
    if(!_months.length){container.innerHTML='<div style="padding:40px;text-align:center;">試合データがありません</div>';return;}
    var today=getToday();
    var tY=Math.floor(today/10000),tM=Math.floor((today%10000)/100);
    var tKey=tY+'-'+tM;
    _currentIdx=_months.indexOf(tKey);
    if(_currentIdx<0)_currentIdx=0;
    _currentCat='all';
    buildCalendar();
    document.querySelectorAll('.cat-btn').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.cat-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');_currentCat=btn.dataset.cat||'all';buildCalendar();});});
    var overlay=document.getElementById('sc-popup-overlay');
    if(overlay){overlay.addEventListener('click',function(e){if(e.target===overlay)hidePopup();});}
    var closeBtn=document.getElementById('sc-popup-close');
    if(closeBtn)closeBtn.addEventListener('click',hidePopup);
  }

  function loadSchedule(){
    fetch('data/schedule.json')
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
      .then(function(data){render(Array.isArray(data)?data:(data.matches||[]));})
      .catch(function(){var c=document.getElementById('calendar-container');if(c)c.innerHTML='<div style="padding:40px;text-align:center;">データを読み込めませんでした。</div>';});
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',loadSchedule);}else{loadSchedule();}
})();
