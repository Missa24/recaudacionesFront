/**
 * Módulo: Catálogos
 * Archivo: tipos.ts
 *
 * Contrato de los catálogos maestros del esquema `catalogo`. Los nombres
 * respetan las respuestas del backend (snake_case) y los DTO de entrada.
 */

export interface Banco {
  id: string;
  nombre: string;
  codigo_bc: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface BancoDto {
  nombre: string;
  codigo_bc?: string;
}

export interface Dependencia {
  id: string;
  codigo: string;
  nombre: string;
  abreviacion: string;
  es_unidad_desconcentrada: boolean;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface DependenciaDto {
  codigo: string;
  nombre: string;
  abreviacion: string;
}

export interface CuentaBancaria {
  id: string;
  banco_id: string;
  dependencia_id: string | null;
  nro_cuenta: string;
  nombre_cuenta: string;
  tipo: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface CuentaBancariaDto {
  banco_id: string;
  dependencia_id?: string | null;
  nro_cuenta: string;
  nombre_cuenta: string;
  tipo: string;
}

export interface Interes {
  id: string;
  fecha_publicacion: string;
  valor: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface InteresDto {
  fecha_publicacion: string;
  valor: number;
}

export interface Calendario {
  id: string;
  fecha: string;
  dia_habil: boolean;
  descripcion: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface CalendarioDto {
  fecha: string;
  habil?: boolean;
  descripcion?: string | null;
}

export interface PersonaNatural {
  id: string;
  tipo_documento: string;
  numero_documento: string;
  complemento: string;
  expedido: string;
  nombres: string;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  apellido_casada: string | null;
  domicilio: string | null;
  telefono: string | null;
  email: string | null;
  fecha_nacimiento: string | null;
  estado_civil: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface PersonaNaturalDto {
  tipo_documento: string;
  numero_documento: string;
  complemento?: string;
  expedido?: string;
  nombres: string;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  apellido_casada?: string | null;
  domicilio?: string | null;
  telefono?: string | null;
  email?: string | null;
  fecha_nacimiento?: string | null;
  estado_civil?: string;
}

export interface PersonaJuridica {
  id: string;
  nit: string;
  razon_social: string;
  domicilio: string | null;
  telefono: string | null;
  email: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface PersonaJuridicaDto {
  nit: string;
  razon_social: string;
  domicilio?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface RequisitoCatalogo {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
  responsable_eliminacion: string | null;
}

export interface RequisitoCatalogoDto {
  codigo: string;
  descripcion: string;
}

export interface Ufv {
  id: string;
  fecha: string;
  valor: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface UfvDto {
  fecha: string;
  valor: number;
}
