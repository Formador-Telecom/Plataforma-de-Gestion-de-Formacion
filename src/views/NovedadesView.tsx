import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Send,
  Calendar,
  FileText,
  UserCheck,
} from 'lucide-react';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { KPICard } from '../components/common/KPICard';
import { FilterBar, FilterState } from '../components/common/FilterBar';
import { dbService } from '../services/dbStore';
import { useAuth } from '../context/AuthContext';
import { Novedad, NovedadStatus } from '../types/database';

interface NovedadesViewProps {
  subView: string;
  onSubViewChange: (sub: string) => void;
}

export const NovedadesView: React.FC<NovedadesViewProps> = ({
  subView,
  onSubViewChange,
}) => {
  const { currentUser, hasPermission, isConsulta } = useAuth();

  const [filters, setFilters] = useState<FilterState>({
    proyectoId: '',
    areaId: '',
    formadorId: '',
    certificacionId: '',
    estado:
      subView === 'abiertas'
        ? 'abierta'
        : subView === 'seguimiento'
        ? 'en_seguimiento'
        : subView === 'cerradas'
        ? 'cerrada'
        : '',
    periodo: 'all',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(subView === 'registrar');
  const [selectedNovedad, setSelectedNovedad] = useState<any>(null);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [newNota, setNewNota] = useState('');
  const [newStatus, setNewStatus] = useState<NovedadStatus>('en_seguimiento');
  const [accionesTomadas, setAccionesTomadas] = useState('');

  // Create form state
  const [formData, setFormData] = useState({
    colaboradorId: '',
    tipoNovedadId: 'tn-1',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    estado: 'abierta' as NovedadStatus,
    responsableSeguimiento: currentUser?.nombreCompleto || 'Gestión Humana',
    accionesTomadas: '',
  });

  const proyectos = dbService.getProyectos();
  const areas = dbService.getAreas();
  const formadores = dbService.getFormadores();
  const tiposNovedad = dbService.getTiposNovedad();
  const enrichedColabs = dbService.getEnrichedColaboradores();
  const rawNovedades = dbService.getNovedades();

  // Keep subView synchronized with filter
  const handleTabChange = (tab: string) => {
    onSubViewChange(tab);
    if (tab === 'abiertas') {
      setFilters((prev) => ({ ...prev, estado: 'abierta' }));
    } else if (tab === 'seguimiento') {
      setFilters((prev) => ({ ...prev, estado: 'en_seguimiento' }));
    } else if (tab === 'cerradas') {
      setFilters((prev) => ({ ...prev, estado: 'cerrada' }));
    } else {
      setFilters((prev) => ({ ...prev, estado: '' }));
    }
  };

  // Enriched Novedades
  const enrichedNovedades = useMemo(() => {
    const colabMap = new Map(enrichedColabs.map((c) => [c.id, c]));
    const tipoMap = new Map(tiposNovedad.map((t) => [t.id, t]));

    return rawNovedades.map((n) => {
      const colab = colabMap.get(n.colaboradorId);
      const tipo = tipoMap.get(n.tipoNovedadId);

      return {
        ...n,
        colaboradorNombre: colab?.nombreCompleto || 'Colaborador',
        colaboradorDocumento: colab?.documento || '—',
        colaboradorCodigo: colab?.codigoInterno || '—',
        cargo: colab?.cargo || '—',
        proyectoId: colab?.proyectoId || '',
        proyectoNombre: colab?.proyectoNombre || 'Sin Proyecto',
        areaId: colab?.areaId || '',
        areaNombre: colab?.areaNombre || 'Sin Área',
        tipoNovedadNombre: tipo?.nombre || 'Novedad General',
      };
    });
  }, [rawNovedades, enrichedColabs, tiposNovedad]);

  // Filtered Novedades
  const filteredNovedades = useMemo(() => {
    return enrichedNovedades.filter((n) => {
      if (filters.proyectoId && n.proyectoId !== filters.proyectoId) return false;
      if (filters.areaId && n.areaId !== filters.areaId) return false;
      if (filters.estado && n.estado !== filters.estado) return false;
      return true;
    });
  }, [enrichedNovedades, filters]);

  // Statistics
  const totalNovedades = filteredNovedades.length;
  const abiertas = filteredNovedades.filter((n) => n.estado === 'abierta').length;
  const enSeguimiento = filteredNovedades.filter((n) => n.estado === 'en_seguimiento').length;
  const cerradas = filteredNovedades.filter((n) => n.estado === 'cerrada').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.colaboradorId || !formData.descripcion) {
      alert('Por favor completa los campos requeridos.');
      return;
    }

    dbService.createNovedad(formData, currentUser);
    setIsCreateModalOpen(false);
    alert('Novedad registrada exitosamente.');
    setFormData({
      colaboradorId: '',
      tipoNovedadId: 'tn-1',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      estado: 'abierta',
      responsableSeguimiento: currentUser?.nombreCompleto || 'Gestión Humana',
      accionesTomadas: '',
    });
  };

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNovedad || !newNota.trim()) return;

    dbService.addSeguimientoNovedad(
      selectedNovedad.id,
      newNota,
      newStatus,
      accionesTomadas,
      currentUser
    );

    // Refresh selected item
    const updated = dbService.getNovedades().find((n) => n.id === selectedNovedad.id);
    if (updated) {
      const colab = enrichedColabs.find((c) => c.id === updated.colaboradorId);
      const tipo = tiposNovedad.find((t) => t.id === updated.tipoNovedadId);
      setSelectedNovedad({
        ...updated,
        colaboradorNombre: colab?.nombreCompleto || 'Colaborador',
        colaboradorDocumento: colab?.documento || '—',
        colaboradorCodigo: colab?.codigoInterno || '—',
        cargo: colab?.cargo || '—',
        proyectoNombre: colab?.proyectoNombre || '—',
        areaNombre: colab?.areaNombre || '—',
        tipoNovedadNombre: tipo?.nombre || 'General',
      });
    }

    setNewNota('');
    alert('Bitácora de seguimiento actualizada.');
  };

  const columns: Column<any>[] = [
    {
      key: 'colaboradorNombre',
      header: 'Colaborador',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.colaboradorNombre}</p>
          <p className="text-[11px] text-slate-500">{r.colaboradorCodigo} • {r.cargo}</p>
        </div>
      ),
    },
    {
      key: 'tipoNovedadNombre',
      header: 'Tipo de Novedad',
      sortable: true,
      render: (r) => (
        <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {r.tipoNovedadNombre}
        </span>
      ),
    },
    {
      key: 'proyectoNombre',
      header: 'Proyecto & Área',
      sortable: true,
      render: (r) => (
        <div>
          <p className="text-slate-800 font-medium">{r.proyectoNombre}</p>
          <p className="text-[11px] text-slate-500">{r.areaNombre}</p>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha Novedad',
      sortable: true,
      render: (r) => <span className="text-xs font-medium text-slate-700">{r.fecha}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (r) => <Badge status={r.estado} />,
    },
    {
      key: 'responsableSeguimiento',
      header: 'Responsable',
      sortable: true,
      render: (r) => <span className="text-xs text-slate-700">{r.responsableSeguimiento}</span>,
    },
    {
      key: 'acciones',
      header: 'Seguimiento & Bitácora',
      align: 'right',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedNovedad(r);
            setNewStatus(r.estado);
            setAccionesTomadas(r.accionesTomadas || '');
            setIsFollowupModalOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Bitácora ({r.historial.length})</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todas', label: 'Todas las Novedades' },
            { id: 'abiertas', label: 'Novedades Abiertas' },
            { id: 'seguimiento', label: 'En Seguimiento' },
            { id: 'cerradas', label: 'Novedades Cerradas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                subView === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!isConsulta && hasPermission('novedades:create') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Novedad</span>
          </button>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard
          title="Total Novedades"
          value={totalNovedades}
          subtitle="Filtradas en pantalla"
          icon={AlertCircle}
          variant="slate"
        />
        <KPICard
          title="Novedades Abiertas"
          value={abiertas}
          subtitle="Atención prioritaria"
          icon={AlertTriangle}
          variant="rose"
        />
        <KPICard
          title="En Seguimiento"
          value={enSeguimiento}
          subtitle="Con plan de acción"
          icon={Clock}
          variant="amber"
        />
        <KPICard
          title="Novedades Cerradas"
          value={cerradas}
          subtitle="Resueltas y archivadas"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onReset={() =>
          setFilters({
            proyectoId: '',
            areaId: '',
            formadorId: '',
            certificacionId: '',
            estado: '',
            periodo: 'all',
          })
        }
        proyectos={proyectos}
        areas={areas}
        formadores={formadores}
        certificaciones={[]}
        showCertFilter={false}
        estadoOptions={[
          { value: 'abierta', label: 'Novedad Abierta' },
          { value: 'en_seguimiento', label: 'En Seguimiento' },
          { value: 'cerrada', label: 'Novedad Cerrada' },
        ]}
      />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredNovedades}
        keyExtractor={(n) => n.id}
        title="Bandeja Central de Novedades e Incidencias"
        subtitle={`Registro y bitácora de eventos asociados al personal de la organización`}
        exportFileName="reporte_novedades"
        searchableFields={['colaboradorNombre', 'tipoNovedadNombre', 'descripcion', 'responsableSeguimiento']}
      />

      {/* Modal: Registrar Novedad */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Nueva Novedad"
        subtitle="Reportar eventos que impacten la disponibilidad o certificación del colaborador"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Colaborador */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colaborador <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.colaboradorId}
                onChange={(e) => setFormData({ ...formData, colaboradorId: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Seleccionar colaborador...</option>
                {enrichedColabs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombreCompleto} ({c.codigoInterno} - {c.proyectoNombre})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo Novedad & Fecha */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Novedad <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.tipoNovedadId}
                  onChange={(e) => setFormData({ ...formData, tipoNovedadId: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {tiposNovedad.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha del Evento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Responsable & Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Responsable de Seguimiento
                </label>
                <input
                  type="text"
                  value={formData.responsableSeguimiento}
                  onChange={(e) => setFormData({ ...formData, responsableSeguimiento: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado Inicial
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as NovedadStatus })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="abierta">Abierta</option>
                  <option value="en_seguimiento">En Seguimiento</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción Detallada <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Especifica el motivo, contexto o diagnóstico preliminar..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              Registrar Novedad
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Bitácora & Seguimiento */}
      <Modal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        title="Bitácora de Seguimiento y Acciones"
        subtitle={`Novedad de ${selectedNovedad?.colaboradorNombre || 'Colaborador'}`}
        maxWidth="xl"
      >
        {selectedNovedad && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900">{selectedNovedad.colaboradorNombre}</span>
                  <span className="text-slate-500 text-[11px] ml-2">
                    ({selectedNovedad.proyectoNombre} • {selectedNovedad.areaNombre})
                  </span>
                </div>
                <Badge status={selectedNovedad.estado} />
              </div>
              <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 italic">
                "{selectedNovedad.descripcion}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Tipo: <strong>{selectedNovedad.tipoNovedadNombre}</strong></span>
                <span>Responsable: <strong>{selectedNovedad.responsableSeguimiento}</strong></span>
              </div>
            </div>

            {/* Timeline of updates */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Historial de Actualizaciones ({selectedNovedad.historial.length})
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedNovedad.historial.map((entry: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-700">{entry.usuario}</span>
                      <span className="text-slate-400">{entry.fecha}</span>
                    </div>
                    <p className="text-slate-700">{entry.nota}</p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium pt-1 border-t border-slate-100">
                      <span>Estado:</span>
                      <span className="font-semibold text-slate-700 capitalize">{entry.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add new follow-up note */}
            {!isConsulta && (
              <form onSubmit={handleAddFollowup} className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3 pt-3">
                <h5 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Agregar Nota de Seguimiento / Resolución</span>
                </h5>

                <textarea
                  required
                  rows={2}
                  placeholder="Describe la acción ejecutada, cita médica, resolución o reingreso..."
                  value={newNota}
                  onChange={(e) => setNewNota(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Actualizar Estado
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as NovedadStatus)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none"
                    >
                      <option value="abierta">Permanecer Abierta</option>
                      <option value="en_seguimiento">En Seguimiento Activo</option>
                      <option value="cerrada">Cerrada / Resuelta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Acciones Finales Tomadas
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Alta médica y reasignación de turno"
                      value={accionesTomadas}
                      onChange={(e) => setAccionesTomadas(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Registrar en Bitácora</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
