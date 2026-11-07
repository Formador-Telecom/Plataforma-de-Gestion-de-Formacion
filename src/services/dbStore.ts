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
  CertificationState,
  NovedadStatus,
  StoredFile,
} from '../types/database';
import {
  INITIAL_PARAMETROS,
  INITIAL_PROYECTOS,
  INITIAL_AREAS,
  INITIAL_FORMADORES,
  INITIAL_CERTIFICACIONES_CATALOGO,
  INITIAL_COLABORADORES,
  INITIAL_PERSONAL_CERTIFICACIONES,
  INITIAL_CAPACITACIONES,
  INITIAL_TIPOS_NOVEDAD,
  INITIAL_NOVEDADES,
  INITIAL_APP_MODULES,
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_AUDITORIA,
  INITIAL_STORED_FILES,
} from './initialData';

const STORAGE_KEY = 'formacion_db_v2';

interface DatabaseSchema {
  parametros: GlobalParametros;
  proyectos: Proyecto[];
  areas: Area[];
  formadores: Formador[];
  certificacionesCatalogo: CertificacionCatalogo[];
  colaboradores: Colaborador[];
  personalCertificaciones: PersonalCertificacion[];
  capacitaciones: Capacitacion[];
  tiposNovedad: TipoNovedad[];
  novedades: Novedad[];
  appModules: AppModule[];
  roles: Role[];
  users: User[];
  auditoria: AuditoriaRegistro[];
  storedFiles: StoredFile[];
}

type Listener = () => void;

class DatabaseService {
  private db: DatabaseSchema;
  private listeners: Listener[] = [];

  constructor() {
    this.db = this.loadFromStorage();
    this.recalculateCertificationStatuses();
  }

