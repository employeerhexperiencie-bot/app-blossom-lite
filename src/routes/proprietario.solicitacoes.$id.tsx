import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, Check, X, Clock, Award, TrendingUp } from "lucide-react";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  motoristasCandidatos,
  fmtData,
  fmtBRL,
  periodicidadeLabel,
  type Contrato,
  type SolicitacaoLocacao,
} from "@/lib/mock-proprietario";
import { useProprietario, useCarro } from "@/lib/store-proprietario";
import { caucaoPorNivel } from "@/lib/cobrancas";

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
  const contratoGerado = useProprietario((s) => s.contratos.find((c) => c.solicitacaoId === id));
  const carro = useCarro(sol?.carroId);
  const [valor, setValor] = useState(sol?.valorProposto ?? carro?.diaria ?? 120);
  const [periodicidade, setPeriodicidade] = useState<Contrato["periodicidade"]>(
    sol?.periodicidade ?? "diaria",
  );
  // Caução sugerida já com o benefício do nível do motorista no Clube (Bigode e Veinho pagam menos).
  const sugestaoCaucao = caucaoPorNivel(carro?.caucao ?? 1500, sol?.candidato?.nivel);
  const [caucao, setCaucao] = useState(sugestaoCaucao.valor);
  const [observacoes, setObservacoes] = useState("");

  if (!sol) throw notFound();
  // Propostas vindas do app do motorista trazem o perfil junto; as antigas usam a lista simulada.
  const motorista = sol.candidato ?? motoristasCandidatos.find((m) => m.id === sol.motoristaId);

  function handleEnviarContrato() {
    const contratoId = aceitar(sol!.id, {
      valor,
      periodicidade,
      caucao,
      observacoes: observacoes || undefined,
    });
    toast.success("Contrato enviado ao motorista para aceite");
    if (contratoId) navigate({ to: "/proprietario/contratos/$id", params: { id: contratoId } });
    else navigate({ to: "/proprietario/contratos" });
  }

  return (
    <PageSection>
      <Link
        to="/proprietario/notificacoes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Notificações
      </Link>

      <div className="mt-3 rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
          Solicitação
        </div>
        <div className="font-street text-2xl font-black uppercase">
          {motorista?.nome ?? "Motorista"}
        </div>
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
            <div className="truncate font-semibold">
              {carro.marca} {carro.modelo}
            </div>
            <div className="text-xs text-muted-foreground">
              {carro.placa} · {carro.cidade}
            </div>
          </div>
        </div>
      )}

      {motorista && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniKpi icon={Clock} label="Plataforma" value={motorista.tempoPlataforma} />
          <MiniKpi icon={TrendingUp} label="Corridas" value={String(motorista.corridas)} />
          {motorista.nivel ? (
            <MiniKpi icon={Award} label="Nível" value={motorista.nivel} />
          ) : (
            <MiniKpi
              icon={Award}
              label="Pontualidade"
              value={motorista.pontualidade != null ? `${motorista.pontualidade}%` : "—"}
            />
          )}
        </div>
      )}

      {motorista && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card">
          <h3 className="font-street text-xs font-black uppercase tracking-wider text-muted-foreground">
            Histórico
          </h3>
          <p className="mt-1 text-sm">{motorista.historico}</p>
          {motorista.observacoes && (
            <>
              <h3 className="mt-3 font-street text-xs font-black uppercase tracking-wider text-muted-foreground">
                Observações
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{motorista.observacoes}</p>
            </>
          )}
        </div>
      )}

      <CompararCandidatos atual={sol} />

      {sol.mensagem && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Mensagem
          </div>
          <p className="mt-1 text-sm italic">"{sol.mensagem}"</p>
        </div>
      )}

      {sol.valorProposto != null && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Proposta do motorista
          </div>
          <p className="mt-1 text-sm">
            {fmtBRL(sol.valorProposto)} · {periodicidadeLabel[sol.periodicidade ?? "diaria"]}
            {sol.duracao ? ` · ${sol.duracao}` : ""}
          </p>
        </div>
      )}

      {sol.status === "pendente" ? (
        <>
          <div className="mt-5 rounded-2xl border border-primary/40 bg-primary/5 p-4">
            <div className="font-street text-xs font-black uppercase tracking-wider">
              Condições do contrato
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(+e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Periodicidade</Label>
                <select
                  value={periodicidade}
                  onChange={(e) => setPeriodicidade(e.target.value as Contrato["periodicidade"])}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm"
                >
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Caução (R$)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={caucao}
                  onChange={(e) => setCaucao(+e.target.value)}
                />
                {sugestaoCaucao.desconto > 0 && (
                  <p className="mt-1 text-[11px] text-primary">
                    Nível {sol.candidato?.nivel}: {Math.round(sugestaoCaucao.desconto * 100)}% a
                    menos
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs">Regras e combinados</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex.: sem app de entrega, devolver com tanque cheio..."
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              O motorista recebe o contrato no app e precisa aceitar. O carro só fica alugado depois
              do aceite.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                recusar(sol.id);
                toast("Solicitação recusada");
                navigate({ to: "/proprietario/notificacoes" });
              }}
            >
              <X className="mr-2 h-4 w-4" /> Recusar
            </Button>
            <Button
              className="rounded-xl gradient-primary text-primary-foreground shadow-glow"
              onClick={handleEnviarContrato}
            >
              <Check className="mr-2 h-4 w-4" /> Enviar contrato
            </Button>
          </div>
        </>
      ) : (
        <div
          className={`mt-5 rounded-2xl border p-4 text-center text-sm font-semibold ${
            sol.status === "aceita"
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          Solicitação {sol.status}
          {contratoGerado && (
            <Link
              to="/proprietario/contratos/$id"
              params={{ id: contratoGerado.id }}
              className="mt-2 block text-xs font-semibold text-primary underline"
            >
              Ver contrato
            </Link>
          )}
        </div>
      )}
    </PageSection>
  );
}

function MiniKpi({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-2 text-center shadow-card">
      <Icon className="mx-auto h-3.5 w-3.5 text-primary" />
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-street text-sm font-black leading-tight">{value}</div>
    </div>
  );
}

/** Outros motoristas que pediram o mesmo carro, lado a lado com o atual. */
function CompararCandidatos({ atual }: { atual: SolicitacaoLocacao }) {
  const todas = useProprietario((s) => s.solicitacoes);
  const doCarro = todas.filter(
    (x) => x.carroId === atual.carroId && (x.id === atual.id || x.status === "pendente"),
  );
  if (doCarro.length < 2) return null;
  const linhas = doCarro
    .map((x) => ({
      sol: x,
      m: x.candidato ?? motoristasCandidatos.find((c) => c.id === x.motoristaId),
    }))
    .sort((a, b) => (b.m?.avaliacao ?? 0) - (a.m?.avaliacao ?? 0));

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="font-street text-xs font-black uppercase tracking-wider text-muted-foreground">
        Comparar candidatos para este carro ({linhas.length})
      </h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr>
              <th className="py-1 pr-2 font-semibold">Motorista</th>
              <th className="py-1 pr-2 font-semibold">Nota</th>
              <th className="py-1 pr-2 font-semibold">Nível</th>
              <th className="py-1 pr-2 font-semibold">Corridas</th>
              <th className="py-1 font-semibold">Proposta</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ sol, m }) => (
              <tr
                key={sol.id}
                className={`border-t border-border ${sol.id === atual.id ? "bg-primary/5 font-semibold" : ""}`}
              >
                <td className="py-1.5 pr-2">
                  {sol.id === atual.id ? (
                    (m?.nome ?? "Motorista") + " (este)"
                  ) : (
                    <Link
                      to="/proprietario/solicitacoes/$id"
                      params={{ id: sol.id }}
                      className="text-primary underline"
                    >
                      {m?.nome ?? "Motorista"}
                    </Link>
                  )}
                </td>
                <td className="py-1.5 pr-2">{m?.avaliacao.toFixed(1) ?? "—"}</td>
                <td className="py-1.5 pr-2">{m?.nivel ?? "—"}</td>
                <td className="py-1.5 pr-2">{m?.corridas ?? "—"}</td>
                <td className="py-1.5">{sol.valorProposto ? fmtBRL(sol.valorProposto) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
