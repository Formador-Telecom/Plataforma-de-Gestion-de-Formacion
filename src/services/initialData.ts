import {
  Colaborador,
  Proyecto,
  Area,
  Formador,
  CertificacionCatalogo,
  PersonalCertificacion,
  Capacitacion,
  TipoNovedad,
  Novedad,
  AppModule,
  Role,
  User,
  AuditoriaRegistro,
  GlobalParametros,
  StoredFile,
} from '../types/database';

export const INITIAL_PARAMETROS: GlobalParametros = {
  nombreOrganizacion: 'Consorcio Empresarial de Operaciones Globales',
  diasAlertaVencimiento: 30,
  metaHorasFormacionAnual: 24,
  calificacionMinimaAprobacion: 80,
  permitirAutoRegistroNovedades: true,
};

export const INITIAL_PROYECTOS: Proyecto[] = [
  { id: 'proj-1', codigo: 'PRJ-ALPHA', nombre: 'Proyecto Alpha Minería & Energía', descripcion: 'Operaciones extractivas y generación energética en cordillera', activo: true, createdAt: '2025-01-10T08:00:00Z' },
  { id: 'proj-2', codigo: 'PRJ-CONEX', nombre: 'Proyecto Conexión Telecom 5G', descripcion: 'Despliegue de infraestructura de telecomunicaciones y fibra óptica', activo: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'proj-3', codigo: 'PRJ-METRO', nombre: 'Proyecto Logística Metro & Cargas', descripcion: 'Gestión logística de almacenes centrales y transporte interurbano', activo: true, createdAt: '2025-02-01T08:00:00Z' },
];

export const INITIAL_AREAS: Area[] = [
  { id: 'area-1', codigo: 'SST', nombre: 'Seguridad y Salud en el Trabajo (SST)', descripcion: 'Gestión de riesgos laborales y normativas vigentes', activo: true, createdAt: '2025-01-01T08:00:00Z' },
  { id: 'area-2', codigo: 'OPC', nombre: 'Operaciones de Campo', descripcion: 'Ejecución técnica e intervención en terreno', activo: true, createdAt: '2025-01-01T08:00:00Z' },
  { id: 'area-3', codigo: 'MTO', nombre: 'Mantenimiento Técnico', descripcion: 'Mantenimiento electromecánico preventivo y correctivo', activo: true, createdAt: '2025-01-01T08:00:00Z' },
  { id: 'area-4', codigo: 'CAL', nombre: 'Gestión de Calidad & Procesos', descripcion: 'Aseguramiento de estándares ISO y auditorías internas', activo: true, createdAt: '2025-01-01T08:00:00Z' },
];

export const INITIAL_FORMADORES: Formador[] = [
  { id: 'form-1', codigo: 'FRM-001', nombreCompleto: 'Ing. Carlos Mendoza Rivas', documento: '1023849102', email: 'carlos.mendoza@empresa.com', telefono: '+57 312 849 2011', especialidad: 'Alturas y Espacios Confinados (SST)', activo: true, createdAt: '2025-01-01T08:00:00Z' },
  { id: 'form-2', codigo: 'FRM-002', nombreCompleto: 'Dra. Laura Morales Restrepo', documento: '1049281923', email: 'laura.morales@empresa.com', telefono: '+57 315 902 4432', especialidad: 'Primeros Auxilios y Ergonomía Ocupacional', activo: true, createdAt: '2025-01-05T08:00:00Z' },
  { id: 'form-3', codigo: 'FRM-003', nombreCompleto: 'Esp. Roberto Silva Gómez', documento: '1088392019', email: 'roberto.silva@empresa.com', telefono: '+57 301 773 9921', especialidad: 'Maquinaria Pesada e Izaje Crítico', activo: true, createdAt: '2025-01-10T08:00:00Z' },
  { id: 'form-4', codigo: 'FRM-004', nombreCompleto: 'Esp. Andrea Salazar Ortiz', documento: '1032948201', email: 'andrea.salazar@empresa.com', telefono: '+57 318 445 1109', especialidad: 'Sistemas Integrados de Gestión ISO 9001/45001', activo: true, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'form-5', codigo: 'FRM-005', nombreCompleto: 'Téc. Fernando Castro Peña', documento: '1076291044', email: 'fernando.castro@empresa.com', telefono: '+57 320 889 0041', especialidad: 'Riesgo Eléctrico, LOTO y HazMat', activo: true, createdAt: '2025-02-01T08:00:00Z' },
];

export const INITIAL_CERTIFICACIONES_CATALOGO: CertificacionCatalogo[] = [
  { id: 'cert-cat-1', codigo: 'CRT-ALT-01', nombre: 'Trabajo Seguro en Alturas - Nivel Avanzado', descripcion: 'Certificación obligatoria según resolución de seguridad para trabajos sobre 2.0 metros', vigenciaMeses: 12, exigeEvaluacion: true, calificacionMinima: 80, activo: true },
  { id: 'cert-cat-2', codigo: 'CRT-MAQ-02', nombre: 'Operación Segura de Maquinaria Pesada', descripcion: 'Habilitación para maniobra de grúas telescópicas, retroexcavadoras y montacargas', vigenciaMeses: 24, exigeEvaluacion: true, calificacionMinima: 85, activo: true },
  { id: 'cert-cat-3', codigo: 'CRT-PRI-03', nombre: 'Primeros Auxilios y Brigada de Emergencias', descripcion: 'Atención básica de trauma, RCP y evacuación táctica de instalaciones', vigenciaMeses: 12, exigeEvaluacion: true, calificacionMinima: 75, activo: true },
  { id: 'cert-cat-4', codigo: 'CRT-ELE-04', nombre: 'Riesgo Eléctrico y Bloqueo LOTO (Lockout/Tagout)', descripcion: 'Protocolos de aislamiento de energía cero y desenergización segura', vigenciaMeses: 12, exigeEvaluacion: true, calificacionMinima: 80, activo: true },
  { id: 'cert-cat-5', codigo: 'CRT-ISO-05', nombre: 'Auditor Interno ISO 9001:2015', descripcion: 'Competencia técnica para aseguramiento de calidad y control documental de procesos', vigenciaMeses: 36, exigeEvaluacion: true, calificacionMinima: 80, activo: true },
  { id: 'cert-cat-6', codigo: 'CRT-HAZ-06', nombre: 'Manejo Seguro de Materiales Peligrosos (HazMat)', descripcion: 'Clasificación, almacenamiento, contingencias y hojas de seguridad SDS', vigenciaMeses: 12, exigeEvaluacion: true, calificacionMinima: 85, activo: true },
];

