import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { exchangeRates } from '../drizzle/schema.ts';

/**
 * Script para actualizar tasas de cambio diarias
 * - Obtiene dólar oficial del BCV
 * - Calcula dólar paralelo desde Binance P2P (promedio últimos 5 anuncios USDT)
 */

async function getBCVRate() {
  try {
    // API alternativa para obtener tasa BCV
    const response = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv');
    const data = await response.json();
    
    if (data && data.monitors && data.monitors.bcv) {
      return parseFloat(data.monitors.bcv.price);
    }
    
    console.warn('No se pudo obtener tasa BCV, intentando método alternativo...');
    
    // Método alternativo: scraping del sitio del BCV
    const bcvResponse = await fetch('https://www.bcv.org.ve/');
    const html = await bcvResponse.text();
    
    // Buscar patrón de tasa en el HTML
    const match = html.match(/Bs\.\s*(\d+[,.]?\d*)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo tasa BCV:', error);
    return null;
  }
}

async function getBinanceP2PRate() {
  try {
    // API de Binance P2P para obtener anuncios de compra de USDT en VES (bolívares)
    const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 1,
        rows: 5, // Últimos 5 anuncios
        payTypes: [], // Todos los métodos de pago
        countries: [],
        publisherType: null,
        asset: 'USDT',
        fiat: 'VES', // Bolívares venezolanos
        tradeType: 'BUY', // Anuncios de compra
      }),
    });

    const data = await response.json();
    
    if (data && data.data && data.data.length > 0) {
      // Calcular promedio de los últimos 5 anuncios
      const prices = data.data.map(ad => parseFloat(ad.adv.price));
      const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      console.log(`Precios P2P encontrados: ${prices.join(', ')}`);
      console.log(`Promedio: ${average}`);
      
      return average;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo tasa Binance P2P:', error);
    return null;
  }
}

async function updateRates() {
  console.log(`\n[${new Date().toISOString()}] Iniciando actualización de tasas de cambio...`);
  
  // Obtener tasas
  const [bcvRate, p2pRate] = await Promise.all([
    getBCVRate(),
    getBinanceP2PRate(),
  ]);
  
  console.log(`Tasa BCV: ${bcvRate || 'No disponible'}`);
  console.log(`Tasa P2P (paralelo): ${p2pRate || 'No disponible'}`);
  
  if (!bcvRate && !p2pRate) {
    console.error('❌ No se pudo obtener ninguna tasa. Abortando actualización.');
    process.exit(1);
  }
  
  // Conectar a base de datos
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está configurada');
    process.exit(1);
  }
  
  const db = drizzle(process.env.DATABASE_URL);
  
  // Fecha de hoy
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Insertar o actualizar tasa
    await db.insert(exchangeRates).values({
      fecha: today,
      tasaOficial: bcvRate ? bcvRate.toString() : null,
      tasaParalelo: p2pRate ? p2pRate.toString() : null,
    }).onDuplicateKeyUpdate({
      set: {
        tasaOficial: bcvRate ? bcvRate.toString() : null,
        tasaParalelo: p2pRate ? p2pRate.toString() : null,
      },
    });
    
    console.log(`✅ Tasas actualizadas exitosamente para ${today}`);
  } catch (error) {
    console.error('❌ Error guardando en base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar
updateRates().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
