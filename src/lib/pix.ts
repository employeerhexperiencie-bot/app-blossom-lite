// Pix "copia e cola" (BR Code do Banco Central) para cobrar o aluguel. Sem intermediário: o app não
// fica sabendo sozinho que o Pix foi pago, o proprietário confirma no extrato e marca como pago.
//
// Há dois geradores, um de cada frente de trabalho, mantidos juntos de propósito:
// - gerarPixCopiaECola (brazilian-utils): usado na tela do motorista (PixCobranca).
// - montarCobrancaPix (gerador próprio em pix-brcode.ts + QR com a lib qrcode): usado nas cobranças
//   do proprietário (CobrancaPixDialog), com envio por WhatsApp.
import { generatePixPayload, isValidPixPayload } from "@brazilian-utils/brazilian-utils";
import { isPixKey } from "validation-br";
import { gerarBrCode } from "./pix-brcode";
import type { DadosRecebimento } from "./mock-proprietario";

function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function gerarPixCopiaECola(dados: {
  chave: string;
  nome: string;
  cidade: string;
  valor: number;
  identificador: string;
}): string | null {
  // Regras do padrão: nome até 25 caracteres, cidade até 15, identificador só letras e números (até 25).
  const payload = generatePixPayload({
    key: dados.chave.trim(),
    merchantName: semAcento(dados.nome).trim().slice(0, 25) || "TCHI LEVA",
    merchantCity: semAcento(dados.cidade).trim().slice(0, 15) || "SAO PAULO",
    amount: Math.round(dados.valor * 100) / 100,
    txid: dados.identificador.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***",
  });
  return payload && isValidPixPayload(payload) ? payload : null;
}

/** Remove acentos e caracteres fora do padrão aceito no BR Code. */
function normalizar(texto: string, max: number): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .-]/g, "")
    .trim()
    .slice(0, max);
}

export function chavePixValida(chave: string): boolean {
  return isPixKey(chave.trim());
}

export type CobrancaPix = { brCode: string; qrDataUrl: string };

export async function montarCobrancaPix(params: {
  recebimento: DadosRecebimento;
  valor: number;
  txid?: string;
  descricao?: string;
}): Promise<CobrancaPix> {
  const chave = params.recebimento.chavePix.trim();
  if (!chavePixValida(chave)) {
    throw new Error("Chave Pix inválida. Confira a chave no Perfil.");
  }
  const brCode = gerarBrCode({
    chave,
    nome: normalizar(params.recebimento.nome, 25).toUpperCase() || "TCHI LEVA",
    cidade: normalizar(params.recebimento.cidade, 15).toUpperCase() || "SAO PAULO",
    valor: Math.round(params.valor * 100) / 100,
    txid: params.txid ? params.txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) : undefined,
    infoAdicional: params.descricao ? normalizar(params.descricao, 40) : undefined,
  });
  // A biblioteca de QR Code só é carregada quando a cobrança é aberta
  const QRCode = await import("qrcode");
  const qrDataUrl = await QRCode.toDataURL(brCode, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: "M",
  });
  return { brCode, qrDataUrl };
}

/** Próximo vencimento a partir do último pagamento e da periodicidade do contrato. */
export function proximoVencimento(
  ultimaData: string | undefined,
  periodicidade: "diaria" | "semanal" | "mensal",
): string {
  const hoje = new Date().toISOString().slice(0, 10);
  if (!ultimaData) return hoje;
  const d = new Date(`${ultimaData}T12:00:00`);
  if (periodicidade === "diaria") d.setDate(d.getDate() + 1);
  else if (periodicidade === "semanal") d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  const prox = d.toISOString().slice(0, 10);
  return prox < hoje ? hoje : prox;
}
