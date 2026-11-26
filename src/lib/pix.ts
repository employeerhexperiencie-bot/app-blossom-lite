// Geração do Pix "copia e cola" (BR Code) para cobrar o aluguel.
// O pagamento continua sendo confirmado à mão pelo proprietário: sem servidor, o app não recebe aviso do banco.
import { generatePixPayload, isValidPixPayload } from "@brazilian-utils/brazilian-utils";

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
