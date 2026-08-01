import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Megaphone, Sparkles, Target } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FiltroBar } from "@/components/FiltroBar";
import { useParceiro } from "@/lib/store-parceiro";
import { fmtBRL, iconeCategoriaItem, labelCategoriaItem } from "@/lib/mock-parceiro";
import { oportunidadesParaParceiro } from "@/lib/marketplace-inteligente";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/oportunidades")({
  head: () => ({
    meta: [
      { title: "Central de Oportunidades — TCHI LÉVA" },
      { name: "description", content: "Demanda prevista da frota da região transformada em campanhas para a sua loja." },
      { property: "og:title", content: "Central de Oportunidades — TCHI LÉVA" },
      { property: "og:description", content: "Marketplace Inteligente: venda para quem precisa, na hora certa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Oportunidades,
});

const tiposOp = [
  { value: "todos", label: "Todos" },
  { value: "demanda", label: "Demanda" },
  { value: "frota", label: "Frotas" },
  { value: "recorrencia", label: "Recorrência" },
  { value: "solicitacao", label: "Solicitações" },
  { value: "fluxo", label: "Fluxo" },
];

function Oportunidades() {
  const catalogo = useParceiro((s) => s.catalogo);
  const campanhas = useParceiro((s) => s.campanhas);
  const criarCampanha = useParceiro((s) => s.criarCampanha);
  const alternar = useParceiro((s) => s.alternarCampanha);

  const [tipo, setTipo] = useState("todos");
  const todas = useMemo(() => oportunidadesParaParceiro(catalogo), [catalogo]);
  const lista = todas.filter((o) => tipo === "todos" || o.tipo === tipo);
  const potencial = lista.reduce((a, o) => a + o.receitaPotencial, 0);

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-primary/40 bg-primary/10 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-black uppercase tracking-wider text-primary">Marketplace Inteligente</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            A TCHI LÉVA lê a quilometragem e o histórico dos veículos da região e mostra quem vai precisar do que você vende.
          </p>
          <div className="mt-3 rounded-xl bg-card p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Receita potencial mapeada</div>
            <div className="font-display text-3xl font-black">{fmtBRL(potencial)}</div>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <FiltroBar
          ativos={tipo !== "todos" ? 1 : 0}
          onLimpar={() => setTipo("todos")}
          chips={[{ key: "tipo", label: "Tipo de oportunidade", value: tipo, onChange: setTipo, options: tiposOp }]}
        />
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {lista.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-lg">
                  {iconeCategoriaItem(o.categoria)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{o.titulo}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{o.motivo}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Mini label="Alcance" value={String(o.alcance)} />
                <Mini label="Potencial" value={fmtBRL(o.receitaPotencial)} />
                <Mini label="Categoria" value={labelCategoriaItem(o.categoria)} />
              </div>

              <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Target className="h-3 w-3" /> Campanha sugerida
                </div>
                <div className="mt-1">{o.sugestaoCampanha}</div>
              </div>

              <Button
                className="mt-3 w-full rounded-xl gradient-primary text-primary-foreground"
                onClick={() => {
                  criarCampanha({
                    titulo: o.sugestaoCampanha,
                    desconto: o.descontoSugerido,
                    categoria: o.categoria,
                    validade: "30 dias",
                    alcance: o.alcance,
                    origem: "oportunidade",
                  });
                  toast.success("Campanha criada a partir da oportunidade!");
                }}
              >
                <Megaphone className="mr-2 h-4 w-4" /> Criar campanha ({o.descontoSugerido}% OFF)
              </Button>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-black uppercase tracking-wider">Minhas campanhas</h2>
        <div className="flex flex-col gap-2">
          {campanhas.map((c) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.titulo}</div>
                <div className="text-xs text-muted-foreground">
                  {c.desconto}% OFF · {c.alcance} pessoas · até {c.validade}
                </div>
              </div>
              <button
                onClick={() => alternar(c.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  c.ativa ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {c.ativa ? "Ativa" : "Pausada"}
              </button>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-2">
      <div className="truncate font-display text-sm font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