export const INITIAL_COLABORADORES: Colaborador[] = [
  { id: 'colab-1', codigoInterno: 'EMP-1001', documento: '1092837461', nombreCompleto: 'Alejandro Valencia Torres', email: 'a.valencia@empresa.com', cargo: 'Técnico Liniero de Alturas', proyectoId: 'proj-2', areaId: 'area-2', fechaIngreso: '2023-03-15', activo: true, telefono: '3104829100' },
  { id: 'colab-2', codigoInterno: 'EMP-1002', documento: '1074928103', nombreCompleto: 'Beatriz Elena Quintero', email: 'b.quintero@empresa.com', cargo: 'Inspectora de Seguridad Industrial', proyectoId: 'proj-1', areaId: 'area-1', fechaIngreso: '2022-08-01', activo: true, telefono: '3128947111' },
  { id: 'colab-3', codigoInterno: 'EMP-1003', documento: '1038491827', nombreCompleto: 'Camilo Andrés Cifuentes', email: 'c.cifuentes@empresa.com', cargo: 'Operador de Grúa Torre', proyectoId: 'proj-1', areaId: 'area-2', fechaIngreso: '2021-11-20', activo: true, telefono: '3147728192' },
  { id: 'colab-4', codigoInterno: 'EMP-1004', documento: '1059384729', nombreCompleto: 'Diana Marcela Ríos', email: 'd.rios@empresa.com', cargo: 'Analista de Aseguramiento de Calidad', proyectoId: 'proj-3', areaId: 'area-4', fechaIngreso: '2024-01-10', activo: true, telefono: '3189920192' },
  { id: 'colab-5', codigoInterno: 'EMP-1005', documento: '1029482019', nombreCompleto: 'Eduardo José Martínez', email: 'e.martinez@empresa.com', cargo: 'Electromecánico Senior', proyectoId: 'proj-3', areaId: 'area-3', fechaIngreso: '2023-06-12', activo: true, telefono: '3168829102' },
  { id: 'colab-6', codigoInterno: 'EMP-1006', documento: '1088492011', nombreCompleto: 'Fabiola Guzmán Duarte', email: 'f.guzman@empresa.com', cargo: 'Supervisora de Operaciones', proyectoId: 'proj-2', areaId: 'area-2', fechaIngreso: '2022-02-14', activo: true, telefono: '3119028441' },
  { id: 'colab-7', codigoInterno: 'EMP-1007', documento: '1019284728', nombreCompleto: 'Gabriel Hernando Pineda', email: 'g.pineda@empresa.com', cargo: 'Conductor de Vehículo Pesado', proyectoId: 'proj-3', areaId: 'area-2', fechaIngreso: '2024-04-01', activo: true, telefono: '3174928103' },
  { id: 'colab-8', codigoInterno: 'EMP-1008', documento: '1067382910', nombreCompleto: 'Helena Patricia Vargas', email: 'h.vargas@empresa.com', cargo: 'Coordinadora SST en Proyecto', proyectoId: 'proj-1', areaId: 'area-1', fechaIngreso: '2021-05-18', activo: true, telefono: '3138827102' },
  { id: 'colab-9', codigoInterno: 'EMP-1009', documento: '1047291029', nombreCompleto: 'Iván Darío Echeverry', email: 'i.echeverry@empresa.com', cargo: 'Técnico de Fibra Óptica', proyectoId: 'proj-2', areaId: 'area-3', fechaIngreso: '2023-09-01', activo: true, telefono: '3157729104' },
  { id: 'colab-10', codigoInterno: 'EMP-1010', documento: '1099283711', nombreCompleto: 'Juliana Soto Arango', email: 'j.soto@empresa.com', cargo: 'Auditora de Procesos Operativos', proyectoId: 'proj-1', areaId: 'area-4', fechaIngreso: '2023-11-15', activo: true, telefono: '3198827100' },
  { id: 'colab-11', codigoInterno: 'EMP-1011', documento: '1028471928', nombreCompleto: 'Kevin Alexander Beltrán', email: 'k.beltran@empresa.com', cargo: 'Auxiliar de Montaje Electromecánico', proyectoId: 'proj-3', areaId: 'area-3', fechaIngreso: '2024-02-10', activo: true, telefono: '3008829101' },
  { id: 'colab-12', codigoInterno: 'EMP-1012', documento: '1058291022', nombreCompleto: 'Lucía Fernanda Méndez', email: 'l.mendez@empresa.com', cargo: 'Brigadista Industrial de Emergencias', proyectoId: 'proj-1', areaId: 'area-1', fechaIngreso: '2022-10-05', activo: true, telefono: '3148829100' },
  { id: 'colab-13', codigoInterno: 'EMP-1013', documento: '1077291039', nombreCompleto: 'Manuel Esteban Cardona', email: 'm.cardona@empresa.com', cargo: 'Soldador Estructural Calificado', proyectoId: 'proj-1', areaId: 'area-2', fechaIngreso: '2021-09-20', activo: true, telefono: '3127738192' },
  { id: 'colab-14', codigoInterno: 'EMP-1014', documento: '1039482012', nombreCompleto: 'Natalia Andrea Ospina', email: 'n.ospina@empresa.com', cargo: 'Ingeniera de Redes y Telecomunicaciones', proyectoId: 'proj-2', areaId: 'area-3', fechaIngreso: '2023-01-25', activo: true, telefono: '3187729101' },
  { id: 'colab-15', codigoInterno: 'EMP-1015', documento: '1068291048', nombreCompleto: 'Oscar David Jaramillo', email: 'o.jaramillo@empresa.com', cargo: 'Operador de Maquinaria y Rodillos', proyectoId: 'proj-3', areaId: 'area-2', fechaIngreso: '2024-05-10', activo: true, telefono: '3169920199' },
  { id: 'colab-16', codigoInterno: 'EMP-1016', documento: '1082910492', nombreCompleto: 'Paola Andrea Castaño', email: 'p.castano@empresa.com', cargo: 'Gestora Documental y Calidad', proyectoId: 'proj-2', areaId: 'area-4', fechaIngreso: '2022-04-18', activo: true, telefono: '3117728192' },
  { id: 'colab-17', codigoInterno: 'EMP-1017', documento: '1018291049', nombreCompleto: 'Ricardo Alfonso Morales', email: 'r.morales@empresa.com', cargo: 'Técnico Especialista en Subestaciones', proyectoId: 'proj-1', areaId: 'area-3', fechaIngreso: '2020-07-12', activo: true, telefono: '3109928102' },
  { id: 'colab-18', codigoInterno: 'EMP-1018', documento: '1048291039', nombreCompleto: 'Sandra Milena Villalba', email: 's.villalba@empresa.com', cargo: 'Enfermera Ocupacional', proyectoId: 'proj-3', areaId: 'area-1', fechaIngreso: '2023-08-01', activo: true, telefono: '3137728190' },
  { id: 'colab-19', codigoInterno: 'EMP-1019', documento: '1091829301', nombreCompleto: 'Tomás Felipe Guerrero', email: 't.guerrero@empresa.com', cargo: 'Auxiliar de Logística y Despacho', proyectoId: 'proj-3', areaId: 'area-2', fechaIngreso: '2024-06-15', activo: true, telefono: '3158829103' },
  { id: 'colab-20', codigoInterno: 'EMP-1020', documento: '1027182940', nombreCompleto: 'Viviana Marín Botero', email: 'v.marin@empresa.com', cargo: 'Líder de Cumplimiento Normativo', proyectoId: 'proj-2', areaId: 'area-4', fechaIngreso: '2021-03-01', activo: true, telefono: '3178829104' },
];

