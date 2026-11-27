import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Wrench, Star, Clock, CheckCircle2 } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orcamentosMock } from "@/lib/mock-data";
import { useConect } from "@/lib/store";
import { useOficina } from "@/lib/store-oficina";
import { statusOSInfo, type OrdemServico } from "@/lib/mock-oficina";
import { fmtBRL } from "@/lib/mock-proprietario";

export const Route = createFileRoute("/motorista/orcamentos")({
  head: () => ({ meta: [{ title: "Orçamentos — Motorista | TCHI LÉVA" }] }),
  component: Orcamentos,
});

function Orcamentos() {
  const enviar = useConect((s) => s.enviarOrcamento);
  const enviados = useConect((s) => s.orcamentosEnviados);
  const [servico, setServico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [sent, setSent] = useState(false);

  const solicitarServico = useOficina((s) => s.solicitarServico);
  const ordens = useOficina((s) => s.ordens);
  const nome = useConect((s) => s.nomeUsuario);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!servico.trim()) return;
    // O pedido vira uma solicitação no marketplace do Centro de Serviços.
    const osId = solicitarServico({
      clienteNome: nome || "Motorista TCHI LÉVA",
      clienteTelefone: "",
      carroId: "c1",
      veiculo: "Chevrolet Onix 2022",
      placa: "ABC-1D23",
      categoria: categoriaDoServico(`${servico} ${descricao}`),
      descricao: [servico.trim(), descricao.trim()].filter(Boolean).join(" — "),
      km: 38000,
      clienteTipo: "motorista",
      origem: "marketplace",
      distanciaKm: 1.5,
    });
    enviar(servico.trim(), osId);
    setServico("");
    setDescricao("");
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  return (
    <>
      <PageSection>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">Pedir orçamento</h1>
              <p className="text-xs text-muted-foreground">
                Oficinas parceiras respondem em minutos.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="servico">Serviço</Label>
              <Input
                id="servico"
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                placeholder="Ex: Troca de óleo, alinhamento…"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Descrição (opcional)</Label>
              <Textarea
                id="desc"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Conte mais sobre o problema, modelo, km…"
                maxLength={300}
                rows={3}
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl gradient-primary text-primary-foreground"
            >
              <Send className="mr-1.5 h-4 w-4" /> Enviar para oficinas
            </Button>
            {sent && (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs font-medium text-success">
                <CheckCircle2 className="h-4 w-4" /> Pedido enviado! Acompanhe as respostas abaixo.
              </div>
            )}
          </form>
        </div>
      </PageSection>

      {enviados.length > 0 && (
        <PageSection className="pt-0">
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Pedidos recentes
          </h2>
          <div className="flex flex-col gap-2">
            {enviados.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm shadow-card"
              >
                <div>
                  <div className="font-semibold">{o.servico}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.data} · {situacaoPedido(ordens.find((os) => os.id === o.osId))}
                  </div>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </PageSection>
      )}

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Histórico
        </h2>
        <div className="flex flex-col gap-3">
          {orcamentosMock.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{o.servico}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.veiculo} · {o.data}
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              {o.descricao && <p className="mt-2 text-xs text-muted-foreground">{o.descricao}</p>}
              {o.respostas.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {o.respostas.map((r) => (
                    <div
                      key={r.oficinaId}
                      className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{r.oficinaNome}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {r.rating}
                          </span>
                          <span>· {r.prazo}</span>
                        </div>
                      </div>
                      <div className="font-display text-base font-extrabold text-primary">
                        {fmtBRL(r.valor)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}

function StatusBadge({ status }: { status: "aguardando" | "respondido" | "fechado" }) {
  const map = {
    aguardando: { txt: "Aguardando", cls: "bg-warning/15 text-warning" },
    respondido: { txt: "Respondido", cls: "bg-primary/15 text-primary" },
    fechado: { txt: "Fechado", cls: "bg-muted text-muted-foreground" },
  } as const;
  const v = map[status];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${v.cls}`}
    >
      {v.txt}
    </span>
  );
}

// Tipo de serviço a partir do que o motorista escreveu.
function categoriaDoServico(texto: string): OrdemServico["categoria"] {
  const t = texto.toLowerCase();
  if (/óleo|oleo|filtro/.test(t)) return "oleo";
  if (/pneu|alinhamento|balanceamento|borrach/.test(t)) return "pneus";
  if (/bateria|elétric|eletric|farol|lâmpada/.test(t)) return "eletrica";
  if (/ar.condicionado|ar-condicionado|climatiza/.test(t)) return "ar";
  if (/lava|lavagem|polimento/.test(t)) return "lava-rapido";
  if (/funilaria|amassado|pintura|batida/.test(t)) return "funilaria";
  return "mecanica";
}

function situacaoPedido(os?: OrdemServico): string {
  if (!os) return "aguardando respostas";
  if (os.status === "solicitado") return "aguardando a oficina";
  if (os.status === "recusado" || os.status === "cancelado") return "recusado pela oficina";
  if (os.status === "aceito") return "a oficina aceitou e vai agendar";
  return `com a oficina · ${statusOSInfo[os.status].label.toLowerCase()}`;
}
