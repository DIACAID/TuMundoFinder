# Tu Mundo Finder - Estructura inicial de base de datos

Esta propuesta esta pensada para un MVP escalable: primero permite registrar usuarios, verificar empresas, ubicar tiendas en mapa y asociar productos normalizados a cada tienda con precio y disponibilidad. Luego puede crecer hacia stock automatico, recomendaciones con IA, suscripciones y analitica.

## Motor recomendado

**PostgreSQL + PostGIS**

Motivos:

- Permite buscar tiendas cercanas por distancia real.
- Escala bien para catalogos grandes.
- Soporta busqueda de texto con indices.
- Puede combinar filtros tecnicos, mapa, precio y disponibilidad.
- Es compatible con APIs Node.js y ORMs como Prisma, Drizzle o Sequelize.

## Idea central del modelo

Tu Mundo Finder no deberia depender de que cada tienda escriba productos desde cero. Lo mas escalable es tener un **catalogo central normalizado** y que cada tienda solo indique que vende ese producto.

Ejemplo:

- Catalogo central: `Tornillo para madera cabeza plana 8 x 1 1/2`
- Tienda A: lo vende a `$2.990`, disponible, sucursal Santiago Centro
- Tienda B: lo vende a `$3.200`, consultar disponibilidad, sucursal Maipu

Asi el buscador entiende que varias tiendas venden el mismo producto, aunque cada una tenga precio, foto, disponibilidad o condiciones distintas.

## Entidades principales

### 1. Usuarios

Tabla: `users`

Representa a cualquier persona que use la aplicacion.

Campos sugeridos:

- `id`
- `email`
- `password_hash`
- `full_name`
- `phone`
- `role`: `customer`, `business_owner`, `admin`
- `status`: `active`, `disabled`, `pending`
- `created_at`
- `updated_at`

Notas:

- Un usuario normal puede buscar productos.
- El mismo usuario puede solicitar activar una empresa.
- Un administrador puede verificar empresas y moderar catalogo.

### 2. Empresas

Tabla: `businesses`

Representa la empresa o emprendimiento verificado.

Campos sugeridos:

- `id`
- `owner_user_id`
- `legal_name`
- `trade_name`
- `tax_id`
- `description`
- `website_url`
- `contact_email`
- `contact_phone`
- `verification_status`: `pending`, `verified`, `rejected`
- `created_at`
- `updated_at`

Relacion:

- Una empresa pertenece a un usuario propietario.
- Una empresa puede tener una o varias tiendas/sucursales.

### 3. Solicitudes de verificacion

Tabla: `business_verification_requests`

Sirve para revisar manualmente empresas durante la beta.

Campos sugeridos:

- `id`
- `business_id`
- `submitted_by_user_id`
- `status`: `pending`, `approved`, `rejected`
- `document_url`
- `notes`
- `reviewed_by_user_id`
- `reviewed_at`
- `created_at`

Notas:

- En beta, la verificacion manual es suficiente.
- Mas adelante se puede integrar validacion tributaria o documental.

### 4. Tiendas o sucursales

Tabla: `stores`

Representa un punto fisico en el mapa.

Campos sugeridos:

- `id`
- `business_id`
- `name`
- `description`
- `address_line`
- `commune`
- `region`
- `country`
- `latitude`
- `longitude`
- `location`: tipo geografico PostGIS `geography(Point, 4326)`
- `phone`
- `whatsapp`
- `is_active`
- `created_at`
- `updated_at`

Indices importantes:

- Indice geografico en `location`
- Indice por `commune`
- Indice por `region`

Notas:

- Para busqueda por proximidad, conviene usar `location` con PostGIS.
- `latitude` y `longitude` tambien pueden guardarse para facilidad de uso en frontend.

### 5. Horarios de tienda

Tabla: `store_hours`

Campos sugeridos:

- `id`
- `store_id`
- `weekday`: 0 a 6
- `opens_at`
- `closes_at`
- `is_closed`

Notas:

- Permite mostrar si la tienda esta abierta.
- Puede quedar para una segunda etapa si el MVP necesita ser mas simple.

## Catalogo central de productos

### 6. Categorias

Tabla: `product_categories`

Campos sugeridos:

