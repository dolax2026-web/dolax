var currentSection = 'players';
var currentYear = 'all';

function applyFilter() {
  var vis = 0;
  document.querySelectorAll('.player-card').forEach(function (card) {
    var isStaff  = card.classList.contains('staff-card');
    var isCoach  = card.classList.contains('coach-card');
    var isPlayer = !isStaff && !isCoach;
    var show = false;
    if      (currentSection === 'players' && isPlayer) show = true;
    else if (currentSection === 'staff'   && isStaff)  show = true;
    else if (currentSection === 'coaches' && isCoach)  show = true;
    card.classList.toggle('is-hidden', !show);
    if (show) vis++;
  });
  document.querySelectorAll('.year-group-header').forEach(function (hdr) {
    hdr.classList.toggle('is-hidden', currentSection !== 'players');
  });
  var visEl = document.getElementById('visCount');
  if (visEl) visEl.textContent = vis;

  var params = new URLSearchParams(window.location.search);
  params.set('section', currentSection);
  params.set('year', 'all');
  history.replaceState(null, '', '?' + params.toString());
}

function switchTab(section, btn) {
  currentSection = section;
  currentYear = 'all';
  document.querySelectorAll('.stab').forEach(function (t) { t.classList.remove('active'); });
  btn.classList.add('active');
  applyFilter();
}

function restoreState() {
  var params = new URLSearchParams(window.location.search);
  var section = params.get('section') || 'players';
  var slug    = params.get('from') || '';

  currentSection = section;

 document.querySelectorAll('.stab').forEach(function (btn) {
  if (btn.dataset.section === section) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
});

  applyFilter();

  if (slug) {
    setTimeout(function () {
      var card = document.querySelector('a[href*="slug=' + slug + '"]');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }
}

document.querySelectorAll('.stab').forEach(function (btn) {
  btn.addEventListener('click', function () {
    switchTab(btn.dataset.section, btn);
  });
});

window.addEventListener('rosterRendered', function () {
  restoreState();
});
