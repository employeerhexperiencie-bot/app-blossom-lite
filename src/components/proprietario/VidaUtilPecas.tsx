import { useMemo, useState } from "react";
import { HeartPulse, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Carro } from "@/lib/mock-data";
import { fmtBRL, fmtData, hojeISO, type ItemManutencao } from "@/lib/mock-proprietario";
import {
  kmPorDia,
  planoDoModelo,
  vidaUtilDoCarro,
  type VidaUtilItem,
} from "@/lib/plano-manutencao";
import { useProprietario } from "@/lib/store-proprietario";
import { useParceiro } from "@/lib/store-parceiro";
import { taxas } from "@/lib/monetizacao";
import type { ItemCatalogo } from "@/lib/mock-parceiro";
import { EnviarOficina } from "./EnviarOficina";

const corStatus: Record<VidaUtilItem["status"], string> = {
  ok: "bg-success",
  atencao: "bg-warning",
  vencido: "bg-destructive",
  sem_registro: "bg-muted-foreground/40",
};

/** Peça ou serviço da loja parceira que resolve o item, compatível com o modelo, do mais barato. */
export function ofertaParaItem(
  item: ItemManutencao["item"],
  modelo: string,
  catalogo: ItemCatalogo[],
): ItemCatalogo | undefined {
  const m = modelo.toLowerCase().split(" ")[0];
  const serve = (c: ItemCatalogo) => {
    if (item === "Óleo" || item === "Filtro de óleo")
      return c.categoria === "oleo-filtros" || /troca de óleo/i.test(c.nome);
    if (item === "Freios") return c.categoria === "freios";
    if (item === "Pneus") return c.categoria === "pneus";
    if (item === "Alinhamento" || item === "Balanceamento") return /alinhamento/i.test(c.nome);
    return false;
  };
  return catalogo
    .filter((c) => c.ativo && serve(c))
    .filter((c) => !c.compatibilidade || c.compatibilidade.some((x) => x.toLowerCase() === m))
    .sort((a, b) => a.preco - b.preco)[0];
}

/**
 * Vida útil de cada peça pelo plano de manutenção, com alerta aos 80% e as saídas da rede:
 * mandar para a oficina parceira ou pedir a peça na loja parceira.
 */
