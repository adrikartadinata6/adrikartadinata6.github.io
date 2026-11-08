/* Text translator for plain-HTML copy. Follows <html lang> (set by script.js): in "id" it swaps each English text node
   for its Indonesian entry in js/i18n-dict-id.js (fetched only then); back in "en" it restores the original text.
   Elements that already carry data-i18n or data-nx-id are left to the scripts that own them. */
(function () {
  "use strict";
  var me = document.currentScript, base = me && me.src ? me.src.replace(/[^\/]*$/, "") : "js/";
  var SKIP = "script,style,noscript,textarea,[data-i18n],[data-nx-id],.cmdk,.ask-panel";
  var saved = new WeakMap(), done = [], loading = false;
  var isId = function () { return document.documentElement.lang === "id"; };

  function translate(root) {
    var D = window.__I18N_ID; if (!D) return;
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) {
      if (saved.has(t)) return;
      var p = t.parentElement; if (!p || p.closest(SKIP)) return;
      var raw = t.nodeValue, key = raw.replace(/\s+/g, " ").trim();
      if (key.length < 2 || !Object.prototype.hasOwnProperty.call(D, key)) return;
      var lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
      saved.set(t, raw); done.push(t); t.nodeValue = lead + D[key] + trail;
    });
  }
  function restore() {
    done.forEach(function (t) { if (saved.has(t)) { t.nodeValue = saved.get(t); saved.delete(t); } });
    done = [];
  }
  function apply() {
    if (!isId()) { restore(); return; }
    if (window.__I18N_ID) { translate(); return; }
    if (loading) return; loading = true;
    var s = document.createElement("script"); s.src = base + "i18n-dict-id.js"; s.async = true;
    s.onerror = function () { loading = false; };
    document.head.appendChild(s);
  }
  window.__i18nApply = function () { loading = false; if (isId()) translate(); };
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  /* content that appears after load (filtered cards, lazy blocks) */
  new MutationObserver(function (m) {
    if (!isId() || !window.__I18N_ID) return;
    m.forEach(function (r) { r.addedNodes.forEach(function (n) { if (n.nodeType === 1) translate(n); }); });
  }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
