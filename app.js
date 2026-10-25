/* Bolsa Mayor — tienda (SPA sin dependencias). Datos: productos.js (window.PRODUCTOS) */
(() => {
  "use strict";

  const MIN_COMPRA = 150000;
  const EMAIL_PEDIDOS = "pedidos@bolsamayor.com.ar";

  // Política comercial: costo con 20% de descuento de empleado, 25% de margen
  // operativo objetivo y 6,29% de comisión máxima por cobro inmediato.
  const EMPLOYEE_DISCOUNT = 0.20;
  const TARGET_OPERATING_MARGIN = 0.25;
  const PAYMENT_FEE = 0.0629;
  const PRICE_MULTIPLIER = (1 - EMPLOYEE_DISCOUNT) / (1 - TARGET_OPERATING_MARGIN - PAYMENT_FEE);
  const salePrice = (officialPrice) => officialPrice ? Math.ceil((officialPrice * PRICE_MULTIPLIER) / 100) * 100 : 0;

  // ---------- utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  const money = (n) => fmt.format(n || 0).replace(/\s/g, " ");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin storage */ } },
  };
  const ico = {
    cart: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 7 9 18l-5-5"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 5h16M7 12h10M10 19h4"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M1 6h13v10H1zM14 10h4l3 3v3h-7z"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  };

  // ---------- datos ----------
  const DEPTS = [
    { k: "mochilas", n: "Mochilas", m: ["mochilas"] },
    { k: "carteras", n: "Carteras", m: ["carteras", "cartera"] },
    { k: "billeteras", n: "Billeteras", m: ["billeteras"] },
    { k: "valijas", n: "Valijas y viaje", m: ["valijas", "viaje", "accesorios viaje"] },
    { k: "bolsos", n: "Bolsos", m: ["bolsos"] },
    { k: "bandoleras", n: "Bandoleras", m: ["bandoleras"] },
    { k: "escolar", n: "Escolar", m: ["escolar"] },
    { k: "kids", n: "Kids", m: ["kids"] },
    { k: "bazar", n: "Bazar y mate", m: ["bazar", "todo mate"] },
    { k: "fragancias", n: "Fragancias", m: ["fragancias"] },
    { k: "beauty", n: "Beauty & Care", m: ["beauty & care", "beauty"] },
    { k: "accesorios", n: "Accesorios", m: ["accesorios"] },
    { k: "madre", n: "Día de la Madre", m: ["dia de la madre"] },
  ];
  const DEPT = Object.fromEntries(DEPTS.map((d) => [d.k, d]));
  const BRANDS = ["Chimola", "Barbara Bags", "Amayra", "Cresko", "Lima", "Goodpak", "Everlast", "Discovery", "Disney", "Marvel", "Head", "La Chapelle", "Klub Mode", "Miss Unique", "Check In", "Lattafa", "47 Street", "Boos", "Bross London", "Giesso", "Atrevida", "Bagcherry", "Berkana", "Big Life", "Bossi", "Kevingston", "Milo Lockett", "Agarrate Catalina", "Burgues", "Hummer", "Mc Gregor"];
  const BRAND_COLORS = ["#24349a", "#e3262f", "#0f8a6a", "#c2410c", "#7c3aed", "#0e7490", "#111827", "#b45309", "#1d4ed8", "#be123c", "#047857", "#6d28d9"];
  const COLORS = {
    negro: "#1d1d1f", blanco: "#fff", rojo: "#d62828", azul: "#1e40af", marino: "#1e2a5a", celeste: "#7cc4ef", verde: "#2f9e44", militar: "#5b6b3a", rosa: "#f4a6c0", "rosa viejo": "#c98b8b", fucsia: "#e0218a", gris: "#9ca3af", topo: "#8b7d72", beige: "#e5d3b3", camel: "#c19a6b", suela: "#a0522d", marron: "#6b4226", chocolate: "#4e2a1e", nude: "#e8c8b0", bordo: "#7b1e2b", violeta: "#7c3aed", lila: "#c4b5fd", amarillo: "#facc15", naranja: "#f97316", dorado: "#d4af37", plateado: "#c0c0c0", plata: "#c0c0c0", turquesa: "#14b8a6", coral: "#ff7f6b", natural: "#eadfc8", crema: "#f5ecd7", hueso: "#efe6d2", jean: "#4a6fa5", tostado: "#b5835a", visón: "#9a8478", vison: "#9a8478", oro: "#d4af37", cobre: "#b87333", menta: "#98e2c6", petroleo: "#1f5f6b", mostaza: "#d4a017", aqua: "#5eead4", salmon: "#fa8072", animal: "linear-gradient(135deg,#c19a6b 0 30%,#3b2a1a 30% 45%,#c19a6b 45%)",
    multicolor: "conic-gradient(#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7,#f43f5e)",
  };
  const swatch = (name) => {
    const n = norm(name);
    if (COLORS[n]) return COLORS[n];
    const hit = Object.keys(COLORS).find((k) => n.includes(k));
    return hit ? COLORS[hit] : "#d1d5db";
  };

  const P = (window.PRODUCTOS || []).map((source, i) => {
    const p = {
      ...source,
      p: salePrice(source.p),
      r: salePrice(source.r),
      officialPrice: source.p,
      officialRegularPrice: source.r,
    };
    const cs = new Set(p.c.map((c) => c.toLowerCase()));
    const brand = BRANDS.find((b) => cs.has(b.toLowerCase())) || "";
    const disc = p.o && p.r > p.p ? Math.round(100 - (p.p * 100) / p.r) : 0;
    return { ...p, i, cs, brand, disc, s: norm([p.n, brand, ...p.c].join(" ")) };
  });
  const BY_ID = new Map(P.map((p) => [p.id, p]));
  const inDept = (p, k) => DEPT[k] && DEPT[k].m.some((m) => p.cs.has(m));
  const ofDept = (k) => P.filter((p) => inDept(p, k));
  const deptOf = (p) => DEPTS.find((d) => d.k !== "madre" && inDept(p, d.k));
  const maxDisc = (list) => Math.max(0, ...list.map((p) => p.disc));
  const minPrice = (list) => Math.min(...list.map((p) => p.p).filter(Boolean));

  // ---------- estado ----------
  let cart = store.get("bm_cart", []).filter((l) => BY_ID.has(l.id));
  let favs = new Set(store.get("bm_favs", []).filter((id) => BY_ID.has(id)));
  const saveCart = () => { store.set("bm_cart", cart); paintCounters(); };
  const saveFavs = () => { store.set("bm_favs", [...favs]); paintCounters(); };
  const cartTotal = () => cart.reduce((s, l) => s + (BY_ID.get(l.id).p || 0) * l.q, 0);
  const cartQty = () => cart.reduce((s, l) => s + l.q, 0);

  function paintCounters(bump) {
    const cc = $("#cartCount"), fc = $("#favCount");
    cc.textContent = cartQty();
    fc.textContent = favs.size;
    $("#cartTotalH").textContent = money(cartTotal());
    $("#tabCart").textContent = cartQty();
    $("#tabFav").textContent = favs.size;
    if (bump) { const el = bump === "fav" ? fc : cc; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  }

  function addToCart(id, opt = "", q = 1) {
    const line = cart.find((l) => l.id === id && l.opt === opt);
    if (line) line.q += q; else cart.push({ id, opt, q });
    saveCart();
    paintCounters("cart");
    const p = BY_ID.get(id);
    toast(`<img src="${esc(p.img)}" alt=""><span><b>Agregado al pedido</b><br>${esc(p.n)}${opt ? " · " + esc(opt) : ""}</span><button data-drawer="cart">Ver pedido</button>`);
    if (drawerOpen) renderDrawer();
  }
  function toggleFav(id) {
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    saveFavs();
    paintCounters("fav");
    $$(`[data-fav="${id}"]`).forEach((b) => b.classList.toggle("on", favs.has(id)));
    if (drawerOpen) renderDrawer();
  }

  // ---------- componentes ----------
  const imgTag = (src, cls = "", alt = "") =>
    `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" class="${cls}" onload="this.parentNode.classList.add('loaded')" onerror="this.style.visibility='hidden'">`;

  function swatches(p) {
    const colors = p.a.Color || [];
    if (!colors.length) return '<div class="swatches"></div>';
    const show = colors.slice(0, 6).map((c) => `<i class="sw" title="${esc(c)}" style="background:${swatch(c)}"></i>`).join("");
    return `<div class="swatches">${show}${colors.length > 6 ? `<span class="sw-more">+${colors.length - 6}</span>` : ""}</div>`;
  }
  function priceHtml(p, cls = "price") {
    return `<div class="${cls} ${p.disc ? "sale" : ""}"><b>${money(p.p)}</b>${p.disc ? `<del>${money(p.r)}</del>` : ""}</div>`;
  }
  const favBtn = (p, cls = "fav") =>
    `<button class="${cls} ${favs.has(p.id) ? "on" : ""}" data-fav="${p.id}" aria-label="Favorito">${ico.heart}</button>`;

  function card(p) {
    return `<article class="card fade-in">
      ${p.disc ? `<span class="disc">-${p.disc}%</span>` : ""}
      ${favBtn(p)}
      <a href="#/p/${p.id}" class="card-img sk">${imgTag(p.img, "", p.n)}${p.g[0] ? imgTag(p.g[0], "alt") : ""}</a>
      ${p.brand ? `<div class="card-brand">${esc(p.brand)}</div>` : ""}
      <a href="#/p/${p.id}" class="card-name" title="${esc(p.n)}">${esc(p.n)}</a>
      ${swatches(p)}
      ${priceHtml(p)}
      <button class="btn-add" data-add="${p.id}">${ico.cart} Agregar</button>
    </article>`;
  }
  function mini(p) {
    return `<article class="mini">
      ${p.disc ? `<span class="disc">-${p.disc}%</span>` : ""}
      <a href="#/p/${p.id}" class="card-img sk">${imgTag(p.img, "", p.n)}</a>
      <div style="min-width:0">
        <a href="#/p/${p.id}" class="card-name">${esc(p.n)}</a>
        ${priceHtml(p)}
      </div>
    </article>`;
  }
  const bullets = (p, n = 3) => {
    const items = p.d.filter((l) => !norm(l).startsWith(norm(p.n).slice(0, 12))).slice(0, n);
    return items.length ? `<ul>${items.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : "";
  };
  function scroller(list, id) {
    return `<div class="scroller">
      <button class="sc-btn sc-prev" data-scroll="${id}" data-dir="-1" aria-label="Anterior">${ico.left}</button>
      <div class="row-scroll" id="${id}">${list.map(card).join("")}</div>
      <button class="sc-btn sc-next" data-scroll="${id}" data-dir="1" aria-label="Siguiente">${ico.chev}</button>
    </div>`;
  }
  const secHead = (title, link, linkText = "Ver todo", extra = "") =>
    `<div class="sec-head"><h2>${title}</h2>${extra}${link ? `<a class="sec-link" href="${link}">${linkText} ${ico.chev}</a>` : ""}</div>`;

  // Elige un producto representativo (con descuento si hay) que no se haya usado en otra parte de la home.
  function pickFor(list, used) {
    const sorted = [...list].sort((a, b) => b.disc - a.disc || b.d.length - a.d.length);
    const p = sorted.find((x) => !used.has(x.id)) || sorted[0];
    if (p) used.add(p.id);
    return p;
  }
  function seeded(list, n, seed) {
    const a = [...list];
    let s = seed;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  // ---------- HOME ----------
  let sliderTimer, countdownTimer;
  function renderHome() {
    const used = new Set();
    const slides = [
      { d: "valijas", kicker: "Temporada de viajes", title: "Viajá liviano,<br>llegá con estilo", text: "Carry on, valijas y accesorios de viaje de las marcas que más se venden.", c: "#3b8bd0" },
      { d: "madre", kicker: "Día de la Madre", title: "Regalos que<br>enamoran", text: "Carteras, billeteras, beauty y fragancias para tu vidriera.", c: "#e14f69" },
      { d: "escolar", kicker: "Escolar", title: "Mochilas para<br>todo el año", text: "Con carro, de espalda y cartucheras de sus personajes favoritos.", c: "#16a37e" },
    ].map((s) => {
      const list = ofDept(s.d);
      return { ...s, p: pickFor(list, used), max: maxDisc(list) };
    });
    const tiles = [
      { d: "billeteras", c: "#ff7448" },
      { d: "fragancias", c: "#ea4c7f" },
      { d: "bazar", c: "#1db38e" },
      { d: "bolsos", c: "#8b5cf6" },
    ].map((t) => ({ ...t, list: ofDept(t.d) })).map((t) => ({ ...t, p: pickFor(t.list, used) }));

    const fresh = P.slice(0, 14);
    fresh.forEach((p) => used.add(p.id));

    const cats = [
      { d: "mochilas", c: "#b39245" }, { d: "carteras", c: "#9f3b55" }, { d: "kids", c: "#139fb5" },
      { d: "bandoleras", c: "#e43f4f" }, { d: "beauty", c: "#1c2858" }, { d: "accesorios", c: "#6849cf" },
    ].map((x) => ({ ...x, list: ofDept(x.d) })).map((x) => ({ ...x, p: pickFor(x.list, used) }));

    const deals = P.filter((p) => p.disc && p.d.length >= 2 && !used.has(p.id)).sort((a, b) => b.disc - a.disc).slice(0, 2);
    deals.forEach((p) => used.add(p.id));

    const banners = [
      { d: "mochilas", c: "#ef4559", t: "Mochilas<br>de marca" },
      { d: "valijas", c: "#2eae69", t: "Valijas y<br>carry on" },
      { d: "carteras", c: "#ff8500", t: "Carteras<br>de temporada" },
    ].map((b) => ({ ...b, list: ofDept(b.d) })).map((b) => ({ ...b, p: pickFor(b.list, used), max: maxDisc(b.list) }));

    const featPool = P.filter((p) => p.disc && !used.has(p.id));
    const featBig = [...featPool].sort((a, b) => b.d.length - a.d.length)[0];
    if (featBig) used.add(featBig.id);
    const featMini = [];
    const seenDept = new Map();
    for (const p of featPool) {
      if (used.has(p.id)) continue;
      const k = deptOf(p)?.k || "x";
      if ((seenDept.get(k) || 0) >= 2) continue;
      seenDept.set(k, (seenDept.get(k) || 0) + 1);
      featMini.push(p); used.add(p.id);
      if (featMini.length === 6) break;
    }

    const day = Math.floor(Date.now() / 864e5);
    const recos = seeded(P.filter((p) => !used.has(p.id)), 14, day);

    const brandCounts = BRANDS.map((b) => ({ b, n: P.filter((p) => p.brand === b).length })).filter((x) => x.n).sort((a, b) => b.n - a.n).slice(0, 12);

    $("#app").innerHTML = `
    <div class="wrap">
      <section class="hero">
        <div class="slider" id="slider">
          ${slides.map((s, i) => `
            <div class="slide ${i ? "" : "on"}" style="--bg-c:${s.c}">
              <div class="slide-txt">
                <span class="slide-kicker">${s.kicker}</span>
                <h1>${s.title}</h1>
                <p>${s.text}</p>
                <div class="slide-from">${esc(s.p.n.split(" – ")[0])}<b>${money(s.p.p)}${s.p.disc ? `<del>${money(s.p.r)}</del>` : ""}</b></div>
                <a href="#/tienda?cat=${s.d}" class="btn-dark">Ver colección</a>
              </div>
              <a class="slide-img" href="#/p/${s.p.id}">
                <div class="plate">${imgTag(s.p.big, "", s.p.n)}</div>
                ${s.max ? `<span class="pill"><span><small>HASTA</small>-${s.max}%</span></span>` : ""}
              </a>
            </div>`).join("")}
          <button class="sl-arrow sl-prev" data-slide="-1" aria-label="Anterior">${ico.left}</button>
          <button class="sl-arrow sl-next" data-slide="1" aria-label="Siguiente">${ico.chev}</button>
          <div class="dots">${slides.map((_, i) => `<button class="${i ? "" : "on"}" data-dot="${i}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>
        </div>
        <div class="tiles">
          ${tiles.map((t) => `
            <a class="tile" href="#/tienda?cat=${t.d}" style="--bg-c:${t.c}">
              <h3>${DEPT[t.d].n}</h3>
              <span><b>${t.list.length} productos</b>${maxDisc(t.list) ? `Hasta -${maxDisc(t.list)}%` : `Desde ${money(minPrice(t.list))}`}</span>
              <div class="t-img">${imgTag(t.p.img)}</div>
            </a>`).join("")}
        </div>
      </section>

      <section class="section">
        ${secHead("Recién llegados", "#/tienda", "Ver todos los productos")}
        ${scroller(fresh, "rowFresh")}
      </section>

      <section class="section">
        ${secHead("Categorías populares", "#/tienda")}
        <div class="cats">
          ${cats.map((x) => `
            <a class="cat" href="#/tienda?cat=${x.d}" style="--bg-c:${x.c}">
              <b>${DEPT[x.d].n}</b><span>(${x.list.length} productos)</span>
              <div class="c-img">${imgTag(x.p.img)}</div>
            </a>`).join("")}
        </div>
      </section>

      ${deals.length ? `
      <section class="section">
        ${secHead("Ofertas del día", "", "", `<div class="countdown">Se renuevan en: <div class="cd" id="cd"></div></div>`)}
        <div class="deals">
          ${deals.map((p) => `
            <article class="deal">
              <span class="disc">-${p.disc}%</span>
              <a href="#/p/${p.id}" class="card-img sk">${imgTag(p.big, "", p.n)}</a>
              <div>
                <a href="#/p/${p.id}"><h3>${esc(p.n)}</h3></a>
                ${priceHtml(p)}
                ${bullets(p)}
                <div class="save"><div class="save-bar"><i style="width:${p.disc * 2}%"></i></div><span>Ahorrás <b>${money(p.r - p.p)}</b> por unidad</span></div>
                <button class="btn-add" data-add="${p.id}">${ico.cart} Agregar al pedido</button>
              </div>
            </article>`).join("")}
        </div>
      </section>` : ""}

      <section class="section banners">
        ${banners.map((b) => `
          <a class="banner" href="#/tienda?cat=${b.d}${b.max ? "&oferta=1" : ""}" style="--bg-c:${b.c}">
            <h3>${b.t}</h3>
            <span>${b.max ? `Hasta <b>-${b.max}%</b>` : `Desde <b>${money(minPrice(b.list))}</b>`}</span>
            <div class="b-img">${imgTag(b.p.img)}</div>
          </a>`).join("")}
      </section>

      ${featBig ? `
      <section class="section">
        ${secHead("Destacados en oferta", "#/tienda?oferta=1", "Ver todas las ofertas")}
        <div class="featured">
          <article class="feat-big">
            <span class="disc">-${featBig.disc}%</span>
            ${favBtn(featBig)}
            <a href="#/p/${featBig.id}" class="card-img sk">${imgTag(featBig.big, "", featBig.n)}</a>
            <a href="#/p/${featBig.id}" class="card-name">${esc(featBig.n)}</a>
            ${priceHtml(featBig)}
            ${bullets(featBig)}
            <button class="btn-add" data-add="${featBig.id}">${ico.cart} Agregar al pedido</button>
          </article>
          <div class="mini-grid">${featMini.map(mini).join("")}</div>
        </div>
      </section>` : ""}
    </div>

    <div class="marquee"><div class="marquee-track">${Array(2).fill([
      "Venta mayorista para comercios", "Envíos a todo el país", "Compra mínima $150.000 + IVA",
      `Ofertas de hasta ${maxDisc(P)}% OFF`, `+${Math.floor(P.length / 100) * 100} productos`, "Las mejores marcas de marroquinería",
    ].map((t) => `<span>${ico.bolt} ${t}</span>`).join("")).join("")}</div></div>

    <div class="wrap">
      <section class="section">
        ${secHead("Te puede gustar", "#/tienda", "Ver todos los productos")}
        ${scroller(recos, "rowReco")}
      </section>

      <section class="section">
        ${secHead("Nuestras marcas", "#/tienda")}
        <div class="brands">
          ${brandCounts.map((x, i) => `<a class="brand" href="#/tienda?marca=${encodeURIComponent(x.b)}" style="--bc:${BRAND_COLORS[i % BRAND_COLORS.length]}"><span>${esc(x.b)}<small>${x.n} productos</small></span></a>`).join("")}
        </div>
      </section>
    </div>`;

    startSlider();
    startCountdown();
  }

  function startSlider() {
    const slider = $("#slider");
    if (!slider) return;
    let i = 0;
    const slides = $$(".slide", slider), dots = $$(".dots button", slider);
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("on", k === i));
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
    };
    const auto = () => { clearInterval(sliderTimer); sliderTimer = setInterval(() => go(i + 1), 6000); };
    slider.addEventListener("click", (e) => {
      const b = e.target.closest("[data-slide],[data-dot]");
      if (!b) return;
      go(b.dataset.dot != null ? +b.dataset.dot : i + +b.dataset.slide);
      auto();
    });
    let x0 = null;
    slider.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); auto(); }
      x0 = null;
    });
    auto();
  }

  function startCountdown() {
    const el = $("#cd");
    clearInterval(countdownTimer);
    if (!el) return;
    const tick = () => {
      const now = new Date(), end = new Date(now);
      end.setHours(24, 0, 0, 0);
      let s = Math.max(0, Math.floor((end - now) / 1000));
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      const pad = (n) => String(n).padStart(2, "0");
      el.innerHTML = `<span><b>${pad(h)}</b>hs</span><span><b>${pad(m)}</b>min</span><span><b>${pad(s)}</b>seg</span>`;
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  // ---------- TIENDA ----------
  const PAGE = 24;
  let shown = PAGE, lastShopKey = "";

  function filterProducts(f) {
    const toks = norm(f.q).split(/\s+/).filter(Boolean);
    let list = P.filter((p) =>
      (!f.cat || inDept(p, f.cat)) &&
      (!f.marcas.length || f.marcas.includes(p.brand)) &&
      (!f.oferta || p.disc) &&
      (!f.min || p.p >= f.min) &&
      (!f.max || p.p <= f.max) &&
      toks.every((t) => p.s.includes(t)));
    const sorts = {
      precio_asc: (a, b) => a.p - b.p,
      precio_desc: (a, b) => b.p - a.p,
      descuento: (a, b) => b.disc - a.disc,
      az: (a, b) => a.n.localeCompare(b.n, "es"),
    };
    if (sorts[f.orden]) list = [...list].sort(sorts[f.orden]);
    else if (toks.length) list = [...list].sort((a, b) => (norm(b.n).includes(toks[0]) ? 1 : 0) - (norm(a.n).includes(toks[0]) ? 1 : 0));
    return list;
  }

  function shopUrl(f, patch = {}) {
    const n = { ...f, ...patch };
    const qs = new URLSearchParams();
    if (n.q) qs.set("q", n.q);
    if (n.cat) qs.set("cat", n.cat);
    if (n.marcas.length) qs.set("marca", n.marcas.join(","));
    if (n.oferta) qs.set("oferta", "1");
    if (n.min) qs.set("min", n.min);
    if (n.max) qs.set("max", n.max);
    if (n.orden) qs.set("orden", n.orden);
    const s = qs.toString();
    return "#/tienda" + (s ? "?" + s : "");
  }

  function renderShop(params) {
    const f = {
      q: params.get("q") || "",
      cat: DEPT[params.get("cat")] ? params.get("cat") : "",
      marcas: (params.get("marca") || "").split(",").filter(Boolean),
      oferta: params.get("oferta") === "1",
      min: +params.get("min") || 0,
      max: +params.get("max") || 0,
      orden: params.get("orden") || "",
    };
    const key = JSON.stringify(f);
    if (key !== lastShopKey) { shown = PAGE; lastShopKey = key; }
    const list = filterProducts(f);
    // Conteos de facetas sobre el resto de filtros
    const base = filterProducts({ ...f, cat: "" });
    const baseB = filterProducts({ ...f, marcas: [] });
    const title = f.q ? `Resultados para “${esc(f.q)}”` : f.cat ? DEPT[f.cat].n : f.oferta ? "Ofertas" : f.marcas.length === 1 ? esc(f.marcas[0]) : "Todos los productos";

    const chips = [
      f.q && [`Búsqueda: ${esc(f.q)}`, { q: "" }],
      f.cat && [DEPT[f.cat].n, { cat: "" }],
      ...f.marcas.map((m) => [esc(m), { marcas: f.marcas.filter((x) => x !== m) }]),
      f.oferta && ["En oferta", { oferta: false }],
      (f.min || f.max) && [`${f.min ? money(f.min) : "$0"} – ${f.max ? money(f.max) : "∞"}`, { min: 0, max: 0 }],
    ].filter(Boolean);

    const brandList = BRANDS.map((b) => ({ b, n: baseB.filter((p) => p.brand === b).length })).filter((x) => x.n || f.marcas.includes(x.b)).sort((a, b) => b.n - a.n);

    $("#app").innerHTML = `
    <div class="wrap">
      <div class="crumbs"><a href="#/">Inicio</a> / <a href="#/tienda">Tienda</a>${f.cat ? ` / <span>${DEPT[f.cat].n}</span>` : ""}</div>
      <h1 class="page-title">${title}</h1>
      <div class="shop">
        <aside class="filters" id="filters">
          <div class="f-group f-head"><b>Filtros</b><button class="icon-btn" data-close-filters>${ico.x}</button></div>
          <div class="f-group">
            <label class="switch">Solo ofertas <input type="checkbox" id="fOferta" ${f.oferta ? "checked" : ""}></label>
          </div>
          <div class="f-group">
            <h4>Categorías</h4>
            <div class="f-list">
              <button class="${f.cat ? "" : "on"}" data-go="${shopUrl(f, { cat: "" })}">Todas <span>${base.length}</span></button>
              ${DEPTS.map((d) => ({ d, n: base.filter((p) => inDept(p, d.k)).length })).filter((x) => x.n || x.d.k === f.cat).map((x) =>
                `<button class="${f.cat === x.d.k ? "on" : ""}" data-go="${shopUrl(f, { cat: x.d.k })}">${x.d.n} <span>${x.n}</span></button>`).join("")}
            </div>
          </div>
          <div class="f-group">
            <h4>Marcas</h4>
            <div class="f-list">
              ${brandList.map((x) => `<label><div><input type="checkbox" data-brand="${esc(x.b)}" ${f.marcas.includes(x.b) ? "checked" : ""}>${esc(x.b)}</div><span>${x.n}</span></label>`).join("")}
            </div>
          </div>
          <div class="f-group">
            <h4>Precio</h4>
            <form class="price-in" id="priceForm">
              <input type="number" min="0" step="1000" placeholder="Mín" name="min" value="${f.min || ""}">
              <span>–</span>
              <input type="number" min="0" step="1000" placeholder="Máx" name="max" value="${f.max || ""}">
              <button class="btn-ghost" aria-label="Aplicar">${ico.chev}</button>
            </form>
          </div>
          ${chips.length ? `<a class="btn-ghost" style="display:block;text-align:center" href="#/tienda">Limpiar filtros</a>` : ""}
        </aside>

        <div>
          <div class="toolbar">
            <div class="chips">
              <button class="btn-ghost only-filters-btn" id="openFilters" style="display:inline-flex;align-items:center;gap:6px">${ico.filter} Filtros</button>
              <b style="color:var(--ink)">${list.length}</b> productos
              ${chips.map(([t, patch]) => `<span class="chip">${t}<button data-go="${shopUrl(f, patch)}" aria-label="Quitar">${ico.x}</button></span>`).join("")}
            </div>
            <select id="sortSel" aria-label="Ordenar">
              ${[["", "Más relevantes"], ["precio_asc", "Menor precio"], ["precio_desc", "Mayor precio"], ["descuento", "Mayor descuento"], ["az", "Nombre A–Z"]]
                .map(([v, t]) => `<option value="${v}" ${f.orden === v ? "selected" : ""}>${t}</option>`).join("")}
            </select>
          </div>
          ${list.length ? `<div class="grid" id="shopGrid">${list.slice(0, shown).map(card).join("")}</div>
            <div class="more">${shown < list.length ? `<span>Mostrando ${shown} de ${list.length}</span><button class="btn-dark" id="moreBtn">Cargar más productos</button>` : `<span>Viste los ${list.length} productos</span>`}</div>`
            : `<div class="empty">${ico.search}<b>No encontramos productos</b>Probá con otra búsqueda o quitá algunos filtros.<br><br><a class="btn-dark" href="#/tienda">Ver todo el catálogo</a></div>`}
        </div>
      </div>
    </div>`;

    $("#fOferta").onchange = (e) => go(shopUrl(f, { oferta: e.target.checked }));
    $("#sortSel").onchange = (e) => go(shopUrl(f, { orden: e.target.value }));
    $$("[data-brand]").forEach((c) => (c.onchange = () => {
      const b = c.dataset.brand;
      go(shopUrl(f, { marcas: c.checked ? [...f.marcas, b] : f.marcas.filter((x) => x !== b) }));
    }));
    $("#priceForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      go(shopUrl(f, { min: +fd.get("min") || 0, max: +fd.get("max") || 0 }));
    };
    $("#openFilters").onclick = () => { $("#filters").classList.add("open"); showOverlay(); };
    const more = $("#moreBtn");
    if (more) more.onclick = () => {
      const grid = $("#shopGrid");
      grid.insertAdjacentHTML("beforeend", list.slice(shown, shown + PAGE).map(card).join(""));
      shown += PAGE;
      $(".more").innerHTML = shown < list.length ? `<span>Mostrando ${shown} de ${list.length}</span><button class="btn-dark" id="moreBtn">Cargar más productos</button>` : `<span>Viste los ${list.length} productos</span>`;
      const nb = $("#moreBtn"); if (nb) nb.onclick = more.onclick;
    };
  }

  // ---------- PRODUCTO ----------
  function optionsHtml(p, selected = {}) {
    return p.va.map((name) => `
      <div class="opt-label">${esc(name)}: <span data-optlabel="${esc(name)}">${esc(selected[name] || "elegí una opción")}</span></div>
      <div class="opts" data-opts="${esc(name)}">
        ${p.a[name].map((v) => `<button class="opt ${name === "Color" ? "" : "nosw"} ${selected[name] === v ? "on" : ""}" data-opt="${esc(v)}">${name === "Color" ? `<i class="sw" style="background:${swatch(v)}"></i>` : ""}${esc(v)}</button>`).join("")}
      </div>`).join("");
  }
  function bindOptions(root, p, sel) {
    $$(".opts", root).forEach((box) => box.addEventListener("click", (e) => {
      const b = e.target.closest(".opt");
      if (!b) return;
      const name = box.dataset.opts;
      sel[name] = b.dataset.opt;
      $$(".opt", box).forEach((o) => o.classList.toggle("on", o === b));
      $(`[data-optlabel="${CSS.escape(name)}"]`, root).textContent = sel[name];
    }));
  }
  function readOptions(root, p, sel) {
    const missing = p.va.filter((n) => !sel[n]);
    if (missing.length) {
      missing.forEach((n) => $$(`[data-opts="${CSS.escape(n)}"] .opt`, root).forEach((o) => { o.classList.remove("shake"); void o.offsetWidth; o.classList.add("shake"); }));
      toast(`Elegí ${missing.join(" y ").toLowerCase()} antes de agregar`);
      return null;
    }
    return p.va.map((n) => sel[n]).join(" / ");
  }
  function qtyHtml(v = 1) {
    return `<div class="qty"><button type="button" data-q="-1" aria-label="Menos">−</button><input type="number" min="1" value="${v}" aria-label="Cantidad"><button type="button" data-q="1" aria-label="Más">+</button></div>`;
  }
  function bindQty(root) {
    const box = $(".qty", root), inp = $("input", box);
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]");
      if (b) inp.value = Math.max(1, (+inp.value || 1) + +b.dataset.q);
    });
    return () => Math.max(1, Math.floor(+inp.value || 1));
  }

  function renderProduct(id) {
    const p = BY_ID.get(+id);
    if (!p) { $("#app").innerHTML = `<div class="wrap"><div class="empty" style="margin:40px 0">${ico.search}<b>Producto no encontrado</b><a class="btn-dark" href="#/tienda">Ir a la tienda</a></div></div>`; return; }
    const d = deptOf(p);
    const imgs = [p.big, ...p.g];
    const related = P.filter((x) => x.id !== p.id && d && inDept(x, d.k)).sort((a, b) => (b.brand === p.brand) - (a.brand === p.brand) || b.disc - a.disc).slice(0, 14);
    const sel = {};
    const desc = p.d.filter((l) => norm(l) !== norm(p.n));
    const visibleCats = p.c.filter((c) => !["marcas", "ver todo"].includes(c.toLowerCase()));

    $("#app").innerHTML = `
    <div class="wrap">
      <div class="crumbs"><a href="#/">Inicio</a> / <a href="#/tienda">Tienda</a>${d ? ` / <a href="#/tienda?cat=${d.k}">${d.n}</a>` : ""} / <span>${esc(p.n)}</span></div>
      <section class="pdp fade-in" id="pdp">
        <div class="gallery">
          <div class="thumbs">${imgs.map((src, i) => `<button class="${i ? "" : "on"}" data-img="${esc(src)}">${imgTag(src)}</button>`).join("")}</div>
          <div class="g-main sk" id="gMain">${imgTag(p.big, "", p.n)}</div>
        </div>
        <div class="pdp-info">
          ${p.brand ? `<a class="card-brand" href="#/tienda?marca=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a>` : ""}
          <h1>${esc(p.n)}</h1>
          <div class="pdp-tags"><span class="tag stock">● En stock</span>${visibleCats.slice(0, 5).map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</div>
          <div class="pdp-price ${p.disc ? "sale" : ""}">
            <b>${money(p.p)}</b>
            ${p.disc ? `<del>${money(p.r)}</del><span class="off">-${p.disc}%</span><small>Ahorrás ${money(p.r - p.p)} por unidad</small>` : ""}
          </div>
          ${optionsHtml(p, sel)}
          <div class="buy">
            ${qtyHtml()}
            <button class="btn-add" id="pdpAdd">${ico.cart} Agregar al pedido</button>
            ${favBtn(p, "fav-big")}
          </div>
          ${desc.length ? `<div class="pdp-desc"><ul>${desc.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div>` : ""}
          <div class="pdp-meta">
            <div>${ico.truck} Envíos a todo el país</div>
            <div>${ico.box} Venta mayorista · compra mínima ${money(MIN_COMPRA)} + IVA</div>
            <div>${ico.mail} Consultas: <a href="mailto:${EMAIL_PEDIDOS}?subject=${encodeURIComponent("Consulta: " + p.n)}" style="color:var(--primary)">${EMAIL_PEDIDOS}</a></div>
          </div>
        </div>
      </section>
      ${related.length ? `<section class="section">${secHead("También te puede interesar", d ? `#/tienda?cat=${d.k}` : "#/tienda")}${scroller(related, "rowRel")}</section>` : ""}
    </div>`;

    const root = $("#pdp");
    bindOptions(root, p, sel);
    const getQ = bindQty(root);
    $("#pdpAdd").onclick = () => {
      const opt = readOptions(root, p, sel);
      if (opt == null) return;
      addToCart(p.id, opt, getQ());
      const b = $("#pdpAdd");
      b.classList.add("done"); b.innerHTML = `${ico.check} ¡Agregado!`;
      setTimeout(() => { b.classList.remove("done"); b.innerHTML = `${ico.cart} Agregar al pedido`; }, 1600);
    };
    $(".thumbs", root).addEventListener("click", (e) => {
      const b = e.target.closest("[data-img]");
      if (!b) return;
      $$(".thumbs button", root).forEach((x) => x.classList.toggle("on", x === b));
      $("#gMain img").src = b.dataset.img;
    });
    const gm = $("#gMain");
    gm.addEventListener("mousemove", (e) => {
      const r = gm.getBoundingClientRect();
      $("img", gm).style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });
  }

  // ---------- quick add (modal) ----------
  function quickAdd(id) {
    const p = BY_ID.get(id);
    if (!p.va.length) { addToCart(id); return true; }
    const sel = {};
    openModal(`
      <div style="display:grid;grid-template-columns:120px 1fr;gap:18px;align-items:center;margin-bottom:18px">
        <div class="card-img sk" style="margin:0">${imgTag(p.img)}</div>
        <div><h3 style="font-size:18px">${esc(p.n)}</h3>${priceHtml(p)}</div>
      </div>
      ${optionsHtml(p, sel)}
      <div class="buy">${qtyHtml()}<button class="btn-add" id="qaAdd">${ico.cart} Agregar al pedido</button></div>
      <a class="ext" href="#/p/${p.id}" data-close>Ver detalle del producto ${ico.chev}</a>`);
    const root = $("#modalBody");
    bindOptions(root, p, sel);
    const getQ = bindQty(root);
    $("#qaAdd").onclick = () => {
      const opt = readOptions(root, p, sel);
      if (opt == null) return;
      closeAll();
      addToCart(p.id, opt, getQ());
    };
    return false;
  }

  // ---------- drawer (pedido / favoritos) ----------
  let drawerOpen = false, drawerTab = "cart";
  function openDrawer(tab) {
    drawerTab = tab;
    drawerOpen = true;
    $("#drawer").classList.add("open");
    $("#drawer").setAttribute("aria-hidden", "false");
    showOverlay();
    renderDrawer();
  }
  function renderDrawer() {
    $$(".tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === drawerTab));
    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if (drawerTab === "fav") {
      const list = [...favs].map((id) => BY_ID.get(id));
      body.innerHTML = list.length ? list.map((p) => `
        <div class="line">
          <a href="#/p/${p.id}" data-close><img src="${esc(p.img)}" alt=""></a>
          <div><a href="#/p/${p.id}" data-close class="line-name">${esc(p.n)}</a>${priceHtml(p)}</div>
          <div class="line-right"><button class="btn-add" style="padding:8px 12px" data-add="${p.id}">${ico.cart}</button><button class="line-del" data-fav="${p.id}">Quitar</button></div>
        </div>`).join("") : `<div class="empty" style="box-shadow:none">${ico.heart}<b>Todavía no tenés favoritos</b>Tocá el corazón de cualquier producto para guardarlo acá.</div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = cart.length ? cart.map((l, i) => {
      const p = BY_ID.get(l.id);
      return `<div class="line">
        <a href="#/p/${p.id}" data-close><img src="${esc(p.img)}" alt=""></a>
        <div style="min-width:0">
          <a href="#/p/${p.id}" data-close class="line-name">${esc(p.n)}</a>
          <div class="line-opt">${l.opt ? esc(l.opt) + " · " : ""}${money(p.p)} c/u</div>
          <div class="qty"><button data-line="${i}" data-d="-1" aria-label="Menos">−</button><input value="${l.q}" data-line-in="${i}" type="number" min="1" aria-label="Cantidad"><button data-line="${i}" data-d="1" aria-label="Más">+</button></div>
        </div>
        <div class="line-right"><b>${money(p.p * l.q)}</b><button class="line-del" data-del="${i}">Eliminar</button></div>
      </div>`;
    }).join("") : `<div class="empty" style="box-shadow:none">${ico.cart}<b>Tu pedido está vacío</b>Agregá productos para armar tu compra mayorista.<br><br><a class="btn-dark" href="#/tienda" data-close>Ir a la tienda</a></div>`;
    if (!cart.length) { foot.innerHTML = ""; return; }
    const tot = cartTotal(), falta = MIN_COMPRA - tot, pct = Math.min(100, (tot / MIN_COMPRA) * 100);
    foot.innerHTML = `
      <div class="min">${falta > 0 ? `Te faltan <b>${money(falta)}</b> para la compra mínima mayorista` : `<b style="color:var(--green)">✓ Llegaste a la compra mínima</b>`}
        <div class="save-bar"><i class="${falta > 0 ? "" : "ok"}" style="width:${pct}%"></i></div></div>
      <div class="tot"><span>Subtotal (${cartQty()} u.)</span><b>${money(tot)}</b></div>
      <div class="tot-note">Compra mínima ${money(MIN_COMPRA)} + IVA. El envío se coordina al confirmar el pedido.</div>
      <button class="btn-dark" id="checkoutBtn" ${falta > 0 ? "disabled" : ""}>Finalizar pedido</button>`;
    const cb = $("#checkoutBtn");
    if (cb) cb.onclick = checkout;
  }

  function checkout() {
    const lines = cart.map((l) => { const p = BY_ID.get(l.id); return { p, l, sub: p.p * l.q }; });
    const PROV = ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];
    openModal(`
      <h3>Finalizar pedido</h3>
      <p>Completá tus datos y te enviamos el pedido por email para que el equipo de ventas lo confirme.</p>
      <form class="form" id="coForm">
        <label class="full">Nombre o razón social<input name="nombre" required autocomplete="organization"></label>
        <label>CUIT<input name="cuit" inputmode="numeric" placeholder="20-12345678-9"></label>
        <label>Teléfono<input name="tel" type="tel" required autocomplete="tel"></label>
        <label class="full">Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Provincia<select name="prov" required><option value="">Elegí…</option>${PROV.map((x) => `<option>${x}</option>`).join("")}</select></label>
        <label>Localidad<input name="loc" required autocomplete="address-level2"></label>
        <label class="full">Notas<textarea name="notas" rows="2" placeholder="Transporte preferido, horarios, etc."></textarea></label>
        <div class="sum full">${lines.map(({ p, l, sub }) => `<div><span>${l.q} × ${esc(p.n)}${l.opt ? ` (${esc(l.opt)})` : ""}</span><span>${money(sub)}</span></div>`).join("")}
          <div class="sum-t"><span>Total</span><span>${money(cartTotal())}</span></div></div>
        <button class="btn-dark full" style="grid-column:1/-1">Enviar pedido</button>
      </form>`);
    $("#coForm").onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const body = [
        `Pedido mayorista — ${d.nombre}`, `CUIT: ${d.cuit || "-"}`, `Tel: ${d.tel}`, `Email: ${d.email}`, `Destino: ${d.loc}, ${d.prov}`, "",
        ...lines.map(({ p, l, sub }) => `${l.q} x ${p.n}${l.opt ? ` (${l.opt})` : ""} — ${money(sub)}  [id ${p.id}]`),
        "", `TOTAL: ${money(cartTotal())}`, d.notas ? `\nNotas: ${d.notas}` : "",
      ].join("\n");
      location.href = `mailto:${EMAIL_PEDIDOS}?subject=${encodeURIComponent("Pedido mayorista — " + d.nombre)}&body=${encodeURIComponent(body)}`;
      cart = []; saveCart();
      openModal(`<div style="text-align:center"><div class="ok-ico">${ico.check}</div><h3>¡Pedido listo!</h3><p>Se abrió tu programa de email con el detalle del pedido. Envialo y el equipo de ventas te contacta para confirmar stock, pago y envío.</p><a class="btn-dark" href="#/" data-close>Seguir comprando</a></div>`);
    };
  }

  // ---------- overlay / modal / toast ----------
  function showOverlay() { $("#overlay").hidden = false; document.body.style.overflow = "hidden"; }
  function openModal(html) { $("#modalBody").innerHTML = html; $("#modal").hidden = false; document.body.style.overflow = "hidden"; }
  function closeAll() {
    drawerOpen = false;
    $("#drawer").classList.remove("open");
    $("#drawer").setAttribute("aria-hidden", "true");
    $("#sidemenu").classList.remove("open");
    $("#filters")?.classList.remove("open");
    $("#modal").hidden = true;
    $("#overlay").hidden = true;
    document.body.style.overflow = "";
  }
  let toastTimer;
  function toast(html) {
    const t = $("#toast");
    t.innerHTML = html;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  // ---------- búsqueda con sugerencias ----------
  function initSearch() {
    const form = $("#searchForm"), input = $("#searchInput"), sel = $("#searchCat"), box = $("#suggest");
    sel.innerHTML += DEPTS.map((d) => `<option value="${d.k}">${d.n}</option>`).join("");
    let idx = -1;
    const submit = () => {
      box.hidden = true;
      go(shopUrl({ q: input.value.trim(), cat: sel.value, marcas: [], oferta: false, min: 0, max: 0, orden: "" }));
      input.blur();
    };
    form.onsubmit = (e) => { e.preventDefault(); submit(); };
    input.addEventListener("input", () => {
      const q = input.value.trim();
      idx = -1;
      if (q.length < 2) { box.hidden = true; return; }
      const res = filterProducts({ q, cat: sel.value, marcas: [], oferta: false, min: 0, max: 0, orden: "" });
      box.innerHTML = res.length
        ? res.slice(0, 6).map((p) => `<a href="#/p/${p.id}"><img src="${esc(p.img)}" alt=""><span>${esc(p.n)}</span><span class="s-price">${money(p.p)}</span></a>`).join("") +
          `<a class="s-all" href="#" data-all>Ver los ${res.length} resultados</a>`
        : `<a class="s-all">Sin resultados para “${esc(q)}”</a>`;
      box.hidden = false;
    });
    input.addEventListener("keydown", (e) => {
      const items = $$("a", box);
      if (box.hidden || !items.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle("on", i === idx));
      } else if (e.key === "Enter" && idx >= 0) {
        e.preventDefault();
        items[idx].click();
      } else if (e.key === "Escape") box.hidden = true;
    });
    box.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (a.hasAttribute("data-all")) { e.preventDefault(); submit(); }
      box.hidden = true;
    });
    document.addEventListener("click", (e) => { if (!form.contains(e.target)) box.hidden = true; });
  }

  // ---------- navegación ----------
  function initNav() {
    const counts = Object.fromEntries(DEPTS.map((d) => [d.k, ofDept(d.k).length]));
    const deptLinks = DEPTS.filter((d) => counts[d.k]).map((d) => `<a href="#/tienda?cat=${d.k}">${d.n} <span>${counts[d.k]}</span></a>`).join("");
    $("#deptMenu").innerHTML = deptLinks;
    $("#sideBody").innerHTML = `<div class="side-list"><a href="#/" data-close>Inicio</a><a href="#/tienda?oferta=1" data-close>Ofertas <span>${P.filter((p) => p.disc).length}</span></a>${deptLinks.replace(/<a /g, "<a data-close ")}</div>`;
    const links = [["#/", "Inicio"], ["#/tienda?cat=mochilas", "Mochilas"], ["#/tienda?cat=carteras", "Carteras"], ["#/tienda?cat=billeteras", "Billeteras"], ["#/tienda?cat=valijas", "Valijas"], ["#/tienda?cat=escolar", "Escolar"], ["#/tienda?cat=bazar", "Bazar"], ["#/tienda?oferta=1", "Ofertas"], ["#/tienda", "Todo"]];
    $("#navLinks").innerHTML = links.map(([h, t]) => `<a href="${h}">${t}</a>`).join("");
    $("#fCats").innerHTML = DEPTS.slice(0, 8).map((d) => `<li><a href="#/tienda?cat=${d.k}">${d.n}</a></li>`).join("");
    $("#fBrands").innerHTML = BRANDS.slice(0, 8).map((b) => `<li><a href="#/tienda?marca=${encodeURIComponent(b)}">${b}</a></li>`).join("");
    $("#promoText").textContent = `Ofertas de hasta ${maxDisc(P)}% OFF`;
    $("#featCount").textContent = `+${Math.floor(P.length / 100) * 100} productos`;
    $("#year").textContent = new Date().getFullYear();
    $("#deptBtn").onclick = () => $(".dept").classList.toggle("open");
    $("#menuBtn").onclick = () => { $("#sidemenu").classList.add("open"); showOverlay(); };
    $("#newsForm").onsubmit = (e) => { e.preventDefault(); e.target.reset(); toast("¡Gracias! Te vamos a avisar de las novedades."); };
  }

  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

  // ---------- movimiento premium ----------
  let revealObserver;
  function initPremiumMotion() {
    const app = $("#app");
    if (!app) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.toggle("reduce-motion", reduced);
    revealObserver?.disconnect();

    const reveals = $$(".hero, .section, .marquee, .shop", app);
    reveals.forEach((el) => el.classList.add("reveal"));

    if (reduced || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    reveals.forEach((el) => revealObserver.observe(el));

    // Profundidad reactiva, limitada a punteros precisos para no afectar móviles.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".tile, .card, .cat, .banner, .brand, .deal, .feat-big", app).forEach((el) => {
      el.classList.add("motion-surface");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
        el.style.setProperty("--rx", `${(0.5 - y) * 2.2}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * 2.2}deg`);
        el.classList.add("motion-active");
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("motion-active");
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
      });
    });
  }

  function route() {
    clearInterval(sliderTimer);
    clearInterval(countdownTimer);
    closeAll();
    $(".dept")?.classList.remove("open");
    const h = location.hash.slice(1) || "/";
    const [path, qs] = h.split("?");
    const params = new URLSearchParams(qs || "");
    const prevScroll = path.startsWith("/tienda") && route.last?.startsWith("/tienda");
    if (path.startsWith("/p/")) renderProduct(path.slice(3));
    else if (path.startsWith("/tienda")) renderShop(params);
    else renderHome();
    initPremiumMotion();
    $$("#navLinks a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + h || (h === "/" && a.getAttribute("href") === "#/")));
    if (!prevScroll) window.scrollTo({ top: 0, behavior: "instant" });
    route.last = path;
  }

  // ---------- eventos globales ----------
  document.addEventListener("click", (e) => {
    const t = e.target;
    const add = t.closest("[data-add]");
    if (add) {
      e.preventDefault();
      const added = quickAdd(+add.dataset.add);
      if (added && add.classList.contains("btn-add") && !add.closest(".drawer")) {
        const old = add.innerHTML;
        add.classList.add("done"); add.innerHTML = `${ico.check} Agregado`;
        setTimeout(() => { add.classList.remove("done"); add.innerHTML = old; }, 1400);
      }
      return;
    }
    const fav = t.closest("[data-fav]");
    if (fav) { e.preventDefault(); toggleFav(+fav.dataset.fav); return; }
    const dr = t.closest("[data-drawer]");
    if (dr) { e.preventDefault(); openDrawer(dr.dataset.drawer); $("#toast").classList.remove("show"); return; }
    const tab = t.closest("[data-tab]");
    if (tab) { drawerTab = tab.dataset.tab; renderDrawer(); return; }
    const goB = t.closest("[data-go]");
    if (goB) { go(goB.dataset.go); return; }
    const sc = t.closest("[data-scroll]");
    if (sc) { const row = $("#" + sc.dataset.scroll); row.scrollBy({ left: row.clientWidth * 0.8 * +sc.dataset.dir, behavior: "smooth" }); return; }
    const line = t.closest("[data-line]");
    if (line) { const l = cart[+line.dataset.line]; l.q = Math.max(1, l.q + +line.dataset.d); saveCart(); renderDrawer(); return; }
    const del = t.closest("[data-del]");
    if (del) { cart.splice(+del.dataset.del, 1); saveCart(); renderDrawer(); return; }
    if (t.closest("[data-close-filters]")) { closeAll(); return; }
    if (t.closest("[data-close]") || t === $("#overlay") || t === $("#modal")) { closeAll(); }
  });
  document.addEventListener("change", (e) => {
    const inp = e.target.closest("[data-line-in]");
    if (inp) { cart[+inp.dataset.lineIn].q = Math.max(1, Math.floor(+inp.value || 1)); saveCart(); renderDrawer(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    $("#header").classList.toggle("stuck", y > 40);
    $("#toTop").classList.toggle("show", y > 600);
  }, { passive: true });
  $("#toTop").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  window.addEventListener("hashchange", route);

  initNav();
  initSearch();
  paintCounters();
  route();
})();
