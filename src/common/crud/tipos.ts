/**
 * Módulo: Común / CRUD
 * Archivo: tipos.ts
 *
 * Tipos compartidos por las pantallas de catálogos y aranceles. Permiten
 * describir un formulario con campos simples, selects, fechas, números y
 * booleanos sin escribir un diálogo distinto por entidad.
 */

/** Valor admitido por el formulario genérico. */
export type ValorFormulario = string | boolean;

/** Mapa de valores del formulario indexado por nombre de campo. */
export type ValoresFormulario = Record<string, ValorFormulario>;

/** Tipo de control que renderiza el diálogo. */
export type TipoCampo =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "multiline";

/** Opción de un select. */
export interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

/** Descripción de un campo del formulario. */
export interface CampoFormulario {
  nombre: string;
  etiqueta: string;
  tipo?: TipoCampo;
  requerido?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  opciones?: OpcionSelect[];
  ayuda?: string;
  /** Ancho en la grilla: 12 = fila completa, 6 = media fila. */
  ancho?: 6 | 12;
}

/** Permisos que gobiernan los botones de una tabla de recurso. */
export interface PermisosRecurso {
  crear: string;
  editar: string;
  estado: string;
}
