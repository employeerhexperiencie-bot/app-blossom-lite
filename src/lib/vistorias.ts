// Vistoria periódica: o motorista (ou o dono) envia fotos tiradas na hora, com o KM do painel.
// Sem banco: as fotos ficam reduzidas no navegador (localStorage), só as mais recentes de cada carro.
import { VISTORIA, diasDesde } from "./regras-proprietario";

export type LadoFoto = "painel" | "frente" | "traseira" | "esquerda" | "direita";

export const ladosFoto: { key: LadoFoto; label: string }[] = [
  { key: "painel", label: "Painel (KM e luzes)" },
  { key: "frente", label: "Frente" },
  { key: "traseira", label: "Traseira" },
  { key: "esquerda", label: "Lado esquerdo" },
  { key: "direita", label: "Lado direito" },
];

export type Vistoria = {
  id: string;
  carroId: string;
  contratoId?: string;
  /** Data e hora do envio (ISO completo). */
  enviadaEm: string;
  km: number;
  fotos: Partial<Record<LadoFoto, string>>;
  /** Quantas fotos foram enviadas (continua valendo quando as imagens antigas são descartadas). */
  qtdFotos: number;
  local?: { lat: number; lng: number };
  luzAcesa: boolean;
  avarias?: string;
  enviadaPor: "motorista" | "proprietario";
  /** Alerta gerado na validação (ex.: KM rodado fora do normal). */
  alerta?: string;
};

export type ResultadoKm = { ok: true; alerta?: string } | { ok: false; erro: string };

/** O KM nunca volta; um salto muito grande no período vira alerta para o dono. */
export function validarKm(
  kmNovo: number,
  anterior: { km: number; data: string } | undefined,
  hoje: string,
): ResultadoKm {
  if (!Number.isFinite(kmNovo) || kmNovo <= 0)
    return { ok: false, erro: "Informe o KM do painel." };
  if (!anterior) return { ok: true };
  if (kmNovo < anterior.km)
    return {
      ok: false,
      erro: `O KM não pode ser menor que o último registrado (${anterior.km.toLocaleString("pt-BR")} km).`,
    };
  const dias = Math.max(1, diasDesde(anterior.data, hoje));
  const porDia = (kmNovo - anterior.km) / dias;
  if (porDia > VISTORIA.kmPorDiaSuspeito)
    return {
      ok: true,
      alerta: `${Math.round(porDia).toLocaleString("pt-BR")} km por dia desde a última leitura, acima do normal.`,
    };
  return { ok: true };
}

/** A próxima vistoria vence em X dias ou X km rodados desde a última, o que vier primeiro. */
export function situacaoVistoria(
  ultima: { km: number; data: string } | undefined,
  kmAtual: number,
  hoje: string,
): { pendente: boolean; atrasadaDias: number; motivo: string } {
  if (!ultima) return { pendente: true, atrasadaDias: 0, motivo: "Nenhuma vistoria enviada ainda" };
  const dias = diasDesde(ultima.data, hoje);
  const km = kmAtual - ultima.km;
  if (dias >= VISTORIA.dias)
    return {
      pendente: true,
      atrasadaDias: dias - VISTORIA.dias,
      motivo: `Última vistoria há ${dias} dias`,
    };
  if (km >= VISTORIA.km)
    return {
      pendente: true,
      atrasadaDias: 0,
      motivo: `${km.toLocaleString("pt-BR")} km rodados desde a última vistoria`,
    };
  return {
    pendente: false,
    atrasadaDias: 0,
    motivo: `Próxima em ${VISTORIA.dias - dias} dia${VISTORIA.dias - dias === 1 ? "" : "s"}`,
  };
}

/** Mantém as fotos só nas `n` vistorias mais recentes de cada carro (o resto guarda só os dados). */
export function limitarFotos(lista: Vistoria[], n = VISTORIA.fotosGuardadasPorCarro): Vistoria[] {
  const contagem: Record<string, number> = {};
  return [...lista]
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))
    .map((v) => {
      contagem[v.carroId] = (contagem[v.carroId] ?? 0) + 1;
      return contagem[v.carroId] > n ? { ...v, fotos: {} } : v;
    });
}

/** Reduz a foto da câmera para caber no navegador (JPEG ~480 px). Só roda no browser. */
export function reduzirFoto(arquivo: File, largura = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a foto"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo não é uma imagem"));
      img.onload = () => {
        const escala = Math.min(1, largura / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  });
}
