# Genera ../productos.js a partir de productos_raw.json
import json, html, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
raw = json.load(open(os.path.join(HERE, "productos_raw.json"), encoding="utf-8"))

def size(img, w):
    for part in (img.get("srcset") or "").split(","):
        part = part.strip()
        if part.endswith(f" {w}w"):
            return part.rsplit(" ", 1)[0]
    return img.get("thumbnail") or img.get("src")

def txt(s):
    s = re.sub(r"<[^>]+>", "\n", s or "")
    lines = [re.sub(r"\s+", " ", html.unescape(l)).strip() for l in s.split("\n")]
    return [l for l in lines if l][:6]

def money(v, m):
    return round(int(v) / 10**m) if v not in (None, "") else None

out = []
for p in raw:
    if not p.get("images"):
        continue
    pr = p["prices"]; m = pr.get("currency_minor_unit", 2)
    rng = pr.get("price_range") or {}
    img = p["images"][0]
    attrs, var = {}, []
    for a in p.get("attributes", []):
        name = html.unescape(a["name"])
        attrs[name] = [html.unescape(t["name"]) for t in a.get("terms", [])]
        if a.get("has_variations") and len(attrs[name]) > 1:
            var.append(name)
    out.append({
        "id": p["id"],
        "n": html.unescape(p["name"]).replace("–", "–"),
        "p": money(rng.get("min_amount"), m) if rng else money(pr["price"], m),
        "r": money(pr.get("regular_price"), m),
        "o": bool(p.get("on_sale")),
        "c": [html.unescape(c["name"]) for c in p.get("categories", [])],
        "img": size(img, 400),
        "big": size(img, 800),
        "g": [size(i, 400) for i in p["images"][1:4]],
        "u": p.get("permalink"),
        "d": txt(p.get("short_description")) or txt(p.get("description")),
        "a": attrs,
        "va": var,
        "rt": float(p.get("average_rating") or 0),
        "rv": p.get("review_count") or 0,
    })

dst = os.path.join(HERE, "..", "productos.js")
with open(dst, "w", encoding="utf-8") as f:
    f.write("window.PRODUCTOS=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";")
print(len(out), "productos ->", os.path.getsize(dst) // 1024, "KB")
print("con rating:", sum(1 for x in out if x["rv"]))
print("descuentos:", sorted({round(100 - x["p"] * 100 / x["r"]) for x in out if x["o"] and x["r"]}))
