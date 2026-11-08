/* Click the logo (brand mark + name) three times in a row to open the study room; do it again there to go home.
   No visible hint on purpose. */
(function () {
  "use strict";
  var me = document.currentScript, root = new URL("../", me && me.src ? me.src : location.href);
  var here = /\/belajar\.html$/.test(location.pathname);
  var go = new URL(here ? "index.html" : "belajar.html", root).href;
  var st = document.createElement("style");
  st.textContent = ".brand{-webkit-user-select:none;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}";
  document.head.appendChild(st);
  var n = 0, t = 0;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".brand");
    if (!b) return;
    clearTimeout(t);
    if (++n >= 3) { n = 0; location.href = go; return; }
    b.style.opacity = ".7"; setTimeout(function () { b.style.opacity = ""; }, 120);
    t = setTimeout(function () { n = 0; }, 700);
  });
})();
