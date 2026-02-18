(function () {
  var LANGS = ['en','ko','ja','zh-CN','es','de','fr','pt','ru','it'];
  var DEFAULT = 'en';
  var t = {};
  var current = DEFAULT;

  function detect() {
    var p = new URLSearchParams(location.search).get('lang');
    if (p && LANGS.indexOf(p) !== -1) return p;
    var s = localStorage.getItem('pocketcode-lang');
    if (s && LANGS.indexOf(s) !== -1) return s;
    var b = (navigator.language || '').toLowerCase();
    if (LANGS.indexOf(b) !== -1) return b;
    var prefix = b.split('-')[0];
    if (LANGS.indexOf(prefix) !== -1) return prefix;
    if (b.indexOf('zh') === 0) return 'zh-CN';
    return DEFAULT;
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (t[k] != null) el.textContent = t[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (t[k] != null) el.innerHTML = t[k];
    });
    var isPrivacy = location.pathname.indexOf('privacy') !== -1;
    if (!isPrivacy) {
      if (t['meta.title']) {
        document.title = t['meta.title'];
        var m = document.querySelector('meta[property="og:title"]');
        if (m) m.content = t['meta.title'];
        m = document.querySelector('meta[name="twitter:title"]');
        if (m) m.content = t['meta.title'];
      }
      if (t['meta.description']) {
        var m = document.querySelector('meta[name="description"]');
        if (m) m.content = t['meta.description'];
      }
      if (t['og.description']) {
        var m = document.querySelector('meta[property="og:description"]');
        if (m) m.content = t['og.description'];
        m = document.querySelector('meta[name="twitter:description"]');
        if (m) m.content = t['og.description'];
      }
    } else {
      if (t['privacy.meta.title']) document.title = t['privacy.meta.title'];
      if (t['privacy.meta.description']) {
        var m = document.querySelector('meta[name="description"]');
        if (m) m.content = t['privacy.meta.description'];
      }
    }
    var btn = document.querySelector('.lang-switcher-btn');
    if (btn) btn.textContent = current.toUpperCase();
    document.querySelectorAll('.lang-option').forEach(function (o) {
      o.classList.toggle('active', o.getAttribute('data-lang') === current);
    });
  }

  function load(lang) {
    return fetch('lang/' + lang + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) { t = data; })
      .catch(function () {
        if (lang !== DEFAULT) return load(DEFAULT);
      });
  }

  function set(lang) {
    if (LANGS.indexOf(lang) === -1) lang = DEFAULT;
    current = lang;
    localStorage.setItem('pocketcode-lang', lang);
    document.documentElement.lang = lang === 'zh-CN' ? 'zh-Hans' : lang;
    return load(lang).then(apply);
  }

  function init() {
    current = detect();
    var sw = document.querySelector('.lang-switcher');
    if (sw) {
      var btn = sw.querySelector('.lang-switcher-btn');
      var dd = sw.querySelector('.lang-dropdown');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        dd.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        dd.classList.remove('open');
      });
      dd.querySelectorAll('.lang-option').forEach(function (o) {
        o.addEventListener('click', function (e) {
          e.preventDefault();
          set(o.getAttribute('data-lang'));
          dd.classList.remove('open');
        });
      });
    }
    set(current);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.i18n = { setLanguage: set };
})();
