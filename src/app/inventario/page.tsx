'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fragment } from 'react';
import { Download, Check, X, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterContainer } from '@/components/ui/filter-container';
import { PaginationBar } from '@/components/ui/pagination-bar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { CALIDAD } from '@/lib/constants';
import { getApiErrorMessage } from '@/lib/utils';
import * as inventarioApi from '@/lib/api/inventario';
import { useRawMaterialStore } from '@/stores';
import type { InventarioItem } from '@/types';

export default function InventarioPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, user: currentUser } = useAuth();
  const { items: materiasPrimas, getAll: loadMateriasPrimas } = useRawMaterialStore();

  const [data, setData] = useState<InventarioItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filtroLote, setFiltroLote] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroMateriaPrima, setFiltroMateriaPrima] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectItem, setRejectItem] = useState<InventarioItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (materiasPrimas.length === 0) loadMateriasPrimas();

    const mpId = searchParams.get('amonet_materia_prima_id');
    if (mpId && !filtroMateriaPrima) {
      setFiltroMateriaPrima(mpId);
      setFiltersOpen(true);
    }
  }, [materiasPrimas.length, loadMateriasPrimas, searchParams]);

  const fetchData = async (page = currentPage, size = pageSize, extraFilters?: Record<string, string | boolean>) => {
    setLoading(true);
    try {
      const filters: Record<string, string | boolean> = { ...extraFilters };
      if (!filters.amonet_materia_prima_id && filtroMateriaPrima) filters.amonet_materia_prima_id = filtroMateriaPrima;
      if (filtroLote) filters.lote = filtroLote;
      if (filtroProveedor) filters.proveedor = filtroProveedor;
      if (filtroFechaInicio) filters.fecha_inicio = filtroFechaInicio;
      if (filtroFechaFin) filters.fecha_fin = filtroFechaFin;
      if (filtroStatus !== '') filters.status = filtroStatus === 'true';

      const res = await inventarioApi.getAllInventario(page, size, filters);
      setData(res.items);
      setTotalItems(res.total_items);
      setCurrentPage(res.current_page);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al cargar inventario'), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mpId = searchParams.get('amonet_materia_prima_id');
    if (mpId) {
      const filters: Record<string, string | boolean> = {};
      filters.amonet_materia_prima_id = mpId;
      fetchData(1, pageSize, filters);
    } else {
      fetchData(1, pageSize);
    }
  }, []);

  const handleSearch = () => fetchData(1, pageSize);

  const handleApprove = async (item: InventarioItem) => {
    try {
      await inventarioApi.updateInventario(item.id, { status: true });
      toast({ title: 'Inventario aprobado', description: 'Se ha aprobado correctamente', variant: 'success' });
      fetchData(currentPage, pageSize);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al aprobar'), variant: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectItem || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await inventarioApi.updateInventario(rejectItem.id, { status: false, observacion_rechazo: rejectReason });
      toast({ title: 'Inventario rechazado', description: 'Se ha rechazado correctamente', variant: 'success' });
      setRejectItem(null);
      setRejectReason('');
      fetchData(currentPage, pageSize);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al rechazar'), variant: 'error' });
    } finally {
      setRejecting(false);
    }
  };

  const canReview = isAdmin || currentUser?.rol === CALIDAD;
  const isPending = (item: InventarioItem) => item.status === null;

  const canEdit = (item: InventarioItem) => {
    if (isAdmin) return true;
    if (currentUser?.rol === CALIDAD && isPending(item)) return true;
    return false;
  };

  const handleDownload = async (item: InventarioItem) => {
    try {
      const url = await inventarioApi.downloadEvidencia(item.numero_ingreso);
      window.open(url, '_blank');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al descargar'), variant: 'error' });
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const formatFecha = (f: string) => new Date(f).toLocaleDateString('es-PE');

  return (
    <>
      <PageHeader title="Inventario" description="Gestión de inventario de materias primas" createHref="/inventario/new" createLabel="Nuevo ingreso" />
      <div className="px-6">
        <FilterContainer
          open={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
          onSearch={handleSearch}
          loading={loading}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Proveedor</label>
              <Input value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)} placeholder="Proveedor" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Lote</label>
              <Input value={filtroLote} onChange={(e) => setFiltroLote(e.target.value)} placeholder="N° lote" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Materia prima</label>
              <select className="flex h-10 w-full rounded-8 border border-input bg-white px-3 py-2 text-sm" value={filtroMateriaPrima} onChange={(e) => setFiltroMateriaPrima(e.target.value)}>
                <option value="">Todas</option>
                {materiasPrimas.map((mp) => (
                  <option key={mp.id} value={mp.id}>{mp.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Status</label>
              <select className="flex h-10 w-full rounded-8 border border-input bg-white px-3 py-2 text-sm" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="true">Aprobado</option>
                <option value="false">Rechazado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha inicio</label>
              <Input type="date" value={filtroFechaInicio} onChange={(e) => setFiltroFechaInicio(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha fin</label>
              <Input type="date" value={filtroFechaFin} onChange={(e) => setFiltroFechaFin(e.target.value)} />
            </div>
          </div>
        </FilterContainer>

        {loading && <p className="text-sm text-gris-tecnico py-8 text-center">Cargando...</p>}

        {!loading && data.length === 0 && (
          <p className="text-sm text-gris-tecnico py-8 text-center">No se encontraron registros de inventario.</p>
        )}

        {!loading && data.length > 0 && (
          <div className="rounded-8 border border-border-tabla overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-lavanda-soft border-b border-border-tabla">
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">N° Ingreso</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Materia Prima</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Proveedor</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Lote</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Ingreso</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Venc.</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Ingresado por</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Status</th>
                    <th className="text-right px-3 py-3 font-medium text-gris-tecnico">Total</th>
                    <th className="text-left px-3 py-3 font-medium text-gris-tecnico">Ud.</th>
                    <th className="text-right px-3 py-3 font-medium text-gris-tecnico">Cont.</th>
                    <th className="w-16 px-3 py-3 font-medium text-gris-tecnico">Evid.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <Fragment key={item.id}>
                      <tr
                        className="border-b border-border-tabla hover:bg-lila-50 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      >
                        <td className="px-3 py-3 font-medium text-gray-900">{item.numero_ingreso}</td>
                        <td className="px-3 py-3 text-gray-700">{item.materia_prima_nombre}</td>
                        <td className="px-3 py-3 text-gray-700">{item.proveedor}</td>
                        <td className="px-3 py-3 text-gray-700">{item.lote}</td>
                        <td className="px-3 py-3 text-gray-700 text-xs">{formatFecha(item.fecha_ingreso)}</td>
                        <td className="px-3 py-3 text-gray-700 text-xs">{formatFecha(item.fecha_vencimiento)}</td>
                        <td className="px-3 py-3 text-xs text-gray-700">{item.usuario_alta?.documento}</td>
                        <td className="px-3 py-3">
                          {item.status === null && <Badge variant="warning">Pendiente</Badge>}
                          {item.status === true && <Badge variant="success">Aprobado</Badge>}
                          {item.status === false && <Badge variant="error">Rechazado</Badge>}
                        </td>
                        <td className="px-3 py-3 text-right font-medium">{item.cantidad_total.toFixed(2)}</td>
                        <td className="px-3 py-3 text-gray-700">{item.unidad_abreviacion}</td>
                        <td className="px-3 py-3 text-right text-gris-tecnico">{item.numero_contenedores}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            {canEdit(item) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); router.push(`/inventario/${item.id}/edit`); }}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4 text-violet-lab" />
                              </Button>
                            )}
                            {(isAdmin || (canReview && isPending(item))) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                                  title="Aprobar"
                                >
                                  <Check className="h-4 w-4 text-verde-exito" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); setRejectItem(item); setRejectReason(''); }}
                                  title="Rechazar"
                                >
                                  <X className="h-4 w-4 text-coral-alerta" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                              title="Descargar evidencia"
                            >
                              <Download className="h-4 w-4 text-violet-lab" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === item.id && (
                        <tr className="bg-lila-50">
                          <td colSpan={12} className="px-6 py-3">
                            <p className="text-xs font-medium text-gris-tecnico mb-2">Contenedores</p>
                            <div className="flex items-center gap-4 text-xs font-medium text-gris-tecnico mb-1 pl-10">
                              <span className="w-20">Cant. original</span>
                              <span className="w-20">Cant. disponible</span>
                              <span className="w-24">Precio total</span>
                              <span>Precio unitario</span>
                            </div>
                            <div className="space-y-1">
                              {item.contenedores.map((c) => (
                                <div key={c.contador} className="flex items-center gap-4 text-sm">
                                  <span className="text-gris-tecnico w-6">#{c.contador}</span>
                                  <span className="font-medium text-gray-900 w-20">{c.cantidad.toFixed(2)}</span>
                                  <span className="font-medium text-gray-900 w-20">{c.cantidad_disponible.toFixed(2)}</span>
                                  <span className="text-gray-700 w-24">$ {c.precio.toLocaleString()}</span>
                                  <span className="text-violet-lab">$ {c.precio_unidad.toFixed(2)} / {item.unidad_abreviacion}</span>
                                </div>
                              ))}
                            </div>
                            {item.status === false && item.observacion_rechazo && (
                              <div className="mt-3 p-3 rounded-8 bg-coral-alerta/5 border border-coral-alerta/20">
                                <p className="text-xs font-medium text-coral-alerta mb-1">Motivo de rechazo</p>
                                <p className="text-sm text-gray-900">{item.observacion_rechazo}</p>
                              </div>
                            )}
                            {item.usuario_modifica && (
                              <div className="mt-3 text-xs text-gris-tecnico">
                                Modificado por {item.usuario_modifica.documento} - {item.usuario_modifica.nombre}
                                {item.fecha_modifica && <> el {new Date(item.fecha_modifica).toLocaleString('es-PE')}</>}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(p) => fetchData(p, pageSize)}
              onPageSizeChange={(s) => { setPageSize(s); fetchData(1, s); }}
            />
          </div>
        )}
      </div>

      <Dialog open={!!rejectItem} onOpenChange={(open) => { if (!open) setRejectItem(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar inventario</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-900 mb-3">
              Ingresa el motivo de rechazo para <strong>{rejectItem?.numero_ingreso}</strong>
            </p>
            <textarea
              className="w-full rounded-8 border border-border-tabla px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-lab"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setRejectItem(null)} disabled={rejecting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={rejecting || !rejectReason.trim()}>
              {rejecting ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
