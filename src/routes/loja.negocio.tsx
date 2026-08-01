import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Save } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useParceiro } from "@/lib/store-parceiro";
import { categoriasItem, type CategoriaItem } from "@/lib/mock-parceiro";
import { useConect } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/negocio")({
  head: () => ({
    meta: [
      { title: "Meu Negócio — Parceiro TCHI LÉVA" },
      { name: "description", content: "Cadastro, horários, endereço, equipe e formas de pagamento da sua loja parceira." },
      { property: "og:title", content: "Meu Negócio — Parceiro TCHI LÉVA" },
      { property: "og:description", content: "Gerencie os dados institucionais da sua loja na TCHI LÉVA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MeuNegocio,
});

const formasPagamento = ["Pix", "Crédito", "Débito", "Dinheiro", "Boleto"];

function MeuNegocio() {
  const negocio = useParceiro((s) => s.negocio);
  const salvar = useParceiro((s) => s.salvarNegocio);
  const { logout } = useConect();
  const navigate = useNavigate();

  const [form, setForm] = useState(negocio);

  const toggleDia = (dia: string) =>
    setForm((f) => ({
      ...f,
      horarios: f.horarios.map((h) => (h.dia === dia ? { ...h, aberto: !h.aberto } : h)),
    }));

  const setHora = (dia: string, campo: "abre" | "fecha", v: string) =>
    setForm((f) => ({ ...f, horarios: f.horarios.map((h) => (h.dia === dia ? { ...h, [campo]: v } : h)) }));

  const togglePagamento = (p: string) =>
    setForm((f) => ({
      ...f,
      pagamentos: f.pagamentos.includes(p) ? f.pagamentos.filter((x) => x !== p) : [...f.pagamentos, p],
    }));

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="font-display text-lg font-black">{negocio.nome}</div>
          <div className="text-xs text-muted-foreground">
            ⭐ {negocio.rating} · Plano {negocio.plano === "premium" ? "Premium" : "Gratuito"}
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <Bloco titulo="Dados básicos">
          <Campo label="Nome do negócio" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
          <div>
            <Label>Categoria principal</Label>
            <select
              value={form.categoriaPrincipal}
              onChange={(e) => setForm({ ...form, categoriaPrincipal: e.target.value as CategoriaItem })}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {categoriasItem.map((c) => (
                <option key={c.key} value={c.key}>{c.icone} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Descrição</Label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
          </div>
        </Bloco>
      </PageSection>

      <PageSection className="pt-0">
        <Bloco titulo="Endereço e atendimento">
          <Campo label="Endereço" value={form.endereco} onChange={(v) => setForm({ ...form, endereco: v })} />
          <Campo label="Região atendida" value={form.regiao} onChange={(v) => setForm({ ...form, regiao: v })} />
          <Campo label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Entrega" on={form.entrega} onClick={() => setForm({ ...form, entrega: !form.entrega })} />
            <Toggle label="Retirada" on={form.retirada} onClick={() => setForm({ ...form, retirada: !form.retirada })} />
          </div>
        </Bloco>
      </PageSection>

      <PageSection className="pt-0">
        <Bloco titulo="Horários">
          <div className="flex flex-col gap-2">
            {form.horarios.map((h) => (
              <div key={h.dia} className="grid grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
                <span className="font-display text-sm font-bold">{h.dia}</span>
                <input
                  type="time" value={h.abre} disabled={!h.aberto}
                  onChange={(e) => setHora(h.dia, "abre", e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-2 text-sm disabled:opacity-40"
                />
                <input
                  type="time" value={h.fecha} disabled={!h.aberto}
                  onChange={(e) => setHora(h.dia, "fecha", e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-2 text-sm disabled:opacity-40"
                />
                <button
                  onClick={() => toggleDia(h.dia)}
                  className={`h-9 rounded-lg border px-3 text-[11px] font-semibold ${
                    h.aberto ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {h.aberto ? "Aberto" : "Fechado"}
                </button>
              </div>
            ))}
          </div>
        </Bloco>
      </PageSection>

      <PageSection className="pt-0">
        <Bloco titulo="Estrutura">
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Fotos publicadas" value={String(form.fotos)} onChange={(v) => setForm({ ...form, fotos: Number(v) || 0 })} tipo="number" />
            <Campo label="Pessoas na equipe" value={String(form.equipe)} onChange={(v) => setForm({ ...form, equipe: Number(v) || 0 })} tipo="number" />
          </div>
          <div>
            <Label>Formas de pagamento</Label>
            <div className="flex flex-wrap gap-2">
              {formasPagamento.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePagamento(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    form.pagamentos.includes(p) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </Bloco>
      </PageSection>

      <PageSection className="pt-0">
        <Button
          className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
          onClick={() => { salvar(form); toast.success("Dados do negócio salvos!"); }}
        >
          <Save className="mr-2 h-4 w-4" /> Salvar alterações
        </Button>
        <Button
          variant="outline"
          className="mt-3 w-full rounded-xl"
          onClick={() => { logout(); navigate({ to: "/" }); }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </PageSection>
    </>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h2 className="mb-3 font-display text-sm font-black uppercase tracking-wider">{titulo}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</div>;
}

function Campo({ label, value, onChange, tipo = "text" }: { label: string; value: string; onChange: (v: string) => void; tipo?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={tipo}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
      />
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-lg border text-sm font-semibold ${
        on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
      }`}
    >
      {label}: {on ? "sim" : "não"}
    </button>
  );
}