export const INITIAL_PERSONAL_CERTIFICACIONES: PersonalCertificacion[] = [
  // Vigentes
  { id: 'pc-1', colaboradorId: 'colab-1', certificacionId: 'cert-cat-1', estado: 'vigente', fechaCertificacion: '2026-04-10', fechaVencimiento: '2027-04-10', formadorId: 'form-1', codigoCertificado: 'CRT-2026-001', calificacion: 95, observaciones: 'Aprobó prueba práctica de rescate vertical con honores.', updatedAt: '2026-04-10T10:00:00Z', updatedBy: 'form-1' },
  { id: 'pc-2', colaboradorId: 'colab-2', certificacionId: 'cert-cat-3', estado: 'vigente', fechaCertificacion: '2026-03-01', fechaVencimiento: '2027-03-01', formadorId: 'form-2', codigoCertificado: 'CRT-2026-002', calificacion: 98, observaciones: 'Líder de brigada de respuesta inmediata.', updatedAt: '2026-03-01T11:00:00Z', updatedBy: 'form-2' },
  { id: 'pc-3', colaboradorId: 'colab-3', certificacionId: 'cert-cat-2', estado: 'vigente', fechaCertificacion: '2025-06-15', fechaVencimiento: '2027-06-15', formadorId: 'form-3', codigoCertificado: 'CRT-2025-089', calificacion: 92, observaciones: 'Inspección técnica de cables y balancines aprobada.', updatedAt: '2025-06-15T15:00:00Z', updatedBy: 'form-3' },
  { id: 'pc-4', colaboradorId: 'colab-4', certificacionId: 'cert-cat-5', estado: 'vigente', fechaCertificacion: '2025-08-20', fechaVencimiento: '2028-08-20', formadorId: 'form-4', codigoCertificado: 'CRT-2025-104', calificacion: 94, observaciones: 'Capacitada como auditora líder de procesos.', updatedAt: '2025-08-20T12:00:00Z', updatedBy: 'form-4' },
  { id: 'pc-5', colaboradorId: 'colab-5', certificacionId: 'cert-cat-4', estado: 'vigente', fechaCertificacion: '2026-02-15', fechaVencimiento: '2027-02-15', formadorId: 'form-5', codigoCertificado: 'CRT-2026-020', calificacion: 90, observaciones: 'Excelente destreza en candados multipunto.', updatedAt: '2026-02-15T16:00:00Z', updatedBy: 'form-5' },
  { id: 'pc-6', colaboradorId: 'colab-8', certificacionId: 'cert-cat-1', estado: 'vigente', fechaCertificacion: '2026-05-18', fechaVencimiento: '2027-05-18', formadorId: 'form-1', codigoCertificado: 'CRT-2026-045', calificacion: 96, observaciones: 'Coordinadora de alturas certificada.', updatedAt: '2026-05-18T09:00:00Z', updatedBy: 'form-1' },
  { id: 'pc-7', colaboradorId: 'colab-10', certificacionId: 'cert-cat-5', estado: 'vigente', fechaCertificacion: '2025-11-10', fechaVencimiento: '2028-11-10', formadorId: 'form-4', codigoCertificado: 'CRT-2025-156', calificacion: 88, observaciones: 'Auditoría interna de calidad aprobada.', updatedAt: '2025-11-10T14:00:00Z', updatedBy: 'form-4' },
  { id: 'pc-8', colaboradorId: 'colab-12', certificacionId: 'cert-cat-3', estado: 'vigente', fechaCertificacion: '2026-01-20', fechaVencimiento: '2027-01-20', formadorId: 'form-2', codigoCertificado: 'CRT-2026-008', calificacion: 92, observaciones: 'Certificación de triage y desfibrilador DEA.', updatedAt: '2026-01-20T13:00:00Z', updatedBy: 'form-2' },
  { id: 'pc-9', colaboradorId: 'colab-17', certificacionId: 'cert-cat-4', estado: 'vigente', fechaCertificacion: '2025-10-15', fechaVencimiento: '2026-10-15', formadorId: 'form-5', codigoCertificado: 'CRT-2025-132', calificacion: 95, observaciones: 'Habilitado para media y alta tensión.', updatedAt: '2025-10-15T10:00:00Z', updatedBy: 'form-5' },

  // Próximos a vencer (within 30 days of current simulated date 2026-09-09)
  { id: 'pc-10', colaboradorId: 'colab-6', certificacionId: 'cert-cat-1', estado: 'proximo_vencer', fechaCertificacion: '2025-09-25', fechaVencimiento: '2026-09-25', formadorId: 'form-1', codigoCertificado: 'CRT-2025-112', calificacion: 85, observaciones: 'Requiere reentrenamiento programado para finales de mes.', updatedAt: '2026-08-25T11:00:00Z', updatedBy: 'form-1' },
  { id: 'pc-11', colaboradorId: 'colab-9', certificacionId: 'cert-cat-1', estado: 'proximo_vencer', fechaCertificacion: '2025-09-30', fechaVencimiento: '2026-09-30', formadorId: 'form-1', codigoCertificado: 'CRT-2025-115', calificacion: 84, observaciones: 'Trabajo en postes y torres de telecomunicaciones.', updatedAt: '2026-08-30T09:00:00Z', updatedBy: 'form-1' },
  { id: 'pc-12', colaboradorId: 'colab-13', certificacionId: 'cert-cat-6', estado: 'proximo_vencer', fechaCertificacion: '2025-10-02', fechaVencimiento: '2026-10-02', formadorId: 'form-5', codigoCertificado: 'CRT-2025-120', calificacion: 86, observaciones: 'Manejo de gases comprimidos y cilindros.', updatedAt: '2026-09-01T08:00:00Z', updatedBy: 'form-5' },

  // Vencidos
  { id: 'pc-13', colaboradorId: 'colab-7', certificacionId: 'cert-cat-2', estado: 'vencido', fechaCertificacion: '2024-07-15', fechaVencimiento: '2026-07-15', formadorId: 'form-3', codigoCertificado: 'CRT-2024-055', calificacion: 82, observaciones: 'Vencido hace más de 50 días. Notificado a jefatura de operaciones.', updatedAt: '2026-07-16T08:00:00Z', updatedBy: 'form-3' },
  { id: 'pc-14', colaboradorId: 'colab-11', certificacionId: 'cert-cat-4', estado: 'vencido', fechaCertificacion: '2025-06-10', fechaVencimiento: '2026-06-10', formadorId: 'form-5', codigoCertificado: 'CRT-2025-072', calificacion: 80, observaciones: 'Pendiente prueba práctica de desenergización.', updatedAt: '2026-06-11T09:00:00Z', updatedBy: 'form-5' },
  { id: 'pc-15', colaboradorId: 'colab-14', certificacionId: 'cert-cat-1', estado: 'vencido', fechaCertificacion: '2025-05-12', fechaVencimiento: '2026-05-12', formadorId: 'form-1', codigoCertificado: 'CRT-2025-060', calificacion: 85, observaciones: 'Ingeniera asignada a diseño, requiere recertificar para ingreso a campo.', updatedAt: '2026-05-13T10:00:00Z', updatedBy: 'form-1' },

  // No certificados (Registrados en catálogo pero aún sin certificación emitida o en proceso)
  { id: 'pc-16', colaboradorId: 'colab-15', certificacionId: 'cert-cat-2', estado: 'no_certificado', observaciones: 'Nuevo ingreso, programado para curso en octubre.', updatedAt: '2026-09-01T10:00:00Z', updatedBy: 'admin-1' },
  { id: 'pc-17', colaboradorId: 'colab-16', certificacionId: 'cert-cat-5', estado: 'no_certificado', observaciones: 'Pre-requisito de 6 meses en cargo aún en curso.', updatedAt: '2026-08-15T11:00:00Z', updatedBy: 'admin-1' },
  { id: 'pc-18', colaboradorId: 'colab-18', certificacionId: 'cert-cat-6', estado: 'no_certificado', observaciones: 'Pendiente módulo virtual de químicos peligrosos.', updatedAt: '2026-09-02T14:00:00Z', updatedBy: 'admin-1' },
  { id: 'pc-19', colaboradorId: 'colab-19', certificacionId: 'cert-cat-3', estado: 'no_certificado', observaciones: 'No asistió a la primera convocatoria por incapacidad.', updatedAt: '2026-08-20T08:00:00Z', updatedBy: 'admin-1' },
  { id: 'pc-20', colaboradorId: 'colab-20', certificacionId: 'cert-cat-5', estado: 'vigente', fechaCertificacion: '2025-04-18', fechaVencimiento: '2028-04-18', formadorId: 'form-4', codigoCertificado: 'CRT-2025-039', calificacion: 99, observaciones: 'Líder auditor internacional certificada.', updatedAt: '2025-04-18T10:00:00Z', updatedBy: 'form-4' },
];