- `id`
- `parent_id`
- `name`
- `slug`
- `description`
- `created_at`
- `updated_at`

Ejemplo:

- Ferreteria
- Ferreteria > Fijaciones
- Ferreteria > Fijaciones > Tornillos
- Ferreteria > Maderas
- Ferreteria > Herramientas

### 7. Productos base

Tabla: `products`

Representa el producto normalizado del catalogo.

Campos sugeridos:

- `id`
- `category_id`
- `name`
- `slug`
- `description`
- `brand`
- `model`
- `unit`: `unidad`, `pack`, `kg`, `metro`, `litro`
- `search_text`
- `is_active`
- `created_by_user_id`
- `created_at`
- `updated_at`

Notas:

- `search_text` puede guardar una version preparada para busqueda: nombre, sinonimos, medidas, categoria y descripcion.
- `brand` puede ser opcional, porque muchos productos genericos no tendran marca.

### 8. Variantes de productos

Tabla: `product_variants`

Representa una version especifica del producto.

Ejemplo: no basta con "tornillo para madera"; se necesita medida, cabeza, material, largo, etc.

Campos sugeridos:

- `id`
- `product_id`
- `sku_internal`
- `name`
- `description`
- `barcode`
- `manufacturer_sku`
- `is_active`
- `created_at`
- `updated_at`

Ejemplo:

- Producto: `Tornillo para madera`
- Variante: `Tornillo para madera cabeza plana zincado 8 x 1 1/2`

### 9. Atributos tecnicos

Tabla: `product_attributes`

Define los atributos posibles por categoria o producto.

Campos sugeridos:

- `id`
- `category_id`
- `name`
- `code`
- `data_type`: `text`, `number`, `boolean`, `option`
- `unit`
- `is_filterable`
- `is_required`

Ejemplos para tornillos:

- `diameter`
- `length`
- `head_type`
- `material`
- `finish`
- `thread_type`
- `recommended_use`

### 10. Valores tecnicos de variantes

Tabla: `product_variant_attribute_values`

Guarda los valores concretos de cada variante.

Campos sugeridos:

- `id`
- `variant_id`
- `attribute_id`
- `text_value`
- `number_value`
- `boolean_value`
- `option_value`

Ejemplo:

- Variante: `Tornillo madera cabeza plana 8 x 1 1/2`
- Atributo: `head_type`
- Valor: `cabeza plana`

Notas:

- Este modelo evita crear muchas columnas rigidas.
- Permite que cada categoria tenga atributos distintos.

### 11. Sinonimos y palabras clave

Tabla: `product_keywords`

Campos sugeridos:

- `id`
- `product_id`
- `variant_id`
- `keyword`
- `keyword_type`: `synonym`, `common_name`, `technical_name`, `misspelling`

Ejemplos:

- `tornillo madera`
- `tirafondo`
- `tornillo cabeza plana`
- `tornillo para mueble`

Notas:

- Esta tabla es clave para la busqueda inteligente.
- Tambien ayuda a corregir diferencias entre lenguaje tecnico y lenguaje comun.

### 12. Imagenes de productos

Tabla: `product_images`

Campos sugeridos:

- `id`
- `product_id`
- `variant_id`
- `url`
- `alt_text`
- `source`: `catalog`, `store`, `admin`
- `is_primary`
- `created_at`

Notas:

- Puede haber una imagen oficial del catalogo y fotos subidas por tiendas.

## Productos vendidos por tiendas

### 13. Inventario comercial de tienda

Tabla: `store_products`

Esta es una de las tablas mas importantes. Une tienda + variante de producto.

Campos sugeridos:

- `id`
- `store_id`
- `variant_id`
- `store_sku`
- `price`
- `currency`: por defecto `CLP`
- `availability_status`: `available`, `low_stock`, `on_request`, `out_of_stock`
- `stock_quantity`
- `stock_mode`: `manual`, `approximate`, `external`, `not_tracked`
- `is_featured`
- `is_active`
- `last_confirmed_at`
- `created_at`
- `updated_at`

Notas:

- Para la beta, `stock_quantity` puede ser opcional.
- Lo mas sano es partir con disponibilidad simple.
- `last_confirmed_at` ayuda a mostrar si la informacion esta fresca.

