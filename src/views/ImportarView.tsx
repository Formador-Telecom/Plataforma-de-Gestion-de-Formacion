import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  downloadTemplate,
  parseExcelOrCsv,
  ImportType,
} from '../services/excelService';
import { dbService } from '../services/dbStore';
import { useAuth } from '../context/AuthContext';

export const ImportarView: React.FC = () => {
  const { currentUser } = useAuth();

  // 10-step or phased wizard:
  // Step 1: Tipo de importación & Descarga de plantilla
  // Step 2: Carga de archivo & Procesamiento
  // Step 3: Previsualización, Validación & Reporte de errores
  // Step 4: Confirmación & Carga a Base de Datos
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [importType, setImportType] = useState<ImportType>('personal');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [skipErrors, setSkipErrors] = useState(true);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const importTypesList = [
    {
      id: 'personal' as ImportType,
      label: 'Personal / Colaboradores',
      desc: 'Carga masiva de colaboradores con documento, código, proyecto, área y cargo.',
    },
    {
      id: 'capacitaciones' as ImportType,
      label: 'Sesiones de Capacitación',
      desc: 'Historial de capacitaciones por colaborador, tema, fecha, horas y formador.',
    },
    {
      id: 'certificaciones' as ImportType,
      label: 'Certificaciones Obtenidas',
      desc: 'Estándares normativos aprobados, fechas de emisión, vigencia y vencimiento.',
    },
    {
      id: 'novedades' as ImportType,
      label: 'Novedades del Personal',
      desc: 'Incapacidades, suspensiones, traslados o eventos de seguimiento.',
    },
  ];

  const handleDownloadTemplate = () => {
    downloadTemplate(importType);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    try {
      const result = await parseExcelOrCsv(selectedFile, importType);
      setParseResult(result);
      setCurrentStep(3);
    } catch (err: any) {
      alert(`Error al procesar el archivo: ${err.message || 'Formato no soportado'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.validRows.length === 0) {
      alert('No hay registros válidos para importar.');
      return;
    }

    const insertedCount = dbService.bulkInsert(importType, parseResult.validRows, currentUser);
    setImportSuccessMessage(
      `¡Importación completada con éxito! Se cargaron ${insertedCount} registros de ${importType} al sistema con su debida pista de auditoría.`
    );
    setCurrentStep(4);
  };

  const handleRestart = () => {
    setFile(null);
    setParseResult(null);
    setImportSuccessMessage(null);
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Step Progress Tracker */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>Asistente de Importación Masiva (Excel / CSV)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocolo corporativo de 10 pasos con validación estricta de estructura y tipos
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Descargar Plantilla Oficial (.xlsx)</span>
          </button>
        </div>

        {/* 4 Major Progress Nodes */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
          {[
            { num: 1, title: '1. Tipo y Plantilla' },
            { num: 2, title: '2. Cargar Archivo' },
            { num: 3, title: '3. Validar y Errores' },
            { num: 4, title: '4. Confirmar Carga' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2 rounded-lg text-center font-bold border transition-colors ${
                currentStep === s.num
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : currentStep > s.num
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Tipo de información */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Paso 1: Selecciona el Tipo de Información a Cargar
            </h4>
            <p className="text-xs text-slate-500">
              Cada módulo cuenta con especificaciones de columnas obligatorias y formatos normalizados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {importTypesList.map((item) => (
              <div
                key={item.id}
                onClick={() => setImportType(item.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  importType === item.id
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                  <input
                    type="radio"
                    checked={importType === item.id}
                    onChange={() => setImportType(item.id)}
                    className="text-blue-600"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Plantilla para {importTypesList.find((i) => i.id === importType)?.label}
                </p>
                <p className="text-[11px] text-slate-500">
                  Incluye fila de ejemplo y encabezados oficiales listos para diligenciar.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .xlsx</span>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <span>Continuar al Paso 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Carga de archivo */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Paso 2: Subir Archivo Diligenciado
              </h4>
              <p className="text-xs text-slate-500">
                Seleccionado: <strong className="text-blue-700">{importType.toUpperCase()}</strong>. Acepta formatos .xlsx, .xls y .csv.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cambiar tipo</span>
            </button>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-10 text-center transition-all flex flex-col items-center justify-center cursor-pointer"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Arrastra y suelta tu archivo aquí, o haz clic para examinar
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Archivos Excel (.xlsx, .xls) o CSV con encabezados oficiales
            </p>

            {isProcessing && (
              <div className="mt-4 flex items-center gap-2 text-xs text-blue-700 font-bold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analizando estructura y validando registros...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Previsualización, Validación & Errores */}
      {currentStep === 3 && parseResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Paso 3: Validación de Estructura y Reporte de Inconsistencias
              </h4>
              <p className="text-xs text-slate-500">
                Archivo: <strong>{file?.name}</strong> • Total filas leídas: <strong>{parseResult.totalRows}</strong>
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Subir otro archivo</span>
            </button>
          </div>

          {/* Validation Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold block">Total Procesados</span>
              <span className="text-2xl font-extrabold text-slate-900">{parseResult.totalRows}</span>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs text-emerald-700 font-semibold block">Registros Válidos</span>
              <span className="text-2xl font-extrabold text-emerald-800">
                {parseResult.validRows.length}
              </span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs text-rose-700 font-semibold block">Registros con Error</span>
              <span className="text-2xl font-extrabold text-rose-800">
                {parseResult.invalidRows.length}
              </span>
            </div>
          </div>

          {/* Error Details Breakdown if any */}
          {parseResult.invalidRows.length > 0 && (
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Detalle de Inconsistencias Detectadas</span>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipErrors}
                    onChange={(e) => setSkipErrors(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Omitir filas erróneas e importar las {parseResult.validRows.length} válidas</span>
                </label>
              </div>

              <div className="max-h-40 overflow-y-auto divide-y divide-rose-100 text-xs text-rose-900 bg-white rounded-lg border border-rose-200">
                {parseResult.invalidRows.map((inv: any, idx: number) => (
                  <div key={idx} className="p-2 flex items-start gap-2">
                    <span className="font-bold text-rose-700 shrink-0">Fila {inv.rowNumber}:</span>
                    <span>{inv.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table of Valid Rows */}
          <div>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Previsualización de Registros Válidos ({parseResult.validRows.length})
            </h5>
            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-64">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0">
                  <tr>
                    {parseResult.validRows.length > 0 &&
                      Object.keys(parseResult.validRows[0]).map((col) => (
                        <th key={col} className="p-2.5">
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parseResult.validRows.slice(0, 8).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {Object.values(row).map((val: any, j: number) => (
                        <td key={j} className="p-2.5 truncate max-w-[180px]">
                          {String(val ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parseResult.validRows.length > 8 && (
              <p className="text-[11px] text-slate-400 mt-1">
                Mostrando primeras 8 filas de {parseResult.validRows.length}.
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parseResult.validRows.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirmar e Importar {parseResult.validRows.length} Registros</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Success Screen */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center space-y-4 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">
            ¡Carga Masiva Exitosa!
          </h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {importSuccessMessage}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              Realizar Otra Importación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
