import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  GraduationCap,
  Clock,
  AlertOctagon,
  BookOpen,
  ClipboardList,
  Target,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { KPICard } from '../components/common/KPICard';
import { FilterBar, FilterState } from '../components/common/FilterBar';
import { Badge } from '../components/common/Badge';
import { dbService } from '../services/dbStore';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (view: string, subView?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, isFormador } = useAuth();

  const [filters, setFilters] = useState<FilterState>({
    proyectoId: '',
    areaId: '',
    formadorId: isFormador && currentUser.formadorId ? currentUser.formadorId : '',
    certificacionId: '',
    estado: '',
    periodo: 'all',
  });

  const proyectos = dbService.getProyectos();
  const areas = dbService.getAreas();
  const formadores = dbService.getFormadores();
  const certificacionesCatalogo = dbService.getCertificacionesCatalogo();
  const enrichedColabs = dbService.getEnrichedColaboradores();
  const capacitaciones = dbService.getCapacitaciones();
  const novedades = dbService.getNovedades();
  const parametros = dbService.getParametros();

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      proyectoId: '',
      areaId: '',
      formadorId: isFormador && currentUser.formadorId ? currentUser.formadorId : '',
      certificacionId: '',
      estado: '',
      periodo: 'all',
    });
  };

  // Filter enriched collaborators based on all active criteria
  const filteredColabs = useMemo(() => {
    return enrichedColabs.filter((c) => {
      if (filters.proyectoId && c.proyectoId !== filters.proyectoId) return false;
      if (filters.areaId && c.areaId !== filters.areaId) return false;
      if (filters.estado && c.estadoCertificacion !== filters.estado) return false;

      if (filters.certificacionId) {
        const hasCert = c.certificaciones.some((cert) => cert.certificacionId === filters.certificacionId);
        if (!hasCert) return false;
      }

      if (filters.formadorId) {
        const trainedByFormador = capacitaciones.some(
          (cap) => cap.colaboradorId === c.id && cap.formadorId === filters.formadorId
        );
        const certByFormador = c.certificaciones.some((cert) => cert.formadorId === filters.formadorId);
        if (!trainedByFormador && !certByFormador) return false;
      }

      return true;
    });
  }, [enrichedColabs, filters, capacitaciones]);

  // Filtered Capacitaciones
  const filteredCapacitaciones = useMemo(() => {
    const colabIds = new Set(filteredColabs.map((c) => c.id));
    return capacitaciones.filter((cap) => {
      if (!colabIds.has(cap.colaboradorId)) return false;
      if (filters.formadorId && cap.formadorId !== filters.formadorId) return false;
      return true;
    });
  }, [capacitaciones, filteredColabs, filters.formadorId]);

  // Filtered Novedades
  const filteredNovedades = useMemo(() => {
    const colabIds = new Set(filteredColabs.map((c) => c.id));
    return novedades.filter((n) => colabIds.has(n.colaboradorId));
  }, [novedades, filteredColabs]);

  // Calculations for KPIs
  const totalColaboradores = filteredColabs.length;
  const totalCertificadosVigentes = filteredColabs.filter((c) => c.estadoCertificacion === 'vigente').length;
  const totalProximosVencer = filteredColabs.filter((c) => c.estadoCertificacion === 'proximo_vencer').length;
  const totalVencidos = filteredColabs.filter((c) => c.estadoCertificacion === 'vencido').length;
  const totalNoCertificados = filteredColabs.filter((c) => c.estadoCertificacion === 'no_certificado').length;

  const totalCertificados = totalCertificadosVigentes + totalProximosVencer;
  const porcentajeCertificacion =
    totalColaboradores > 0 ? Math.round((totalCertificados / totalColaboradores) * 100) : 0;

  // Training metrics
  const colaboradoresCapacitados = filteredColabs.filter((c) => c.capacitacionesCount > 0).length;
  const totalHorasFormacion = filteredCapacitaciones
    .filter((c) => c.estado === 'realizada')
    .reduce((sum, c) => sum + (c.duracionHoras || 0), 0);

  const metaHorasPorPersona = parametros.metaHorasFormacionAnual || 24;
  const metaTotalHoras = totalColaboradores * metaHorasPorPersona;
  const porcentajeCumplimientoHoras =
    metaTotalHoras > 0 ? Math.min(100, Math.round((totalHorasFormacion / metaTotalHoras) * 100)) : 0;

  const totalNovedadesAbiertas = filteredNovedades.filter((n) => n.estado === 'abierta').length;

  // Chart: Certification distribution
  const certDistData = [
    { label: 'Vigente', count: totalCertificadosVigentes, color: 'bg-emerald-500', hex: '#10B981' },
    { label: 'Próx. a Vencer', count: totalProximosVencer, color: 'bg-amber-500', hex: '#F59E0B' },
    { label: 'Vencido', count: totalVencidos, color: 'bg-rose-500', hex: '#F43F5E' },
    { label: 'No Certificado', count: totalNoCertificados, color: 'bg-slate-400', hex: '#94A3B8' },
  ];

  // Distribution by Project
  const projectDist = useMemo(() => {
    return proyectos.map((p) => {
      const inProj = filteredColabs.filter((c) => c.proyectoId === p.id);
      const certCount = inProj.filter((c) => c.estadoCertificacion === 'vigente' || c.estadoCertificacion === 'proximo_vencer').length;
      return {
        id: p.id,
        nombre: p.nombre,
        total: inProj.length,
        certificados: certCount,
        pct: inProj.length > 0 ? Math.round((certCount / inProj.length) * 100) : 0,
      };
    });
  }, [proyectos, filteredColabs]);

  // Distribution by Area
  const areaDist = useMemo(() => {
    return areas.map((a) => {
      const inArea = filteredColabs.filter((c) => c.areaId === a.id);
      const certCount = inArea.filter((c) => c.estadoCertificacion === 'vigente' || c.estadoCertificacion === 'proximo_vencer').length;
      return {
        id: a.id,
        nombre: a.nombre,
        total: inArea.length,
        certificados: certCount,
        pct: inArea.length > 0 ? Math.round((certCount / inArea.length) * 100) : 0,
      };
    });
  }, [areas, filteredColabs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Personalized Formador Banner if logged as Trainer */}
      {isFormador && (
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                Panel Especial de Formador
              </span>
              <Sparkles className="w-4 h-4 text-blue-200" />
            </div>
            <h3 className="text-lg font-bold">
              Bienvenido, {currentUser.nombreCompleto}
            </h3>
            <p className="text-xs text-blue-100 max-w-2xl">
              Aquí puedes monitorear de primera mano las capacitaciones bajo tu responsabilidad, gestionar asistencias y registrar estados de certificación en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('formacion', 'registrar')}
              className="px-3.5 py-2 bg-white text-blue-900 rounded-lg text-xs font-bold shadow hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Registrar Capacitación</span>
            </button>
            <button
              onClick={() => onNavigate('novedades', 'registrar')}
              className="px-3.5 py-2 bg-blue-600/80 hover:bg-blue-600 text-white border border-white/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Reportar Novedad</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        proyectos={proyectos}
        areas={areas}
        formadores={formadores}
        certificaciones={certificacionesCatalogo}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Colaboradores"
          value={totalColaboradores}
          subtitle={`Distribuidos en ${proyectos.length} proyectos`}
          icon={Users}
          variant="slate"
          onClick={() => onNavigate('certificaciones', 'todos')}
        />

        <KPICard
          title="Personal Certificado"
          value={totalCertificados}
          subtitle={`${porcentajeCertificacion}% del personal habilitado`}
          icon={Award}
          variant="emerald"
          trend={{ value: `${porcentajeCertificacion}% cobertura`, isPositive: porcentajeCertificacion >= 70 }}
          onClick={() => onNavigate('certificaciones', 'certificados')}
        />

        <KPICard
          title="Próximas a Vencer"
          value={totalProximosVencer}
          subtitle="Vencimiento menor a 30 días"
          icon={Clock}
          variant="amber"
          trend={{ value: 'Acción requerida', isPositive: false }}
          onClick={() => onNavigate('certificaciones', 'proximos')}
        />

        <KPICard
          title="Personal No Certificado"
          value={totalNoCertificados + totalVencidos}
          subtitle={`${totalVencidos} vencidos / ${totalNoCertificados} sin registrar`}
          icon={AlertOctagon}
          variant="rose"
          onClick={() => onNavigate('certificaciones', 'vencidos')}
        />

        <KPICard
          title="Personal Capacitado"
          value={colaboradoresCapacitados}
          subtitle={`${Math.round((colaboradoresCapacitados / (totalColaboradores || 1)) * 100)}% de colaboradores con sesiones`}
          icon={GraduationCap}
          variant="blue"
          onClick={() => onNavigate('formacion', 'capacitados')}
        />

        <KPICard
          title="Horas de Formación"
          value={`${totalHorasFormacion} hrs`}
          subtitle={`En ${filteredCapacitaciones.length} sesiones ejecutadas`}
          icon={BookOpen}
          variant="indigo"
          onClick={() => onNavigate('formacion', 'historial')}
        />

        <KPICard
          title="Cumplimiento de Meta"
          value={`${porcentajeCumplimientoHoras}%`}
          subtitle={`Meta anual: ${metaHorasPorPersona}h por colaborador`}
          icon={Target}
          variant="emerald"
          trend={{ value: `${totalHorasFormacion}/${metaTotalHoras}h`, isPositive: porcentajeCumplimientoHoras >= 60 }}
          onClick={() => onNavigate('formacion', 'plan')}
        />

        <KPICard
          title="Novedades Abiertas"
          value={totalNovedadesAbiertas}
          subtitle="En seguimiento o resolución"
          icon={ClipboardList}
          variant={totalNovedadesAbiertas > 0 ? 'amber' : 'slate'}
          onClick={() => onNavigate('novedades', 'abiertas')}
        />
      </div>

      {/* Main Analysis Section: Visual Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certification Status Visual Doughnut / Bar Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-blue-600" />
                  <span>Estado General de Certificación</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proporción sobre el total de {totalColaboradores} colaboradores
                </p>
              </div>
            </div>

            {/* Visual Progress Bar Breakdown */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex my-4">
              {certDistData.map((item) => {
                const pct = totalColaboradores > 0 ? (item.count / totalColaboradores) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={item.label}
                    title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
                    style={{ width: `${pct}%`, backgroundColor: item.hex }}
                    className="h-full transition-all duration-500"
                  />
                );
              })}
            </div>

            {/* Legend items */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {certDistData.map((item) => {
                const pct = totalColaboradores > 0 ? Math.round((item.count / totalColaboradores) * 100) : 0;
                return (
                  <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.hex }} />
                    <div className="text-xs truncate">
                      <p className="font-semibold text-slate-800 truncate">{item.label}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.count} ({pct}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Índice Global de Cumplimiento:</span>
            <span className="font-extrabold text-emerald-700 text-sm">{porcentajeCertificacion}%</span>
          </div>
        </div>

        {/* Distribution by Project */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Distribución por Proyecto</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nivel de cobertura y certificación por frente de trabajo
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {projectDist.map((proj) => (
              <div key={proj.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {proj.nombre}
                  </span>
                  <span className="font-bold text-slate-700 shrink-0">
                    {proj.certificados}/{proj.total} ({proj.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      proj.pct >= 80 ? 'bg-emerald-500' : proj.pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${proj.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution by Area */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Distribución por Área</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personal certificado según departamento técnico
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {areaDist.map((area) => (
              <div key={area.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-800 truncate">{area.nombre}</p>
                  <p className="text-[11px] text-slate-500">{area.total} colaboradores asignados</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-blue-700">{area.pct}%</span>
                  <p className="text-[10px] text-slate-400">{area.certificados} cert.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Attention Tables: Próximas a Vencer & Novedades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificaciones Próximas a Vencer (< 30 días) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Certificaciones Críticas Próximas a Vencer
              </h4>
            </div>
            <button
              onClick={() => onNavigate('certificaciones', 'proximos')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredColabs
              .flatMap((colab) =>
                colab.certificaciones
                  .filter((cert) => cert.estado === 'proximo_vencer')
                  .map((cert) => ({ ...cert, colab }))
              )
              .slice(0, 4)
              .map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-amber-50/20">
                  <div>
                    <p className="font-bold text-slate-800">{item.colab.nombreCompleto}</p>
                    <p className="text-slate-500 text-[11px]">{item.certificacionNombre}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.colab.proyectoNombre} • Formador: {item.formadorNombre}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge status="proximo_vencer" />
                    <p className="text-[11px] font-semibold text-amber-800 mt-1">
                      Vence: {item.fechaVencimiento}
                    </p>
                  </div>
                </div>
              ))}

            {filteredColabs.flatMap((colab) =>
              colab.certificaciones.filter((cert) => cert.estado === 'proximo_vencer')
            ).length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <p>No hay certificaciones próximas a vencer en la selección actual.</p>
              </div>
            )}
          </div>
        </div>

        {/* Novedades Recientes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/50">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Últimas Novedades y Seguimiento
              </h4>
            </div>
            <button
              onClick={() => onNavigate('novedades', 'todas')}
              className="text-xs font-semibold text-blue-800 hover:text-blue-900 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredNovedades.slice(0, 4).map((nov) => {
              const colab = enrichedColabs.find((c) => c.id === nov.colaboradorId);
              const tipo = dbService.getTiposNovedad().find((t) => t.id === nov.tipoNovedadId);
              return (
                <div key={nov.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{colab?.nombreCompleto || 'Colaborador'}</span>
                      <span className="text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                        {tipo?.nombre || 'General'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] truncate mt-1">
                      {nov.descripcion}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Fecha: {nov.fecha} • {nov.historial.length} actualizaciones
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge status={nov.estado} />
                  </div>
                </div>
              );
            })}

            {filteredNovedades.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                <ClipboardList className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p>No se registran novedades con los filtros activos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