### 14. Historial de precios

Tabla: `store_product_price_history`

Campos sugeridos:

- `id`
- `store_product_id`
- `old_price`
- `new_price`
- `changed_by_user_id`
- `changed_at`

Notas:

- No es obligatorio para el primer MVP.
- Sirve para descuentos, auditoria y futuras recomendaciones de precio.

## Busqueda, mapa e IA

### 15. Busquedas realizadas

Tabla: `search_queries`

Campos sugeridos:

- `id`
- `user_id`
- `query_text`
- `latitude`
- `longitude`
- `filters_json`
- `results_count`
- `created_at`

Notas:

- Sirve para entender que busca la gente.
- Ayuda a decidir que productos cargar primero al catalogo central.

### 16. Consultas de recomendacion IA

Tabla: `ai_recommendation_requests`

Campos sugeridos:

- `id`
- `user_id`
- `prompt`
- `context_json`
- `response_summary`
- `created_at`

Ejemplo:

Usuario pregunta:

> Quiero construir un mueble con MDF de 18 mm. Que tornillos necesito?

La IA podria recomendar variantes del catalogo y luego cruzarlas con tiendas cercanas.

### 17. Productos recomendados por IA

Tabla: `ai_recommendation_products`

Campos sugeridos:

- `id`
- `recommendation_request_id`
- `variant_id`
- `reason`
- `rank`

Notas:

- Permite explicar por que se recomendo un producto.
- Tambien permite medir si la recomendacion fue util.

## Suscripciones y beta

### 18. Planes

Tabla: `subscription_plans`

Campos sugeridos:

- `id`
- `name`
- `price`
- `currency`
- `billing_period`: `monthly`, `yearly`
- `max_stores`
- `max_products`
- `features_json`
- `is_active`

### 19. Suscripciones de empresas

Tabla: `business_subscriptions`

Campos sugeridos:

- `id`
- `business_id`
- `plan_id`
- `status`: `trial`, `active`, `past_due`, `cancelled`
- `trial_ends_at`
- `current_period_starts_at`
- `current_period_ends_at`
- `created_at`
- `updated_at`

Notas:

- Durante beta, todas las empresas pueden quedar en plan `trial`.
- Despues se activa cobro por suscripcion.

## Modelo relacional resumido

```text
users
  └── businesses
        ├── business_verification_requests
        ├── business_subscriptions
        └── stores
              ├── store_hours
              └── store_products
                    └── product_variants
                          ├── products
                          │     ├── product_categories
                          │     ├── product_keywords
                          │     └── product_images
                          └── product_variant_attribute_values
                                └── product_attributes
```

## Busqueda recomendada para MVP

Para una primera version, el flujo de busqueda podria ser:

1. Usuario escribe una busqueda.
2. Backend busca coincidencias en `products`, `product_variants`, `product_keywords` y atributos tecnicos.
3. Backend cruza los productos encontrados con `store_products`.
4. Backend ordena resultados por:
   - cercania al usuario
   - disponibilidad
   - precio
   - calidad de coincidencia del texto
5. Frontend muestra:
   - mapa con tiendas
   - lista de productos/tiendas
   - precio
   - disponibilidad
   - distancia

## Orden de implementacion recomendado

### MVP 1

- `users`
- `businesses`
- `business_verification_requests`
- `stores`
- `product_categories`
- `products`
- `product_variants`
- `product_attributes`
- `product_variant_attribute_values`
- `product_keywords`
- `store_products`

### MVP 2

- `product_images`
- `store_hours`
- `search_queries`
- `ai_recommendation_requests`
- `ai_recommendation_products`

### Futuro

- `subscription_plans`
- `business_subscriptions`
- `store_product_price_history`
- integraciones de stock externo
- carga masiva de productos por Excel o CSV

## Consejo final de modelado

El catalogo central debe ser controlado. En la beta, conviene que las tiendas puedan:

- seleccionar productos existentes;
- sugerir productos nuevos;
- editar solo su precio, disponibilidad, foto propia y observaciones;
- no modificar libremente el producto central.

Esto protege la calidad del buscador y hace posible que la IA recomiende productos con precision.
