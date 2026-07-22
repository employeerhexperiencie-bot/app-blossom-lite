import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, Check, X, Clock, Award, TrendingUp } from "lucide-react";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motoristasCandidatos, fmtData } from "@/lib/mock-proprietario";
import { useProprietario, useCarro } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/solicitacoes/$id")({
  loader: ({ params }) => ({ id: params.id }),
  head: () => ({ meta: [{ title: "Solicitação de locação — TCHI LÉVA" }] }),
  component: SolicitacaoDetalhe,
});

function SolicitacaoDetalhe() {
  const { id } = Route.useLoaderData();
  const navigate = useNavigate();
  const sol = useProprietario((s) => s.solicitacoes.find((x) => x.id === id));
  const aceitar = useProprietario((s) => s.aceitarSolicitacao);
  const recusar = useProprietario((s) => s.recusarSolicitacao);
  const [valor, setValor] = useState(120);
  const [periodicidade, setPeriodicidade] = useState<"diaria" | "mensal" | "semanal">("diaria");

  const carro = useCarro(sol?.carroId);
  if (!sol) throw notFound();
  const motorista = motoristasCandidatos.find((m) => m.id === sol.motoristaId);

  function handleAceitar() {
    const contratoId = aceitar(sol!.id, valor, periodicidade);
    toast.success("Solicitação aceita — contrato criado");
    if (contratoId) navigate({ to: "/proprietario/contratos/$id", params: { id: contratoId } });
    else navigate({ to: "/proprietario/contratos" });
  }

  return (
    <PageSection>
      <Link to="/proprietario/notificacoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Notificações
      </Link>

      <div className="mt-3 rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">Solicitação</div>
        <div className="font-street text-2xl font-black uppercase">{motorista?.nome ?? "Motorista"}</div>
        <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
          <Star className="h-3 w-3 fill-current" /> {motorista?.avaliacao.toFixed(1)}
          <span className="mx-2">·</span>
          <span>{fmtData(sol.data)}</span>
        </div>
      </div>

      {carro && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
          <img src={carro.foto} alt="" className="h-12 w-12 rounded-xl object-cover" />
          <div className="min-w-0">
            <div className="truncate font-semibold">{carro.marca} {carro.modelo}</div>
            <div className="text-xs text-muted-foreground">{carro.placa} · {carro.cidade}</div>
          </div>
        </div>
      )}

      {motorista && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniKpi icon={Clock} label="Plataforma" value={motorista.tempoPlataforma} />
          <MiniKpi icon={TrendingUp} label="Corridas" value={String(motorista.corridas)} />
          <MiniKpi icon={Award} label="Pontualidade" value={`${motorista.pontualidade}%`} />
        </div>
      )}

      {motorista && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card">
          <h3 className="font-street text-xs font-black uppercase tracking-wider text-muted-foreground">Histórico</h3>
          <p className="mt-1 text-sm">{motorista.historico}</p>
          {motorista.observacoes && (
            <>
              <h3 className="mt-3 font-street text-xs font-black uppercase tracking-wider text-muted-foreground">Observações</h3>
              <p className="mt-1 text-sm text-muted-foreground">{motorista.observacoes}</p>
            </>
          )}
        </div>
      )}

      {sol.mensagem && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mensagem</div>
          <p className="mt-1 text-sm italic">"{sol.mensagem}"</p>
        </div>
      )}

      {sol.status === "pendente" ? (
        <>
          <div className="mt-5 rounded-2xl border border-primary/40 bg-primary/5 p-4">
            <div className="font-street text-xs font-black uppercase tracking-wider">Condições do contrato</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <Input className="mt-1" type="number" value={valor} onChange={(e) => setValor(+e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Periodicidade</Label>
                <select value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value as "diaria" | "mensal" | "semanal")} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm">
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => { recusar(sol.id); toast("Solicitação recusada"); navigate({ to: "/proprietario/notificacoes" }); }}>
              <X className="mr-2 h-4 w-4" /> Recusar
            </Button>
            <Button className="rounded-xl gradient-primary text-primary-foreground shadow-glow" onClick={handleAceitar}>
              <Check className="mr-2 h-4 w-4" /> Aceitar
            </Button>
          </div>
        </>
      ) : (
        <div className={`mt-5 rounded-2xl border p-4 text-center text-sm font-semibold ${
          sol.status === "aceita" ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"
        }`}>
          Solicitação {sol.status}
        </div>
      )}
    </PageSection>
  );
}

function MiniKpi({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-2 text-center shadow-card">
      <Icon className="mx-auto h-3.5 w-3.5 text-primary" />
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-street text-sm font-black leading-tight">{value}</div>
    </div>
  );
}
