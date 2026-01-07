import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, exchangeRates, InsertExchangeRate, cryptocurrencies, InsertCryptocurrency, purchases, InsertPurchase } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// TASAS DE CAMBIO
// ============================================

export async function upsertExchangeRate(rate: InsertExchangeRate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(exchangeRates).values(rate).onDuplicateKeyUpdate({
    set: {
      tasaOficial: rate.tasaOficial,
      tasaParalelo: rate.tasaParalelo,
    },
  });
}

export async function getExchangeRateByDate(fecha: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(exchangeRates).where(eq(exchangeRates.fecha, fecha)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllExchangeRates() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(exchangeRates).orderBy(desc(exchangeRates.fecha));
}

export async function bulkInsertExchangeRates(rates: InsertExchangeRate[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insertar en lotes de 100
  const batchSize = 100;
  for (let i = 0; i < rates.length; i += batchSize) {
    const batch = rates.slice(i, i + batchSize);
    await db.insert(exchangeRates).values(batch).onDuplicateKeyUpdate({
      set: {
        tasaOficial: sql`VALUES(tasa_oficial)`,
        tasaParalelo: sql`VALUES(tasa_paralelo)`,
      },
    });
  }
}

// ============================================
// CRIPTOMONEDAS
// ============================================

export async function getAllCryptocurrencies() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cryptocurrencies);
}

export async function getCryptocurrencyBySymbol(symbol: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.symbol, symbol)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCryptocurrency(crypto: InsertCryptocurrency) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(cryptocurrencies).values(crypto);
  return result;
}

// ============================================
// COMPRAS
// ============================================

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(purchases).values(purchase);
  return result;
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: purchases.id,
      cryptoId: purchases.cryptoId,
      cryptoSymbol: cryptocurrencies.symbol,
      cryptoName: cryptocurrencies.name,
      cantidad: purchases.cantidad,
      precioUnitario: purchases.precioUnitario,
      fechaCompra: purchases.fechaCompra,
      tasaOficialFecha: purchases.tasaOficialFecha,
      tasaParaleloFecha: purchases.tasaParaleloFecha,
      notas: purchases.notas,
      createdAt: purchases.createdAt,
    })
    .from(purchases)
    .leftJoin(cryptocurrencies, eq(purchases.cryptoId, cryptocurrencies.id))
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.fechaCompra));
}

export async function getUserPurchasesByCrypto(userId: number, cryptoId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.cryptoId, cryptoId)))
    .orderBy(desc(purchases.fechaCompra));
}

export async function getLastNPurchases(userId: number, cryptoId: number, n: number = 5) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.cryptoId, cryptoId)))
    .orderBy(desc(purchases.fechaCompra), desc(purchases.id))
    .limit(n);
}

export async function updatePurchase(id: number, userId: number, data: Partial<InsertPurchase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(purchases)
    .set(data)
    .where(and(eq(purchases.id, id), eq(purchases.userId, userId)));
}

export async function deletePurchase(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(purchases)
    .where(and(eq(purchases.id, id), eq(purchases.userId, userId)));
}

// ============================================
// ESTADÍSTICAS Y RESUMEN
// ============================================

export async function getPortfolioSummary(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      cryptoId: purchases.cryptoId,
      cryptoSymbol: cryptocurrencies.symbol,
      cryptoName: cryptocurrencies.name,
      totalCantidad: sql<string>`SUM(${purchases.cantidad})`,
      precioPromedioCompra: sql<string>`AVG(${purchases.precioUnitario})`,
      inversionTotalUsd: sql<string>`SUM(${purchases.cantidad} * ${purchases.precioUnitario})`,
      primeraCompra: sql<string>`MIN(${purchases.fechaCompra})`,
      ultimaCompra: sql<string>`MAX(${purchases.fechaCompra})`,
      numeroCompras: sql<string>`COUNT(*)`,
    })
    .from(purchases)
    .leftJoin(cryptocurrencies, eq(purchases.cryptoId, cryptocurrencies.id))
    .where(eq(purchases.userId, userId))
    .groupBy(purchases.cryptoId, cryptocurrencies.symbol, cryptocurrencies.name);

  return result;
}
