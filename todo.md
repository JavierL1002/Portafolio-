# Finance Tracker - Lista de Tareas

## Esquema de Base de Datos
- [x] Diseñar tabla de tasas de cambio (fecha, tasa_oficial, tasa_paralelo)
- [x] Diseñar tabla de criptomonedas (símbolo, nombre)
- [x] Diseñar tabla de compras (usuario, criptomoneda, cantidad, precio, fecha, tipo_cambio)
- [x] Generar código SQL para Supabase con todas las tablas

## Backend - Integración API Binance
- [x] Implementar función para obtener precio actual de criptomonedas desde Binance
- [x] Implementar función para obtener precios históricos desde Binance
- [x] Crear procedimiento tRPC para consultar precios actuales
- [x] Crear procedimiento tRPC para consultar precios históricos por fecha

## Backend - Gestión de Tasas de Cambio
- [x] Crear procedimiento para importar tasas de cambio desde Excel
- [x] Crear procedimiento para consultar tasa de cambio por fecha específica
- [ ] Implementar lógica de interpolación si falta una fecha

## Backend - Gestión de Compras
- [x] Crear procedimiento para registrar nueva compra de criptomoneda
- [x] Crear procedimiento para listar todas las compras del usuario
- [x] Crear procedimiento para editar compra existente
- [x] Crear procedimiento para eliminar compra
- [x] Implementar cálculo de precio promedio de últimas 5 compras

## Backend - Cálculos Financieros
- [x] Implementar cálculo de valor actual del portafolio
- [x] Implementar cálculo de valor histórico del portafolio por fecha
- [x] Implementar cálculo de ganancias/pérdidas en USD
- [x] Implementar cálculo de ganancias/pérdidas en moneda local
- [x] Implementar conversión de precios usando tasas históricas

## Frontend - Dashboard Principal
- [x] Diseñar layout principal con navegación lateral
- [x] Crear vista de resumen del portafolio (valor total, ganancia/pérdida)
- [x] Mostrar lista de criptomonedas con valores actuales
- [ ] Implementar gráfico de rendimiento del portafolio
- [x] Mostrar estadísticas clave (mejor/peor inversión)

## Frontend - Gestión de Compras
- [x] Crear formulario para registrar nueva compra
- [x] Implementar selector de criptomoneda
- [x] Implementar selector de fecha con calendario
- [ ] Mostrar precio actual de la criptomoneda seleccionada
- [x] Crear tabla de historial de compras con filtros
- [ ] Implementar edición de compras existentes
- [x] Implementar eliminación de compras

## Frontend - Visualización de Datos
- [ ] Crear gráfico de evolución del portafolio en el tiempo
- [ ] Crear gráfico de distribución de criptomonedas
- [ ] Implementar filtro por rango de fechas
- [ ] Mostrar comparación precio compra vs precio actual
- [ ] Implementar selector de tipo de cambio (oficial/paralelo)

## Frontend - Importación de Datos
- [x] Crear interfaz para importar archivo Excel de tasas de cambio
- [x] Mostrar progreso de importación
- [x] Validar datos antes de importar
- [x] Mostrar resumen de datos importados

## Estilo y Diseño
- [x] Definir paleta de colores profesional
- [x] Configurar tipografía elegante
- [x] Implementar tema oscuro/claro
- [ ] Diseñar componentes personalizados para gráficos
- [x] Optimizar diseño responsive para móviles

## Testing y Documentación
- [ ] Escribir tests para procedimientos de cálculo
- [ ] Escribir tests para integración con Binance
- [ ] Documentar uso de la API
- [ ] Crear guía de importación de datos

## Integración APIs Externas
- [x] Integrar API del BCV para obtener dólar oficial diariamente
- [x] Integrar API de Binance para calcular dólar paralelo (promedio últimos 5 anuncios USDT)
- [x] Crear job automático para actualizar tasas diariamente
- [x] Importar datos históricos desde Excel (1,435 registros)

## Integración GitHub
- [x] Conectar proyecto con repositorio https://github.com/JavierL1002/Portafolio-.git
- [x] Generar código SQL completo para Supabase

## Integración APIs Externas
- [ ] Integrar API del BCV para obtener dólar oficial diariamente
- [ ] Integrar API de Binance para calcular dólar paralelo (promedio últimos 5 anuncios USDT)
- [ ] Crear job automático para actualizar tasas diariamente
- [ ] Importar datos históricos desde Excel (1,435 registros)

## Integración GitHub
- [ ] Conectar proyecto con repositorio https://github.com/JavierL1002/Portafolio-.git
- [ ] Generar código SQL completo para Supabase
