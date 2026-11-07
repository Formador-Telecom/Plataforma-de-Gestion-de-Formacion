import React, { useState, useMemo } from 'react';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { FilterBar, FilterState } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { dbService } from '../services/dbStore';
import { exportToExcel, exportToCsv } from '../services/excelService';

interface ReportesViewProps {
  subView: string;
  onSubViewChange: (sub: string) => void;
}

export const ReportesView: React.FC<ReportesViewProps> = ({
  subView,
  onSubViewChange,
}) => {
  const [reportType, setReportType] = useState<string>(
    subView === 'certificaciones'
      ? 'certificaciones'
      : subView === 'novedades'
      ? 'novedades'
      : subView === 'formador'
      ? 'formador'
      : subView === 'proyecto'
      ? 'proyecto'
      : subView === 'area'
      ? 'area'
      : 'capacitacion'
  );

  const [filters, setFilters] = useState<FilterState>({
    proyectoId: '',
    areaId: '',
    formadorId: '',
    certificacionId: '',
    estado: '',
    periodo: 'all',
  });

  const proyectos = dbService.getProyectos();
  const areas = dbService.getAreas();
  const formadores = dbService.getFormadores();
  const certsCatalogo = dbService.getCertificacionesCatalogo();
  const enrichedColabs = dbService.getEnrichedColaboradores();
  const capacitaciones = dbService.getCapacitaciones();
  const personalCerts = dbService.getPersonalCertificaciones();
  const novedades = dbService.getNovedades();

  const handleTypeChange = (type: string) => {
    setReportType(type);
    onSubViewChange(type);
  };

  // Build report dataset dynamically
  const reportData = useMemo(() => {
    switch (reportType) {
      case 'capacitacion': {
        const colabMap = new Map(enrichedColabs.map((c) => [c.id, c]));
        const formadorMap = new Map(formadores.map((f) => [f.id, f]));

        return capacitaciones
          .map((c) => {
            const colab = colabMap.get(c.colaboradorId);
            const formador = formadorMap.get(c.formadorId);
            return {
              id: c.id,
              colaborador: colab?.nombreCompleto || 'Colaborador',
              documento: colab?.documento || '—',
              codigo: colab?.codigoInterno || '—',
              proyecto: colab?.proyectoNombre || '—',
              proyectoId: colab?.proyectoId,
              area: colab?.areaNombre || '—',
              areaId: colab?.areaId,
              tema: c.tema,
              tipoCapacitacion: c.tipoCapacitacion,
              fecha: c.fecha,
              horas: c.duracionHoras,
              formador: formador?.nombreCompleto || '—',
              formadorId: c.formadorId,
              modalidad: c.modalidad,
              estado: c.estado,
              resultado: c.resultado,
              calificacion: c.calificacion ?? '—',
            };
          })
          .filter((r) => {
            if (filters.proyectoId && r.proyectoId !== filters.proyectoId) return false;
            if (filters.areaId && r.areaId !== filters.areaId) return false;
            if (filters.formadorId && r.formadorId !== filters.formadorId) return false;
            if (filters.estado && r.estado !== filters.estado) return false;
            return true;
          });
      }

      case 'certificaciones': {
        const colabMap = new Map(enrichedColabs.map((c) => [c.id, c]));
        const certCatMap = new Map(certsCatalogo.map((cat) => [cat.id, cat]));
        const formadorMap = new Map(formadores.map((f) => [f.id, f]));

        return personalCerts
          .map((pc) => {
            const colab = colabMap.get(pc.colaboradorId);
            const cat = certCatMap.get(pc.certificacionId);
            const formador = formadorMap.get(pc.formadorId || '');

            return {
              id: pc.id,
              colaborador: colab?.nombreCompleto || '—',
              documento: colab?.documento || '—',
              codigo: colab?.codigoInterno || '—',
              cargo: colab?.cargo || '—',
              proyecto: colab?.proyectoNombre || '—',
              proyectoId: colab?.proyectoId,
              area: colab?.areaNombre || '—',
              areaId: colab?.areaId,
              certificacion: cat?.nombre || '—',
              certificacionId: pc.certificacionId,
              codigoCertificado: pc.codigoCertificado || '—',
              fechaEmision: pc.fechaCertificacion || '—',
              fechaVencimiento: pc.fechaVencimiento || '—',
              estado: pc.estado,
              formador: formador?.nombreCompleto || '—',
              formadorId: pc.formadorId,
              calificacion: pc.calificacion ?? '—',
            };
          })
          .filter((r) => {
            if (filters.proyectoId && r.proyectoId !== filters.proyectoId) return false;
            if (filters.areaId && r.areaId !== filters.areaId) return false;
            if (filters.formadorId && r.formadorId !== filters.formadorId) return false;
            if (filters.certificacionId && r.certificacionId !== filters.certificacionId) return false;
            if (filters.estado && r.estado !== filters.estado) return false;
            return true;
          });
      }

      case 'novedades': {
        const colabMap = new Map(enrichedColabs.map((c) => [c.id, c]));
        const tipoMap = new Map(dbService.getTiposNovedad().map((t) => [t.id, t]));

        return novedades
          .map((n) => {
            const colab = colabMap.get(n.colaboradorId);
            const tipo = tipoMap.get(n.tipoNovedadId);
            return {
              id: n.id,
              colaborador: colab?.nombreCompleto || '—',
              documento: colab?.documento || '—',
              codigo: colab?.codigoInterno || '—',
              proyecto: colab?.proyectoNombre || '—',
              proyectoId: colab?.proyectoId,
              area: colab?.areaNombre || '—',
              areaId: colab?.areaId,
              tipoNovedad: tipo?.nombre || 'General',
              fecha: n.fecha,
              descripcion: n.descripcion,
              estado: n.estado,
              responsable: n.responsableSeguimiento,
              acciones: n.accionesTomadas || '—',
            };
          })
          .filter((r) => {
            if (filters.proyectoId && r.proyectoId !== filters.proyectoId) return false;
            if (filters.areaId && r.areaId !== filters.areaId) return false;
            if (filters.estado && r.estado !== filters.estado) return false;
            return true;
          });
      }

      case 'formador': {
        return formadores.map((f) => {
          const sessions = capacitaciones.filter((c) => c.formadorId === f.id && c.estado === 'realizada');
          const hours = sessions.reduce((sum, c) => sum + (c.duracionHoras || 0), 0);
          const colabCount = new Set(sessions.map((c) => c.colaboradorId)).size;
          const certCount = personalCerts.filter((c) => c.formadorId === f.id && c.estado === 'vigente').length;

          return {
            id: f.id,
            formador: f.nombreCompleto,
            documento: f.documento,
            especialidad: f.especialidad,
            telefono: f.telefono,
            email: f.email,
            sesionesEjecutadas: sessions.length,
            horasImpartidas: hours,
            colaboradoresFormados: colabCount,
            certificadosEmitidos: certCount,
          };
        });
      }

      case 'proyecto': {
        return proyectos.map((p) => {
          const colabs = enrichedColabs.filter((c) => c.proyectoId === p.id);
          const certVig = colabs.filter((c) => c.estadoCertificacion === 'vigente').length;
          const certProx = colabs.filter((c) => c.estadoCertificacion === 'proximo_vencer').length;
          const certVenc = colabs.filter((c) => c.estadoCertificacion === 'vencido').length;
          const certNo = colabs.filter((c) => c.estadoCertificacion === 'no_certificado').length;
          const totalHours = colabs.reduce((acc, c) => acc + c.horasFormacion, 0);

          return {
            id: p.id,
            proyecto: p.nombre,
            codigo: p.codigo,
            ubicacion: p.ubicacion || 'Principal',
            responsable: p.responsable || 'Gerencia Operativa',
            totalPersonal: colabs.length,
            certificadosVigentes: certVig,
            proximosVencer: certProx,
            certificadosVencidos: certVenc,
            noCertificados: certNo,
            porcentajeCertificacion: colabs.length > 0 ? `${Math.round(((certVig + certProx) / colabs.length) * 100)}%` : '0%',
            horasAcumuladas: totalHours,
          };
        });
      }

      case 'area': {
        return areas.map((a) => {
          const colabs = enrichedColabs.filter((c) => c.areaId === a.id);
          const certVig = colabs.filter((c) => c.estadoCertificacion === 'vigente' || c.estadoCertificacion === 'proximo_vencer').length;
          const totalHours = colabs.reduce((acc, c) => acc + c.horasFormacion, 0);

          return {
            id: a.id,
            area: a.nombre,
            codigo: a.codigo,
            responsable: a.responsable || 'Dirección de Área',
            totalColaboradores: colabs.length,
            certificados: certVig,
            porcentajeHabilitado: colabs.length > 0 ? `${Math.round((certVig / colabs.length) * 100)}%` : '0%',
            horasFormacion: totalHours,
          };
        });
      }

      default:
        return [];
    }
  }, [reportType, capacitaciones, personalCerts, novedades, enrichedColabs, formadores, proyectos, areas, certsCatalogo, filters]);

  // Generate dynamic columns based on selected report
  const dynamicColumns = useMemo((): Column<any>[] => {
    if (reportData.length === 0) return [];
    const firstRow = reportData[0];
    const keys = Object.keys(firstRow).filter((k) => !k.endsWith('Id') && k !== 'id');

    return keys.map((key) => ({
      key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      sortable: true,
      render: (r: any) => {
        const val = r[key];
        if (key === 'estado') {
          return <span className="font-semibold capitalize text-slate-800">{val}</span>;
        }
        return String(val ?? '—');
      },
    }));
  }, [reportData]);

  const handleDirectExport = (format: 'xlsx' | 'csv') => {
    const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}`;
    if (format === 'xlsx') {
      exportToExcel(reportData, fileName);
    } else {
      exportToCsv(reportData, fileName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Selector Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-blue-600" />
              <span>Generador de Reportes & Exportación Ejecutiva</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Descarga informes consolidados en Excel (.xlsx) y CSV compatibles con auditorías externas
            </p>
          </div>

          {/* Quick direct download buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDirectExport('xlsx')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Vista a Excel</span>
            </button>
            <button
              onClick={() => handleDirectExport('csv')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar a CSV</span>
            </button>
          </div>
        </div>

        {/* Report Category Chips */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
          {[
            { id: 'capacitacion', label: 'Reporte de Capacitación' },
            { id: 'certificaciones', label: 'Reporte de Certificaciones' },
            { id: 'novedades', label: 'Reporte de Novedades' },
            { id: 'formador', label: 'Métricas por Formador' },
            { id: 'proyecto', label: 'Métricas por Proyecto' },
            { id: 'area', label: 'Métricas por Área' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === type.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
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
        certificaciones={certsCatalogo}
      />

      {/* Live Preview Table */}
      <DataTable
        columns={dynamicColumns}
        data={reportData}
        keyExtractor={(r) => r.id}
        title={`Vista Previa: ${reportType.toUpperCase()} (${reportData.length} Registros)`}
        subtitle="Los datos exportados reflejarán fielmente la estructura y filtros de esta tabla"
        exportFileName={`reporte_${reportType}`}
      />
    </div>
  );
};