export const INITIAL_CAPACITACIONES: Capacitacion[] = [
  { id: 'cap-1', colaboradorId: 'colab-1', tema: 'Técnicas Avanzadas de Auto-rescate en Alturas', subtema: 'Descenso controlado y uso de poleas 4:1', tipoCapacitacion: 'Normativa / SST', fecha: '2026-08-14', duracionHoras: 8, formadorId: 'form-1', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 96, observaciones: 'Excelente destreza física y conocimiento de nudos tácticos.', evidenciaArchivo: 'acta_alturas_cap1.pdf', createdAt: '2026-08-10T08:00:00Z', createdBy: 'form-1', updatedAt: '2026-08-14T17:00:00Z' },
  { id: 'cap-2', colaboradorId: 'colab-2', tema: 'Actualización en Protocolos de Reanimación Cardiopulmonar (RCP)', subtema: 'Manejo de Desfibrilador Externo Automático (DEA)', tipoCapacitacion: 'SST / Primeros Auxilios', fecha: '2026-08-18', duracionHoras: 6, formadorId: 'form-2', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 98, observaciones: 'Capacidad de liderazgo en simulación de emergencias.', evidenciaArchivo: 'eval_rcp_cap2.pdf', createdAt: '2026-08-12T09:00:00Z', createdBy: 'form-2', updatedAt: '2026-08-18T16:00:00Z' },
  { id: 'cap-3', colaboradorId: 'colab-3', tema: 'Inspección Pre-operacional de Grúas y Equipos de Izaje', subtema: 'Cálculo de centro de gravedad y tablas de carga', tipoCapacitacion: 'Técnica / Maquinaria', fecha: '2026-07-22', duracionHoras: 10, formadorId: 'form-3', modalidad: 'mixta', estado: 'realizada', resultado: 'Aprobado', calificacion: 94, observaciones: 'Cumplió satisfactoriamente la prueba de estabilidad con vientos.', evidenciaArchivo: 'certificado_izaje_cap3.pdf', createdAt: '2026-07-15T08:00:00Z', createdBy: 'form-3', updatedAt: '2026-07-22T18:00:00Z' },
  { id: 'cap-4', colaboradorId: 'colab-4', tema: 'Técnicas de Auditoría Interna bajo ISO 19011', subtema: 'Redacción de no conformidades y muestreo estadístico', tipoCapacitacion: 'Calidad & Procesos', fecha: '2026-06-10', duracionHoras: 12, formadorId: 'form-4', modalidad: 'virtual', estado: 'realizada', resultado: 'Aprobado', calificacion: 92, observaciones: 'Entrega oportuna de los talleres prácticos de no conformidades.', evidenciaArchivo: 'taller_iso_cap4.pdf', createdAt: '2026-06-01T10:00:00Z', createdBy: 'form-4', updatedAt: '2026-06-10T16:00:00Z' },
  { id: 'cap-5', colaboradorId: 'colab-5', tema: 'Aislamiento Seguro de Energía - Procedimiento LOTO', subtema: 'Instalación de tarjetas y candados de seguridad en tableros 480V', tipoCapacitacion: 'Normativa / Eléctrica', fecha: '2026-08-05', duracionHoras: 8, formadorId: 'form-5', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 90, observaciones: 'Prueba de cero energía verificada con multímetro calibrado.', evidenciaArchivo: 'registro_loto_cap5.pdf', createdAt: '2026-07-28T11:00:00Z', createdBy: 'form-5', updatedAt: '2026-08-05T17:00:00Z' },
  { id: 'cap-6', colaboradorId: 'colab-6', tema: 'Supervisión y Control de Trabajos de Alto Riesgo', subtema: 'Emisión y firma de permisos de trabajo (Permits to Work)', tipoCapacitacion: 'SST / Liderazgo', fecha: '2026-08-28', duracionHoras: 6, formadorId: 'form-1', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 89, observaciones: 'Identificó todas las trampas de seguridad en el simulacro.', evidenciaArchivo: 'control_riesgo_cap6.pdf', createdAt: '2026-08-20T08:00:00Z', createdBy: 'form-1', updatedAt: '2026-08-28T16:00:00Z' },
  { id: 'cap-7', colaboradorId: 'colab-7', tema: 'Manejo Defensivo y Seguridad Vial en Minería', subtema: 'Frenado en pendientes pronunciadas y control de hidroplaneo', tipoCapacitacion: 'Seguridad Vial', fecha: '2026-05-15', duracionHoras: 8, formadorId: 'form-3', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 85, observaciones: 'Aprobó con recomendaciones de distancia de seguimiento.', evidenciaArchivo: 'defensivo_cap7.pdf', createdAt: '2026-05-08T08:00:00Z', createdBy: 'form-3', updatedAt: '2026-05-15T17:00:00Z' },
  { id: 'cap-8', colaboradorId: 'colab-8', tema: 'Actualización en Matriz de Riesgos y Peligros GTC 45', subtema: 'Evaluación cuantitativa y jerarquía de controles', tipoCapacitacion: 'SST / Normativa', fecha: '2026-08-11', duracionHoras: 8, formadorId: 'form-2', modalidad: 'virtual', estado: 'realizada', resultado: 'Aprobado', calificacion: 97, observaciones: 'Presentó matriz adaptada para el nuevo frente de excavación.', evidenciaArchivo: 'matriz_gtc45_cap8.pdf', createdAt: '2026-08-01T09:00:00Z', createdBy: 'form-2', updatedAt: '2026-08-11T16:00:00Z' },
  { id: 'cap-9', colaboradorId: 'colab-9', tema: 'Instalación Segura de Líneas de Vida en Torres 5G', subtema: 'Puntos de anclaje certificados y factor de caída', tipoCapacitacion: 'Técnica / Alturas', fecha: '2026-07-30', duracionHoras: 8, formadorId: 'form-1', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 88, observaciones: 'Buen manejo de mosquetones con seguro automático.', evidenciaArchivo: 'lineas_vida_cap9.pdf', createdAt: '2026-07-22T08:00:00Z', createdBy: 'form-1', updatedAt: '2026-07-30T17:00:00Z' },
  { id: 'cap-10', colaboradorId: 'colab-10', tema: 'Gestión de Riesgos de Proceso bajo ISO 31000', subtema: 'Análisis bow-tie y mitigación de fallas críticas', tipoCapacitacion: 'Calidad & Procesos', fecha: '2026-08-25', duracionHoras: 8, formadorId: 'form-4', modalidad: 'virtual', estado: 'realizada', resultado: 'Aprobado', calificacion: 93, observaciones: 'Excelente claridad conceptual en el análisis de causas raíz.', evidenciaArchivo: 'iso31000_cap10.pdf', createdAt: '2026-08-15T10:00:00Z', createdBy: 'form-4', updatedAt: '2026-08-25T17:00:00Z' },
  { id: 'cap-11', colaboradorId: 'colab-11', tema: 'Fundamentos de Seguridad Eléctrica RETIE', subtema: 'Distancias mínimas de seguridad en subestaciones', tipoCapacitacion: 'Técnica / Eléctrica', fecha: '2026-06-18', duracionHoras: 6, formadorId: 'form-5', modalidad: 'virtual', estado: 'realizada', resultado: 'Aprobado', calificacion: 81, observaciones: 'Debe reforzar lectura de planos unifilares.', evidenciaArchivo: 'retie_cap11.pdf', createdAt: '2026-06-10T09:00:00Z', createdBy: 'form-5', updatedAt: '2026-06-18T15:00:00Z' },
  { id: 'cap-12', colaboradorId: 'colab-12', tema: 'Triage de Víctimas en Incidentes Múltiples (START)', subtema: 'Clasificación por colores y estabilización respiratoria', tipoCapacitacion: 'Primeros Auxilios', fecha: '2026-08-03', duracionHoras: 8, formadorId: 'form-2', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 95, observaciones: 'Simulación de campo aprobada en tiempo récord.', evidenciaArchivo: 'triage_cap12.pdf', createdAt: '2026-07-25T08:00:00Z', createdBy: 'form-2', updatedAt: '2026-08-03T17:00:00Z' },
  { id: 'cap-13', colaboradorId: 'colab-13', tema: 'Seguridad en Operaciones de Oxicorte y Soldadura', subtema: 'Válvulas arrestallamas y control de atmósferas explosivas', tipoCapacitacion: 'Técnica / Caliente', fecha: '2026-07-14', duracionHoras: 8, formadorId: 'form-5', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 89, observaciones: 'Uso estricto de mamparas y ventilación forzada.', evidenciaArchivo: 'soldadura_cap13.pdf', createdAt: '2026-07-05T08:00:00Z', createdBy: 'form-5', updatedAt: '2026-07-14T17:00:00Z' },
  { id: 'cap-14', colaboradorId: 'colab-14', tema: 'Seguridad en Tendido de Redes Subterráneas y Aéreas', subtema: 'Protocolos de coordinación con distribuidores de energía', tipoCapacitacion: 'Técnica / Telecom', fecha: '2026-08-22', duracionHoras: 6, formadorId: 'form-5', modalidad: 'virtual', estado: 'realizada', resultado: 'Aprobado', calificacion: 91, observaciones: 'Comprensión completa de la interfaz con media tensión.', evidenciaArchivo: 'redes_cap14.pdf', createdAt: '2026-08-15T09:00:00Z', createdBy: 'form-5', updatedAt: '2026-08-22T16:00:00Z' },
  { id: 'cap-15', colaboradorId: 'colab-15', tema: 'Inducción General de Seguridad en Obras Metro', subtema: 'Señalización, alarmas y rutas de evacuación', tipoCapacitacion: 'Inducción Corporativa', fecha: '2026-05-12', duracionHoras: 4, formadorId: 'form-2', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 88, observaciones: 'Completó el recorrido perimetral de inducción.', evidenciaArchivo: 'induccion_cap15.pdf', createdAt: '2026-05-05T08:00:00Z', createdBy: 'form-2', updatedAt: '2026-05-12T13:00:00Z' },
  { id: 'cap-16', colaboradorId: 'colab-16', tema: 'Control Documental Digital y Trazabilidad ISO', subtema: 'Gestión de versiones y aprobaciones electrónicas', tipoCapacitacion: 'Calidad & Procesos', fecha: '2026-07-08', duracionHoras: 6, formadorId: 'form-4', modalidad: 'virtual', estado: 'realizada', resultado: 'Aprobado', calificacion: 96, observaciones: 'Configuró con éxito el repositorio de pruebas.', evidenciaArchivo: 'doc_iso_cap16.pdf', createdAt: '2026-07-01T10:00:00Z', createdBy: 'form-4', updatedAt: '2026-07-08T16:00:00Z' },
  { id: 'cap-17', colaboradorId: 'colab-17', tema: 'Arco Eléctrico y Selección de EPP Ignífugo (NFPA 70E)', subtema: 'Límites de aproximación y cálculo de energía incidente', tipoCapacitacion: 'Normativa / Eléctrica', fecha: '2026-08-29', duracionHoras: 8, formadorId: 'form-5', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 97, observaciones: 'Experto en calcomanías de advertencia de arco.', evidenciaArchivo: 'nfpa70e_cap17.pdf', createdAt: '2026-08-20T08:00:00Z', createdBy: 'form-5', updatedAt: '2026-08-29T17:00:00Z' },
  { id: 'cap-18', colaboradorId: 'colab-18', tema: 'Gestión de Residuos Biológicos y Hospitalarios', subtema: 'Clasificación de cortopunzantes y ruta sanitaria', tipoCapacitacion: 'Salud Ocupacional', fecha: '2026-08-16', duracionHoras: 6, formadorId: 'form-2', modalidad: 'virtual', estado: 'realizada', resultado: 'Aprobado', calificacion: 100, observaciones: 'Puntaje perfecto en manejo de residuos peligrosos.', evidenciaArchivo: 'residuos_cap18.pdf', createdAt: '2026-08-08T09:00:00Z', createdBy: 'form-2', updatedAt: '2026-08-16T15:00:00Z' },
  { id: 'cap-19', colaboradorId: 'colab-19', tema: 'Ergonomía en Levantamiento de Cargas y Posturas Forzadas', subtema: 'Técnica de flexión de rodillas y pesos máximos permisibles', tipoCapacitacion: 'SST / Ergonomía', fecha: '2026-06-25', duracionHoras: 4, formadorId: 'form-2', modalidad: 'presencial', estado: 'realizada', resultado: 'Aprobado', calificacion: 84, observaciones: 'Realizó taller biomecánico práctico.', evidenciaArchivo: 'ergonomia_cap19.pdf', createdAt: '2026-06-18T08:00:00Z', createdBy: 'form-2', updatedAt: '2026-06-25T13:00:00Z' },
  { id: 'cap-20', colaboradorId: 'colab-20', tema: 'Formación de Auditores Líderes en Normas Trinorma', subtema: 'Integración ISO 9001, 14001 y 45001', tipoCapacitacion: 'Calidad & Auditoría', fecha: '2026-08-12', duracionHoras: 16, formadorId: 'form-4', modalidad: 'mixta', estado: 'realizada', resultado: 'Aprobado', calificacion: 99, observaciones: 'Defensa de informe de auditoría impecable.', evidenciaArchivo: 'trinorma_cap20.pdf', createdAt: '2026-08-01T08:00:00Z', createdBy: 'form-4', updatedAt: '2026-08-12T18:00:00Z' },

  // Capacitaciones Programadas próximas
  { id: 'cap-21', colaboradorId: 'colab-1', tema: 'Reentrenamiento Anual de Alturas 2026', subtema: 'Nuevas técnicas de anclaje estructural', tipoCapacitacion: 'Normativa / SST', fecha: '2026-09-18', duracionHoras: 8, formadorId: 'form-1', modalidad: 'presencial', estado: 'programada', resultado: 'Pendiente', observaciones: 'Convocatoria enviada a jefatura de proyecto.', createdAt: '2026-09-02T10:00:00Z', createdBy: 'form-1', updatedAt: '2026-09-02T10:00:00Z' },
  { id: 'cap-22', colaboradorId: 'colab-7', tema: 'Recertificación en Operación Segura de Volquetas', subtema: 'Puntos ciegos y uso de cámaras de 360 grados', tipoCapacitacion: 'Técnica / Maquinaria', fecha: '2026-09-22', duracionHoras: 8, formadorId: 'form-3', modalidad: 'presencial', estado: 'programada', resultado: 'Pendiente', observaciones: 'Urgente para reactivar certificación vencida.', createdAt: '2026-09-03T11:00:00Z', createdBy: 'form-3', updatedAt: '2026-09-03T11:00:00Z' },
  { id: 'cap-23', colaboradorId: 'colab-11', tema: 'Reevaluación de Bloqueo LOTO y Pruebas Prácticas', subtema: 'Simulación de interruptores principales de potencia', tipoCapacitacion: 'Normativa / Eléctrica', fecha: '2026-09-25', duracionHoras: 6, formadorId: 'form-5', modalidad: 'presencial', estado: 'programada', resultado: 'Pendiente', observaciones: 'Sesión personalizada de reentrenamiento.', createdAt: '2026-09-04T08:00:00Z', createdBy: 'form-5', updatedAt: '2026-09-04T08:00:00Z' },
  { id: 'cap-24', colaboradorId: 'colab-15', tema: 'Manejo Seguro de Minicargadores y Montacargas', subtema: 'Estabilidad de carga y centro de gravedad', tipoCapacitacion: 'Técnica / Maquinaria', fecha: '2026-09-28', duracionHoras: 16, formadorId: 'form-3', modalidad: 'presencial', estado: 'programada', resultado: 'Pendiente', observaciones: 'Curso inicial para habilitación operativa.', createdAt: '2026-09-05T09:00:00Z', createdBy: 'form-3', updatedAt: '2026-09-05T09:00:00Z' },
  { id: 'cap-25', colaboradorId: 'colab-14', tema: 'Recertificación en Alturas para Supervisores', subtema: 'Inspección de arneses y eslingas con absorbedor', tipoCapacitacion: 'Normativa / SST', fecha: '2026-10-02', duracionHoras: 8, formadorId: 'form-1', modalidad: 'presencial', estado: 'programada', resultado: 'Pendiente', observaciones: 'Programada en campo de entrenamiento.', createdAt: '2026-09-06T10:00:00Z', createdBy: 'form-1', updatedAt: '2026-09-06T10:00:00Z' },
];

