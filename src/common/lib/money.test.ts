import { describe, expect, it } from "vitest";
import {
  calcularIva,
  formatearMonto,
  formatearMontoConMoneda,
  parsearMonto,
  redondear,
} from "./money";

describe("formatearMonto", () => {
  it("usa separador de miles y coma decimal", () => {
    expect(formatearMonto(1234.5)).toBe("1.234,50");
    expect(formatearMonto(2765)).toBe("2.765,00");
  });

  it("acepta textos numéricos del backend", () => {
    expect(formatearMonto("2446.81")).toBe("2.446,81");
  });

  it("devuelve vacío cuando no hay valor", () => {
    expect(formatearMonto(null)).toBe("");
    expect(formatearMonto(undefined)).toBe("");
    expect(formatearMonto("")).toBe("");
    expect(formatearMonto("no es un monto")).toBe("");
  });

  it("agrega el prefijo de moneda", () => {
    expect(formatearMontoConMoneda(100)).toBe("Bs 100,00");
    expect(formatearMontoConMoneda(null)).toBe("");
  });
});

describe("parsearMonto", () => {
  it("interpreta el formato local", () => {
    expect(parsearMonto("1.234,56")).toBe(1234.56);
    expect(parsearMonto("1234,56")).toBe(1234.56);
  });

  it("interpreta el punto como decimal cuando corresponde", () => {
    expect(parsearMonto("1234.56")).toBe(1234.56);
    expect(parsearMonto("0.5")).toBe(0.5);
  });

  it("interpreta el punto como separador de miles en los demás casos", () => {
    expect(parsearMonto("1.234")).toBe(1234);
    expect(parsearMonto("1.234.567")).toBe(1234567);
  });

  it("ignora símbolos de moneda y espacios", () => {
    expect(parsearMonto("Bs 2.765,00")).toBe(2765);
  });

  it("devuelve null si no se puede interpretar", () => {
    expect(parsearMonto("")).toBeNull();
    expect(parsearMonto("abc")).toBeNull();
    expect(parsearMonto(",,")).toBeNull();
  });

  it("ida y vuelta con formatearMonto", () => {
    expect(parsearMonto(formatearMonto(1234567.89))).toBe(1234567.89);
  });
});

describe("redondear", () => {
  it("redondea a dos decimales sin arrastrar error binario", () => {
    expect(redondear(1.005)).toBe(1.01);
    expect(redondear(2.675)).toBe(2.68);
    expect(redondear(10)).toBe(10);
  });
});

describe("calcularIva", () => {
  it("calcula el IVA y el líquido pagable", () => {
    const resultado = calcularIva(2765, 13);

    expect(resultado.montoTotal).toBe(2765);
    expect(resultado.montoIva).toBeCloseTo(359.45, 2);
    expect(resultado.montoLiquidoPagable).toBeCloseTo(2405.55, 2);
  });

  it("el total siempre es la suma de las partes", () => {
    const resultado = calcularIva(1234.56, 13);

    expect(
      redondear(resultado.montoIva + resultado.montoLiquidoPagable, 2),
    ).toBe(resultado.montoTotal);
  });

  it("tolera valores vacíos", () => {
    expect(calcularIva(null, 13)).toEqual({
      montoTotal: 0,
      montoIva: 0,
      montoLiquidoPagable: 0,
    });
  });
});
