import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { cryptocurrencies } from '../drizzle/schema.ts';

const cryptos = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'LTC', name: 'Litecoin' },
  { symbol: 'ATOM', name: 'Cosmos' },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL no está configurada');
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log('Insertando criptomonedas...');

  for (const crypto of cryptos) {
    try {
      await db.insert(cryptocurrencies).values(crypto).onDuplicateKeyUpdate({
        set: { name: crypto.name },
      });
      console.log(`✓ ${crypto.symbol} - ${crypto.name}`);
    } catch (error) {
      console.error(`✗ Error con ${crypto.symbol}:`, error);
    }
  }

  console.log('\n✅ Seed completado');
}

seed().catch(console.error);