export const INITIAL_TIPOS_NOVEDAD: TipoNovedad[] = [
  { id: 'tnov-1', nombre: 'Incapacidad Médica', descripcion: 'Reporte de incapacidad expedida por EPS o ARL que impide asistencia a formación', activo: true },
  { id: 'tnov-2', nombre: 'Permiso Laboral / Calamidad', descripcion: 'Permiso autorizado por jefatura directa o asunto doméstico grave', activo: true },
  { id: 'tnov-3', nombre: 'Solicitud de Re-evaluación', descripcion: 'Petición de segunda oportunidad o recertificación tras reprobación o vencimiento', activo: true },
  { id: 'tnov-4', nombre: 'Cambio de Proyecto / Área', descripcion: 'Traslado del colaborador que modifica los requerimientos de su perfil de capacitación', activo: true },
  { id: 'tnov-5', nombre: 'Incidente Operativo / Desvío SST', descripcion: 'Observación sobre condición insegura o desvío de protocolo en terreno', activo: true },
  { id: 'tnov-6', nombre: 'Falla Técnica en Aula Virtual', descripcion: 'Problema de conectividad o acceso a plataforma de e-learning durante la sesión', activo: true },
];

export const INITIAL_NOVEDADES: Novedad[] = [
  {
    id: 'nov-1',
    colaboradorId: 'colab-7',
    tipoNovedadId: 'tnov-3',
    fecha: '2026-08-10',
    descripcion: 'Vencimiento de certificación en maquinaria pesada. El colaborador solicita fecha de evaluación práctica con prioridad.',
    responsableId: 'form-3',
    estado: 'abierta',
    observaciones: 'Coordinando disponibilidad de volqueta en frente norte para prueba en terreno.',
    evidencias: ['solicitud_colab7.pdf'],
    historial: [
      { id: 'h-1', fecha: '2026-08-10T10:00:00Z', usuario: 'Beatriz Quintero (SST)', accion: 'Registro Inicial', comentario: 'Se registra novedad por alerta de vencimiento emitida por sistema.', estadoNuevo: 'abierta' }
    ],
    createdAt: '2026-08-10T10:00:00Z',
    createdBy: 'colab-2',
    updatedAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'nov-2',
    colaboradorId: 'colab-11',
    tipoNovedadId: 'tnov-3',
    fecha: '2026-08-15',
    descripcion: 'Reprogramación de prueba de bloqueo LOTO pendiente por turno rotativo de noche.',
    responsableId: 'form-5',
    estado: 'en_seguimiento',
    observaciones: 'Se acordó fecha para el 25 de septiembre a las 09:00 hrs.',
    evidencias: ['turno_colab11.pdf'],
    historial: [
      { id: 'h-2', fecha: '2026-08-15T11:00:00Z', usuario: 'Fernando Castro (Formador)', accion: 'Creación', comentario: 'Reporte de inasistencia justificada por turno.', estadoNuevo: 'abierta' },
      { id: 'h-3', fecha: '2026-08-20T14:30:00Z', usuario: 'Fernando Castro (Formador)', accion: 'Actualización', comentario: 'Turno conciliado con jefe de subestación.', estadoAnterior: 'abierta', estadoNuevo: 'en_seguimiento' }
    ],
    createdAt: '2026-08-15T11:00:00Z',
    createdBy: 'form-5',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'nov-3',
    colaboradorId: 'colab-19',
    tipoNovedadId: 'tnov-1',
    fecha: '2026-08-18',
    descripcion: 'Incapacidad médica por 7 días por cuadro respiratorio agudo. Justifica inasistencia a módulo de ergonomía.',
    responsableId: 'form-2',
    estado: 'cerrada',
    fechaCierre: '2026-08-26',
    observaciones: 'Certificado de EPS radicado. Se reprogramó sesión virtual complementaria.',
    evidencias: ['incapacidad_eps_colab19.pdf'],
    historial: [
      { id: 'h-4', fecha: '2026-08-18T09:00:00Z', usuario: 'Sandra Villalba (Enfermera)', accion: 'Creación', comentario: 'Radicación de incapacidad médica de EPS Sanitas.', estadoNuevo: 'abierta' },
      { id: 'h-5', fecha: '2026-08-26T16:00:00Z', usuario: 'Laura Morales (Formadora)', accion: 'Cierre', comentario: 'Colaborador se reintegró y culminó módulo de repaso.', estadoAnterior: 'abierta', estadoNuevo: 'cerrada' }
    ],
    createdAt: '2026-08-18T09:00:00Z',
    createdBy: 'colab-18',
    updatedAt: '2026-08-26T16:00:00Z'
  },
  {
    id: 'nov-4',
    colaboradorId: 'colab-1',
    tipoNovedadId: 'tnov-4',
    fecha: '2026-08-28',
    descripcion: 'Reasignación temporal a frente de torre en Proyecto Conexión 5G. Requiere validar vigencia de EPP específico.',
    responsableId: 'form-1',
    estado: 'abierta',
    observaciones: 'Arnés dieléctrico entregado en almacén técnico.',
    evidencias: ['entrega_epp_colab1.pdf'],
    historial: [
      { id: 'h-6', fecha: '2026-08-28T15:00:00Z', usuario: 'Carlos Mendoza (Formador)', accion: 'Registro', comentario: 'Novedad de traslado operativo registrada.', estadoNuevo: 'abierta' }
    ],
    createdAt: '2026-08-28T15:00:00Z',
    createdBy: 'form-1',
    updatedAt: '2026-08-28T15:00:00Z'
  },
  {
    id: 'nov-5',
    colaboradorId: 'colab-6',
    tipoNovedadId: 'tnov-3',
    fecha: '2026-09-02',
    descripcion: 'Certificación de Trabajo en Alturas vence el 25 de septiembre. Solicitud de cupo en la cohorte del 18 de septiembre.',
    responsableId: 'form-1',
    estado: 'en_seguimiento',
    observaciones: 'Inscrita en el curso programado para el 18 de septiembre.',
    evidencias: [],
    historial: [
      { id: 'h-7', fecha: '2026-09-02T08:30:00Z', usuario: 'Carlos Mendoza (Formador)', accion: 'Creación', comentario: 'Alerta automática atendida e inscripción formal realizada.', estadoNuevo: 'en_seguimiento' }
    ],
    createdAt: '2026-09-02T08:30:00Z',
    createdBy: 'form-1',
    updatedAt: '2026-09-02T08:30:00Z'
  },
];

