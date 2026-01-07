# Finance Tracker - Lista de Tareas

## Esquema de Base de Datos
- [ ] Diseñar tabla de tasas de cambio (fecha, tasa_oficial, tasa_paralelo)
- [ ] Diseñar tabla de criptomonedas (símbolo, nombre)
- [ ] Diseñar tabla de compras (usuario, criptomoneda, cantidad, precio, fecha, tipo_cambio)
- [ ] Generar código SQL para Supabase con todas las tablas

## Backend - Integración API Binance
- [ ] Implementar función para obtener precio actual de criptomonedas desde Binance
- [ ] Implementar función para obtener precios históricos desde Binance
- [ ] Crear procedimiento tRPC para consultar precios actuales
- [ ] Crear procedimiento tRPC para consultar precios históricos por fecha

## Backend - Gestión de Tasas de Cambio
- [ ] Crear procedimiento para importar tasas de cambio desde Excel
- [ ] Crear procedimiento para consultar tasa de cambio por fecha específica
- [ ] Implementar lógica de interpolación si falta una fecha

## Backend - Gestión de Compras
- [ ] Crear procedimiento para registrar nueva compra de criptomoneda
- [ ] Crear procedimiento para listar todas las compras del usuario
- [ ] Crear procedimiento para editar compra existente
- [ ] Crear procedimiento para eliminar compra
- [ ] Implementar cálculo de precio promedio de últimas 5 compras

## Backend - Cálculos Financieros
- [ ] Implementar cálculo de valor actual del portafolio
- [ ] Implementar cálculo de valor histórico del portafolio por fecha
- [ ] Implementar cálculo de ganancias/pérdidas en USD
- [ ] Implementar cálculo de ganancias/pérdidas en moneda local
- [ ] Implementar conversión de precios usando tasas históricas

## Frontend - Dashboard Principal
- [ ] Diseñar layout principal con navegación lateral
- [ ] Crear vista de resumen del portafolio (valor total, ganancia/pérdida)
- [ ] Mostrar lista de criptomonedas con valores actuales
- [ ] Implementar gráfico de rendimiento del portafolio
- [ ] Mostrar estadísticas clave (mejor/peor inversión)

## Frontend - Gestión de Compras
- [ ] Crear formulario para registrar nueva compra
- [ ] Implementar selector de criptomoneda
- [ ] Implementar selector de fecha con calendario
- [ ] Mostrar precio actual de la criptomoneda seleccionada
- [ ] Crear tabla de historial de compras con filtros
- [ ] Implementar edición de compras existentes
- [ ] Implementar eliminación de compras

## Frontend - Visualización de Datos
- [ ] Crear gráfico de evolución del portafolio en el tiempo
- [ ] Crear gráfico de distribución de criptomonedas
- [ ] Implementar filtro por rango de fechas
- [ ] Mostrar comparación precio compra vs precio actual
- [ ] Implementar selector de tipo de cambio (oficial/paralelo)

## Frontend - Importación de Datos
- [ ] Crear interfaz para importar archivo Excel de tasas de cambio
- [ ] Mostrar progreso de importación
- [ ] Validar datos antes de importar
- [ ] Mostrar resumen de datos importados

## Estilo y Diseño
- [ ] Definir paleta de colores profesional
- [ ] Configurar tipografía elegante
- [ ] Implementar tema oscuro/claro
- [ ] Diseñar componentes personalizados para gráficos
- [ ] Optimizar diseño responsive para móviles

## Testing y Documentación
- [ ] Escribir tests para procedimientos de cálculo
- [ ] Escribir tests para integración con Binance
- [ ] Documentar uso de la API
- [ ] Crear guía de importación de datos

## Integración APIs Externas
- [ ] Integrar API del BCV para obtener dólar oficial diariamente
- [ ] Integrar API de Binance para calcular dólar paralelo (promedio últimos 5 anuncios USDT)
- [ ] Crear job automático para actualizar tasas diariamente
- [ ] Importar datos históricos desde Excel (1,435 registros)

## Integración GitHub
- [ ] Conectar proyecto con repositorio GitHub
- [ ] Configurar push automático de cambios

## Integración APIs Externas
- [ ] Integrar API del BCV para obtener dólar oficial diariamente
- [ ] Integrar API de Binance para calcular dólar paralelo (promedio últimos 5 anuncios USDT)
- [ ] Crear job automático para actualizar tasas diariamente
- [ ] Importar datos históricos desde Excel (1,435 registros)

## Integración GitHub
- [ ] Conectar proyecto con repositorio https://github.com/JavierL1002/Portafolio-.git
- [ ] Generar código SQL completo para Supabase
