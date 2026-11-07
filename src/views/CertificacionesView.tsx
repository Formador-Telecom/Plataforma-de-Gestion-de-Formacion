import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
  FileCheck,
} from 'lucide-react';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { KPICard } from '../components/common/KPICard';
import { FilterBar, FilterState } from '../components/common/FilterBar';
import { dbService } from '../services/dbStore';
import { useAuth } from '../context/AuthContext';
import {
  PersonalCertificacion,
  CertificationState,
  CertificacionCatalogo,
} from '../types/database';

interface CertificacionesViewProps {
  subView: string;
  onSubViewChange: (sub: string) => void;
}

export const CertificacionesView: React.FC<CertificacionesViewProps> = ({
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
      subView === 'certificados'
        ? 'vigente'
        : subView === 'no_certificados'
        ? 'no_certificado'
        : subView === 'proximos'
        ? 'proximo_vencer'
        : subView === 'vencidos'
        ? 'vencido'
        : '',
    periodo: 'all',
  });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedColab, setSelectedColab] = useState<any>(null);
  const [selectedCertRecord, setSelectedCertRecord] = useState<any>(null);

  // Form state for new / edit certification
  const [formData, setFormData] = useState({
    colaboradorId: '',
    certificacionId: '',
    estado: 'vigente' as CertificationState,
    fechaCertificacion: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    formadorId: '',
    codigoCertificado: '',
    calificacion: 90,
    observaciones: '',
  });

  const proyectos = dbService.getProyectos();
  const areas = dbService.getAreas();
  const formadores = dbService.getFormadores();
  const certsCatalogo = dbService.getCertificacionesCatalogo();
  const enrichedColabs = dbService.getEnrichedColaboradores();

  // Keep subView synchronized with filter
  const handleSubTabClick = (tab: string) => {
    onSubViewChange(tab);
    if (tab === 'certificados') {
      setFilters((prev) => ({ ...prev, estado: 'vigente' }));
    } else if (tab === 'no_certificados') {
      setFilters((prev) => ({ ...prev, estado: 'no_certificado' }));
    } else if (tab === 'proximos') {
      setFilters((prev) => ({ ...prev, estado: 'proximo_vencer' }));
    } else if (tab === 'vencidos') {
      setFilters((prev) => ({ ...prev, estado: 'vencido' }));
    } else {
      setFilters((prev) => ({ ...prev, estado: '' }));
    }
  };

  // Auto calculate expiration date based on catalog validity
  const handleCertSelect = (certId: string) => {
    const cert = certsCatalogo.find((c) => c.id === certId);
    if (cert && formData.fechaCertificacion) {
      const d = new Date(formData.fechaCertificacion);
      d.setMonth(d.getMonth() + (cert.vigenciaMeses || 12));
      setFormData((prev) => ({
        ...prev,
        certificacionId: certId,
        fechaVencimiento: d.toISOString().split('T')[0],
      }));
    } else {
      setFormData((prev) => ({ ...prev, certificacionId: certId }));
    }
  };

  // Flattened row data for comprehensive table view
  const flattenedRecords = useMemo(() => {
    const rows: any[] = [];
    enrichedColabs.forEach((colab) => {
      if (colab.certificaciones.length > 0) {
        colab.certificaciones.forEach((cert) => {
          rows.push({
            id: cert.id,
            colaboradorId: colab.id,
            codigoInterno: colab.codigoInterno,
            documento: colab.documento,
            nombreCompleto: colab.nombreCompleto,
            cargo: colab.cargo,
            proyectoId: colab.proyectoId,
            proyectoNombre: colab.proyectoNombre,
            areaId: colab.areaId,
            areaNombre: colab.areaNombre,
            certificacionId: cert.certificacionId,
            certificacionNombre: cert.certificacionNombre,
            certificacionCodigo: cert.certificacionCodigo,
            estado: cert.estado,
            fechaCertificacion: cert.fechaCertificacion || '—',
            fechaVencimiento: cert.fechaVencimiento || '—',
            formadorId: cert.formadorId,
            formadorNombre: cert.formadorNombre,
            calificacion: cert.calificacion ?? '—',
            observaciones: cert.observaciones || '',
            codigoCertificado: cert.codigoCertificado || '—',
            updatedAt: cert.updatedAt,
            colabRef: colab,
          });
        });
      } else {
        // Colaborador sin certificaciones (No certificado)
        rows.push({
          id: `no-cert-${colab.id}`,
          colaboradorId: colab.id,
          codigoInterno: colab.codigoInterno,
          documento: colab.documento,
          nombreCompleto: colab.nombreCompleto,
          cargo: colab.cargo,
          proyectoId: colab.proyectoId,
          proyectoNombre: colab.proyectoNombre,
          areaId: colab.areaId,
          areaNombre: colab.areaNombre,
          certificacionId: '',
          certificacionNombre: 'Sin Certificación Registrada',
          certificacionCodigo: '—',
          estado: 'no_certificado',
          fechaCertificacion: '—',
          fechaVencimiento: '—',
          formadorId: '',
          formadorNombre: 'Sin Asignar',
          calificacion: '—',
          observaciones: 'Pendiente programación en curso inicial',
          codigoCertificado: '—',
          updatedAt: '—',
          colabRef: colab,
        });
      }
    });

    // Apply active filters
    return rows.filter((r) => {
      if (filters.proyectoId && r.proyectoId !== filters.proyectoId) return false;
      if (filters.areaId && r.areaId !== filters.areaId) return false;
      if (filters.formadorId && r.formadorId !== filters.formadorId) return false;
      if (filters.certificacionId && r.certificacionId !== filters.certificacionId) return false;
      if (filters.estado && r.estado !== filters.estado) return false;
      return true;
    });
  }, [enrichedColabs, filters]);

  // Statistics for this view
  const totalRecords = flattenedRecords.length;
  const totalVigentes = flattenedRecords.filter((r) => r.estado === 'vigente').length;
  const totalProximos = flattenedRecords.filter((r) => r.estado === 'proximo_vencer').length;
  const totalVencidos = flattenedRecords.filter((r) => r.estado === 'vencido').length;
  const totalNoCert = flattenedRecords.filter((r) => r.estado === 'no_certificado').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.colaboradorId || !formData.certificacionId) {
      alert('Por favor selecciona el colaborador y la certificación.');
      return;
    }

    dbService.createPersonalCertificacion(formData, currentUser);
    setIsCreateModalOpen(false);
    // Reset form
    setFormData({
      colaboradorId: '',
      certificacionId: '',
      estado: 'vigente',
      fechaCertificacion: new Date().toISOString().split('T')[0],
      fechaVencimiento: '',
      formadorId: '',
      codigoCertificado: '',
      calificacion: 90,
      observaciones: '',
    });
  };

  const handleDeleteCert = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de certificación para ${name}?`)) {
      dbService.deletePersonalCertificacion(id, currentUser);
    }
  };

  // Columns for the certification DataTable
  const columns: Column<any>[] = [
    {
      key: 'colaborador',
      header: 'Colaborador',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.nombreCompleto}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <span className="font-mono font-medium">{r.codigoInterno}</span>
            <span>•</span>
            <span>Doc: {r.documento}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'proyectoNombre',
      header: 'Proyecto & Área',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.proyectoNombre}</p>
          <p className="text-[11px] text-slate-500">{r.areaNombre} • {r.cargo}</p>
        </div>
      ),
    },
    {
      key: 'certificacionNombre',
      header: 'Certificación Obtenida',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.certificacionNombre}</p>
          {r.codigoCertificado !== '—' && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Ref: {r.codigoCertificado} • Nota: {r.calificacion}/100
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'fechas',
      header: 'Vigencia',
      sortable: true,
      render: (r) => (
        <div>
          <p className="text-slate-700 font-medium">Exp: {r.fechaCertificacion}</p>
          <p className={`text-[11px] font-bold ${r.estado === 'vencido' ? 'text-rose-600' : r.estado === 'proximo_vencer' ? 'text-amber-700' : 'text-slate-500'}`}>
            Vence: {r.fechaVencimiento}
          </p>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (r) => <Badge status={r.estado} />,
    },
    {
      key: 'formadorNombre',
      header: 'Formador Responsable',
      sortable: true,
      render: (r) => <span className="text-xs text-slate-700">{r.formadorNombre}</span>,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedCertRecord(r);
              setIsDetailModalOpen(true);
            }}
            title="Ver detalle del registro"
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!isConsulta && hasPermission('certificaciones:delete') && r.id.startsWith('pc-') && (
            <button
              onClick={() => handleDeleteCert(r.id, r.nombreCompleto)}
              title="Eliminar certificación"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todos', label: 'Todos los Registros' },
            { id: 'certificados', label: 'Certificados Vigentes' },
            { id: 'proximos', label: 'Próximas a Vencer' },
            { id: 'vencidos', label: 'Certificaciones Vencidas' },
            { id: 'no_certificados', label: 'Personal No Certificado' },
            { id: 'catalogo', label: 'Catálogo de Estándares' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSubTabClick(tab.id)}
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

        {!isConsulta && hasPermission('certificaciones:create') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar Certificación</span>
          </button>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard
          title="Total Registros"
          value={totalRecords}
          subtitle="Filtrados en pantalla"
          icon={Award}
          variant="slate"
        />
        <KPICard
          title="Vigentes"
          value={totalVigentes}
          subtitle="Habilitación activa"
          icon={CheckCircle2}
          variant="emerald"
        />
        <KPICard
          title="Próximas a Vencer"
          value={totalProximos}
          subtitle="Menor a 30 días"
          icon={Clock}
          variant="amber"
        />
        <KPICard
          title="Vencidas o Sin Cert."
          value={totalVencidos + totalNoCert}
          subtitle={`${totalVencidos} vencidas, ${totalNoCert} no cert.`}
          icon={AlertOctagon}
          variant="rose"
        />
      </div>

      {/* If subView is 'catalogo', show certification standards cards */}
      {subView === 'catalogo' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Catálogo Institucional de Estándares de Certificación
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Normas técnicas oficiales y programas de habilitación para trabajo de alto riesgo
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certsCatalogo.map((cert) => {
                const assignedCount = dbService
                  .getPersonalCertificaciones()
                  .filter((c) => c.certificacionId === cert.id).length;

                return (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {cert.codigo}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Vigencia: {cert.vigenciaMeses} meses
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cert.nombre}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {cert.descripcion}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <span>Nota mínima: {cert.calificacionMinima}/100</span>
                      <span className="font-bold text-blue-700">
                        {assignedCount} colaboradores
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={(key, val) => setFilters((p) => ({ ...p, [key]: val }))}
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
            certificaciones={certsCatalogo}
          />

          {/* Records Table */}
          <DataTable
            columns={columns}
            data={flattenedRecords}
            keyExtractor={(r) => r.id}
            title="Matriz de Personal Certificado vs. No Certificado"
            subtitle={`Mostrando ${flattenedRecords.length} registros según filtros aplicados`}
            exportFileName="reporte_personal_certificaciones"
            searchableFields={['nombreCompleto', 'documento', 'codigoInterno', 'certificacionNombre', 'cargo']}
          />
        </>
      )}

      {/* Modal: Asignar o Registrar Certificación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Asignar y Registrar Certificación"
        subtitle="Vincular un estándar certificado a un colaborador de la organización"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colaborador */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colaborador <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.colaboradorId}
                onChange={(e) => setFormData({ ...formData, colaboradorId: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Selecciona un colaborador...</option>
                {enrichedColabs.map((colab) => (
                  <option key={colab.id} value={colab.id}>
                    {colab.nombreCompleto} ({colab.codigoInterno} - {colab.cargo})
                  </option>
                ))}
              </select>
            </div>

            {/* Certificación Estándar */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estándar de Certificación <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.certificacionId}
                onChange={(e) => handleCertSelect(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Selecciona el estándar oficial...</option>
                {certsCatalogo.map((cert) => (
                  <option key={cert.id} value={cert.id}>
                    [{cert.codigo}] {cert.nombre} ({cert.vigenciaMeses} meses vigencia)
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Certificación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de Emisión <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.fechaCertificacion}
                onChange={(e) => {
                  setFormData({ ...formData, fechaCertificacion: e.target.value });
                  if (formData.certificacionId) handleCertSelect(formData.certificacionId);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Fecha Vencimiento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de Vencimiento <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Formador Responsable */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Formador / Evaluador Responsable
              </label>
              <select
                value={formData.formadorId}
                onChange={(e) => setFormData({ ...formData, formadorId: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Selecciona formador...</option>
                {formadores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombreCompleto} ({f.especialidad})
                  </option>
                ))}
              </select>
            </div>

            {/* Código Certificado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Registro / Código Certificado
              </label>
              <input
                type="text"
                placeholder="Ej. CRT-2026-088"
                value={formData.codigoCertificado}
                onChange={(e) => setFormData({ ...formData, codigoCertificado: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Calificación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Calificación Obtenida (0-100)
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

            {/* Estado Forzado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado Inicial
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as CertificationState })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="vigente">Certificado Vigente</option>
                <option value="proximo_vencer">Próximo a Vencer</option>
                <option value="vencido">Certificado Vencido</option>
                <option value="no_certificado">No Certificado / En Proceso</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observaciones y Evidencia
              </label>
              <textarea
                rows={2}
                placeholder="Detalles de evaluación práctica, campo de entrenamiento, aptitud médica..."
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
              Guardar Certificación
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalle de Certificación */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha Detallada de Certificación"
        subtitle={`Registro de ${selectedCertRecord?.nombreCompleto || 'Colaborador'}`}
        maxWidth="lg"
      >
        {selectedCertRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedCertRecord.nombreCompleto}</p>
                <p className="text-slate-500">
                  {selectedCertRecord.codigoInterno} • Doc: {selectedCertRecord.documento} • {selectedCertRecord.cargo}
                </p>
              </div>
              <Badge status={selectedCertRecord.estado} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Proyecto</span>
                <span className="font-bold text-slate-800">{selectedCertRecord.proyectoNombre}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Área Operativa</span>
                <span className="font-bold text-slate-800">{selectedCertRecord.areaNombre}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Certificación</span>
                <span className="font-bold text-blue-700">{selectedCertRecord.certificacionNombre}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Formador Responsable</span>
                <span className="font-bold text-slate-800">{selectedCertRecord.formadorNombre}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Fecha Emisión</span>
                <span className="font-bold text-slate-800">{selectedCertRecord.fechaCertificacion}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Fecha Vencimiento</span>
                <span className="font-bold text-slate-800">{selectedCertRecord.fechaVencimiento}</span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Observaciones Registradas</span>
              <p className="text-slate-700 italic">
                {selectedCertRecord.observaciones || 'Sin observaciones adicionales.'}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2">
              <span>Última actualización: {selectedCertRecord.updatedAt}</span>
              <span>Ref: {selectedCertRecord.codigoCertificado}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
