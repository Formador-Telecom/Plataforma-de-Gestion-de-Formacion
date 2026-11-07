import * as XLSX from 'xlsx';

export interface ImportValidationRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  isValid: boolean;
}

export interface ImportValidationResult {
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  duplicateRowsCount: number;
  columnsFound: string[];
  missingColumns: string[];
  rows: ImportValidationRow[];
}

// Expected schemas for different import types
export const IMPORT_SCHEMAS = {
  colaboradores: {
    requiredCols: ['documento', 'nombreCompleto', 'cargo'],
    optionalCols: ['codigoInterno', 'email', 'proyecto', 'area', 'fechaIngreso', 'telefono'],
    sample: [
      {
        codigoInterno: 'EMP-2001',
        documento: '1098765432',
        nombreCompleto: 'Carlos Eduardo Ramírez',
        email: 'c.ramirez@empresa.com',
        cargo: 'Técnico Electromecánico',
        proyecto: 'Proyecto Alpha Minería & Energía',
        area: 'Operaciones de Campo',
        fechaIngreso: '2025-01-10',
        telefono: '3112223344',
      },
      {
        codigoInterno: 'EMP-2002',
        documento: '1087654321',
        nombreCompleto: 'Mariana Duque Gómez',
        email: 'm.duque@empresa.com',
        cargo: 'Inspectora SST',
        proyecto: 'Proyecto Conexión Telecom 5G',
        area: 'Seguridad y Salud en el Trabajo (SST)',
        fechaIngreso: '2025-02-01',
        telefono: '3154445566',
      },
    ],
  },
  certificaciones: {
    requiredCols: ['documentoColaborador', 'certificacionCodigo', 'fechaCertificacion', 'fechaVencimiento'],
    optionalCols: ['calificacion', 'codigoCertificado', 'formadorDocumento', 'observaciones'],
    sample: [
      {
        documentoColaborador: '1092837461',
        certificacionCodigo: 'CRT-ALT-01',
        fechaCertificacion: '2026-03-01',
        fechaVencimiento: '2027-03-01',
        calificacion: 92,
        codigoCertificado: 'CRT-EXP-2026-01',
        formadorDocumento: '1023849102',
        observaciones: 'Prueba práctica aprobada',
      },
    ],
  },
  capacitaciones: {
    requiredCols: ['documentoColaborador', 'tema', 'fecha', 'duracionHoras', 'modalidad'],
    optionalCols: ['subtema', 'tipoCapacitacion', 'formadorDocumento', 'resultado', 'calificacion', 'observaciones'],
    sample: [
      {
        documentoColaborador: '1092837461',
        tema: 'Aislamiento Seguro en Alturas',
        subtema: 'Uso de absorvedores de impacto',
        tipoCapacitacion: 'Normativa / SST',
        fecha: '2026-08-15',
        duracionHoras: 8,
        modalidad: 'presencial',
        resultado: 'Aprobado',
        calificacion: 95,
        observaciones: 'Taller práctico superado',
      },
    ],
  },
};

export const parseExcelOrCsvFile = async (
  file: File,
  importType: 'colaboradores' | 'certificaciones' | 'capacitaciones',
  existingRecords: {
    colaboradores: Array<{ documento: string }>;
    certificaciones: Array<{ documento: string; certificacionCodigo: string }>;
  }
): Promise<ImportValidationResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const schema = IMPORT_SCHEMAS[importType];
        if (!rawJson || rawJson.length === 0) {
          throw new Error('El archivo está vacío o no contiene filas con datos válidos.');
        }

        const columnsFound = Object.keys(rawJson[0]);
        // Normalize columns (lowercase, trimmed)
        const normalizedColsFound = columnsFound.map((c) => c.toLowerCase().trim());

        const missingColumns = schema.requiredCols.filter(
          (req) => !normalizedColsFound.some((c) => c === req.toLowerCase())
        );

        const rows: ImportValidationRow[] = [];
        let validRowsCount = 0;
        let invalidRowsCount = 0;
        let duplicateRowsCount = 0;

        const seenInFile = new Set<string>();

        rawJson.forEach((row, index) => {
          const rowNumber = index + 2; // considering 1-based and header row
          const errors: string[] = [];
          const warnings: string[] = [];
          let isDuplicate = false;

          // Normalize row keys
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            normalizedRow[k.toLowerCase().trim()] = row[k];
          });

          // Check required fields
          schema.requiredCols.forEach((col) => {
            const val = normalizedRow[col.toLowerCase()];
            if (val === undefined || String(val).trim() === '') {
              errors.push(`El campo obligatorio '${col}' está vacío.`);
            }
          });

          // Specific validation by type
          if (importType === 'colaboradores') {
            const doc = String(normalizedRow['documento'] || '').trim();
            if (doc) {
              if (seenInFile.has(doc)) {
                isDuplicate = true;
                errors.push(`Documento '${doc}' duplicado en este mismo archivo.`);
              } else {
                seenInFile.add(doc);
              }

              const existsInDb = existingRecords.colaboradores.some((c) => c.documento === doc);
              if (existsInDb) {
                isDuplicate = true;
                warnings.push(`El colaborador con documento '${doc}' ya existe en el sistema (se actualizarán datos).`);
              }
            }
          } else if (importType === 'certificaciones') {
            const doc = String(normalizedRow['documentocolaborador'] || '').trim();
            const cert = String(normalizedRow['certificacioncodigo'] || '').trim();
            const key = `${doc}-${cert}`;
            if (seenInFile.has(key)) {
              isDuplicate = true;
              errors.push(`Certificación '${cert}' para documento '${doc}' duplicada en archivo.`);
            } else {
              seenInFile.add(key);
            }
          }

          const isValid = errors.length === 0;
          if (isValid) {
            validRowsCount++;
          } else {
            invalidRowsCount++;
          }
          if (isDuplicate) {
            duplicateRowsCount++;
          }

          rows.push({
            rowNumber,
            data: row,
            errors,
            warnings,
            isDuplicate,
            isValid,
          });
        });

        resolve({
          fileName: file.name,
          totalRows: rawJson.length,
          validRowsCount,
          invalidRowsCount,
          duplicateRowsCount,
          columnsFound,
          missingColumns,
          rows,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: Record<string, any>[], fileName: string, sheetName: string = 'Datos') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToCsv = (data: Record<string, any>[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export type ImportType = 'colaboradores' | 'certificaciones' | 'capacitaciones' | 'personal' | 'novedades';

export const parseExcelOrCsv = async (file: File, type: ImportType) => {
  const mappedType = type === 'personal' ? 'colaboradores' : type === 'novedades' ? 'colaboradores' : type;
  const result = await parseExcelOrCsvFile(file, mappedType as any, {
    colaboradores: [],
    certificaciones: [],
  });

  return {
    totalRows: result.totalRows,
    validRows: result.rows.filter((r) => r.isValid).map((r) => r.data),
    invalidRows: result.rows.filter((r) => !r.isValid).map((r) => ({
      rowNumber: r.rowNumber,
      error: r.errors.join('; '),
    })),
  };
};

export const downloadTemplate = (importType: ImportType, format: 'xlsx' | 'csv' = 'xlsx') => {
  const mappedType = (importType === 'personal' || importType === 'novedades') ? 'colaboradores' : importType;
  const schema = IMPORT_SCHEMAS[mappedType as 'colaboradores'];
  if (format === 'xlsx') {
    exportToExcel(schema.sample, `plantilla_${importType}`, 'Plantilla');
  } else {
    exportToCsv(schema.sample, `plantilla_${importType}`);
  }
};
