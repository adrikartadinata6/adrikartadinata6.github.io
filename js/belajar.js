/* Ruang Belajar: in-page reader and progress (progress lives in this browser only). */
(function () {
  "use strict";
  var KEY = "belajar.done.v1";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- progress ---- */
  var done = [];
  try { done = JSON.parse(localStorage.getItem(KEY) || "[]"); if (!Array.isArray(done)) done = []; } catch (_) { done = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (_) {} }
  function paint() {
    var cards = $$(".study-card");
    cards.forEach(function (c) {
      var id = c.getAttribute("data-id"), on = done.indexOf(id) > -1;
      c.classList.toggle("is-done", on);
      var cb = $("[data-done]", c); if (cb) cb.checked = on;
    });
    var n = cards.filter(function (c) { return c.classList.contains("is-done"); }).length;
    $("#study-bar").style.width = (cards.length ? Math.round(n / cards.length * 100) : 0) + "%";
    $("#study-count").textContent = n + " dari " + cards.length + " materi selesai";
  }
  $$("[data-done]").forEach(function (cb) {
    cb.addEventListener("change", function () {
      var id = cb.getAttribute("data-done"), i = done.indexOf(id);
      if (cb.checked && i < 0) done.push(id); else if (!cb.checked && i > -1) done.splice(i, 1);
      save(); paint();
    });
  });
  paint();


  /* ---- hide empty sections while filtering ---- */
  function syncSections() {
    $$(".study-sec").forEach(function (sec) {
      var cards = $$(".study-card", sec), vis = cards.filter(function (c) { return !c.hidden; }).length;
      if (sec.hidden !== (vis === 0)) sec.hidden = vis === 0;
      var n = $(".study-sec-count", sec), t = vis + (vis === cards.length ? " materi" : " dari " + cards.length + " materi"); if (n && n.textContent !== t) n.textContent = t;
    });
  }
  var host = $(".study-list") && $(".study-list").parentElement.parentElement;
  if (host && window.MutationObserver) new MutationObserver(function () { syncSections(); }).observe(host, { attributes: true, attributeFilter: ["hidden"], subtree: true });
  var bar = $(".filter-bar");
  if (bar) { ["click", "input"].forEach(function (ev) { bar.addEventListener(ev, function () { setTimeout(syncSections, 0); }); }); }
  syncSections();

  /* ---- reader ---- */
  var sv = $("#sv"), frame = $("#sv-frame"), last = null;
  function open(url, title, from) {
    last = from || null;
    $("#sv-title").textContent = title || "Materi";
    $("#sv-tab").setAttribute("href", url);
    frame.src = /\.pdf$/i.test(url) ? url + "#view=FitH" : url;
    sv.hidden = false; document.documentElement.style.overflow = "hidden";
    $("#sv-close").focus();
  }
  function close() {
    sv.hidden = true; frame.src = "about:blank"; document.documentElement.style.overflow = "";
    if (last) last.focus();
  }
  $$("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () { open(b.getAttribute("data-open"), b.getAttribute("data-title"), b); });
  });
  $("#sv-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !sv.hidden) close(); });
})();
