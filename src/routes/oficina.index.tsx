import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bell, Clock, Megaphone, Play, Wrench } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useOficina, useResumoHoje } from "@/lib/store-oficina";
import { fmtBRL, iconeCategoria, statusOSInfo } from "@/lib/mock-oficina";
import { toast } from "sonner";

export const Route = createFileRoute("/oficina/")({
  head: () => ({
    meta: [
      { title: "Hoje — Centro de Serviços TCHI LÉVA" },
      { name: "description", content: "Painel diário do centro de serviços: atendimentos, solicitações e faturamento previsto." },
      { property: "og:title", content: "Hoje — Centro de Serviços TCHI LÉVA" },
      { property: "og:description", content: "Painel diário do centro de serviços TCHI LÉVA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hoje,
});

const diaSemana = () =>
  new Date().toLocaleDateString("pt-BR", { weekday: "long" });

function Hoje() {
  const perfil = useOficina((s) => s.perfil);
  const iniciar = useOficina((s) => s.iniciarAtendimento);
  const { doDia, emAndamento, aguardando, novas, previsao, proximo } = useResumoHoje();
  const navigate = useNavigate();

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="text-xs text-muted-foreground">
            {saudacao}, <span className="font-semibold text-foreground">{perfil.nome}</span>.
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">Hoje é {diaSemana()}.</div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display text-xl font-black">{doDia.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Agendados</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display text-xl font-black">{aguardando.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Aprovação</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display text-xl font-black">{emAndamento.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Em manut.</div>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-primary/10 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Previsão de faturamento</div>
            <div className="font-display text-2xl font-black">{fmtBRL(previsao)}</div>
          </div>
        </div>
      </PageSection>

      {proximo && (
        <PageSection className="pt-0">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Próximo atendimento</div>
            <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl">
                {iconeCategoria(proximo.categoria)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-lg font-black">{proximo.veiculo}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {proximo.hora} · {proximo.descricao} · {proximo.clienteNome}
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                className="rounded-xl gradient-primary text-primary-foreground"
                onClick={() => {
                  iniciar(proximo.id);
                  toast.success("Atendimento iniciado!");
                  navigate({ to: "/oficina/servicos/$osId", params: { osId: proximo.id } });
                }}
              >
                <Play className="mr-2 h-4 w-4" /> Iniciar
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/oficina/servicos/$osId" params={{ osId: proximo.id }}>Detalhes</Link>
              </Button>
            </div>
          </div>
        </PageSection>
      )}

      <PageSection className="pt-0">
        <Link
          to="/oficina/servicos"
          search={{ status: "solicitado" }}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Bell className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">{novas.length} novas solicitações</div>
            <div className="text-xs text-muted-foreground">Aceite ou recuse os pedidos pendentes</div>
          </div>
          <span className="text-xs font-bold text-primary">Responder</span>
        </Link>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-black uppercase tracking-wider">Serviços em andamento</h2>
        {emAndamento.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhum serviço em andamento.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {emAndamento.map((o) => (
              <Link
                key={o.id}
                to="/oficina/servicos/$osId"
                params={{ osId: o.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-lg">{iconeCategoria(o.categoria)}</div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{o.veiculo}</div>
                  <div className="truncate text-xs text-muted-foreground">{o.placa} · {o.clienteNome}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusOSInfo[o.status].cls}`}>
                  {statusOSInfo[o.status].label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-black uppercase tracking-wider">Agenda de hoje</h2>
          <Link to="/oficina/agenda" className="text-xs font-semibold text-primary">Ver tudo</Link>
        </div>
        <div className="flex flex-col gap-2">
          {doDia.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Nada agendado para hoje.
            </div>
          )}
          {[...doDia]
            .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""))
            .map((o) => (
              <div key={o.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl bg-card p-3 shadow-card">
                <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-display text-xs font-bold">
                  <Clock className="h-3 w-3" /> {o.hora}
                </div>
                <div className="min-w-0 truncate text-sm">
                  <span className="font-semibold">{o.veiculo}</span>{" "}
                  <span className="text-muted-foreground">· {o.descricao}</span>
                </div>
              </div>
            ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-black uppercase tracking-wider">Oportunidades</span>
          </div>
          <p className="mt-2 text-sm">
            Existem <span className="font-display text-xl font-black text-primary">12 veículos</span> próximos da revisão na sua região.
          </p>
          <Button asChild variant="outline" className="mt-3 w-full rounded-xl">
            <Link to="/oficina/financeiro">
              Criar campanha <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <Link
          to="/oficina/servicos"
          search={{ status: "todos" }}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm font-semibold shadow-card"
        >
          <Wrench className="h-4 w-4" /> Todas as ordens de serviço
        </Link>
      </PageSection>
    </>
  );
}
