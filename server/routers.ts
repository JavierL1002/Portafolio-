import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // TASAS DE CAMBIO
  // ============================================
  exchangeRates: router({
    getByDate: publicProcedure
      .input(z.object({ fecha: z.string() }))
      .query(async ({ input }) => {
        return await db.getExchangeRateByDate(input.fecha);
      }),

    getAll: publicProcedure.query(async () => {
      return await db.getAllExchangeRates();
    }),

    importBulk: protectedProcedure
      .input(z.array(z.object({
        fecha: z.string(),
        tasaOficial: z.string().nullable(),
        tasaParalelo: z.string().nullable(),
      })))
      .mutation(async ({ input }) => {
        await db.bulkInsertExchangeRates(input);
        return { success: true, count: input.length };
      }),
  }),

  // ============================================
  // CRIPTOMONEDAS
  // ============================================
  crypto: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCryptocurrencies();
    }),

    getBySymbol: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        return await db.getCryptocurrencyBySymbol(input.symbol);
      }),

    getCurrentPrice: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${input.symbol}USDT`
          );
          const data = await response.json();
          return {
            symbol: input.symbol,
            price: parseFloat(data.price),
            timestamp: Date.now(),
          };
        } catch (error) {
          throw new Error(`Error obteniendo precio de ${input.symbol}`);
        }
      }),

    getHistoricalPrice: publicProcedure
      .input(z.object({
        symbol: z.string(),
        date: z.string(), // YYYY-MM-DD
      }))
      .query(async ({ input }) => {
        try {
          // Convertir fecha a timestamp
          const dateObj = new Date(input.date);
          const startTime = dateObj.getTime();
          const endTime = startTime + 24 * 60 * 60 * 1000; // +1 día

          const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${input.symbol}USDT&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=1`
          );
          const data = await response.json();

          if (data.length > 0) {
            const [timestamp, open, high, low, close] = data[0];
            return {
              symbol: input.symbol,
              date: input.date,
              open: parseFloat(open),
              high: parseFloat(high),
              low: parseFloat(low),
              close: parseFloat(close),
              timestamp,
            };
          }

          return null;
        } catch (error) {
          throw new Error(`Error obteniendo precio histórico de ${input.symbol}`);
        }
      }),
  }),

  // ============================================
  // COMPRAS
  // ============================================
  purchases: router({
    create: protectedProcedure
      .input(z.object({
        cryptoId: z.number(),
        cantidad: z.string(),
        precioUnitario: z.string(),
        fechaCompra: z.string(),
        notas: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Obtener tasas de cambio para la fecha
        const exchangeRate = await db.getExchangeRateByDate(input.fechaCompra);

        await db.createPurchase({
          userId: ctx.user.id,
          cryptoId: input.cryptoId,
          cantidad: input.cantidad,
          precioUnitario: input.precioUnitario,
          fechaCompra: input.fechaCompra,
          tasaOficialFecha: exchangeRate?.tasaOficial || null,
          tasaParaleloFecha: exchangeRate?.tasaParalelo || null,
          notas: input.notas || null,
        });

        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPurchases(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        cantidad: z.string().optional(),
        precioUnitario: z.string().optional(),
        fechaCompra: z.string().optional(),
        notas: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        
        // Si cambia la fecha, actualizar tasas
        if (data.fechaCompra) {
          const exchangeRate = await db.getExchangeRateByDate(data.fechaCompra);
          await db.updatePurchase(id, ctx.user.id, {
            ...data,
            tasaOficialFecha: exchangeRate?.tasaOficial || null,
            tasaParaleloFecha: exchangeRate?.tasaParalelo || null,
          });
        } else {
          await db.updatePurchase(id, ctx.user.id, data);
        }

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePurchase(input.id, ctx.user.id);
        return { success: true };
      }),

    getAveragePrice: protectedProcedure
      .input(z.object({
        cryptoId: z.number(),
        lastN: z.number().default(5),
      }))
      .query(async ({ ctx, input }) => {
        const purchases = await db.getLastNPurchases(
          ctx.user.id,
          input.cryptoId,
          input.lastN
        );

        if (purchases.length === 0) {
          return { average: 0, count: 0 };
        }

        const sum = purchases.reduce(
          (acc, p) => acc + parseFloat(p.precioUnitario),
          0
        );
        const average = sum / purchases.length;

        return {
          average,
          count: purchases.length,
          purchases: purchases.map(p => ({
            fecha: p.fechaCompra,
            precio: parseFloat(p.precioUnitario),
          })),
        };
      }),
  }),

  // ============================================
  // PORTAFOLIO Y ESTADÍSTICAS
  // ============================================
  portfolio: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const summary = await db.getPortfolioSummary(ctx.user.id);
      
      // Obtener precios actuales para cada criptomoneda
      const enrichedSummary = await Promise.all(
        summary.map(async (item) => {
          try {
            const response = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${item.cryptoSymbol}USDT`
            );
            const priceData = await response.json();
            const currentPrice = parseFloat(priceData.price);

            const totalCantidad = parseFloat(item.totalCantidad);
            const precioPromedioCompra = parseFloat(item.precioPromedioCompra);
            const inversionTotalUsd = parseFloat(item.inversionTotalUsd);
            const valorActualUsd = totalCantidad * currentPrice;
            const gananciaUsd = valorActualUsd - inversionTotalUsd;
            const gananciaPercentaje = (gananciaUsd / inversionTotalUsd) * 100;

            return {
              ...item,
              currentPrice,
              totalCantidad,
              precioPromedioCompra,
              inversionTotalUsd,
              valorActualUsd,
              gananciaUsd,
              gananciaPercentaje,
            };
          } catch (error) {
            console.error(`Error obteniendo precio de ${item.cryptoSymbol}:`, error);
            return {
              ...item,
              currentPrice: 0,
              totalCantidad: parseFloat(item.totalCantidad),
              precioPromedioCompra: parseFloat(item.precioPromedioCompra),
              inversionTotalUsd: parseFloat(item.inversionTotalUsd),
              valorActualUsd: 0,
              gananciaUsd: 0,
              gananciaPercentaje: 0,
            };
          }
        })
      );

      return enrichedSummary;
    }),

    calculateValue: protectedProcedure
      .input(z.object({
        date: z.string().optional(),
        useParalelo: z.boolean().default(true),
      }))
      .query(async ({ ctx, input }) => {
        const summary = await db.getPortfolioSummary(ctx.user.id);
        
        // Obtener tasa de cambio para la fecha (o actual)
        const fecha = input.date || new Date().toISOString().split('T')[0];
        const exchangeRate = await db.getExchangeRateByDate(fecha);

        if (!exchangeRate) {
          throw new Error(`No hay tasa de cambio disponible para ${fecha}`);
        }

        const tasa = input.useParalelo
          ? parseFloat(exchangeRate.tasaParalelo || '0')
          : parseFloat(exchangeRate.tasaOficial || '0');

        // Calcular valor en USD y convertir a moneda local
        const enrichedSummary = await Promise.all(
          summary.map(async (item) => {
            try {
              const response = await fetch(
                `https://api.binance.com/api/v3/ticker/price?symbol=${item.cryptoSymbol}USDT`
              );
              const priceData = await response.json();
              const currentPrice = parseFloat(priceData.price);

              const totalCantidad = parseFloat(item.totalCantidad);
              const valorActualUsd = totalCantidad * currentPrice;
              const valorActualLocal = valorActualUsd * tasa;

              return {
                cryptoSymbol: item.cryptoSymbol,
                cryptoName: item.cryptoName,
                totalCantidad,
                currentPrice,
                valorActualUsd,
                valorActualLocal,
              };
            } catch (error) {
              return {
                cryptoSymbol: item.cryptoSymbol,
                cryptoName: item.cryptoName,
                totalCantidad: parseFloat(item.totalCantidad),
                currentPrice: 0,
                valorActualUsd: 0,
                valorActualLocal: 0,
              };
            }
          })
        );

        const totalUsd = enrichedSummary.reduce((sum, item) => sum + item.valorActualUsd, 0);
        const totalLocal = enrichedSummary.reduce((sum, item) => sum + item.valorActualLocal, 0);

        return {
          fecha,
          tasa,
          tipoTasa: input.useParalelo ? 'paralelo' : 'oficial',
          totalUsd,
          totalLocal,
          items: enrichedSummary,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
