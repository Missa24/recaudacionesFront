/**
 * Módulo: Aranceles
 * Archivo: tipos.ts
 *
 * Contrato de los recursos del esquema `arancel`: tipos de trámite,
 * aranceles, detalles, tarifas, rangos y requisitos.
 */

export interface TipoTramite {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo_vut: string;
  dependencia_ejecutora_id: string | null;
  requiere_hoja_ruta: boolean;
  requiere_derivacion: boolean;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface TipoTramiteDto {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  tipo_vut: string;
  dependencia_ejecutora_id?: string | null;
  requiere_hoja_ruta?: boolean;
  requiere_derivacion?: boolean;
}

export interface ArancelGeneral {
  id: string;
  dependencia_id: string;
  nro_arancel_gral: string;
  descripcion: string;
  cuenta_destino_id: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ArancelGeneralDto {
  dependencia_id: string;
  nro_arancel_gral: string;
  descripcion: string;
  cuenta_destino_id?: string | null;
}

export interface ArancelDetalle {
  id: string;
  arancel_general_id: string;
  tipo_tramite_id: string;
  nro_arancel_det: string;
  descripcion: string;
  monto_variable: boolean;
  unidad_calculo: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ArancelDetalleDto {
  arancel_general_id: string;
  tipo_tramite_id: string;
  nro_arancel_det: string;
  descripcion: string;
  monto_variable?: boolean;
  unidad_calculo?: string | null;
}

export interface Tarifa {
  id: string;
  arancel_det_id: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  monto: number;
  referencia_aprobacion: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface TarifaDto {
  arancel_det_id: string;
  vigente_desde: string;
  vigente_hasta?: string | null;
  monto: number;
  referencia_aprobacion: string;
}

export interface ArancelRango {
  id: string;
  desde: number;
  hasta: number | null;
  base_fija: number;
  porcentaje: number;
  excedente: number;
  tarifa_id: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ArancelRangoDto {
  tarifa_id: string;
  desde: number;
  hasta?: number | null;
  base_fija: number;
  porcentaje: number;
  excedente: number;
}

export interface ArancelRequisito {
  id: string;
  tipo_tramite_id: string;
  requisito_catalogo_id: string;
  obligatorio: boolean;
  orden: number;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface ArancelRequisitoDto {
  tipo_tramite_id: string;
  requisito_catalogo_id: string;
  obligatorio?: boolean;
  orden?: number;
}
