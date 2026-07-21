import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Ban, Check, StopCircle } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { carros } from "@/lib/mock-data";
import { fmtBRL, fmtData } from "@/lib/mock-proprietario";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/contratos/$id")({
  loader: ({ params }) => ({ id: params.id }),
  head: () => ({ meta: [{ title: "Contrato — TCHI LÉVA" }] }),
  component: Detalhe,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Contrato não encontrado.</div>,
});

function Detalhe() {
  const { id } = Route.useLoaderData();
  const contrato = useProprietario((s) => s.contratos.find((c) => c.id === id));
  const pagamentos = useProprietario((s) => s.pagamentos.filter((p) => p.contratoId === id));
  const registrarPagamento = useProprietario((s) => s.registrarPagamento);
  const encerrar = useProprietario((s) => s.encerrarContrato);
  const suspender = useProprietario((s) => s.suspenderContrato);

  if (!contrato) throw notFound();
  const carro = carros.find((c) => c.id === contrato.carroId);

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

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Info k="Início" v={fmtData(contrato.inicio)} />
          <Info k="Fim" v={contrato.fim ? fmtData(contrato.fim) : "Em aberto"} />
          <Info k="Status" v={contrato.status} className="capitalize" />
          {carro && <Info k="Veículo" v={`${carro.marca} ${carro.modelo}`} />}
        </div>

        {contrato.observacoes && (
          <p className="mt-3 rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">{contrato.observacoes}</p>
        )}

        {contrato.status === "ativo" && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => { suspender(contrato.id); toast("Contrato suspenso"); }}>
              <StopCircle className="mr-2 h-4 w-4" /> Suspender
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => { encerrar(contrato.id); toast.success("Contrato encerrado"); }}>
              <Ban className="mr-2 h-4 w-4" /> Encerrar
            </Button>
          </div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Pagamentos</h2>
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
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => { registrarPagamento(p.id); toast.success("Pagamento registrado"); }}>
                  <Check className="h-4 w-4 text-success" />
                </Button>
              )}
            </div>
          ))}
          {pagamentos.length === 0 && <p className="text-sm text-muted-foreground">Sem pagamentos registrados.</p>}
        </div>
      </PageSection>
    </>
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
