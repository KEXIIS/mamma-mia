/* =========================================================
   TRATTORIA MAMMA MIA — interakcje
   Wszystko jest progresywnym ulepszeniem: przy wyłączonym
   JavaScripcie strona zostaje po polsku, a całe menu pozostaje
   widoczne (patrz reguła `.js .menu__panel[hidden]` w CSS).
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. Przełącznik języka

     Polski jest treścią domyślną w HTML. Angielski żyje
     w atrybutach `data-en` (tekst) i `data-href-en` (adresy).
     Polski wariant zapamiętujemy przy pierwszym uruchomieniu.
     --------------------------------------------------------- */
  var KLUCZ = "mammamia-jezyk";
  var przyciskiJezyka = document.querySelectorAll(".lang-switch button");

  function zapamietajPolski() {
    document.querySelectorAll("[data-en]").forEach(function (el) {
      // Podmieniamy wyłącznie czysty tekst — element z dziećmi
      // zostałby zniszczony przez przypisanie do textContent.
      if (el.children.length > 0) return;
      el.dataset.pl = el.textContent.trim();
    });
    document.querySelectorAll("[data-href-en]").forEach(function (el) {
      el.dataset.hrefPl = el.getAttribute("href");
    });
  }

  function ustawJezyk(jezyk) {
    var en = jezyk === "en";

    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el.children.length > 0) return;
      var tekst = en ? el.dataset.en : el.dataset.pl;
      if (tekst) el.textContent = tekst;
    });

    document.querySelectorAll("[data-href-en]").forEach(function (el) {
      el.setAttribute("href", en ? el.dataset.hrefEn : el.dataset.hrefPl);
    });

    document.documentElement.lang = en ? "en" : "pl";

    przyciskiJezyka.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === jezyk));
    });

    try {
      localStorage.setItem(KLUCZ, jezyk);
    } catch (e) {
      /* tryb prywatny — wybór po prostu nie przetrwa odświeżenia */
    }
  }

  function jezykStartowy() {
    var zapisany;
    try {
      zapisany = localStorage.getItem(KLUCZ);
    } catch (e) {
      zapisany = null;
    }
    if (zapisany === "pl" || zapisany === "en") return zapisany;
    return (navigator.language || "pl").toLowerCase().indexOf("pl") === 0 ? "pl" : "en";
  }

  zapamietajPolski();
  przyciskiJezyka.forEach(function (b) {
    b.addEventListener("click", function () {
      ustawJezyk(b.dataset.lang);
    });
  });
  ustawJezyk(jezykStartowy());

  /* ---------------------------------------------------------
     2. Zakładki menu

     Wszystkie panele są w HTML i domyślnie widoczne. Dopiero
     tutaj chowamy nieaktywne — dzięki temu bez JS nic nie ginie.
     --------------------------------------------------------- */
  var zakladki = Array.prototype.slice.call(document.querySelectorAll(".menu__tab"));

  if (zakladki.length) {
    var panele = zakladki.map(function (t) {
      return document.getElementById(t.getAttribute("aria-controls"));
    });

    var pokaz = function (indeks, przenies) {
      zakladki.forEach(function (t, i) {
        var aktywna = i === indeks;
        t.setAttribute("aria-selected", String(aktywna));
        t.tabIndex = aktywna ? 0 : -1;
        if (panele[i]) panele[i].hidden = !aktywna;
      });
      if (przenies) zakladki[indeks].focus();
    };

    zakladki.forEach(function (t, i) {
      t.addEventListener("click", function () {
        pokaz(i, false);
      });

      t.addEventListener("keydown", function (ev) {
        var cel = null;
        if (ev.key === "ArrowRight") cel = (i + 1) % zakladki.length;
        else if (ev.key === "ArrowLeft") cel = (i - 1 + zakladki.length) % zakladki.length;
        else if (ev.key === "Home") cel = 0;
        else if (ev.key === "End") cel = zakladki.length - 1;
        if (cel === null) return;
        ev.preventDefault();
        pokaz(cel, true);
      });
    });

    pokaz(0, false);
  }

  /* ---------------------------------------------------------
     3. Nawigacja mobilna
     --------------------------------------------------------- */
  var przelacznikNawigacji = document.querySelector(".nav-toggle");
  var nawigacja = document.getElementById("site-nav");

  if (przelacznikNawigacji && nawigacja) {
    przelacznikNawigacji.addEventListener("click", function () {
      var otwarta = nawigacja.classList.toggle("is-open");
      przelacznikNawigacji.setAttribute("aria-expanded", String(otwarta));
    });

    nawigacja.addEventListener("click", function (ev) {
      if (ev.target.tagName !== "A") return;
      nawigacja.classList.remove("is-open");
      przelacznikNawigacji.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------------------------------------------------------
     4. Rok w stopce
     --------------------------------------------------------- */
  var rok = document.getElementById("rok");
  if (rok) rok.textContent = String(new Date().getFullYear());
})();
