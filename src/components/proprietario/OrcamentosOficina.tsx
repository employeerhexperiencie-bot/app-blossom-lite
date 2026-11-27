import { useState } from "react";
import { Check, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtBRL, statusOSInfo, totalOS, type OrdemServico } from "@/lib/mock-oficina";
import { fmtData } from "@/lib/mock-proprietario";
import { useOficina } from "@/lib/store-oficina";

/** Ordens de serviço do carro no Centro de Serviços, das mais recentes para as mais antigas. */
export function useOrdensDoCarro(carroId: string): OrdemServico[] {
  return useOficina(useShallow((s) => s.ordens.filter((o) => o.carroId === carroId)));
}

/**
 * Pedidos do carro na oficina dentro do passaporte: o dono aprova ou recusa o orçamento aqui
 * e acompanha cada ordem até a conclusão (que lança o custo no financeiro do carro).
 */
export function OrcamentosOficina({ carroId }: { carroId: string }) {
  const ordens = useOrdensDoCarro(carroId);
  const oficina = useOficina((s) => s.perfil.nome);
  const aguardando = ordens.filter((o) => o.status === "aguardando_aprovacao");
  const andamento = ordens.filter((o) =>
    ["solicitado", "aceito", "agendado", "em_atendimento"].includes(o.status),
  );
  const concluidas = ordens.filter((o) => o.status === "concluido").slice(0, 3);

  if (ordens.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        <div className="font-street text-sm font-black uppercase">Oficina</div>
        <span className="ml-auto text-[11px] text-muted-foreground">{oficina}</span>
      </div>

      {aguardando.map((os) => (
        <OrcamentoParaAprovar key={os.id} os={os} />
      ))}

      {andamento.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {andamento.map((os) => (
            <li key={os.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 truncate">
                <b>{os.codigo}</b> · {os.descricao}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusOSInfo[os.status].cls}`}
              >
                {statusOSInfo[os.status].label}
              </span>
            </li>
          ))}
        </ul>
      )}

      {concluidas.length > 0 && (
        <div className="mt-3 border-t border-border pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Concluídas
          </div>
          <ul className="mt-1 space-y-1">
            {concluidas.map((os) => (
              <li key={os.id} className="flex justify-between gap-2 text-xs">
                <span className="min-w-0 truncate">
                  {os.codigo} · {os.conclusao ? fmtData(os.conclusao.data) : ""}
                  {os.conclusao ? ` · garantia ${os.conclusao.garantiaMeses} meses` : ""}
                </span>
                <span className="shrink-0 font-semibold">
                  {fmtBRL(os.conclusao?.valorTotal ?? totalOS(os))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-muted-foreground">
            O valor de cada serviço concluído já entra nos custos do carro.
          </p>
        </div>
      )}
    </div>
  );
}

function OrcamentoParaAprovar({ os }: { os: OrdemServico }) {
  const aprovar = useOficina((s) => s.aprovarOrcamento);
  const recusar = useOficina((s) => s.recusarOrcamento);
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const total = totalOS(os);

  return (
    <div className="mt-3 rounded-xl border border-warning/60 bg-warning/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Orçamento {os.codigo}</div>
        <span className="text-[10px] uppercase text-muted-foreground">
          {os.orcamentoEnviadoEm ? `enviado ${fmtData(os.orcamentoEnviadoEm)}` : ""}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{os.descricao}</p>
      <ul className="mt-2 space-y-1 text-xs">
        {os.servicos.map((s) => (
          <li key={s.id} className="flex justify-between gap-2">
            <span className="min-w-0 truncate">{s.nome}</span>
            <span className="shrink-0">{fmtBRL(s.valor)}</span>
          </li>
        ))}
        {os.pecas.map((p) => (
          <li key={p.id} className="flex justify-between gap-2">
            <span className="min-w-0 truncate">
              {p.quantidade}× {p.produto}
            </span>
            <span className="shrink-0">{fmtBRL(p.valorUnit * p.quantidade)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-bold">
        <span>Total</span>
        <span>{fmtBRL(total)}</span>
      </div>

      {recusando ? (
        <div className="mt-3 space-y-2">
          <Input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (opcional): preço, prazo, vou levar em outra..."
          />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setRecusando(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => {
                recusar(os.id, motivo.trim() || undefined);
                toast("Orçamento recusado. A oficina foi avisada.");
              }}
            >
              Recusar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => setRecusando(true)}>
            <X className="mr-1 h-4 w-4" /> Recusar
          </Button>
          <Button
            className="rounded-xl gradient-primary text-primary-foreground"
            onClick={() => {
              aprovar(os.id);
              toast.success("Orçamento aprovado. A oficina pode começar o serviço.");
            }}
          >
            <Check className="mr-1 h-4 w-4" /> Aprovar
          </Button>
        </div>
      )}
    </div>
  );
}
