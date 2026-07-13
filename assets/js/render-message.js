/* ================================================================
   DOLAX – ご挨拶レンダラー  render-message.js
   ================================================================ */
(function () {
  window.msgImgFail = function(img) {
    img.style.display = 'none';
    var ph = img.parentNode.querySelector('.photo-placeholder');
    if (ph) ph.classList.remove('is-hidden');
  };

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildCard(m) {
    var bodyHtml = (m.body || []).map(function (p) {
      return '<p>' + esc(p) + '</p>';
    }).join('');
    return (
      '<div class="msg-card">' +
        '<div class="msg-photo-wrap">' +
          '<div class="corner-tl"></div>' +
          '<div class="corner-br"></div>' +
          '<div class="msg-photo">' +
            (m.photo
              ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.role) + ' ' + esc(m.nameJa) + '" onerror="msgImgFail(this)">'
              : '') +
            '<div class="photo-placeholder' + (m.photo ? ' is-hidden' : '') + '">' +
              '<div class="ph-monogram">' + esc(m.monogram || '') + '</div>' +
              '<div class="ph-role">'     + esc(m.roleEn   || '') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="msg-body">' +
          '<div class="msg-role">'    + esc(m.role)   + ' / ' + esc(m.roleEn) + '</div>' +
          '<div class="msg-name-en">' + esc(m.nameEn) + '</div>' +
          '<div class="msg-name-ja">' + esc(m.nameJa) + '</div>' +
          '<div class="msg-rule"></div>' +
          '<div class="msg-text">' + bodyHtml + '</div>' +
          '<div class="msg-signature">' +
            '<div class="sig-inner">' +
              '<div class="sig-role">同志社大学体育会男子ラクロス部　' + esc(m.role) + '</div>' +
              '<div class="sig-name">' + esc(m.nameJa) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function render(data) {
    var grid = document.getElementById('msgGrid');
    if (!grid) return;
    var messages = data.messages || [];
    if (messages.length === 0) { grid.innerHTML = ''; return; }
    grid.innerHTML = messages.map(buildCard).join('');
  }

  function load() {
    var root = (typeof window.DOLAX_ROOT !== 'undefined') ? window.DOLAX_ROOT : '';
    fetch(root + 'data/staff.json')
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function (e) {
        console.warn('[DOLAX] render-message.js: data/staff.json 読み込み失敗。', e);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
