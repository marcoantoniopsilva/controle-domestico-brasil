import { CreditCard } from "lucide-react";
import nubankIcon from "@/assets/banks/nubank.png.asset.json";
import itauIcon from "@/assets/banks/itau.png.asset.json";
import bradescoIcon from "@/assets/banks/bradesco.png.asset.json";
import santanderIcon from "@/assets/banks/santander.png.asset.json";
import bbIcon from "@/assets/banks/bb.webp.asset.json";
import caixaIcon from "@/assets/banks/caixa.jpeg.asset.json";
import interIcon from "@/assets/banks/inter.webp.asset.json";
import c6Icon from "@/assets/banks/c6.png.asset.json";
import xpIcon from "@/assets/banks/xp.jpg.asset.json";
import mercadopagoIcon from "@/assets/banks/mercadopago.png.asset.json";

export const BANCO_ICONES: Record<string, string> = {
  nubank: nubankIcon.url,
  itau: itauIcon.url,
  bradesco: bradescoIcon.url,
  santander: santanderIcon.url,
  bb: bbIcon.url,
  caixa: caixaIcon.url,
  inter: interIcon.url,
  c6: c6Icon.url,
  xp: xpIcon.url,
  mercadopago: mercadopagoIcon.url,
};

export const BANDEIRAS = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "elo", label: "Elo" },
  { value: "amex", label: "American Express" },
  { value: "hipercard", label: "Hipercard" },
  { value: "diners", label: "Diners" },
  { value: "outra", label: "Outra" },
];

export const BANCOS = [
  { value: "nubank", label: "Nubank", cor: "#820AD1" },
  { value: "itau", label: "Itaú", cor: "#EC7000" },
  { value: "bradesco", label: "Bradesco", cor: "#CC092F" },
  { value: "santander", label: "Santander", cor: "#EC0000" },
  { value: "bb", label: "Banco do Brasil", cor: "#FFEF38" },
  { value: "caixa", label: "Caixa", cor: "#0070AF" },
  { value: "inter", label: "Inter", cor: "#FF7A00" },
  { value: "c6", label: "C6 Bank", cor: "#1C1C1C" },
  { value: "xp", label: "XP", cor: "#000000" },
  { value: "next", label: "Next", cor: "#00FF5F" },
  { value: "mercadopago", label: "Mercado Pago", cor: "#00B1EA" },
  { value: "outro", label: "Outro", cor: "#6366f1" },
];

export const CORES_PRESET = [
  "#820AD1", "#EC7000", "#CC092F", "#EC0000", "#0070AF",
  "#FF7A00", "#1C1C1C", "#6366f1", "#10b981", "#f59e0b",
  "#0ea5e9", "#ec4899",
];

export function getBancoLabel(value?: string | null): string {
  if (!value) return "";
  return BANCOS.find((b) => b.value === value)?.label || value;
}

export function getBandeiraLabel(value?: string | null): string {
  if (!value) return "";
  return BANDEIRAS.find((b) => b.value === value)?.label || value;
}

export function getBancoCor(value?: string | null): string {
  if (!value) return "#6366f1";
  return BANCOS.find((b) => b.value === value)?.cor || "#6366f1";
}

/**
 * Componente visual padronizado. Como não temos SVGs licenciados das bandeiras,
 * usamos uma badge com iniciais sobre a cor do banco.
 */
interface CartaoIconeProps {
  banco?: string | null;
  bandeira?: string | null;
  cor?: string;
  size?: number;
  className?: string;
}

export function CartaoIcone({ banco, bandeira, cor, size = 36, className = "" }: CartaoIconeProps) {
  const iconUrl = banco ? BANCO_ICONES[banco] : undefined;
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={getBancoLabel(banco)}
        className={`inline-block rounded-md object-cover ${className}`}
        style={{ width: size, height: size }}
        title={`${getBancoLabel(banco)} ${getBandeiraLabel(bandeira)}`.trim()}
      />
    );
  }

  const corFundo = cor || getBancoCor(banco);
  const sigla =
    (banco && getBancoLabel(banco).slice(0, 2).toUpperCase()) ||
    (bandeira && getBandeiraLabel(bandeira).slice(0, 2).toUpperCase()) ||
    "CC";
  // luminância simples para escolher cor do texto
  const hex = corFundo.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const corTexto = lum > 0.6 ? "#1f2937" : "#ffffff";

  if (!banco && !bandeira && !cor) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-md ${className}`}
        style={{ width: size, height: size, backgroundColor: "#e5e7eb" }}
      >
        <CreditCard className="text-slate-500" style={{ width: size * 0.55, height: size * 0.55 }} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-md font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: corFundo,
        color: corTexto,
        fontSize: size * 0.34,
        letterSpacing: -0.5,
      }}
      title={`${getBancoLabel(banco)} ${getBandeiraLabel(bandeira)}`.trim()}
    >
      {sigla}
    </div>
  );
}