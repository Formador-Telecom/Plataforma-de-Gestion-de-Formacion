import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Proyecto, Area, Formador, CertificacionCatalogo } from '../../types/database';

export interface FilterState {
  proyectoId: string;
  areaId: string;
  formadorId: string;
  certificacionId: string;
  estado: string;
  periodo: string; // 'all' | '30d' | '90d' | 'year'
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  proyectos: Proyecto[];
  areas: Area[];
  formadores: Formador[];
  certificaciones: CertificacionCatalogo[];
  showCertFilter?: boolean;
  estadoOptions?: { value: string; label: string }[];
  id?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  proyectos,
  areas,
  formadores,
  certificaciones,
  showCertFilter = true,
  estadoOptions,
  id,
}) => {
  const hasActiveFilters =
    filters.proyectoId !== '' ||
    filters.areaId !== '' ||
    filters.formadorId !== '' ||
    filters.certificacionId !== '' ||
    filters.estado !== '' ||
    filters.periodo !== 'all';

  return (
    <div id={id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filtros Globales de Visualización</span>
          {hasActiveFilters && (
            <span className="ml-1 bg-blue-100 text-blue-800 text-[11px] px-2 py-0.5 rounded-full font-medium">
              Filtros activos
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Proyecto */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Proyecto</label>
          <select
            value={filters.proyectoId}
            onChange={(e) => onFilterChange('proyectoId', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Todos los Proyectos</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Área */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Área / Depto</label>
          <select
            value={filters.areaId}
            onChange={(e) => onFilterChange('areaId', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Todas las Áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Formador */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Formador</label>
          <select
            value={filters.formadorId}
            onChange={(e) => onFilterChange('formadorId', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Todos los Formadores</option>
            {formadores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombreCompleto}
              </option>
            ))}
          </select>
        </div>

        {/* Certificación */}
        {showCertFilter && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Certificación</label>
            <select
              value={filters.certificacionId}
              onChange={(e) => onFilterChange('certificacionId', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">Todas las Certificaciones</option>
              {certificaciones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Estado */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
          <select
            value={filters.estado}
            onChange={(e) => onFilterChange('estado', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Todos los Estados</option>
            {estadoOptions ? (
              estadoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            ) : (
              <>
                <option value="vigente">Certificado Vigente</option>
                <option value="proximo_vencer">Próximo a Vencer</option>
                <option value="vencido">Certificado Vencido</option>
                <option value="no_certificado">No Certificado</option>
              </>
            )}
          </select>
        </div>

        {/* Periodo */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Periodo</label>
          <select
            value={filters.periodo}
            onChange={(e) => onFilterChange('periodo', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">Histórico Completo</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="year">Año 2026</option>
          </select>
        </div>
      </div>
    </div>
  );
};