  private loadFromStorage(): DatabaseSchema {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DatabaseSchema = JSON.parse(saved);
        // Ensure storedFiles is present
        if (!parsed.storedFiles || !Array.isArray(parsed.storedFiles)) {
          parsed.storedFiles = INITIAL_STORED_FILES;
        }
        // Ensure all users have credentials & sync admin name with initialData
        if (parsed.users && Array.isArray(parsed.users)) {
          parsed.users = parsed.users.map((u) => {
            const initUser = INITIAL_USERS.find((iu) => iu.id === u.id);
            return {
              ...u,
              password: u.password || (initUser ? initUser.password : '123456'),
              cargo: u.cargo || (initUser ? initUser.cargo : 'Colaborador'),
              telefono: u.telefono || (initUser ? initUser.telefono : ''),
              nombreCompleto: (u.id === 'user-admin' && initUser) ? initUser.nombreCompleto : u.nombreCompleto,
            };
          });
        }
        return parsed;
      }
    } catch {
      console.warn('Could not read from localStorage, using initial dataset.');
    }
    return this.getDefaultData();
  }

  private getDefaultData(): DatabaseSchema {
    return {
      parametros: INITIAL_PARAMETROS,
      proyectos: INITIAL_PROYECTOS,
      areas: INITIAL_AREAS,
      formadores: INITIAL_FORMADORES,
      certificacionesCatalogo: INITIAL_CERTIFICACIONES_CATALOGO,
      colaboradores: INITIAL_COLABORADORES,
      personalCertificaciones: INITIAL_PERSONAL_CERTIFICACIONES,
      capacitaciones: INITIAL_CAPACITACIONES,
      tiposNovedad: INITIAL_TIPOS_NOVEDAD,
      novedades: INITIAL_NOVEDADES,
      appModules: INITIAL_APP_MODULES,
      roles: INITIAL_ROLES,
      users: INITIAL_USERS,
      auditoria: INITIAL_AUDITORIA,
      storedFiles: INITIAL_STORED_FILES,
    };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    } catch (e) {
      console.error('Error persisting database to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener callback error', e);
      }
    });
  }

  public resetToDemoData() {
    this.db = this.getDefaultData();
    this.persist();
  }

  // Auto calculate and update certification statuses (vigente, proximo_vencer, vencido) based on expiration date
  public recalculateCertificationStatuses() {
    const today = new Date();
    const thresholdDays = this.db.parametros.diasAlertaVencimiento || 30;

    let modified = false;
    this.db.personalCertificaciones = this.db.personalCertificaciones.map((pc) => {
      if (pc.estado === 'no_certificado' || !pc.fechaVencimiento) {
        return pc;
      }
      const expDate = new Date(pc.fechaVencimiento);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let calculatedState: CertificationState = 'vigente';
      if (diffDays < 0) {
        calculatedState = 'vencido';
      } else if (diffDays <= thresholdDays) {
        calculatedState = 'proximo_vencer';
      } else {
        calculatedState = 'vigente';
      }

      if (pc.estado !== calculatedState) {
        modified = true;
        return { ...pc, estado: calculatedState };
      }
      return pc;
    });

    if (modified) {
      this.persist();
    }
  }

  // ----------------- AUDITORÍA -----------------
  public logAudit(entry: {
    usuarioId: string;
    usuarioNombre: string;
    rol: string;
    accion: AuditoriaRegistro['accion'];
    modulo: string;
    registroAfectadoId: string;
    registroDescripcion: string;
    valorAnterior?: string;
    valorNuevo?: string;
  }) {
    const auditRecord: AuditoriaRegistro = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fechaHora: new Date().toISOString(),
      ...entry,
    };
    this.db.auditoria.unshift(auditRecord);
    if (this.db.auditoria.length > 500) {
      this.db.auditoria = this.db.auditoria.slice(0, 500);
    }
    this.persist();
  }

  // ----------------- GETTERS -----------------
  public getParametros(): GlobalParametros {
    return { ...this.db.parametros };
  }

  public updateParametros(params: Partial<GlobalParametros>, currentUser: User) {
    const anterior = JSON.stringify(this.db.parametros);
    this.db.parametros = { ...this.db.parametros, ...params };
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Parámetros del Sistema',
      registroAfectadoId: 'config-global',
      registroDescripcion: 'Actualización de parámetros generales de formación',
      valorAnterior: anterior,
      valorNuevo: JSON.stringify(this.db.parametros),
    });
    this.recalculateCertificationStatuses();
    this.persist();
  }

  public getProyectos(): Proyecto[] {
    return [...this.db.proyectos];
  }

  public getAreas(): Area[] {
    return [...this.db.areas];
  }

  public getFormadores(): Formador[] {
    return [...this.db.formadores];
  }

  public getCertificacionesCatalogo(): CertificacionCatalogo[] {
    return [...this.db.certificacionesCatalogo];
  }

  public getColaboradores(): Colaborador[] {
    return [...this.db.colaboradores];
  }

  public getPersonalCertificaciones(): PersonalCertificacion[] {
    return [...this.db.personalCertificaciones];
  }

  public getCapacitaciones(): Capacitacion[] {
    return [...this.db.capacitaciones];
  }

  public getTiposNovedad(): TipoNovedad[] {
    return [...this.db.tiposNovedad];
  }

  public getNovedades(): Novedad[] {
    return [...this.db.novedades];
  }

  public getAppModules(): AppModule[] {
    return [...this.db.appModules].sort((a, b) => a.orden - b.orden);
  }

  public getRoles(): Role[] {
    return [...this.db.roles];
  }

  public getUsers(): User[] {
    return [...this.db.users];
  }

  public getAuditoria(): AuditoriaRegistro[] {
    return [...this.db.auditoria];
  }

  public getStoredFiles(): StoredFile[] {
    return [...(this.db.storedFiles || [])];
  }

  // ----------------- RELATIONAL ENRICHED DATA -----------------
  public getEnrichedColaboradores() {
    const proyectosMap = new Map(this.db.proyectos.map((p) => [p.id, p]));
    const areasMap = new Map(this.db.areas.map((a) => [a.id, a]));
    const formadoresMap = new Map(this.db.formadores.map((f) => [f.id, f]));
    const certCatalogoMap = new Map(this.db.certificacionesCatalogo.map((c) => [c.id, c]));

    return this.db.colaboradores.map((colab) => {
      const proyecto = proyectosMap.get(colab.proyectoId);
      const area = areasMap.get(colab.areaId);

      // Certificaciones
      const certs = this.db.personalCertificaciones
        .filter((pc) => pc.colaboradorId === colab.id)
        .map((pc) => {
          const certInfo = certCatalogoMap.get(pc.certificacionId);
          const formador = pc.formadorId ? formadoresMap.get(pc.formadorId) : undefined;
          return {
            ...pc,
            certificacionNombre: certInfo?.nombre || 'Certificación no encontrada',
            certificacionCodigo: certInfo?.codigo || 'N/A',
            formadorNombre: formador?.nombreCompleto || 'Sin asignar',
          };
        });

      // Overall certification state for the collaborator
      let estadoGeneral: CertificationState = 'no_certificado';
      if (certs.length > 0) {
        if (certs.some((c) => c.estado === 'vencido')) {
          estadoGeneral = 'vencido';
        } else if (certs.some((c) => c.estado === 'proximo_vencer')) {
          estadoGeneral = 'proximo_vencer';
        } else if (certs.some((c) => c.estado === 'vigente')) {
          estadoGeneral = 'vigente';
        }
      }

      // Capacitaciones
      const capacitaciones = this.db.capacitaciones.filter((cap) => cap.colaboradorId === colab.id);
      const horasTotales = capacitaciones
        .filter((cap) => cap.estado === 'realizada')
        .reduce((sum, cap) => sum + (cap.duracionHoras || 0), 0);

      // Novedades
      const novedades = this.db.novedades.filter((nov) => nov.colaboradorId === colab.id);
      const novedadesAbiertas = novedades.filter((nov) => nov.estado !== 'cerrada').length;

      return {
        ...colab,
        proyectoNombre: proyecto?.nombre || 'Sin Proyecto',
        areaNombre: area?.nombre || 'Sin Área',
        certificaciones: certs,
        estadoCertificacion: estadoGeneral,
        capacitacionesCount: capacitaciones.length,
        horasFormacion: horasTotales,
        novedadesCount: novedades.length,
        novedadesAbiertas,
      };
    });
  }

  // ----------------- CRUD CERTIFICACIONES -----------------
  public createPersonalCertificacion(
    data: Omit<PersonalCertificacion, 'id' | 'updatedAt' | 'updatedBy'>,
    currentUser: User
  ): PersonalCertificacion {
    const id = `pc-${Date.now()}`;
    const newRecord: PersonalCertificacion = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
    };
    this.db.personalCertificaciones.push(newRecord);
    this.recalculateCertificationStatuses();

    const colab = this.db.colaboradores.find((c) => c.id === data.colaboradorId);
    const certCat = this.db.certificacionesCatalogo.find((cc) => cc.id === data.certificacionId);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Certificaciones',
      registroAfectadoId: id,
      registroDescripcion: `Asignación de certificación ${certCat?.nombre || data.certificacionId} a ${colab?.nombreCompleto || data.colaboradorId}`,
      valorNuevo: JSON.stringify(newRecord),
    });

    this.persist();
    return newRecord;
  }

  public updatePersonalCertificacion(
    id: string,
    data: Partial<PersonalCertificacion>,
    currentUser: User
  ) {
    const index = this.db.personalCertificaciones.findIndex((pc) => pc.id === id);
    if (index === -1) throw new Error('Certificación no encontrada');

    const anterior = JSON.stringify(this.db.personalCertificaciones[index]);
    this.db.personalCertificaciones[index] = {
      ...this.db.personalCertificaciones[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
    };

    this.recalculateCertificationStatuses();

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Certificaciones',
      registroAfectadoId: id,
      registroDescripcion: `Actualización de certificación ID: ${id}`,
      valorAnterior: anterior,
      valorNuevo: JSON.stringify(this.db.personalCertificaciones[index]),
    });

    this.persist();
    return this.db.personalCertificaciones[index];
  }

  public deletePersonalCertificacion(id: string, currentUser: User) {
    const item = this.db.personalCertificaciones.find((pc) => pc.id === id);
    if (!item) return;

    this.db.personalCertificaciones = this.db.personalCertificaciones.filter((pc) => pc.id !== id);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'ELIMINAR',
      modulo: 'Certificaciones',
      registroAfectadoId: id,
      registroDescripcion: `Eliminación de certificación ID: ${id}`,
      valorAnterior: JSON.stringify(item),
    });

    this.persist();
  }

  // ----------------- CRUD CAPACITACIONES -----------------
  public createCapacitacion(
    data: Omit<Capacitacion, 'id' | 'createdAt' | 'createdBy' | 'updatedAt'>,
    currentUser: User
  ): Capacitacion {
    const id = `cap-${Date.now()}`;
    const newCap: Capacitacion = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    };
    this.db.capacitaciones.unshift(newCap);

    const colab = this.db.colaboradores.find((c) => c.id === data.colaboradorId);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Capacitaciones',
      registroAfectadoId: id,
      registroDescripcion: `Registro de capacitación '${data.tema}' para ${colab?.nombreCompleto || data.colaboradorId}`,
      valorNuevo: JSON.stringify(newCap),
    });

    this.persist();
    return newCap;
  }

  public updateCapacitacion(id: string, data: Partial<Capacitacion>, currentUser: User) {
    const index = this.db.capacitaciones.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Capacitación no encontrada');

    const anterior = JSON.stringify(this.db.capacitaciones[index]);
    this.db.capacitaciones[index] = {
      ...this.db.capacitaciones[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Capacitaciones',
      registroAfectadoId: id,
      registroDescripcion: `Modificación de capacitación '${this.db.capacitaciones[index].tema}'`,
      valorAnterior: anterior,
      valorNuevo: JSON.stringify(this.db.capacitaciones[index]),
    });

    this.persist();
    return this.db.capacitaciones[index];
  }

  public deleteCapacitacion(id: string, currentUser: User) {
    const item = this.db.capacitaciones.find((c) => c.id === id);
    if (!item) return;

    this.db.capacitaciones = this.db.capacitaciones.filter((c) => c.id !== id);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'ELIMINAR',
      modulo: 'Capacitaciones',
      registroAfectadoId: id,
      registroDescripcion: `Eliminación de capacitación '${item.tema}'`,
      valorAnterior: JSON.stringify(item),
    });

    this.persist();
  }

  // ----------------- CRUD NOVEDADES -----------------
  public createNovedad(
    data: Omit<Novedad, 'id' | 'historial' | 'createdAt' | 'createdBy' | 'updatedAt'>,
    currentUser: User
  ): Novedad {
    const id = `nov-${Date.now()}`;
    const newNov: Novedad = {
      ...data,
      id,
      historial: [
        {
          id: `h-${Date.now()}`,
          fecha: new Date().toISOString(),
          usuario: currentUser.nombreCompleto,
          accion: 'Registro inicial',
          comentario: data.descripcion,
          estadoNuevo: data.estado,
        },
      ],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    };

    this.db.novedades.unshift(newNov);

    const colab = this.db.colaboradores.find((c) => c.id === data.colaboradorId);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Novedades',
      registroAfectadoId: id,
      registroDescripcion: `Apertura de novedad para ${colab?.nombreCompleto || data.colaboradorId}`,
      valorNuevo: JSON.stringify(newNov),
    });

    this.persist();
    return newNov;
  }

  public updateNovedad(
    id: string,
    data: Partial<Novedad> & { comentarioHistorial?: string },
    currentUser: User
  ) {
    const index = this.db.novedades.findIndex((n) => n.id === id);
    if (index === -1) throw new Error('Novedad no encontrada');

    const anterior = { ...this.db.novedades[index] };
    const prevStatus = anterior.estado;
    const newStatus = data.estado || prevStatus;

    const historial = [...anterior.historial];
    if (data.comentarioHistorial || prevStatus !== newStatus) {
      historial.push({
        id: `h-${Date.now()}`,
        fecha: new Date().toISOString(),
        usuario: currentUser.nombreCompleto,
        accion: prevStatus !== newStatus ? `Cambio a ${newStatus}` : 'Seguimiento registrado',
        comentario: data.comentarioHistorial || data.observaciones || 'Actualización de registro',
        estadoAnterior: prevStatus,
        estadoNuevo: newStatus,
      });
    }

    const { comentarioHistorial, ...fieldsToUpdate } = data;

    this.db.novedades[index] = {
      ...this.db.novedades[index],
      ...fieldsToUpdate,
      historial,
      fechaCierre: newStatus === 'cerrada' ? (data.fechaCierre || new Date().toISOString().split('T')[0]) : undefined,
      updatedAt: new Date().toISOString(),
    };

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Novedades',
      registroAfectadoId: id,
      registroDescripcion: `Actualización de novedad ID: ${id} (${prevStatus} -> ${newStatus})`,
      valorAnterior: JSON.stringify(anterior),
      valorNuevo: JSON.stringify(this.db.novedades[index]),
    });

    this.persist();
    return this.db.novedades[index];
  }

  public deleteNovedad(id: string, currentUser: User) {
    const item = this.db.novedades.find((n) => n.id === id);
    if (!item) return;

    this.db.novedades = this.db.novedades.filter((n) => n.id !== id);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'ELIMINAR',
      modulo: 'Novedades',
      registroAfectadoId: id,
      registroDescripcion: `Eliminación de novedad ID: ${id}`,
      valorAnterior: JSON.stringify(item),
    });

    this.persist();
  }

  // ----------------- CRUD TIPOS DE NOVEDAD -----------------
  public createTipoNovedad(data: Omit<TipoNovedad, 'id'>, currentUser: User) {
    const id = `tnov-${Date.now()}`;
    const newTipo: TipoNovedad = { id, ...data };
    this.db.tiposNovedad.push(newTipo);
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Catálogos',
      registroAfectadoId: id,
      registroDescripcion: `Creación de tipo de novedad '${data.nombre}'`,
      valorNuevo: JSON.stringify(newTipo),
    });
    this.persist();
    return newTipo;
  }

  public updateTipoNovedad(id: string, data: Partial<TipoNovedad>, currentUser: User) {
    const index = this.db.tiposNovedad.findIndex((t) => t.id === id);
    if (index === -1) return;
    const anterior = JSON.stringify(this.db.tiposNovedad[index]);
    this.db.tiposNovedad[index] = { ...this.db.tiposNovedad[index], ...data };
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Catálogos',
      registroAfectadoId: id,
      registroDescripcion: `Modificación de tipo de novedad '${this.db.tiposNovedad[index].nombre}'`,
      valorAnterior: anterior,
      valorNuevo: JSON.stringify(this.db.tiposNovedad[index]),
    });
    this.persist();
  }

  // ----------------- APLICATIVOS / MODULAR PLATFORM -----------------
  public toggleAppModule(id: string, activo: boolean, currentUser: User) {
    const mod = this.db.appModules.find((m) => m.id === id);
    if (!mod) return;
    const anterior = mod.activo;
    mod.activo = activo;

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Administración de Aplicativos',
      registroAfectadoId: id,
      registroDescripcion: `${activo ? 'Activación' : 'Desactivación'} de aplicativo '${mod.nombre}'`,
      valorAnterior: `activo: ${anterior}`,
      valorNuevo: `activo: ${activo}`,
    });

    this.persist();
  }

  public createAppModule(data: Omit<AppModule, 'id'>, currentUser: User): AppModule {
    const id = `mod-${Date.now()}`;
    const newMod: AppModule = { ...data, id };
    this.db.appModules.push(newMod);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Administración de Aplicativos',
      registroAfectadoId: id,
      registroDescripcion: `Creación e integración de nuevo aplicativo '${data.nombre}'`,
      valorNuevo: JSON.stringify(newMod),
    });

    this.persist();
    return newMod;
  }

  public updateAppModule(id: string, data: Partial<AppModule>, currentUser: User) {
    const idx = this.db.appModules.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const anterior = JSON.stringify(this.db.appModules[idx]);
    this.db.appModules[idx] = { ...this.db.appModules[idx], ...data };

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Administración de Aplicativos',
      registroAfectadoId: id,
      registroDescripcion: `Modificación de parámetros del aplicativo '${this.db.appModules[idx].nombre}'`,
      valorAnterior: anterior,
      valorNuevo: JSON.stringify(this.db.appModules[idx]),
    });

    this.persist();
  }

  public updateRolePermisos(roleId: string, permisos: string[], currentUser: User) {
    const role = this.db.roles.find((r) => r.id === roleId);
    if (!role) return;
    const anterior = JSON.stringify(role.permisos);
    role.permisos = permisos;

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Roles y Permisos',
      registroAfectadoId: roleId,
      registroDescripcion: `Actualización de matriz de permisos para rol '${role.nombre}'`,
      valorAnterior: anterior,
      valorNuevo: JSON.stringify(permisos),
    });

    this.persist();
  }

  // ----------------- CRUD PROYECTOS & AREAS & FORMADORES -----------------
  public createProyecto(data: Omit<Proyecto, 'id' | 'createdAt'>, currentUser: User) {
    const id = `proj-${Date.now()}`;
    const p: Proyecto = { ...data, id, createdAt: new Date().toISOString() };
    this.db.proyectos.push(p);
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Catálogo de Proyectos',
      registroAfectadoId: id,
      registroDescripcion: `Creación de proyecto '${data.nombre}'`,
      valorNuevo: JSON.stringify(p),
    });
    this.persist();
    return p;
  }

  public createArea(data: Omit<Area, 'id' | 'createdAt'>, currentUser: User) {
    const id = `area-${Date.now()}`;
    const a: Area = { ...data, id, createdAt: new Date().toISOString() };
    this.db.areas.push(a);
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Catálogo de Áreas',
      registroAfectadoId: id,
      registroDescripcion: `Creación de área '${data.nombre}'`,
      valorNuevo: JSON.stringify(a),
    });
    this.persist();
    return a;
  }

  public createFormador(data: Omit<Formador, 'id' | 'createdAt'>, currentUser: User) {
    const id = `form-${Date.now()}`;
    const f: Formador = { ...data, id, createdAt: new Date().toISOString() };
    this.db.formadores.push(f);
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Catálogo de Formadores',
      registroAfectadoId: id,
      registroDescripcion: `Registro de nuevo formador '${data.nombreCompleto}'`,
      valorNuevo: JSON.stringify(f),
    });
    this.persist();
    return f;
  }

  public createCertificacionCatalogo(data: Omit<CertificacionCatalogo, 'id'>, currentUser: User) {
    const id = `cert-cat-${Date.now()}`;
    const c: CertificacionCatalogo = { ...data, id };
    this.db.certificacionesCatalogo.push(c);
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Catálogo de Certificaciones',
      registroAfectadoId: id,
      registroDescripcion: `Alta de estándar de certificación '${data.nombre}'`,
      valorNuevo: JSON.stringify(c),
    });
    this.persist();
    return c;
  }

  // ----------------- BULK IMPORT COMMIT -----------------
  public commitImportedData(
    items: {
      type: 'colaboradores' | 'certificaciones' | 'capacitaciones';
      records: any[];
    },
    currentUser: User
  ) {
    const { type, records } = items;
    let insertedCount = 0;

    if (type === 'colaboradores') {
      records.forEach((rec) => {
        const id = `colab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        this.db.colaboradores.push({
          id,
          codigoInterno: rec.codigoInterno || `EMP-${Date.now()}`,
          documento: String(rec.documento),
          nombreCompleto: rec.nombreCompleto,
          email: rec.email || `${rec.documento}@empresa.com`,
          cargo: rec.cargo || 'Operario',
          proyectoId: rec.proyectoId || this.db.proyectos[0]?.id || 'proj-1',
          areaId: rec.areaId || this.db.areas[0]?.id || 'area-1',
          fechaIngreso: rec.fechaIngreso || new Date().toISOString().split('T')[0],
          activo: true,
          telefono: rec.telefono || '',
        });
        insertedCount++;
      });
    } else if (type === 'certificaciones') {
      records.forEach((rec) => {
        const id = `pc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        this.db.personalCertificaciones.push({
          id,
          colaboradorId: rec.colaboradorId,
          certificacionId: rec.certificacionId,
          estado: rec.estado || 'vigente',
          fechaCertificacion: rec.fechaCertificacion,
          fechaVencimiento: rec.fechaVencimiento,
          formadorId: rec.formadorId,
          codigoCertificado: rec.codigoCertificado || `CRT-${Date.now().toString().slice(-4)}`,
          calificacion: rec.calificacion ? Number(rec.calificacion) : 90,
          observaciones: rec.observaciones || 'Importado por lote',
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.id,
        });
        insertedCount++;
      });
      this.recalculateCertificationStatuses();
    } else if (type === 'capacitaciones') {
      records.forEach((rec) => {
        const id = `cap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        this.db.capacitaciones.unshift({
          id,
          colaboradorId: rec.colaboradorId,
          tema: rec.tema,
          subtema: rec.subtema || '',
          tipoCapacitacion: rec.tipoCapacitacion || 'Normativa / SST',
          fecha: rec.fecha || new Date().toISOString().split('T')[0],
          duracionHoras: Number(rec.duracionHoras) || 4,
          formadorId: rec.formadorId || this.db.formadores[0]?.id || 'form-1',
          modalidad: rec.modalidad || 'presencial',
          estado: rec.estado || 'realizada',
          resultado: rec.resultado || 'Aprobado',
          calificacion: rec.calificacion ? Number(rec.calificacion) : undefined,
          observaciones: rec.observaciones || 'Importado por lote masivo',
          createdAt: new Date().toISOString(),
          createdBy: currentUser.id,
          updatedAt: new Date().toISOString(),
        });
        insertedCount++;
      });
    }

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'IMPORTAR',
      modulo: 'Importación Masiva',
      registroAfectadoId: `batch-${Date.now()}`,
      registroDescripcion: `Importación exitosa de ${insertedCount} registros de ${type}`,
      valorNuevo: `Registros importados: ${insertedCount}`,
    });

    this.persist();
    return insertedCount;
  }

  public addSeguimientoNovedad(
    novedadId: string,
    comentarioOrObj: string | { comentario: string; nuevoEstado?: NovedadStatus },
    nuevoEstadoOrUser?: NovedadStatus | User,
    accionesTomadas?: string,
    userParam?: User
  ) {
    if (typeof comentarioOrObj === 'object') {
      const u = nuevoEstadoOrUser as User;
      return this.updateNovedad(
        novedadId,
        {
          estado: comentarioOrObj.nuevoEstado,
          comentarioHistorial: comentarioOrObj.comentario,
        },
        u
      );
    }

    const comentario = comentarioOrObj;
    const estado = nuevoEstadoOrUser as NovedadStatus;
    const user = userParam as User;

    return this.updateNovedad(
      novedadId,
      {
        estado,
        accionesTomadas,
        comentarioHistorial: comentario,
      },
      user
    );
  }

  public bulkInsert(type: string, records: any[], currentUser: User): number {
    const mappedType =
      type === 'personal' || type === 'colaboradores'
        ? 'colaboradores'
        : type === 'capacitaciones'
        ? 'capacitaciones'
        : 'certificaciones';

    return this.commitImportedData(
      {
        type: mappedType,
        records,
      },
      currentUser
    );
  }

  // ----------------- AUTENTICACIÓN Y SESIONES -----------------
  public login(identifier: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const user = this.db.users.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, error: 'Usuario o correo electrónico no encontrado en el sistema.' };
    }

    if (!user.activo) {
      return {
        success: false,
        error: 'Esta cuenta se encuentra inactiva. Comuníquese con el Administrador del sistema.',
      };
    }

    const expectedPassword = user.password || 'admin123';
    if (password !== expectedPassword) {
      return { success: false, error: 'Contraseña incorrecta. Verifique sus credenciales.' };
    }

    // Actualizar último acceso
    user.ultimoAcceso = new Date().toISOString();
    this.logAudit({
      usuarioId: user.id,
      usuarioNombre: user.nombreCompleto,
      rol: user.roleId,
      accion: 'LOGIN',
      modulo: 'Autenticación',
      registroAfectadoId: user.id,
      registroDescripcion: `Inicio de sesión exitoso del usuario ${user.nombreCompleto}`,
    });

    this.persist();
    return { success: true, user: { ...user } };
  }

  public logout(currentUser: User): void {
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'LOGOUT',
      modulo: 'Autenticación',
      registroAfectadoId: currentUser.id,
      registroDescripcion: `Cierre de sesión seguro de ${currentUser.nombreCompleto}`,
    });
    this.persist();
  }

  // ----------------- CRUD DE USUARIOS -----------------
  public createUser(
    userData: {
      username: string;
      email: string;
      nombreCompleto: string;
      roleId: string;
      password?: string;
      formadorId?: string;
      cargo?: string;
      telefono?: string;
      activo?: boolean;
    },
    currentUser: User
  ): { success: boolean; user?: User; error?: string } {
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    // Validar duplicados
    const existingUsername = this.db.users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existingUsername) {
      return { success: false, error: `El nombre de usuario '${userData.username}' ya está en uso.` };
    }

    const existingEmail = this.db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return { success: false, error: `El correo electrónico '${userData.email}' ya está registrado.` };
    }

    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      username: userData.username.trim(),
      email: userData.email.trim(),
      nombreCompleto: userData.nombreCompleto.trim(),
      roleId: userData.roleId,
      password: userData.password || '123456',
      formadorId: userData.formadorId,
      cargo: userData.cargo?.trim() || 'Colaborador',
      telefono: userData.telefono?.trim() || '',
      activo: userData.activo !== undefined ? userData.activo : true,
      ultimoAcceso: 'Nunca',
      createdAt: new Date().toISOString(),
    };

    this.db.users.push(newUser);

    const roleName = this.db.roles.find((r) => r.id === newUser.roleId)?.nombre || newUser.roleId;
    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Gestión de Usuarios',
      registroAfectadoId: newUser.id,
      registroDescripcion: `Creación de cuenta para ${newUser.nombreCompleto} con rol ${roleName}`,
      valorNuevo: JSON.stringify({ username: newUser.username, email: newUser.email, role: roleName }),
    });

    this.persist();
    return { success: true, user: newUser };
  }

  public updateUser(
    userId: string,
    data: Partial<User>,
    currentUser: User
  ): { success: boolean; user?: User; error?: string } {
    const index = this.db.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'Usuario no encontrado en la base de datos.' };
    }

    const current = this.db.users[index];

    // Verificar duplicado de username si cambió
    if (data.username && data.username.toLowerCase() !== current.username.toLowerCase()) {
      const dup = this.db.users.find(
        (u) => u.id !== userId && u.username.toLowerCase() === data.username!.toLowerCase().trim()
      );
      if (dup) {
        return { success: false, error: `El nombre de usuario '${data.username}' ya está asignado a otra cuenta.` };
      }
    }

    // Verificar duplicado de email si cambió
    if (data.email && data.email.toLowerCase() !== current.email.toLowerCase()) {
      const dup = this.db.users.find(
        (u) => u.id !== userId && u.email.toLowerCase() === data.email!.toLowerCase().trim()
      );
      if (dup) {
        return { success: false, error: `El correo electrónico '${data.email}' ya pertenece a otro usuario.` };
      }
    }

    const prevInfo = JSON.stringify({
      nombreCompleto: current.nombreCompleto,
      roleId: current.roleId,
      activo: current.activo,
      email: current.email,
    });

    const updatedUser: User = {
      ...current,
      ...data,
      id: current.id, // Immutable
    };

    this.db.users[index] = updatedUser;

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Gestión de Usuarios',
      registroAfectadoId: userId,
      registroDescripcion: `Actualización de datos para usuario ${updatedUser.nombreCompleto}`,
      valorAnterior: prevInfo,
      valorNuevo: JSON.stringify({
        nombreCompleto: updatedUser.nombreCompleto,
        roleId: updatedUser.roleId,
        activo: updatedUser.activo,
        email: updatedUser.email,
      }),
    });

    this.persist();
    return { success: true, user: updatedUser };
  }

  public deleteUser(userId: string, currentUser: User): { success: boolean; error?: string } {
    if (userId === currentUser.id) {
      return { success: false, error: 'No es posible eliminar la cuenta del usuario que tiene la sesión activa actualmente.' };
    }

    const userToDelete = this.db.users.find((u) => u.id === userId);
    if (!userToDelete) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    // Proteger si es el último administrador
    if (userToDelete.roleId === 'role-admin') {
      const adminCount = this.db.users.filter((u) => u.roleId === 'role-admin' && u.activo).length;
      if (adminCount <= 1) {
        return {
          success: false,
          error: 'No se puede eliminar el único Administrador activo del sistema.',
        };
      }
    }

    this.db.users = this.db.users.filter((u) => u.id !== userId);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'ELIMINAR',
      modulo: 'Gestión de Usuarios',
      registroAfectadoId: userId,
      registroDescripcion: `Eliminación de la cuenta de usuario ${userToDelete.nombreCompleto} (${userToDelete.username})`,
    });

    this.persist();
    return { success: true };
  }

  public toggleUserStatus(userId: string, currentUser: User): { success: boolean; user?: User; error?: string } {
    if (userId === currentUser.id) {
      return { success: false, error: 'No puedes desactivar tu propia cuenta en sesión.' };
    }

    const user = this.db.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    user.activo = !user.activo;

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Gestión de Usuarios',
      registroAfectadoId: userId,
      registroDescripcion: `${user.activo ? 'Activación' : 'Desactivación'} de la cuenta de ${user.nombreCompleto}`,
      valorNuevo: `Estado: ${user.activo ? 'Activo' : 'Inactivo'}`,
    });

    this.persist();
    return { success: true, user };
  }

  public changeUserPassword(
    userId: string,
    newPassword: string,
    currentUser: User
  ): { success: boolean; error?: string } {
    const user = this.db.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }

    user.password = newPassword.trim();

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'MODIFICAR',
      modulo: 'Gestión de Usuarios',
      registroAfectadoId: userId,
      registroDescripcion: `Cambio de contraseña para el usuario ${user.nombreCompleto} (${user.username})`,
    });

    this.persist();
    return { success: true };
  }

  // ----------------- GESTIÓN DE ARCHIVOS Y DOCUMENTOS -----------------
  public uploadStoredFile(
    fileData: Omit<StoredFile, 'id' | 'fechaSubida'>,
    currentUser: User
  ): StoredFile {
    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newFile: StoredFile = {
      ...fileData,
      id,
      fechaSubida: new Date().toISOString(),
    };

    if (!this.db.storedFiles) {
      this.db.storedFiles = [];
    }

    this.db.storedFiles.unshift(newFile);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'CREAR',
      modulo: 'Almacenamiento de Archivos',
      registroAfectadoId: id,
      registroDescripcion: `Carga de archivo digital '${newFile.nombre}' en módulo ${newFile.modulo}`,
      valorNuevo: JSON.stringify({ nombre: newFile.nombre, tamano: newFile.tamanoBytes }),
    });

    this.persist();
    return newFile;
  }

  public deleteStoredFile(fileId: string, currentUser: User): boolean {
    const file = this.db.storedFiles?.find((f) => f.id === fileId);
    if (!file) return false;

    this.db.storedFiles = this.db.storedFiles.filter((f) => f.id !== fileId);

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'ELIMINAR',
      modulo: 'Almacenamiento de Archivos',
      registroAfectadoId: fileId,
      registroDescripcion: `Eliminación de archivo digital '${file.nombre}'`,
    });

    this.persist();
    return true;
  }

  // ----------------- RESPALDO Y RESTAURACIÓN DE LA BASE DE DATOS -----------------
  public exportDatabaseBackup(currentUser: User): string {
    const backupData = JSON.stringify(
      {
        version: '2.0',
        fechaExportacion: new Date().toISOString(),
        generadoPor: currentUser.nombreCompleto,
        database: this.db,
      },
      null,
      2
    );

    this.logAudit({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombreCompleto,
      rol: currentUser.roleId,
      accion: 'BACKUP',
      modulo: 'Base de Datos',
      registroAfectadoId: 'db-backup',
      registroDescripcion: `Generación y descarga de respaldo completo de la base de datos institucional`,
    });

    this.persist();
    return backupData;
  }

  public importDatabaseBackup(
    backupJson: string,
    currentUser: User
  ): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(backupJson);
      const targetDb: DatabaseSchema = parsed.database ? parsed.database : parsed;

      // Validación básica de estructura
      if (
        !targetDb.colaboradores ||
        !targetDb.personalCertificaciones ||
        !targetDb.capacitaciones ||
        !targetDb.users ||
        !targetDb.roles
      ) {
        return {
          success: false,
          error: 'El archivo de respaldo no contiene la estructura requerida de tablas de la plataforma.',
        };
      }

      this.db = targetDb;
      this.recalculateCertificationStatuses();

      this.logAudit({
        usuarioId: currentUser.id,
        usuarioNombre: currentUser.nombreCompleto,
        rol: currentUser.roleId,
        accion: 'RESTAURAR',
        modulo: 'Base de Datos',
        registroAfectadoId: 'db-restore',
        registroDescripcion: `Restauración total de la base de datos desde archivo de respaldo externo`,
      });

      this.persist();
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'El archivo cargado no es un JSON válido o está corrupto.',
      };
    }
  }
}

export const dbService = new DatabaseService();
