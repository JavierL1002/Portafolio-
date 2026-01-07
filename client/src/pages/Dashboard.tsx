import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity } from "lucide-react";
import { useMemo } from "react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: portfolio, isLoading } = trpc.portfolio.summary.useQuery(undefined, {
    enabled: !!user,
  });

  const stats = useMemo(() => {
    if (!portfolio) {
      return {
        totalInversion: 0,
        totalValorActual: 0,
        totalGanancia: 0,
        gananciaPercentaje: 0,
      };
    }

    const totalInversion = portfolio.reduce((sum, item) => sum + item.inversionTotalUsd, 0);
    const totalValorActual = portfolio.reduce((sum, item) => sum + item.valorActualUsd, 0);
    const totalGanancia = totalValorActual - totalInversion;
    const gananciaPercentaje = totalInversion > 0 ? (totalGanancia / totalInversion) * 100 : 0;

    return {
      totalInversion,
      totalValorActual,
      totalGanancia,
      gananciaPercentaje,
    };
  }, [portfolio]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Resumen de tu portafolio de criptomonedas
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inversión Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalInversion.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Capital invertido en USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Actual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalValorActual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor del portafolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganancia/Pérdida</CardTitle>
              {stats.totalGanancia >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalGanancia >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.totalGanancia >= 0 ? '+' : ''}${stats.totalGanancia.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.gananciaPercentaje >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.gananciaPercentaje >= 0 ? '+' : ''}{stats.gananciaPercentaje.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Retorno de inversión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de criptomonedas */}
        <Card>
          <CardHeader>
            <CardTitle>Portafolio de Criptomonedas</CardTitle>
            <CardDescription>
              Detalle de tus inversiones por criptomoneda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!portfolio || portfolio.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tienes compras registradas aún</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Comienza agregando tu primera compra de criptomonedas
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Criptomoneda</th>
                      <th className="text-right py-3 px-4 font-medium">Cantidad</th>
                      <th className="text-right py-3 px-4 font-medium">Precio Promedio</th>
                      <th className="text-right py-3 px-4 font-medium">Precio Actual</th>
                      <th className="text-right py-3 px-4 font-medium">Inversión</th>
                      <th className="text-right py-3 px-4 font-medium">Valor Actual</th>
                      <th className="text-right py-3 px-4 font-medium">Ganancia/Pérdida</th>
                      <th className="text-right py-3 px-4 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item) => (
                      <tr key={item.cryptoId} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold">{item.cryptoSymbol}</div>
                            <div className="text-sm text-muted-foreground">{item.cryptoName}</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          {item.totalCantidad.toFixed(8)}
                        </td>
                        <td className="text-right py-3 px-4">
                          ${item.precioPromedioCompra.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4">
                          ${item.currentPrice.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4">
                          ${item.inversionTotalUsd.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ${item.valorActualUsd.toFixed(2)}
                        </td>
                        <td className={`text-right py-3 px-4 font-semibold ${item.gananciaUsd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.gananciaUsd >= 0 ? '+' : ''}${item.gananciaUsd.toFixed(2)}
                        </td>
                        <td className={`text-right py-3 px-4 font-semibold ${item.gananciaPercentaje >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.gananciaPercentaje >= 0 ? '+' : ''}{item.gananciaPercentaje.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
