'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import { Search, Download, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import * as inventarioApi from '@/lib/api/inventario';
import { useRawMaterialStore } from '@/stores';
import type { InventarioItem } from '@/types';

export default function InventarioPage() {
  const { toast } = useToast();
  const router = useRouter();
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

  useEffect(() => {
    if (materiasPrimas.length === 0) loadMateriasPrimas();
  }, [materiasPrimas.length, loadMateriasPrimas]);

  const fetchData = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const filters: Record<string, string | boolean> = {};
      if (filtroLote) filters.lote = filtroLote;
      if (filtroProveedor) filters.proveedor = filtroProveedor;
      if (filtroMateriaPrima) filters.amonet_materia_prima_id = filtroMateriaPrima;
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
    fetchData(1, pageSize);
  }, []);

  const handleSearch = () => fetchData(1, pageSize);

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
        <button
          className="flex items-center gap-2 text-sm text-gris-tecnico mb-3 hover:text-gray-900"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Filtros de búsqueda
        </button>

        {filtersOpen && (
          <div className="mb-4 p-4 rounded-8 border border-border-tabla bg-white space-y-3">
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
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </div>
        )}

        {!filtersOpen && (
          <div className="mb-4 flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleSearch} disabled={loading}>
              <Search className="mr-1 h-3 w-3" /> Buscar
            </Button>
          </div>
        )}

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
                        <td className="px-3 py-3">
                          {item.status === null && <Badge variant="warning">Pendiente</Badge>}
                          {item.status === true && <Badge variant="success">Aprobado</Badge>}
                          {item.status === false && <Badge variant="error">Rechazado</Badge>}
                        </td>
                        <td className="px-3 py-3 text-right font-medium">{item.cantidad_total.toFixed(2)}</td>
                        <td className="px-3 py-3 text-gray-700">{item.unidad_abreviacion}</td>
                        <td className="px-3 py-3 text-right text-gris-tecnico">{item.numero_contenedores}</td>
                        <td className="px-3 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                            title="Descargar evidencia"
                          >
                            <Download className="h-4 w-4 text-violet-lab" />
                          </Button>
                        </td>
                      </tr>
                      {expandedId === item.id && (
                        <tr className="bg-lila-50">
                          <td colSpan={11} className="px-6 py-3">
                            <p className="text-xs font-medium text-gris-tecnico mb-2">Contenedores</p>
                            <div className="flex items-center gap-4 text-xs font-medium text-gris-tecnico mb-1 pl-10">
                              <span className="w-24">Cantidad</span>
                              <span className="w-24">Precio total</span>
                              <span>Precio unitario</span>
                            </div>
                            <div className="space-y-1">
                              {item.contenedores.map((c) => (
                                <div key={c.contador} className="flex items-center gap-4 text-sm">
                                  <span className="text-gris-tecnico w-6">#{c.contador}</span>
                                  <span className="font-medium text-gray-900 w-24">{c.cantidad.toFixed(2)}</span>
                                  <span className="text-gray-700 w-24">$ {c.precio.toLocaleString()}</span>
                                  <span className="text-violet-lab">$ {c.precio_unidad.toFixed(2)} / {item.unidad_abreviacion}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border-tabla">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gris-tecnico">Registros por página</span>
                <select className="text-sm border border-border-tabla rounded-8 px-2 py-1 bg-white" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); fetchData(1, Number(e.target.value)); }}>
                  {[10, 20, 50, 100].map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gris-tecnico mr-2">Página {currentPage} de {totalPages} ({totalItems} registros)</span>
                {totalPages > 1 && (
                  <>
                    <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => fetchData(currentPage - 1)}>Anterior</Button>
                    <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => fetchData(currentPage + 1)}>Siguiente</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
