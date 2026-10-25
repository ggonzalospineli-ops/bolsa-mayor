import json, csv, html, re, time, urllib.request, sys, os
BASE = "https://www.epaccesorios.com.ar/wp-json/wc/store/v1/products"
OUT = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "Mozilla/5.0"}

def get(page):
    req = urllib.request.Request(f"{BASE}?per_page=100&page={page}", headers=UA)
    for i in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r), int(r.headers.get("X-WP-TotalPages", 1))
        except Exception as e:
            print("reintento", page, e); time.sleep(3)
    raise SystemExit(f"falló página {page}")

def txt(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()

def money(v, minor):
    return int(v) / 10**minor if v not in (None, "") else None

raw, page, total = [], 1, 1
while page <= total:
    data, total = get(page)
    raw += data
    print(f"página {page}/{total}: {len(data)}")
    page += 1; time.sleep(0.5)

json.dump(raw, open(os.path.join(OUT, "productos_raw.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

rows = []
for p in raw:
    pr = p["prices"]; m = pr.get("currency_minor_unit", 2)
    rng = pr.get("price_range") or {}
    rows.append({
        "id": p["id"],
        "nombre": html.unescape(p["name"]),
        "sku": p.get("sku"),
        "tipo": p.get("type"),
        "precio": money(pr.get("price"), m),
        "precio_regular": money(pr.get("regular_price"), m),
        "precio_oferta": money(pr.get("sale_price"), m) if p.get("on_sale") else None,
        "precio_min": money(rng.get("min_amount"), m) if rng else None,
        "precio_max": money(rng.get("max_amount"), m) if rng else None,
        "moneda": pr.get("currency_code"),
        "en_oferta": p.get("on_sale"),
        "en_stock": p.get("is_in_stock"),
        "categorias": " | ".join(html.unescape(c["name"]) for c in p.get("categories", [])),
        "marcas": " | ".join(html.unescape(b["name"]) for b in p.get("brands", []) or []),
        "atributos": " | ".join(f'{a["name"]}: ' + ", ".join(t["name"] for t in a.get("terms", [])) for a in p.get("attributes", [])),
        "variaciones": len(p.get("variations", [])),
        "imagen": (p.get("images") or [{}])[0].get("src"),
        "imagenes": " | ".join(i["src"] for i in p.get("images", [])),
        "url": p.get("permalink"),
        "descripcion_corta": txt(p.get("short_description")),
        "descripcion": txt(p.get("description")),
    })

with open(os.path.join(OUT, "productos.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys(), delimiter=";")
    w.writeheader(); w.writerows(rows)
try:
    import openpyxl
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Productos"
    ws.append(list(rows[0].keys()))
    for r in rows: ws.append(list(r.values()))
    ws.freeze_panes = "A2"; ws.auto_filter.ref = ws.dimensions
    wb.save(os.path.join(OUT, "productos.xlsx"))
except ImportError:
    print("sin openpyxl: no se generó xlsx")
print("total productos:", len(rows))
