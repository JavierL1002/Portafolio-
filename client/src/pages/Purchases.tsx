import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Purchases() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cryptoId: "",
    cantidad: "",
    precioUnitario: "",
    fechaCompra: new Date().toISOString().split('T')[0],
    notas: "",
  });

  const utils = trpc.useUtils();
  const { data: purchases, isLoading } = trpc.purchases.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: cryptos } = trpc.crypto.list.useQuery();

  const createMutation = trpc.purchases.create.useMutation({
    onSuccess: () => {
      toast.success("Compra registrada exitosamente");
      utils.purchases.list.invalidate();
      utils.portfolio.summary.invalidate();
      setIsDialogOpen(false);
      setFormData({
        cryptoId: "",
        cantidad: "",
        precioUnitario: "",
        fechaCompra: new Date().toISOString().split('T')[0],
        notas: "",
      });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.purchases.delete.useMutation({
    onSuccess: () => {
      toast.success("Compra eliminada");
      utils.purchases.list.invalidate();
      utils.portfolio.summary.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cryptoId || !formData.cantidad || !formData.precioUnitario) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    createMutation.mutate({
      cryptoId: parseInt(formData.cryptoId),
      cantidad: formData.cantidad,
      precioUnitario: formData.precioUnitario,
      fechaCompra: formData.fechaCompra,
      notas: formData.notas || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta compra?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tu historial de compras de criptomonedas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Compra</DialogTitle>
                  <DialogDescription>
                    Agrega una nueva compra de criptomoneda a tu portafolio
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cryptoId">Criptomoneda *</Label>
                    <Select
                      value={formData.cryptoId}
                      onValueChange={(value) => setFormData({ ...formData, cryptoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una criptomoneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptos?.map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id.toString()}>
                            {crypto.symbol} - {crypto.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cantidad">Cantidad *</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00000000"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="precioUnitario">Precio Unitario (USD) *</Label>
                    <Input
                      id="precioUnitario"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00"
                      value={formData.precioUnitario}
                      onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fechaCompra">Fecha de Compra *</Label>
                    <Input
                      id="fechaCompra"
                      type="date"
                      value={formData.fechaCompra}
                      onChange={(e) => setFormData({ ...formData, fechaCompra: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notas">Notas (opcional)</Label>
                    <Textarea
                      id="notas"
                      placeholder="Agrega notas sobre esta compra..."
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Guardando..." : "Guardar Compra"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Compras</CardTitle>
            <CardDescription>
              Todas tus compras de criptomonedas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !purchases || purchases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tienes compras registradas</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Haz clic en "Nueva Compra" para comenzar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium">Criptomoneda</th>
                      <th className="text-right py-3 px-4 font-medium">Cantidad</th>
                      <th className="text-right py-3 px-4 font-medium">Precio Unitario</th>
                      <th className="text-right py-3 px-4 font-medium">Total USD</th>
                      <th className="text-right py-3 px-4 font-medium">Tasa Paralelo</th>
                      <th className="text-right py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => {
                      const totalUsd = parseFloat(purchase.cantidad) * parseFloat(purchase.precioUnitario);
                      return (
                        <tr key={purchase.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">{purchase.fechaCompra}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-semibold">{purchase.cryptoSymbol}</div>
                              <div className="text-sm text-muted-foreground">{purchase.cryptoName}</div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            {parseFloat(purchase.cantidad).toFixed(8)}
                          </td>
                          <td className="text-right py-3 px-4">
                            ${parseFloat(purchase.precioUnitario).toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold">
                            ${totalUsd.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {purchase.tasaParaleloFecha
                              ? `Bs. ${parseFloat(purchase.tasaParaleloFecha).toFixed(2)}`
                              : '-'}
                          </td>
                          <td className="text-right py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(purchase.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
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
