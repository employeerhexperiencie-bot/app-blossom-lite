import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Ban, Check, StopCircle, Plus, Bell } from "lucide-react";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmtBRL, fmtData, lembretesDefault, type Pagamento } from "@/lib/mock-proprietario";
import { useProprietario, useCarro } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/contratos/$id")({
  loader: ({ params }) => ({ id: params.id }),
  head: () => ({ meta: [{ title: "Contrato — TCHI LÉVA" }] }),
  component: Detalhe,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Contrato não encontrado.</div>,
});

type Aba = "geral" | "pagamentos" | "lembretes";

function Detalhe() {
  const { id } = Route.useLoaderData();
  const contrato = useProprietario((s) => s.contratos.find((c) => c.id === id));
  const pagamentos = useProprietario((s) => s.pagamentos.filter((p) => p.contratoId === id));
  const registrarPagamento = useProprietario((s) => s.registrarPagamento);
  const registrarPagamentoDetalhado = useProprietario((s) => s.registrarPagamentoDetalhado);
  const encerrar = useProprietario((s) => s.encerrarContrato);
  const suspender = useProprietario((s) => s.suspenderContrato);
  const lembretesSalvos = useProprietario((s) => s.lembretes[id]);
  const salvarLembretes = useProprietario((s) => s.salvarLembretes);
  const [aba, setAba] = useState<Aba>("geral");

  const carro = useCarro(contrato?.carroId);
  if (!contrato) throw notFound();

  return (
    <>
      <PageSection>
        <Link to="/proprietario/contratos" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Contratos
        </Link>

        <div className="mt-3 rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">Contrato</div>
          <div className="font-street text-2xl font-black uppercase">{contrato.motoristaNome}</div>
          <div className="mt-1 text-xs opacity-90">
            {carro ? `${carro.marca} ${carro.modelo} · ${carro.placa}` : "—"}
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span>Valor {fmtBRL(contrato.valor)}</span>
            <span className="capitalize">{contrato.periodicidade}</span>
            <span>Caução {fmtBRL(contrato.caucao)}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(["geral", "pagamentos", "lembretes"] as Aba[]).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                aba === a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {aba === "geral" && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Info k="Início" v={fmtData(contrato.inicio)} />
              <Info k="Fim" v={contrato.fim ? fmtData(contrato.fim) : "Em aberto"} />
              <Info k="Status" v={contrato.status} className="capitalize" />
              {carro && <Info k="Veículo" v={`${carro.marca} ${carro.modelo}`} />}
            </div>

            {contrato.observacoes && (
              <p className="rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">{contrato.observacoes}</p>
            )}

            {contrato.status === "ativo" && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => { suspender(contrato.id); toast("Contrato suspenso"); }}>
                  <StopCircle className="mr-2 h-4 w-4" /> Suspender
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => { encerrar(contrato.id); toast.success("Contrato encerrado"); }}>
                  <Ban className="mr-2 h-4 w-4" /> Encerrar
                </Button>
              </div>
            )}
          </div>
        )}

        {aba === "pagamentos" && (
          <PagamentosPanel
            contratoId={id}
            pagamentos={pagamentos}
            onRegistrar={registrarPagamento}
            onRegistrarDetalhado={registrarPagamentoDetalhado}
          />
        )}

        {aba === "lembretes" && (
          <LembretesPanel
            atual={lembretesSalvos ?? lembretesDefault}
            onSalvar={(cfg) => { salvarLembretes(id, cfg); toast.success("Lembretes atualizados"); }}
          />
        )}
      </PageSection>
    </>
  );
}

function PagamentosPanel({ contratoId, pagamentos, onRegistrar, onRegistrarDetalhado }: {
  contratoId: string;
  pagamentos: Pagamento[];
  onRegistrar: (id: string) => void;
  onRegistrarDetalhado: (contratoId: string, dados: { valor: number; data: string; forma: Pagamento["forma"] }) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(120);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [forma, setForma] = useState<Pagamento["forma"]>("Pix");

  return (
    <div className="mt-4">
      {!aberto ? (
        <Button size="sm" variant="outline" className="mb-3 w-full rounded-xl" onClick={() => setAberto(true)}>
          <Plus className="mr-2 h-4 w-4" /> Registrar pagamento
        </Button>
      ) : (
        <div className="mb-3 space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Valor</Label>
              <Input className="mt-1" type="number" value={valor} onChange={(e) => setValor(+e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Data</Label>
              <Input className="mt-1" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Forma</Label>
              <select value={forma} onChange={(e) => setForma(e.target.value as Pagamento["forma"])} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">
                <option>Pix</option><option>Dinheiro</option><option>Cartão</option><option>Transferência</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button
              className="flex-1 rounded-xl gradient-primary text-primary-foreground"
              onClick={() => { onRegistrarDetalhado(contratoId, { valor, data, forma }); toast.success("Pagamento registrado"); setAberto(false); }}
            >
              Salvar
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {pagamentos.map((p) => (
          <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
            <div className="min-w-0">
              <div className="font-semibold">{fmtBRL(p.valor)}</div>
              <div className="text-xs text-muted-foreground">{fmtData(p.data)} · {p.forma}</div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              p.status === "pago" ? "bg-success/15 text-success" :
              p.status === "pendente" ? "bg-warning/20 text-warning-foreground" :
              "bg-destructive/15 text-destructive"
            }`}>
              {p.status}
            </span>
            {p.status !== "pago" && (
              <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => { onRegistrar(p.id); toast.success("Pagamento marcado"); }}>
                <Check className="h-4 w-4 text-success" />
              </Button>
            )}
          </div>
        ))}
        {pagamentos.length === 0 && <p className="text-sm text-muted-foreground">Sem pagamentos registrados.</p>}
      </div>
    </div>
  );
}

function LembretesPanel({ atual, onSalvar }: { atual: typeof lembretesDefault; onSalvar: (cfg: typeof lembretesDefault) => void }) {
  const [cfg, setCfg] = useState(atual);
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-street text-sm font-black uppercase">Lembretes ao locatário</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Com sua autorização, enviamos lembretes automáticos ao motorista.
        </p>

        <div className="mt-4 space-y-3">
          <Toggle
            checked={cfg.vencimentoAluguel}
            onChange={(v) => setCfg({ ...cfg, vencimentoAluguel: v })}
            label="Vencimento do aluguel"
            desc="Aviso antes da data de vencimento."
          />
          {cfg.vencimentoAluguel && (
            <div className="pl-6">
              <Label className="text-xs">Antecedência</Label>
              <select
                value={cfg.antecedenciaDias}
                onChange={(e) => setCfg({ ...cfg, antecedenciaDias: +e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                <option value={0}>No dia</option>
                <option value={1}>1 dia antes</option>
                <option value={3}>3 dias antes</option>
              </select>
            </div>
          )}
          <Toggle
            checked={cfg.fotoPainelMensal}
            onChange={(v) => setCfg({ ...cfg, fotoPainelMensal: v })}
            label="Foto do painel (KM)"
            desc="Pedido mensal de foto para atualizar KM."
          />
          <Toggle
            checked={cfg.documentacao}
            onChange={(v) => setCfg({ ...cfg, documentacao: v })}
            label="Documentação"
            desc="Lembrete de docs vencendo."
          />
        </div>
        <Button className="mt-4 w-full rounded-xl gradient-primary text-primary-foreground" onClick={() => onSalvar(cfg)}>
          Salvar preferências
        </Button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-current" />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </label>
  );
}

function Info({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className={`text-sm font-semibold ${className}`}>{v}</div>
    </div>
  );
}
