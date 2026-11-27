import { useState } from "react";
import { Wrench } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Carro } from "@/lib/mock-data";
import type { ItemManutencao } from "@/lib/mock-proprietario";
import { categoriasServico, statusOSInfo, type OrdemServico } from "@/lib/mock-oficina";
import { useOficina } from "@/lib/store-oficina";
import { useProprietario } from "@/lib/store-proprietario";

const categoriaPorItem: Partial<Record<ItemManutencao["item"], OrdemServico["categoria"]>> = {
  Óleo: "oleo",
  "Filtro de óleo": "oleo",
  Pneus: "pneus",
  Alinhamento: "pneus",
  Balanceamento: "pneus",
};

const STATUS_FECHADOS: OrdemServico["status"][] = ["concluido", "recusado", "cancelado"];

/** Ordens de serviço abertas de um carro no Centro de Serviços. */
export function useOrdensAbertasDoCarro(carroId: string): OrdemServico[] {
  return useOficina(
    useShallow((s) =>
      s.ordens.filter((o) => o.carroId === carroId && !STATUS_FECHADOS.includes(o.status)),
    ),
  );
}

/**
 * Botão "Enviar para oficina parceira" de um item de manutenção: cria a ordem de serviço no Centro de Serviços.
 * Quando a oficina conclui, a ordem já volta para o Passaporte do carro (store-oficina).
 */
export function EnviarOficina({ carro, item }: { carro: Carro; item: ItemManutencao }) {
  const solicitar = useOficina((s) => s.solicitarServico);
  const addEvento = useProprietario((s) => s.addEvento);
  const perfil = useProprietario((s) => s.perfil);
  const abertas = useOrdensAbertasDoCarro(carro.id);
  const [aberto, setAberto] = useState(false);
  const [categoria, setCategoria] = useState<OrdemServico["categoria"]>(
    categoriaPorItem[item.item] ?? "mecanica",
  );
  const [descricao, setDescricao] = useState(
    `${item.item}: manutenção preventiva${item.proximoKm ? ` (prevista para ${item.proximoKm.toLocaleString("pt-BR")} km)` : ""}.`,
  );

  const jaEnviada = abertas.find((o) => o.categoria === categoria);
  if (jaEnviada && !aberto) {
    return (
      <div className="mt-2 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
        <span>{jaEnviada.codigo} no Centro de Serviços</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusOSInfo[jaEnviada.status].cls}`}
        >
          {statusOSInfo[jaEnviada.status].label}
        </span>
      </div>
    );
  }

  if (!aberto) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="mt-2 w-full rounded-xl"
        onClick={() => setAberto(true)}
      >
        <Wrench className="mr-2 h-4 w-4" /> Enviar para oficina parceira
      </Button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-primary/40 bg-primary/5 p-3">
      <div>
        <Label className="text-xs">Tipo de serviço</Label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as OrdemServico["categoria"])}
          className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
        >
          {categoriasServico.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-xs">O que precisa ser feito</Label>
        <Textarea
          className="mt-1"
          rows={2}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl"
          onClick={() => setAberto(false)}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl gradient-primary text-primary-foreground"
          disabled={!descricao.trim()}
          onClick={() => {
            solicitar({
              clienteNome: perfil.nome || carro.proprietario,
              clienteTelefone: perfil.telefone,
              carroId: carro.id,
              veiculo: `${carro.marca} ${carro.modelo} ${carro.ano}`,
              placa: carro.placa,
              categoria,
              descricao: descricao.trim(),
              km: carro.km,
            });
            addEvento({
              carroId: carro.id,
              tipo: "observacao",
              titulo: `Enviado ao Centro de Serviços: ${item.item}`,
              descricao: descricao.trim(),
              data: new Date().toISOString().slice(0, 10),
              km: carro.km,
            });
            toast.success("Pedido enviado ao Centro de Serviços");
            setAberto(false);
          }}
        >
          Enviar pedido
        </Button>
      </div>
    </div>
  );
}
