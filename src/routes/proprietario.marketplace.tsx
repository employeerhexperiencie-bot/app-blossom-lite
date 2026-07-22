import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Store, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FiltroBar } from "@/components/FiltroBar";
import { toast } from "sonner";
import { marketplaceMock, fmtBRL } from "@/lib/mock-proprietario";
import { useCarros, useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — TCHI LÉVA" },
      { name: "description", content: "Veja veículos disponíveis para locação na comunidade TCHI LÉVA." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const carros = useCarros();
  const anuncios = useProprietario((s) => s.anuncios);
  const criarSolicitacaoMock = useProprietario((s) => s.criarSolicitacaoMock);

  const [cidade, setCidade] = useState<string>("todos");
  const [periodicidade, setPeriodicidade] = useState<string>("todos");
  const [faixa, setFaixa] = useState<string>("todos");

  const cidades = Array.from(new Set(marketplaceMock.map((v) => v.cidade)));

  const meusPublicados = carros.filter((c) => anuncios[c.id]?.publicado);

  const comunidade = useMemo(() => marketplaceMock.filter((v) => {
    if (cidade !== "todos" && v.cidade !== cidade) return false;
    if (periodicidade !== "todos" && v.periodicidade !== periodicidade) return false;
    if (faixa === "ate100" && v.valor > 100) return false;
    if (faixa === "100a200" && (v.valor < 100 || v.valor > 200)) return false;
    if (faixa === "acima200" && v.valor <= 200) return false;
    return true;
  }), [cidade, periodicidade, faixa]);

  const ativos = (cidade !== "todos" ? 1 : 0) + (periodicidade !== "todos" ? 1 : 0) + (faixa !== "todos" ? 1 : 0);

  return (
    <>
      <PageSection>
        <Link to="/proprietario" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          <h1 className="font-street text-2xl font-black uppercase">Marketplace</h1>
        </div>
        <p className="text-xs text-muted-foreground">Veículos disponíveis para locação na comunidade.</p>
      </PageSection>

      {meusPublicados.length > 0 && (
        <PageSection className="pt-0">
          <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Seus anúncios</h2>
          <div className="flex flex-col gap-2">
            {meusPublicados.map((c) => {
              const a = anuncios[c.id]!;
              return (
                <div key={c.id} className="rounded-2xl border border-primary/40 bg-primary/5 p-3 shadow-card">
                  <div className="flex items-center gap-3">
                    <img src={c.foto} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{c.marca} {c.modelo}</div>
                      <div className="text-xs text-muted-foreground">{fmtBRL(a.valor)} · {a.periodicidade}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        criarSolicitacaoMock(c.id);
                        toast.success("Solicitação simulada recebida!");
                      }}
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5" /> Simular
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </PageSection>
      )}

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Da comunidade</h2>
        <div className="mb-3">
          <FiltroBar
            ativos={ativos}
            onLimpar={() => { setCidade("todos"); setPeriodicidade("todos"); setFaixa("todos"); }}
            chips={[
              {
                key: "cd", label: "Cidade", value: cidade, onChange: setCidade,
                options: [{ value: "todos", label: "Todas" }, ...cidades.map((c) => ({ value: c, label: c }))],
              },
              {
                key: "pr", label: "Periodicidade", value: periodicidade, onChange: setPeriodicidade,
                options: [
                  { value: "todos", label: "Todas" },
                  { value: "diaria", label: "Diária" },
                  { value: "mensal", label: "Mensal" },
                ],
              },
              {
                key: "fx", label: "Faixa de valor", value: faixa, onChange: setFaixa,
                options: [
                  { value: "todos", label: "Todas" },
                  { value: "ate100", label: "Até R$100" },
                  { value: "100a200", label: "R$100–200" },
                  { value: "acima200", label: "Acima R$200" },
                ],
              },
            ]}
          />
        </div>
        <div className="flex flex-col gap-3">
          {comunidade.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <img src={v.foto} alt={v.modelo} className="h-40 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-street text-base font-black uppercase">{v.marca} {v.modelo}</div>
                  <div className="font-street text-sm font-black text-primary">{fmtBRL(v.valor)}<span className="text-[10px] font-semibold text-muted-foreground">/{v.periodicidade === "diaria" ? "dia" : "mês"}</span></div>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{v.ano} · {v.cidade} · {v.proprietario}</div>
                <p className="mt-2 text-xs">{v.regras}</p>
                <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl" onClick={() => toast("Interesse enviado ao proprietário (mock)")}>
                  Tenho interesse
                </Button>
              </div>
            </div>
          ))}
          {comunidade.length === 0 && <p className="text-sm text-muted-foreground">Nenhum veículo nesta seleção.</p>}
        </div>
      </PageSection>
    </>
  );
}
