// Gerador do BR Code do Pix estático (padrão EMV-MPM do Banco Central).
// Sem dependências: monta os campos "ID + tamanho + valor" e calcula o CRC16.
// Referência: Manual de Padrões para Iniciação do Pix (BCB), anexo BR Code.

export type PixEstatico = {
  chave: string;
  nome: string; // até 25 caracteres
  cidade: string; // até 15 caracteres
  valor?: number;
  txid?: string; // até 25 caracteres alfanuméricos
  infoAdicional?: string;
};

function campo(id: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, "0");
  if (valor.length > 99) throw new Error(`Campo ${id} excede 99 caracteres`);
  return `${id}${tamanho}${valor}`;
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido no campo 63. */
export function crc16(texto: string): string {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function gerarBrCode(p: PixEstatico): string {
  const gui = campo("00", "br.gov.bcb.pix");
  const chave = campo("01", p.chave);
  // A conta do recebedor (campo 26) tem limite de 99 caracteres: a descrição usa o que sobrar
  const espaco = 99 - gui.length - chave.length - 4;
  const info = p.infoAdicional && espaco > 0 ? campo("02", p.infoAdicional.slice(0, espaco)) : "";

  const payload =
    campo("00", "01") +
    campo("26", gui + chave + info) +
    campo("52", "0000") +
    campo("53", "986") +
    (p.valor && p.valor > 0 ? campo("54", p.valor.toFixed(2)) : "") +
    campo("58", "BR") +
    campo("59", p.nome.slice(0, 25)) +
    campo("60", p.cidade.slice(0, 15)) +
    campo("62", campo("05", p.txid ? p.txid.slice(0, 25) : "***")) +
    "6304";

  return payload + crc16(payload);
}