export const INITIAL_APP_MODULES: AppModule[] = [
  { id: 'mod-1', codigo: 'MOD-CERT', nombre: 'Personal Certificado vs. No Certificado', descripcion: 'Control integral de vigencias, alertas y vencimientos de certificaciones', icono: 'Award', ruta: '/certificaciones', activo: true, orden: 1, esSistema: true, categoria: 'Core' },
  { id: 'mod-2', codigo: 'MOD-CAP', nombre: 'Personal Capacitado', descripcion: 'Registro de horas de formación, modalidades, calificaciones y metas', icono: 'GraduationCap', ruta: '/formacion', activo: true, orden: 2, esSistema: true, categoria: 'Core' },
  { id: 'mod-3', codigo: 'MOD-NOV', nombre: 'Reporte de Novedades', descripcion: 'Gestión de incidencias, permisos, incapacidades y reevaluaciones', icono: 'AlertCircle', ruta: '/novedades', activo: true, orden: 3, esSistema: true, categoria: 'Core' },
  { id: 'mod-4', codigo: 'MOD-ASIS', nombre: 'Control de Asistencia Digital', descripcion: 'Registro biométrico y firmas digitales de listas de asistencia a eventos formativos', icono: 'CheckSquare', ruta: '/asistencia', activo: true, orden: 4, esSistema: false, categoria: 'Extensión' },
  { id: 'mod-5', codigo: 'MOD-EVAL', nombre: 'Evaluaciones y Exámenes en Línea', descripcion: 'Banco de preguntas, exámenes automatizados y bancos de reactivos', icono: 'FileCheck2', ruta: '/evaluaciones', activo: true, orden: 5, esSistema: false, categoria: 'Extensión' },
  { id: 'mod-6', codigo: 'MOD-PLAN', nombre: 'Plan Anual de Formación (PAF)', descripcion: 'Presupuesto formativo, cronograma maestro y asignación de cohortes', icono: 'Calendar', ruta: '/plan-anual', activo: true, orden: 6, esSistema: false, categoria: 'Gestión' },
  { id: 'mod-7', codigo: 'MOD-COMP', nombre: 'Gestión de Competencias Laborales', descripcion: 'Matriz de polivalencia, gaps de habilidad y planes de desarrollo individual', icono: 'TrendingUp', ruta: '/competencias', activo: true, orden: 7, esSistema: false, categoria: 'Gestión' },
  { id: 'mod-8', codigo: 'MOD-ENC', nombre: 'Encuestas de Satisfacción', descripcion: 'Evaluación del formador y efectividad de la capacitación Kirkpatrick nivel 1', icono: 'MessageSquareText', ruta: '/encuestas', activo: false, orden: 8, esSistema: false, categoria: 'Extensión' },
  { id: 'mod-9', codigo: 'MOD-DOC', nombre: 'Gestión Documental y Normativa', descripcion: 'Repositorio central de guías, estándares técnicos y licencias SST', icono: 'FolderLock', ruta: '/documentos', activo: false, orden: 9, esSistema: false, categoria: 'Gestión' },
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-admin',
    codigo: 'ADMIN',
    nombre: 'Administrador de Plataforma',
    descripcion: 'Acceso total y privilegios completos sobre configuración, módulos, catálogos, auditoría y datos.',
    activo: true,
    permisos: [
      'dashboard:read',
      'certificaciones:read', 'certificaciones:create', 'certificaciones:update', 'certificaciones:delete', 'certificaciones:export',
      'capacitacion:read', 'capacitacion:create', 'capacitacion:update', 'capacitacion:delete', 'capacitacion:export',
      'novedades:read', 'novedades:create', 'novedades:update', 'novedades:delete', 'novedades:export',
      'reportes:read', 'reportes:export',
      'aplicativos:read', 'aplicativos:create', 'aplicativos:update', 'aplicativos:delete',
      'usuarios:read', 'usuarios:create', 'usuarios:update', 'usuarios:delete',
      'roles:read', 'roles:create', 'roles:update',
      'catalogos:read', 'catalogos:create', 'catalogos:update', 'catalogos:delete',
      'auditoria:read', 'parametros:update'
    ]
  },
  {
    id: 'role-formador',
    codigo: 'FORMADOR',
    nombre: 'Formador Especialista',
    descripcion: 'Registro y seguimiento de capacitaciones, certificaciones y novedades bajo su asignación.',
    activo: true,
    permisos: [
      'dashboard:read',
      'certificaciones:read', 'certificaciones:create', 'certificaciones:update',
      'capacitacion:read', 'capacitacion:create', 'capacitacion:update',
      'novedades:read', 'novedades:create', 'novedades:update',
      'reportes:read'
    ]
  },
  {
    id: 'role-consulta',
    codigo: 'CONSULTA',
    nombre: 'Usuario de Consulta / Auditor',
    descripcion: 'Acceso de solo lectura para supervisión ejecutiva, informes y auditorías operativas.',
    activo: true,
    permisos: [
      'dashboard:read',
      'certificaciones:read',
      'capacitacion:read',
      'novedades:read',
      'reportes:read', 'reportes:export'
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin.formacion',
    email: 'admin.formacion@empresa.com',
    nombreCompleto: 'Coordinador Guido Arias Herrera',
    roleId: 'role-admin',
    activo: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ultimoAcceso: '2026-09-09T08:00:00Z',
    password: 'admin123',
    cargo: 'Coordinador General de Formación & Capacitación',
    telefono: '+57 310 882 9901',
    createdAt: '2025-01-01T08:00:00Z',
  },
  {
    id: 'user-formador-1',
    username: 'carlos.mendoza',
    email: 'carlos.mendoza@empresa.com',
    nombreCompleto: 'Ing. Carlos Mendoza Rivas',
    roleId: 'role-formador',
    formadorId: 'form-1',
    activo: true,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    ultimoAcceso: '2026-09-09T07:45:00Z',
    password: 'formador123',
    cargo: 'Formador Especialista en Alturas y Espacios Confinados',
    telefono: '+57 312 849 2011',
    createdAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'user-formador-2',
    username: 'laura.morales',
    email: 'laura.morales@empresa.com',
    nombreCompleto: 'Dra. Laura Morales Restrepo',
    roleId: 'role-formador',
    formadorId: 'form-2',
    activo: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    ultimoAcceso: '2026-09-08T16:20:00Z',
    password: 'formador123',
    cargo: 'Médica Especialista en Salud Ocupacional y Ergonomía',
    telefono: '+57 315 902 4432',
    createdAt: '2025-01-08T08:00:00Z',
  },
  {
    id: 'user-consulta',
    username: 'auditor.externo',
    email: 'auditor.sst@empresa.com',
    nombreCompleto: 'Lic. Fernando Gutiérrez (Auditor SST)',
    roleId: 'role-consulta',
    activo: true,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    ultimoAcceso: '2026-09-07T14:10:00Z',
    password: 'consulta123',
    cargo: 'Auditor Externo de Seguridad y Cumplimiento Legal',
    telefono: '+57 300 771 2289',
    createdAt: '2025-02-01T08:00:00Z',
  }
];

