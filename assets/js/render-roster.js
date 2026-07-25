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
