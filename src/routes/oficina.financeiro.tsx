import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOficina } from "@/lib/store-oficina";
import { categoriasServico, fmtBRL, labelCategoria, totalOS, type CategoriaServico } from "@/lib/mock-oficina";
import { toast } from "sonner";

export const Route = createFileRoute("/oficina/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Centro de Serviços TCHI LÉVA" },
      { name: "description", content: "Faturamento, ticket médio, peças versus mão de obra e campanhas do centro de serviços." },
      { property: "og:title", content: "Financeiro — Centro de Serviços TCHI LÉVA" },
      { property: "og:description", content: "Acompanhe o faturamento do seu centro de serviços." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Financeiro,
});

const dias = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

function Financeiro() {
  const ordens = useOficina((s) => s.ordens);
  const campanhas = useOficina((s) => s.campanhas);
  const criarCampanha = useOficina((s) => s.criarCampanha);
  const alternar = useOficina((s) => s.alternarCampanha);

  const [periodo, setPeriodo] = useState("30");
  const [categoria, setCategoria] = useState("todas");
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [desconto, setDesconto] = useState("20");
  const [validade, setValidade] = useState("");
  const [catNova, setCatNova] = useState<CategoriaServico>("oleo");

  const limite = periodo === "todos" ? "0000-01-01" : dias(Number(periodo));
  const concluidas = ordens
    .filter((o) => o.status === "concluido" && (o.conclusao?.data ?? o.criadoEm) >= limite)
    .filter((o) => categoria === "todas" || o.categoria === categoria);

  const faturamento = concluidas.reduce((a, o) => a + (o.conclusao?.valorTotal ?? totalOS(o)), 0);
  const ticket = concluidas.length ? faturamento / concluidas.length : 0;
  const custoPecas = concluidas.reduce((a, o) => a + o.pecas.reduce((x, p) => x + p.valorUnit * p.quantidade, 0), 0);
  const maoDeObra = faturamento - custoPecas;

  const porCategoria = categoriasServico
    .map((c) => ({
      label: c.label,
      valor: concluidas.filter((o) => o.categoria === c.key).reduce((a, o) => a + (o.conclusao?.valorTotal ?? totalOS(o)), 0),
    }))
    .filter((c) => c.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const maxCat = Math.max(1, ...porCategoria.map((c) => c.valor));
  const ativos = (periodo !== "30" ? 1 : 0) + (categoria !== "todas" ? 1 : 0);

  return (
    <>
      <PageSection>
        <FiltroBar
          ativos={ativos}
          onLimpar={() => { setPeriodo("30"); setCategoria("todas"); }}
          chips={[
            {
              key: "periodo", label: "Período", value: periodo, onChange: setPeriodo,
              options: [
                { value: "1", label: "Hoje" },
                { value: "7", label: "7 dias" },
                { value: "30", label: "30 dias" },
                { value: "365", label: "Ano" },
                { value: "todos", label: "Tudo" },
              ],
            },
            {
              key: "categoria", label: "Tipo de serviço", value: categoria, onChange: setCategoria,
              options: [{ value: "todas", label: "Todas" }, ...categoriasServico.map((c) => ({ value: c.key, label: c.label }))],
            },
          ]}
        />
      </PageSection>

      <PageSection className="pt-0">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Faturamento no período</div>
          <div className="font-display text-3xl font-black">{fmtBRL(faturamento)}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display font-bold">{concluidas.length}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Serviços</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display font-bold">{fmtBRL(ticket)}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Ticket médio</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display font-bold">{fmtBRL(custoPecas)}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Peças</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Mão de obra {fmtBRL(maoDeObra)}</span>
              <span>Peças {fmtBRL(custoPecas)}</span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${faturamento ? (maoDeObra / faturamento) * 100 : 0}%` }} />
              <div className="h-full bg-accent" style={{ width: `${faturamento ? (custoPecas / faturamento) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-black uppercase tracking-wider">Receita por tipo de serviço</h2>
        {porCategoria.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Sem serviços concluídos no período.
          </div>
        ) : (
          <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
            {porCategoria.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs">
                  <span>{c.label}</span>
                  <span className="font-display font-bold">{fmtBRL(c.valor)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.valor / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-black uppercase tracking-wider">Campanhas</h2>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Nova
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {campanhas.map((c) => (
            <div key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Megaphone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.titulo}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {c.desconto}% off · {labelCategoria(c.categoria)} · até {c.validade}
                </div>
              </div>
              <Switch checked={c.ativa} onCheckedChange={() => alternar(c.id)} />
            </div>
          ))}
        </div>
      </PageSection>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Nova campanha</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Troca de óleo com desconto" /></div>
            <div>
              <Label>Tipo de serviço</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {categoriasServico.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCatNova(c.key)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      catNova === c.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Desconto (%)</Label><Input type="number" value={desconto} onChange={(e) => setDesconto(e.target.value)} /></div>
              <div><Label>Validade</Label><Input value={validade} onChange={(e) => setValidade(e.target.value)} placeholder="dd/mm/aaaa" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={() => {
                if (!titulo.trim()) return toast.error("Informe o título.");
                criarCampanha({
                  titulo,
                  categoria: catNova,
                  desconto: Number(desconto) || 0,
                  validade: validade || "sem prazo",
                  alvo: "Veículos próximos da revisão",
                });
                setTitulo(""); setValidade(""); setOpen(false);
                toast.success("Campanha criada!");
              }}
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