export const INITIAL_STORED_FILES: StoredFile[] = [
  {
    id: 'file-1',
    nombre: 'Manual_SST_Alturas_2026.pdf',
    tipo: 'application/pdf',
    tamanoBytes: 1542800,
    modulo: 'capacitaciones',
    referenciaId: 'cap-1',
    referenciaNombre: 'Técnicas Avanzadas de Auto-rescate en Alturas',
    contenidoUrl: 'https://example.com/docs/manual_sst_alturas_2026.pdf',
    fechaSubida: '2026-08-14T17:30:00Z',
    subidoPor: 'Ing. Carlos Mendoza Rivas',
    observaciones: 'Material de apoyo y guía práctica de nudos para rescate vertical.',
  },
  {
    id: 'file-2',
    nombre: 'Acta_Evaluacion_RCP_DEA_2026.pdf',
    tipo: 'application/pdf',
    tamanoBytes: 894200,
    modulo: 'capacitaciones',
    referenciaId: 'cap-2',
    referenciaNombre: 'Actualización en Protocolos RCP y DEA',
    contenidoUrl: 'https://example.com/docs/acta_evaluacion_rcp.pdf',
    fechaSubida: '2026-08-18T16:15:00Z',
    subidoPor: 'Dra. Laura Morales Restrepo',
    observaciones: 'Evaluación práctica de reanimación y simulación DEA.',
  },
  {
    id: 'file-3',
    nombre: 'Certificado_Oficial_CRT-2026-001.pdf',
    tipo: 'application/pdf',
    tamanoBytes: 420100,
    modulo: 'certificaciones',
    referenciaId: 'pc-1',
    referenciaNombre: 'Trabajo Seguro en Alturas - Nivel Avanzado',
    contenidoUrl: 'https://example.com/certs/crt_2026_001.pdf',
    fechaSubida: '2026-04-10T10:30:00Z',
    subidoPor: 'Ing. Carlos Mendoza Rivas',
    observaciones: 'Certificado digital oficial emitido por centro de entrenamiento avalado.',
  },
  {
    id: 'file-4',
    nombre: 'Certificado_Medico_Incapacidad_Nov3.pdf',
    tipo: 'application/pdf',
    tamanoBytes: 312000,
    modulo: 'novedades',
    referenciaId: 'nov-3',
    referenciaNombre: 'Incapacidad Médica Colaborador 19',
    contenidoUrl: 'https://example.com/novedades/incapacidad_nov3.pdf',
    fechaSubida: '2026-09-06T16:05:00Z',
    subidoPor: 'Dra. Laura Morales Restrepo',
    observaciones: 'Constancia médica de incapacidad por 5 días.',
  },
  {
    id: 'file-5',
    nombre: 'Politica_General_Formacion_Consorcio.pdf',
    tipo: 'application/pdf',
    tamanoBytes: 2450000,
    modulo: 'general',
    referenciaId: 'general',
    referenciaNombre: 'Política Corporativa de Capacitación',
    contenidoUrl: 'https://example.com/docs/politica_general_formacion.pdf',
    fechaSubida: '2026-01-15T09:00:00Z',
    subidoPor: 'Coordinador Guido Arias Herrera',
    observaciones: 'Directriz aprobada por gerencia de operaciones y talento humano.',
  }
];

