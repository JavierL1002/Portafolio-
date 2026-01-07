import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ImportData() {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const utils = trpc.useUtils();
  const importMutation = trpc.exchangeRates.importBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} tasas de cambio importadas exitosamente`);
      setImportedCount(data.count);
      utils.exchangeRates.getAll.invalidate();
      setIsImporting(false);
    },
    onError: (error) => {
      toast.error(`Error al importar: ${error.message}`);
      setIsImporting(false);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      // Leer archivo como texto
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("El archivo debe contener un array de tasas de cambio");
      }

      // Validar estructura
      const validData = data.map((item: any) => ({
        fecha: item.fecha,
        tasaOficial: item.tasa_oficial?.toString() || null,
        tasaParalelo: item.tasa_paralelo?.toString() || null,
      }));

      // Importar en la base de datos
      importMutation.mutate(validData);
    } catch (error) {
      toast.error("Error al procesar el archivo. Asegúrate de que sea un JSON válido.");
      setIsImporting(false);
    }
  };

  const handleImportHistorical = async () => {
    setIsImporting(true);
    
    try {
      // Cargar archivo JSON pre-generado
      const response = await fetch('/tasas_cambio_historicas.json');
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Datos históricos inválidos");
      }

      const validData = data.map((item: any) => ({
        fecha: item.fecha,
        tasaOficial: item.tasa_oficial?.toString() || null,
        tasaParalelo: item.tasa_paralelo?.toString() || null,
      }));

      importMutation.mutate(validData);
    } catch (error) {
      toast.error("Error al cargar datos históricos");
      setIsImporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importar Datos</h1>
          <p className="text-muted-foreground mt-2">
            Importa tasas de cambio históricas desde archivos JSON o Excel
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Importar desde archivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importar desde Archivo
              </CardTitle>
              <CardDescription>
                Sube un archivo JSON con tasas de cambio históricas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona un archivo JSON con el formato correcto
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isImporting}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild disabled={isImporting}>
                    <span>
                      {isImporting ? "Importando..." : "Seleccionar Archivo"}
                    </span>
                  </Button>
                </label>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Formato esperado:</p>
                <pre className="text-xs overflow-x-auto">
{`[
  {
    "fecha": "2022-01-03",
    "tasa_oficial": 4.5972,
    "tasa_paralelo": 4.7540
  },
  ...
]`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Importar datos pre-cargados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Datos Históricos Pre-cargados
              </CardTitle>
              <CardDescription>
                Importa 1,434 registros desde 2022-01-03 hasta 2026-01-07
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Registros disponibles:</span>
                  <span className="font-semibold">1,434</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rango de fechas:</span>
                  <span className="font-semibold">2022-01-03 a 2026-01-07</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Incluye:</span>
                  <span className="font-semibold">Oficial y Paralelo</span>
                </div>
              </div>

              <Button
                onClick={handleImportHistorical}
                disabled={isImporting}
                className="w-full"
                size="lg"
              >
                {isImporting ? "Importando..." : "Importar Datos Históricos"}
              </Button>

              {importedCount > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-semibold text-green-500">
                    ¡Importación exitosa!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {importedCount} registros importados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Las tasas de cambio se utilizan para calcular el valor de tus inversiones en moneda local
            </p>
            <p>
              • El <strong>dólar oficial</strong> se obtiene del BCV (Banco Central de Venezuela)
            </p>
            <p>
              • El <strong>dólar paralelo</strong> se calcula como el promedio de los últimos 5 anuncios de compra de USDT en Binance P2P
            </p>
            <p>
              • Los datos se actualizan automáticamente de lunes a viernes a las 6 PM mediante GitHub Actions
            </p>
            <p>
              • Si una fecha no tiene tasa registrada, se usa la tasa más cercana disponible
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
