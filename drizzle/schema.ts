import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, unique, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabla de tasas de cambio históricas (dólar oficial y paralelo)
 */
export const exchangeRates = mysqlTable("exchange_rates", {
  id: int("id").autoincrement().primaryKey(),
  fecha: varchar("fecha", { length: 10 }).notNull().unique(), // YYYY-MM-DD
  tasaOficial: decimal("tasa_oficial", { precision: 10, scale: 4 }),
  tasaParalelo: decimal("tasa_paralelo", { precision: 10, scale: 4 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  fechaIdx: index("fecha_idx").on(table.fecha),
}));

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = typeof exchangeRates.$inferInsert;

/**
 * Tabla de criptomonedas soportadas
 */
export const cryptocurrencies = mysqlTable("cryptocurrencies", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(), // BTC, ETH, USDT, etc.
  name: varchar("name", { length: 100 }).notNull(), // Bitcoin, Ethereum, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = typeof cryptocurrencies.$inferInsert;

/**
 * Tabla de compras de criptomonedas
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  cryptoId: int("crypto_id").notNull(),
  cantidad: decimal("cantidad", { precision: 20, scale: 8 }).notNull(), // Cantidad de cripto comprada
  precioUnitario: decimal("precio_unitario", { precision: 20, scale: 8 }).notNull(), // Precio en USD por unidad
  fechaCompra: varchar("fecha_compra", { length: 10 }).notNull(), // YYYY-MM-DD
  tasaOficialFecha: decimal("tasa_oficial_fecha", { precision: 10, scale: 4 }), // Tasa oficial en esa fecha
  tasaParaleloFecha: decimal("tasa_paralelo_fecha", { precision: 10, scale: 4 }), // Tasa paralelo en esa fecha
  notas: text("notas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  cryptoIdIdx: index("crypto_id_idx").on(table.cryptoId),
  fechaCompraIdx: index("fecha_compra_idx").on(table.fechaCompra),
}));

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;