export const INITIAL_AUDITORIA: AuditoriaRegistro[] = [
  { id: 'aud-1', fechaHora: '2026-09-09T07:30:15Z', usuarioId: 'user-admin', usuarioNombre: 'Directora Patricia Vélez', rol: 'ADMIN', accion: 'LOGIN', modulo: 'Autenticación', registroAfectadoId: 'user-admin', registroDescripcion: 'Inicio de sesión exitoso en plataforma', ipAddress: '192.168.1.45' },
  { id: 'aud-2', fechaHora: '2026-09-08T15:42:00Z', usuarioId: 'user-formador-1', usuarioNombre: 'Ing. Carlos Mendoza', rol: 'FORMADOR', accion: 'CREAR', modulo: 'Capacitaciones', registroAfectadoId: 'cap-21', registroDescripcion: 'Programación de curso Reentrenamiento Anual de Alturas 2026', valorNuevo: 'Estado: programada, Colaborador: EMP-1001', ipAddress: '192.168.2.11' },
  { id: 'aud-3', fechaHora: '2026-09-08T11:20:00Z', usuarioId: 'user-formador-1', usuarioNombre: 'Ing. Carlos Mendoza', rol: 'FORMADOR', accion: 'MODIFICAR', modulo: 'Certificaciones', registroAfectadoId: 'pc-10', registroDescripcion: 'Actualización estado certificación preventiva próximo a vencer', valorAnterior: 'vigente', valorNuevo: 'proximo_vencer', ipAddress: '192.168.2.11' },
  { id: 'aud-4', fechaHora: '2026-09-07T09:15:30Z', usuarioId: 'user-admin', usuarioNombre: 'Directora Patricia Vélez', rol: 'ADMIN', accion: 'MODIFICAR', modulo: 'Aplicativos', registroAfectadoId: 'mod-4', registroDescripcion: 'Habilitación de aplicativo Control de Asistencia Digital', valorAnterior: 'activo: false', valorNuevo: 'activo: true', ipAddress: '192.168.1.45' },
  { id: 'aud-5', fechaHora: '2026-09-06T16:05:10Z', usuarioId: 'user-formador-2', usuarioNombre: 'Dra. Laura Morales', rol: 'FORMADOR', accion: 'CREAR', modulo: 'Novedades', registroAfectadoId: 'nov-3', registroDescripcion: 'Registro de novedad por incapacidad médica colab-19', valorNuevo: 'Estado: abierta, Tipo: Incapacidad Médica', ipAddress: '192.168.2.19' },
];
