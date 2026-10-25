# Bolsa Mayor

Tienda online de marroquinería y accesorios: HTML, CSS y JS sin dependencias ni build.

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

- `MIN_COMPRA`: compra mínima (0 = sin mínimo; si es mayor, bloquea "Finalizar pedido" hasta alcanzarla)
- `EMAIL_PEDIDOS`: adónde llega el pedido (también aparece en `index.html`)

## Precios

`productos.js` guarda los precios oficiales de EPA, que se publican **+ IVA**. `app.js` calcula el precio de venta:

```
costo  = precio EPA × (1 − 20% descuento de empleado) × 1,21 (IVA)
precio = costo / (1 − margen − comisión)
```

- margen: estable por producto, entre 20% y 30% (`MIN_OPERATING_MARGIN` / `MAX_OPERATING_MARGIN`)
- comisión: Mercado Pago con cobro inmediato, 6,29% + IVA (`PAYMENT_FEE`)
- La ganancia (precio − comisión − costo) se reparte 50/50.

Resultado sobre el catálogo: margen promedio 25%, y el precio de venta queda entre 1,11 y 1,31 veces el precio de EPA con IVA.

## Actualizar el catálogo

```
cd scraper
python scrape.py        # baja los productos (JSON, CSV y Excel en scraper/)
python build_data.py    # regenera ../productos.js
```
