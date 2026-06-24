'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Package, FlaskConical, DollarSign, Hash, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { ADMIN, JEFE_PRODUCCION } from '@/lib/constants';
import * as api from '@/lib/api/ordenes-produccion';
import type { OrdenProduccionDetail, EstadoProduccion } from '@/types';

export default function OrdenProduccionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [orden, setOrden] = useState<OrdenProduccionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState<EstadoProduccion[]>([]);

  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [data, estadosData] = await Promise.all([
          api.getOrdenProduccionById(params.id as string),
          api.getEstadosProduccion(),
        ]);
        setOrden(data);
        setEstados(estadosData);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/ordenes-produccion');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  const isTerminal = orden?.estado_produccion.nombre === 'FINISHED' || orden?.estado_produccion.nombre === 'CANCELLED';
  const canAct = isAdmin || (user?.rol === JEFE_PRODUCCION && !isTerminal);

  const handleFinish = async () => {
    const estado = estados.find(e => e.nombre === 'FINISHED');
    if (!estado) return;
    setUpdating(true);
    try {
      await api.updateOrdenProduccionEstado(params.id as string, { amonet_estado_produccion_id: estado.id });
      toast({ title: 'Orden finalizada', variant: 'success' });
      setFinishDialogOpen(false);
      const data = await api.getOrdenProduccionById(params.id as string);
      setOrden(data);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    const estado = estados.find(e => e.nombre === 'CANCELLED');
    if (!estado || !cancelReason.trim()) return;
    setUpdating(true);
    try {
      await api.updateOrdenProduccionEstado(params.id as string, {
        amonet_estado_produccion_id: estado.id,
        cancel_razon_descripcion: cancelReason,
      });
      toast({ title: 'Orden cancelada', variant: 'success' });
      setCancelDialogOpen(false);
      setCancelReason('');
      const data = await api.getOrdenProduccionById(params.id as string);
      setOrden(data);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return null;
  if (!orden) return null;

  return (
    <>
      <PageHeader
        title="Orden de Producción"
        description={orden.descripcion}
      />
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/ordenes-produccion')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <div className="flex items-center gap-2">
            {canAct && (
              <>
                <Button variant="secondary" size="sm" onClick={() => setCancelDialogOpen(true)}>
                  <X className="mr-1 h-4 w-4" /> Cancelar
                </Button>
                <Button size="sm" onClick={() => setFinishDialogOpen(true)}>
                  <Check className="mr-1 h-4 w-4" /> Finalizar
                </Button>
              </>
            )}
            <Badge variant="default">{orden.estado_produccion.nombre}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" /> General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gris-tecnico">Código</span>
                <span className="font-medium">{orden.producto.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gris-tecnico">Nombre</span>
                <span className="font-medium">{orden.producto.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gris-tecnico">Marca</span>
                <span className="font-medium">{orden.producto.marca_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gris-tecnico">Estado</span>
                <span className="font-medium">{orden.estado_produccion.nombre}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gris-tecnico">Coste total</span>
                <span className="font-semibold text-violet-lab">${orden.coste.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gris-tecnico">Creación</span>
                <span className="font-medium">{new Date(orden.fecha_alta).toLocaleString()}</span>
              </div>
              {orden.fecha_modifica && (
                <div className="flex justify-between">
                  <span className="text-gris-tecnico">Modificación</span>
                  <span className="font-medium">{new Date(orden.fecha_modifica).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" /> Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gris-tecnico">Alta</span>
                <span className="font-medium">{orden.usuario_alta.nombre} ({orden.usuario_alta.documento})</span>
              </div>
              {orden.usuario_modifica && (
                <div className="flex justify-between">
                  <span className="text-gris-tecnico">Modifica</span>
                  <span className="font-medium">{orden.usuario_modifica.nombre} ({orden.usuario_modifica.documento})</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {orden.cancel_razon_descripcion && (
          <Card className="border-coral-alerta/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-coral-alerta">
                <X className="h-4 w-4" /> Cancelación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{orden.cancel_razon_descripcion}</p>
            </CardContent>
          </Card>
        )}

        {orden.variables_globales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="h-4 w-4" /> Variables Globales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orden.variables_globales.map(vg => (
                  <div key={vg.id} className="rounded-lg border border-border-tabla bg-lila-50 p-3">
                    <p className="text-xs text-gris-tecnico">{vg.nombre}</p>
                    <p className="text-lg font-semibold text-violet-lab">{vg.cantidad}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Materias Primas
            </CardTitle>
            <CardDescription>
              {orden.materias_primas.length} materia(s) prima(s) en la orden
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {orden.materias_primas.map(mp => (
              <div key={mp.id} className="border-t border-border-tabla p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{mp.nombre}</h4>
                {mp.contenedores.length === 0 ? (
                  <p className="text-xs text-gris-tecnico">Sin contenedores asignados</p>
                ) : (
                  <div className="space-y-1.5">
                    {mp.contenedores.map(c => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                        <span>
                          Lote <strong>{c.lote}</strong> - {c.proveedor}
                        </span>
                        <span className="font-medium">
                          {c.cantidad} ud · ${c.coste.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {orden.observacion_creacion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{orden.observacion_creacion}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Finalizar orden</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de finalizar esta orden de producción?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setFinishDialogOpen(false)} disabled={updating}>
              Cancelar
            </Button>
            <Button onClick={handleFinish} disabled={updating}>
              {updating ? 'Finalizando...' : 'Finalizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancelar orden</DialogTitle>
            <DialogDescription>
              Ingresa el motivo de cancelación. Esta acción restaurará las cantidades a los contenedores originales.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="after:content-['*'] after:ml-0.5 after:text-coral-alerta">Motivo de cancelación</Label>
            <textarea
              className="mt-1 min-h-[80px] w-full resize-y rounded-lg border border-border-tabla bg-white p-3 text-sm outline-none focus:border-2 focus:border-violet-lab"
              placeholder="Razón obligatoria..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => { setCancelDialogOpen(false); setCancelReason(''); }} disabled={updating}>
              Volver
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={updating || !cancelReason.trim()}
            >
              {updating ? 'Cancelando...' : 'Cancelar orden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
