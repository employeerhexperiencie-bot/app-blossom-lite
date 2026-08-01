import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Star } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConect } from "@/lib/store";
import { useOficina } from "@/lib/store-oficina";
import { catalogoMock, categoriasServico, fmtBRL, labelCategoria } from "@/lib/mock-oficina";
import { toast } from "sonner";

export const Route = createFileRoute("/oficina/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil do centro — TCHI LÉVA" },
      { name: "description", content: "Dados da empresa, especialidades, horários e tabela de preços do centro de serviços." },
      { property: "og:title", content: "Perfil do centro — TCHI LÉVA" },
      { property: "og:description", content: "Configure sua vitrine no ecossistema TCHI LÉVA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { logout } = useConect();
  const navigate = useNavigate();
  const perfil = useOficina((s) => s.perfil);
  const salvarPerfil = useOficina((s) => s.salvarPerfil);
  const ordens = useOficina((s) => s.ordens);

  const [form, setForm] = useState(perfil);
  const concluidos = ordens.filter((o) => o.status === "concluido").length;

  const toggleCat = (key: (typeof categoriasServico)[number]["key"]) =>
    setForm((f) => ({
      ...f,
      categorias: f.categorias.includes(key) ? f.categorias.filter((c) => c !== key) : [...f.categorias, key],
    }));

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="font-display text-xl font-black">{perfil.nome}</div>
          <div className="text-xs text-muted-foreground">{perfil.endereco}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display font-bold">{concluidos}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Serviços</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="flex items-center justify-center gap-1 font-display font-bold">
                {perfil.rating} <Star className="h-3 w-3 fill-primary text-primary" />
              </div>
              <div className="text-[10px] uppercase text-muted-foreground">Avaliação</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="font-display font-bold">{perfil.categorias.length}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Especialid.</div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-black uppercase tracking-wider">Dados da empresa</h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
          <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} /></div>
          <div><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>WhatsApp</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
            <div><Label>Horário</Label><Input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} /></div>
          </div>
          <div>
            <Label>Especialidades</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {categoriasServico.map((c) => (
                <button
                  key={c.key}
                  onClick={() => toggleCat(c.key)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    form.categorias.includes(c.key) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                  }`}
                >
                  {c.icone} {c.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="w-full rounded-xl gradient-primary text-primary-foreground"
            onClick={() => { salvarPerfil(form); toast.success("Perfil atualizado!"); }}
          >
            Salvar alterações
          </Button>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-black uppercase tracking-wider">Tabela de preços</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {catalogoMock.map((c) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.nome}</div>
                <div className="truncate text-xs text-muted-foreground">{labelCategoria(c.categoria)} · {c.tempoMin} min</div>
              </div>
              <div className="font-display font-bold">{fmtBRL(c.preco)}</div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <Button variant="outline" className="w-full rounded-xl" onClick={() => { logout(); navigate({ to: "/" }); }}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </PageSection>
    </>
  );
}