export function VidaUtilPecas({
  carro,
  manutencao,
  onRegistrar,
}: {
  carro: Carro;
  manutencao: ItemManutencao[];
  onRegistrar: () => void;
}) {
  const vistorias = useProprietario((s) => s.vistorias);
  const eventos = useProprietario((s) => s.eventosExtras);
  const hoje = hojeISO();
  const [verTodos, setVerTodos] = useState(false);

  // Ritmo de uso pelas leituras de KM do carro (vistorias e atualizações de KM).
  const ritmo = useMemo(() => {
    const leituras = [
      ...vistorias
        .filter((v) => v.carroId === carro.id)
        .map((v) => ({ data: v.enviadaEm.slice(0, 10), km: v.km })),
      ...eventos
        .filter((e) => e.carroId === carro.id && e.km && (e.tipo === "km" || e.tipo === "vistoria"))
        .map((e) => ({ data: e.data, km: e.km! })),
    ];
    return kmPorDia(leituras);
  }, [vistorias, eventos, carro.id]);

  const itens = vidaUtilDoCarro({
    modelo: carro.modelo,
    kmAtual: carro.km,
    hoje,
    manutencao,
    kmPorDia: ritmo,
  });
  const plano = planoDoModelo(carro.modelo);
  const alertas = itens.filter((i) => i.status === "atencao" || i.status === "vencido");
  const visiveis = verTodos ? itens : itens.filter((i) => i.status !== "ok").slice(0, 6);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <HeartPulse className="h-4 w-4 text-primary" />
        <div className="font-street text-sm font-black uppercase">Vida útil das peças</div>
        {alertas.length > 0 && (
          <span className="ml-auto rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
            {alertas.length} alerta{alertas.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {plano.conferido ? "Plano do manual do fabricante" : plano.fonte}. Uso severo (aplicativo).
        {ritmo ? ` Ritmo atual: ${Math.round(ritmo)} km/dia.` : ""}
      </p>

      <ul className="mt-3 space-y-3">
        {visiveis.map((i) => (
          <LinhaVida
            key={i.item}
            i={i}
            carro={carro}
            manutencao={manutencao}
            onRegistrar={onRegistrar}
          />
        ))}
        {visiveis.length === 0 && (
          <li className="text-xs text-muted-foreground">Todas as peças dentro da vida útil.</li>
        )}
      </ul>

      <button
        className="mt-3 text-xs font-semibold text-primary underline"
        onClick={() => setVerTodos((v) => !v)}
      >
        {verTodos ? "Mostrar só os alertas" : `Ver as ${itens.length} peças do plano`}
      </button>
    </div>
  );
}

function LinhaVida({
  i,
  carro,
  manutencao,
  onRegistrar,
}: {
  i: VidaUtilItem;
  carro: Carro;
  manutencao: ItemManutencao[];
  onRegistrar: () => void;
}) {
  const catalogo = useParceiro((s) => s.catalogo);
  const loja = useParceiro((s) => s.negocio.nome);
  const pedirDaFrota = useParceiro((s) => s.pedirDaFrota);
  const registrarLancamento = useProprietario((s) => s.registrarLancamento);
  const perfil = useProprietario((s) => s.perfil);
  const [pedido, setPedido] = useState(false);
  const pct = Math.min(100, Math.round((i.uso ?? 0) * 100));
  const alerta = i.status === "atencao" || i.status === "vencido";
  const oferta = alerta ? ofertaParaItem(i.item, carro.modelo, catalogo) : undefined;
  // O botão da oficina precisa de um item de manutenção; sem registro, usamos um provisório.
  const registro: ItemManutencao = manutencao.find((m) => m.item === i.item) ?? {
    id: `vu-${carro.id}-${i.item}`,
    carroId: carro.id,
    item: i.item,
    ultimoKm: i.ultimoKm ?? 0,
    ultimaData: i.ultimaData ?? hojeISO(),
  };

  return (
    <li>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold">{i.item}</span>
        <span className="text-[11px] text-muted-foreground">
          {i.status === "sem_registro"
            ? "Sem registro de troca"
            : i.status === "vencido"
              ? i.motivo === "tempo"
                ? `Vencido pelo tempo (${i.intervalo.meses} meses)`
                : `Vencido há ${Math.abs(i.faltamKm ?? 0).toLocaleString("pt-BR")} km`
              : i.motivo === "tempo"
                ? `${pct}% usado pelo tempo`
                : `${pct}% usado · faltam ${Math.max(0, i.faltamKm ?? 0).toLocaleString("pt-BR")} km`}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${corStatus[i.status]}`}
          style={{ width: i.status === "sem_registro" ? "100%" : `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        A cada {i.intervalo.km.toLocaleString("pt-BR")} km ou {i.intervalo.meses} meses
        {i.ultimaData ? ` · última troca ${fmtData(i.ultimaData)}` : ""}
        {i.previsao && i.status !== "vencido" ? ` · prevista para ${fmtData(i.previsao)}` : ""}
      </div>

      {i.status === "sem_registro" && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full rounded-xl"
          onClick={onRegistrar}
        >
          Registrar a última troca
        </Button>
      )}

      {alerta && <EnviarOficina carro={carro} item={registro} />}

      {oferta && !pedido && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs">
          <ShoppingBag className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">
            {oferta.nome} · <b>{fmtBRL(oferta.preco)}</b> em {loja}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 shrink-0 rounded-lg px-2 text-[11px]"
            onClick={() => {
              const id = pedirDaFrota({
                itemId: oferta.id,
                quantidade: 1,
                clienteNome: perfil.nome || "Proprietário TCHI LÉVA",
                veiculo: `${carro.marca} ${carro.modelo} · ${carro.placa}`,
                observacoes: `Alerta de ${i.item} no passaporte do veículo`,
              });
              if (!id) return;
              registrarLancamento({
                tipo: "lead_loja",
                valor: taxas.leadQualificado,
                descricao: `Pedido para ${loja}: ${oferta.nome}`,
                carroId: carro.id,
              });
              setPedido(true);
              toast.success(`Pedido enviado para ${loja}`);
            }}
          >
            Pedir
          </Button>
        </div>
      )}
      {pedido && (
        <p className="mt-2 text-xs text-success">
          Pedido enviado para {loja}. Ela confirma pelo app.
        </p>
      )}
    </li>
  );
}
