# Bolsa Mayor

Tienda mayorista de marroquinería y accesorios: HTML, CSS y JS sin dependencias ni build.

## Ver la página

Abrí `index.html` en el navegador. Las imágenes de los productos se cargan desde internet.

## Estructura

- `index.html`: estructura (header, footer, drawers, modal)
- `styles.css`: diseño
- `app.js`: lógica (home, tienda con filtros, ficha de producto, carrito, favoritos, pedido por email)
- `productos.js`: catálogo generado (`window.PRODUCTOS`)
- `scraper/`: scripts para regenerar el catálogo

## Configuración

Al principio de `app.js`:

- `MIN_COMPRA`: compra mínima mayorista (bloquea "Finalizar pedido" hasta alcanzarla)
- `EMAIL_PEDIDOS`: adónde llega el pedido (también aparece en `index.html`)

## Actualizar el catálogo

```
cd scraper
python scrape.py        # baja los productos (JSON, CSV y Excel en scraper/)
python build_data.py    # regenera ../productos.js
```
