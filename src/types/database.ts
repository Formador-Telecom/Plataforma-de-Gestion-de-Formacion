export type RoleName = 'ADMIN' | 'FORMADOR' | 'CONSULTA';

export interface Role {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: string[]; // e.g. ['certificaciones:create', 'capacitacion:update']
}

export interface User {
  id: string;
  username: string;
  email: string;
  nombreCompleto: string;
  roleId: string;
  formadorId?: string; // If user is linked to a specific Formador profile
  activo: boolean;
  avatarUrl?: string;
  ultimoAcceso: string;
  password?: string;
  cargo?: string;
  telefono?: string;
  createdAt?: string;
}

export interface StoredFile {
  id: string;
  nombre: string;
  tipo: string;
  tamanoBytes: number;
  modulo: 'capacitaciones' | 'certificaciones' | 'novedades' | 'general' | 'respaldo';
  referenciaId?: string;
  referenciaNombre?: string;
  contenidoUrl: string; // Base64 data URI or file reference
  fechaSubida: string;
  subidoPor: string;
  observaciones?: string;
}

export interface Permission {
  id: string;
  codigo: string;
  modulo: string;
  accion: 'create' | 'read' | 'update' | 'delete' | 'export';
  descripcion: string;
}

export interface AppModule {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
  activo: boolean;
  orden: number;
  esSistema: boolean; // Cannot be deleted if system core
  categoria: 'Core' | 'Extensión' | 'Gestión';
  version?: string;
  rolesPermitidos?: string[];
}

export interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  responsable?: string;
  activo: boolean;
  createdAt: string;
}

export interface Area {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  responsable?: string;
  activo: boolean;
  createdAt: string;
}

export interface Cargo {
  id: string;
  nombre: string;
  areaId: string;
  activo: boolean;
}

export interface Formador {
  id: string;
  codigo: string;
  nombreCompleto: string;
  documento: string;
  email: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
  createdAt: string;
}

export interface Colaborador {
  id: string;
  codigoInterno: string;
  documento: string;
  nombreCompleto: string;
  email: string;
  cargo: string;
  proyectoId: string;
  areaId: string;
  fechaIngreso: string;
  activo: boolean;
  telefono?: string;
}

export type CertificationState = 'vigente' | 'proximo_vencer' | 'vencido' | 'no_certificado';

export interface CertificacionCatalogo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  vigenciaMeses: number; // e.g. 12, 24
  exigeEvaluacion: boolean;
  calificacionMinima: number;
  activo: boolean;
}

export interface PersonalCertificacion {
  id: string;
  colaboradorId: string;
  certificacionId: string;
  estado: CertificationState;
  fechaCertificacion?: string;
  fechaVencimiento?: string;
  formadorId?: string;
  codigoCertificado?: string;
  calificacion?: number;
  observaciones?: string;
  evidenciaUrl?: string;
  updatedAt: string;
  updatedBy: string;
}

export type TrainingModality = 'presencial' | 'virtual' | 'mixta';
export type TrainingStatus = 'programada' | 'realizada' | 'cancelada';
export type TrainingResult = 'Aprobado' | 'Reprobado' | 'Asistió' | 'Pendiente';

export interface Capacitacion {
  id: string;
  colaboradorId: string;
  tema: string;
  subtema?: string;
  tipoCapacitacion: string; // e.g. "Normativa", "Técnica", "Habilidades Blandas", "SST"
  fecha: string;
  duracionHoras: number;
  formadorId: string;
  modalidad: TrainingModality;
  estado: TrainingStatus;
  resultado: TrainingResult;
  calificacion?: number;
  observaciones?: string;
  evidenciaArchivo?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export type NovedadStatus = 'abierta' | 'en_seguimiento' | 'cerrada';

export interface TipoNovedad {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface NovedadHistorial {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  comentario: string;
  estadoAnterior?: NovedadStatus;
  estadoNuevo?: NovedadStatus;
}

export interface Novedad {
  id: string;
  colaboradorId: string;
  tipoNovedadId: string;
  fecha: string;
  descripcion: string;
  responsableId: string; // Formador or Admin
  responsableSeguimiento?: string;
  accionesTomadas?: string;
  estado: NovedadStatus;
  fechaCierre?: string;
  observaciones?: string;
  evidencias?: string[];
  historial: NovedadHistorial[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface AuditoriaRegistro {
  id: string;
  fechaHora: string;
  usuarioId: string;
  usuarioNombre: string;
  rol: string;
  accion: 'CREAR' | 'MODIFICAR' | 'ELIMINAR' | 'IMPORTAR' | 'EXPORTAR' | 'LOGIN' | 'LOGOUT' | 'BACKUP' | 'RESTAURAR';
  modulo: string;
  registroAfectadoId: string;
  registroDescripcion: string;
  valorAnterior?: string;
  valorNuevo?: string;
  ipAddress?: string;
}

export interface GlobalParametros {
  nombreOrganizacion: string;
  diasAlertaVencimiento: number; // Days to consider 'proximo_vencer' (e.g. 30)
  diasAvisoVencimiento?: number;
  metaHorasFormacionAnual: number; // Target training hours per collaborator (e.g. 24)
  calificacionMinimaAprobacion: number; // e.g. 80
  permitirAutoRegistroNovedades: boolean;
  periodoActual?: string;
}
