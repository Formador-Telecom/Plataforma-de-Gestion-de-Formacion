import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  Users,
  Target,
  BarChart2,
  Paperclip,
  TrendingUp,
} from 'lucide-react';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { KPICard } from '../components/common/KPICard';
import { FilterBar, FilterState } from '../components/common/FilterBar';
import { dbService } from '../services/dbStore';
import { useAuth } from '../context/AuthContext';
import {
  Capacitacion,
  TrainingModality,
  TrainingStatus,
  TrainingResult,
} from '../types/database';

interface CapacitacionesViewProps {
  subView: string;
  onSubViewChange: (sub: string) => void;
}

export const CapacitacionesView: React.FC<CapacitacionesViewProps> = ({
  subView,
  onSubViewChange,
}) => {
  const { currentUser, isFormador, hasPermission, isConsulta } = useAuth();

  const [filters, setFilters] = useState<FilterState>({
    proyectoId: '',
    areaId: '',
    formadorId: isFormador && currentUser.formadorId ? currentUser.formadorId : '',
    certificacionId: '',
    estado: '',
    periodo: 'all',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(subView === 'registrar');
  const [selectedCapacitacion, setSelectedCapacitacion] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form state for creating training
  const [formData, setFormData] = useState({
    colaboradorId: '',
    tema: '',
    subtema: '',
    tipoCapacitacion: 'Normativa / SST',
    fecha: new Date().toISOString().split('T')[0],
    duracionHoras: 8,
    formadorId: isFormador && currentUser.formadorId ? currentUser.formadorId : '',
    modalidad: 'presencial' as TrainingModality,
    estado: 'realizada' as TrainingStatus,
    resultado: 'Aprobado' as TrainingResult,
    calificacion: 90,
    observaciones: '',
    evidenciaArchivo: '',
  });

  const proyectos = dbService.getProyectos();
  const areas = dbService.getAreas();
  const formadores = dbService.getFormadores();
  const certificacionesCatalogo = dbService.getCertificacionesCatalogo();
  const enrichedColabs = dbService.getEnrichedColaboradores();
  const rawCapacitaciones = dbService.getCapacitaciones();
  const parametros = dbService.getParametros();

  // Enriched capacitaciones with Colaborador, Proyecto, Area and Formador names
  const enrichedCapacitaciones = useMemo(() => {
    const colabMap = new Map(enrichedColabs.map((c) => [c.id, c]));
    const formadorMap = new Map(formadores.map((f) => [f.id, f]));

    return rawCapacitaciones.map((cap) => {
      const colab = colabMap.get(cap.colaboradorId);
      const formador = formadorMap.get(cap.formadorId);

      return {
        ...cap,
        colaboradorNombre: colab?.nombreCompleto || 'Colaborador desconocido',
        colaboradorDocumento: colab?.documento || '—',
        colaboradorCodigo: colab?.codigoInterno || '—',
        cargo: colab?.cargo || '—',
        proyectoId: colab?.proyectoId || '',
        proyectoNombre: colab?.proyectoNombre || 'Sin Proyecto',
        areaId: colab?.areaId || '',
        areaNombre: colab?.areaNombre || 'Sin Área',
        formadorNombre: formador?.nombreCompleto || 'Sin Asignar',
        formadorEspecialidad: formador?.especialidad || '',
      };
    });
  }, [rawCapacitaciones, enrichedColabs, formadores]);

  // Apply filters
  const filteredCapacitaciones = useMemo(() => {
    return enrichedCapacitaciones.filter((c) => {
      if (filters.proyectoId && c.proyectoId !== filters.proyectoId) return false;
      if (filters.areaId && c.areaId !== filters.areaId) return false;
      if (filters.formadorId && c.formadorId !== filters.formadorId) return false;
      if (filters.estado && c.estado !== filters.estado) return false;
      return true;
    });
  }, [enrichedCapacitaciones, filters]);

  // Calculations for KPI Cards
  const totalCapacitaciones = filteredCapacitaciones.length;
  const realizadas = filteredCapacitaciones.filter((c) => c.estado === 'realizada');
  const programadas = filteredCapacitaciones.filter((c) => c.estado === 'programada');
  const totalHoras = realizadas.reduce((acc, c) => acc + (c.duracionHoras || 0), 0);

  const distinctColabs = new Set(realizadas.map((c) => c.colaboradorId)).size;
  const targetHours = (enrichedColabs.length || 1) * (parametros.metaHorasFormacionAnual || 24);
  const cumplimientoMeta = Math.min(100, Math.round((totalHoras / targetHours) * 100));

  // Training by Formador summary
  const formadorStats = useMemo(() => {
    return formadores.map((f) => {
      const sessions = rawCapacitaciones.filter((c) => c.formadorId === f.id && c.estado === 'realizada');
      const hours = sessions.reduce((sum, c) => sum + (c.duracionHoras || 0), 0);
      const uniqueTrained = new Set(sessions.map((c) => c.colaboradorId)).size;
      return {
        formador: f,
        sesiones: sessions.length,
        horas: hours,
        colaboradores: uniqueTrained,
      };
    });
  }, [formadores, rawCapacitaciones]);

  // Most frequent topics
  const topTopics = useMemo(() => {
    const counts: Record<string, { count: number; hours: number }> = {};
    realizadas.forEach((c) => {
      if (!counts[c.tema]) {
        counts[c.tema] = { count: 0, hours: 0 };
      }
      counts[c.tema].count += 1;
      counts[c.tema].hours += c.duracionHoras || 0;
    });

    return Object.entries(counts)
      .map(([tema, data]) => ({ tema, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [realizadas]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.colaboradorId || !formData.tema || !formData.formadorId) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    dbService.createCapacitacion(
      {
        ...formData,
        duracionHoras: Number(formData.duracionHoras) || 1,
        calificacion: formData.calificacion ? Number(formData.calificacion) : undefined,
      },
      currentUser
    );

    setIsCreateModalOpen(false);
    alert('Capacitación registrada exitosamente.');
    // Reset form
    setFormData({
      colaboradorId: '',
      tema: '',
      subtema: '',
      tipoCapacitacion: 'Normativa / SST',
      fecha: new Date().toISOString().split('T')[0],
      duracionHoras: 8,
      formadorId: isFormador && currentUser.formadorId ? currentUser.formadorId : '',
      modalidad: 'presencial',
      estado: 'realizada',
      resultado: 'Aprobado',
      calificacion: 90,
      observaciones: '',
      evidenciaArchivo: '',
    });
  };

  // Columns for History Table
  const historyColumns: Column<any>[] = [
    {
      key: 'tema',
      header: 'Tema & Modalidad',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.tema}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <span className="capitalize">{r.modalidad}</span>
            <span>•</span>
            <span className="text-blue-700 font-medium">{r.tipoCapacitacion}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'colaboradorNombre',
      header: 'Colaborador',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.colaboradorNombre}</p>
          <p className="text-[11px] text-slate-500">
            {r.colaboradorCodigo} • {r.cargo}
          </p>
        </div>
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
      header: 'Fecha & Duración',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-slate-700">{r.fecha}</p>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            {r.duracionHoras} hrs
          </span>
        </div>
      ),
    },
    {
      key: 'formadorNombre',
      header: 'Formador',
      sortable: true,
      render: (r) => <span className="text-xs text-slate-700 font-medium">{r.formadorNombre}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (r) => <Badge status={r.estado} />,
    },
    {
      key: 'resultado',
      header: 'Resultado',
      sortable: true,
      align: 'center',
      render: (r) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            r.resultado === 'Aprobado'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : r.resultado === 'Reprobado'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {r.resultado} {r.calificacion ? `(${r.calificacion})` : ''}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Detalle',
      align: 'right',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedCapacitacion(r);
            setIsDetailModalOpen(true);
          }}
          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors text-xs font-semibold"
        >
          Ver Ficha
        </button>
      ),
    },
  ];

  // Columns for Collaborator training summary table
  const colabSummaryColumns: Column<any>[] = [
    {
      key: 'nombreCompleto',
      header: 'Colaborador',
      sortable: true,
      render: (c) => (
        <div>
          <p className="font-bold text-slate-900">{c.nombreCompleto}</p>
          <p className="text-[11px] text-slate-500">{c.codigoInterno} • {c.cargo}</p>
        </div>
      ),
    },
    {
      key: 'proyectoNombre',
      header: 'Proyecto & Área',
      sortable: true,
      render: (c) => (
        <div>
          <p className="font-semibold text-slate-800">{c.proyectoNombre}</p>
          <p className="text-[11px] text-slate-500">{c.areaNombre}</p>
        </div>
      ),
    },
    {
      key: 'horasFormacion',
      header: 'Horas Acumuladas',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-blue-700 text-sm">{c.horasFormacion} hrs</span>
          <span className="text-[11px] text-slate-400">/ meta {parametros.metaHorasFormacionAnual}h</span>
        </div>
      ),
    },
    {
      key: 'cumplimiento',
      header: 'Cumplimiento de Meta',
      sortable: true,
      render: (c) => {
        const pct = Math.min(100, Math.round((c.horasFormacion / (parametros.metaHorasFormacionAnual || 24)) * 100));
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'capacitacionesCount',
      header: 'Sesiones Asistidas',
      sortable: true,
      align: 'center',
      render: (c) => <span className="font-bold text-slate-700">{c.capacitacionesCount}</span>,
    },
    {
      key: 'certificacion',
      header: 'Certificación',
      sortable: true,
      align: 'center',
      render: (c) => <Badge status={c.estadoCertificacion} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'capacitados', label: 'Personal Capacitado (Resumen)' },
            { id: 'historial', label: 'Historial de Capacitaciones' },
            { id: 'plan', label: 'Plan & Horas por Formador' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSubViewChange(tab.id)}
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

        {!isConsulta && hasPermission('capacitacion:create') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Capacitación</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard
          title="Colaboradores Capacitados"
          value={distinctColabs}
          subtitle={`De ${enrichedColabs.length} en plantilla activa`}
          icon={Users}
          variant="blue"
        />
        <KPICard
          title="Horas Impartidas"
          value={`${totalHoras} hrs`}
          subtitle="En capacitaciones realizadas"
          icon={Clock}
          variant="indigo"
        />
        <KPICard
          title="Sesiones Programadas"
          value={programadas.length}
          subtitle="Pendientes de ejecución"
          icon={Calendar}
          variant="amber"
        />
        <KPICard
          title="Cumplimiento de Meta"
          value={`${cumplimientoMeta}%`}
          subtitle={`Meta: ${parametros.metaHorasFormacionAnual}h/persona`}
          icon={Target}
          variant="emerald"
        />
      </div>

      {/* View Branching */}
      {subView === 'plan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formadores breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Horas Impartidas por Formador</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Carga horaria y cobertura de personal de cada formador
            </p>

            <div className="space-y-3">
              {formadorStats.map((item) => (
                <div key={item.formador.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{item.formador.nombreCompleto}</p>
                    <p className="text-[11px] text-slate-500">{item.formador.especialidad}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.sesiones} sesiones • {item.colaboradores} colaboradores formados
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-700">{item.horas} hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top topics taught */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Temas Más Impartidos en la Organización</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ranking de temáticas con mayor frecuencia de impartición
            </p>

            <div className="space-y-3">
              {topTopics.map((item, idx) => (
                <div key={item.tema} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{item.tema}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.count} sesiones realizadas
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {item.hours} hrs totales
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : subView === 'capacitados' ? (
        <>
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
            certificaciones={certificacionesCatalogo}
            showCertFilter={false}
          />

          <DataTable
            columns={colabSummaryColumns}
            data={enrichedColabs}
            keyExtractor={(c) => c.id}
            title="Consolidado de Horas y Capacitación por Colaborador"
            subtitle={`Control individual de horas ejecutadas vs. meta anual (${parametros.metaHorasFormacionAnual}h)`}
            exportFileName="consolidado_horas_formacion"
            searchableFields={['nombreCompleto', 'documento', 'codigoInterno', 'cargo']}
          />
        </>
      ) : (
        <>
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
            certificaciones={certificacionesCatalogo}
            showCertFilter={false}
            estadoOptions={[
              { value: 'realizada', label: 'Capacitación Realizada' },
              { value: 'programada', label: 'Capacitación Programada' },
              { value: 'cancelada', label: 'Capacitación Cancelada' },
            ]}
          />

          <DataTable
            columns={historyColumns}
            data={filteredCapacitaciones}
            keyExtractor={(c) => c.id}
            title="Historial de Capacitaciones Ejecutadas y Programadas"
            subtitle={`Mostrando ${filteredCapacitaciones.length} registros`}
            exportFileName="historial_capacitaciones"
            searchableFields={['tema', 'colaboradorNombre', 'formadorNombre', 'tipoCapacitacion']}
          />
        </>
      )}

      {/* Modal: Registrar Capacitación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Sesión de Capacitación"
        subtitle="Registro directo con actualización automática de horas y cumplimiento"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colaborador */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colaborador Capacitado <span className="text-rose-500">*</span>
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
                    {c.nombreCompleto} ({c.codigoInterno} - {c.cargo} - {c.proyectoNombre})
                  </option>
                ))}
              </select>
            </div>

            {/* Tema */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tema de Capacitación <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Inspección de Arneses y Líneas de Vida"
                value={formData.tema}
                onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Subtema */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subtema o Módulo
              </label>
              <input
                type="text"
                placeholder="Ej. Factores de caída y anclajes"
                value={formData.subtema}
                onChange={(e) => setFormData({ ...formData, subtema: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo de Capacitación
              </label>
              <select
                value={formData.tipoCapacitacion}
                onChange={(e) => setFormData({ ...formData, tipoCapacitacion: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Normativa / SST">Normativa / SST</option>
                <option value="Técnica / Operativa">Técnica / Operativa</option>
                <option value="Calidad & Procesos">Calidad & Procesos</option>
                <option value="Habilidades Blandas">Habilidades Blandas</option>
                <option value="Inducción Corporativa">Inducción Corporativa</option>
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de Ejecución <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Duración */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duración en Horas <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={40}
                value={formData.duracionHoras}
                onChange={(e) => setFormData({ ...formData, duracionHoras: Number(e.target.value) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Formador */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Formador Responsable <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.formadorId}
                onChange={(e) => setFormData({ ...formData, formadorId: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Seleccionar formador...</option>
                {formadores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombreCompleto} ({f.especialidad})
                  </option>
                ))}
              </select>
            </div>

            {/* Modalidad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Modalidad
              </label>
              <select
                value={formData.modalidad}
                onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as TrainingModality })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="presencial">Presencial en Terreno</option>
                <option value="virtual">Virtual / E-learning</option>
                <option value="mixta">Mixta (Teoría + Práctica)</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado de Sesión
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as TrainingStatus })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="realizada">Realizada</option>
                <option value="programada">Programada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Resultado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resultado de Evaluación
              </label>
              <select
                value={formData.resultado}
                onChange={(e) => setFormData({ ...formData, resultado: e.target.value as TrainingResult })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Aprobado">Aprobado</option>
                <option value="Reprobado">Reprobado</option>
                <option value="Asistió">Asistió (Sin calificación)</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            {/* Calificación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Calificación (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.calificacion}
                onChange={(e) => setFormData({ ...formData, calificacion: Number(e.target.value) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Evidencia / Adjunto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Evidencia / Acta / Archivo
              </label>
              <input
                type="text"
                placeholder="Ej. acta_asistencia_firmada.pdf"
                value={formData.evidenciaArchivo}
                onChange={(e) => setFormData({ ...formData, evidenciaArchivo: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observaciones y Comentarios del Formador
              </label>
              <textarea
                rows={2}
                placeholder="Desempeño en simulacro, participación activa, puntos de refuerzo..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
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
              Guardar Capacitación
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalle de Capacitación */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalle de Sesión de Capacitación"
        subtitle={selectedCapacitacion?.tema || 'Capacitación'}
        maxWidth="lg"
      >
        {selectedCapacitacion && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedCapacitacion.colaboradorNombre}</p>
                <p className="text-slate-500">
                  {selectedCapacitacion.colaboradorCodigo} • {selectedCapacitacion.cargo} • {selectedCapacitacion.proyectoNombre}
                </p>
              </div>
              <Badge status={selectedCapacitacion.estado} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Tema Principal</span>
                <span className="font-bold text-slate-800">{selectedCapacitacion.tema}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Subtema</span>
                <span className="font-bold text-slate-800">{selectedCapacitacion.subtema || 'General'}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Formador</span>
                <span className="font-bold text-blue-700">{selectedCapacitacion.formadorNombre}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Duración</span>
                <span className="font-bold text-indigo-700">{selectedCapacitacion.duracionHoras} Horas</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Modalidad</span>
                <span className="font-bold text-slate-800 capitalize">{selectedCapacitacion.modalidad}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Resultado & Nota</span>
                <span className="font-bold text-emerald-700">
                  {selectedCapacitacion.resultado} {selectedCapacitacion.calificacion ? `(${selectedCapacitacion.calificacion}/100)` : ''}
                </span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Observaciones del Formador</span>
              <p className="text-slate-700 italic">
                {selectedCapacitacion.observaciones || 'Sin observaciones registradas.'}
              </p>
            </div>

            {selectedCapacitacion.evidenciaArchivo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-900">{selectedCapacitacion.evidenciaArchivo}</span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Evidencia Adjunta
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
