import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Shield, FileSignature } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { PageSection } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { fmtBRL, MOTORISTA_LOGADO_ID } from "@/lib/mock-proprietario";
import { useCarros, useProprietario } from "@/lib/store-proprietario";
import { useCandidatoMotorista } from "@/lib/motorista-perfil";
import { atendeRequisitos, descreverRequisitos } from "@/lib/requisitos";

export const Route = createFileRoute("/motorista/alugueis/")({
  head: () => ({ meta: [{ title: "Aluguéis — TCHI LÉVA" }] }),
  component: Alugueis,
});

function Alugueis() {
  const [q, setQ] = useState("");
  // Mesma frota que o proprietário vê: carro alugado ou em manutenção some da lista.
  const carros = useCarros();
  const paraAceitar = useProprietario(
    useShallow((s) =>
      s.contratos.filter(
        (c) => c.motoristaId === MOTORISTA_LOGADO_ID && c.status === "aguardando_aceite",
      ),
    ),
  );
  const anuncios = useProprietario((s) => s.anuncios);
  const candidato = useCandidatoMotorista();
  // Só aparecem carros livres com anúncio publicado pelo dono.
  const list = carros.filter(
    (c) =>
      c.status === "disponivel" &&
      anuncios[c.id]?.publicado &&
      (!q || `${c.marca} ${c.modelo} ${c.cidade}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageSection>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por modelo ou cidade..."
            className="rounded-xl pl-9"
          />
        </div>
      </PageSection>

      {paraAceitar.length > 0 && (
        <PageSection className="pt-0">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contratos para você aceitar
          </h2>
          <div className="flex flex-col gap-2">
            {paraAceitar.map((ct) => {
              const carro = carros.find((c) => c.id === ct.carroId);
              return (
                <Link
                  key={ct.id}
                  to="/motorista/alugueis/$carroId"
                  params={{ carroId: ct.carroId }}
                  className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-3"
                >
                  <FileSignature className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">
                      {carro ? `${carro.marca} ${carro.modelo}` : "Carro"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fmtBRL(ct.valor)} · caução {fmtBRL(ct.caucao)}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Revisar</span>
                </Link>
              );
            })}
          </div>
        </PageSection>
      )}

      <PageSection className="pt-0">
        <div className="grid grid-cols-1 gap-3">
          {list.map((c) => (
            <Link
              key={c.id}
              to="/motorista/alugueis/$carroId"
              params={{ carroId: c.id }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="relative h-40">
                <img
                  src={c.foto}
                  alt={`${c.marca} ${c.modelo}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {c.seguro && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[11px] font-semibold shadow-soft">
                    <Shield className="h-3 w-3 text-success" /> com seguro
                  </div>
                )}
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-display text-lg font-bold">
                    {c.marca} {c.modelo}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.ano} · {c.cidade} · {c.km.toLocaleString("pt-BR")} km
                  </div>
                  <div
                    className={`mt-1 text-[11px] font-semibold ${
                      atendeRequisitos(anuncios[c.id]!, candidato).ok
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {descreverRequisitos(anuncios[c.id]!)}
                    {atendeRequisitos(anuncios[c.id]!, candidato).ok
                      ? " · você atende"
                      : " · você ainda não atende"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {anuncios[c.id]!.periodicidade === "diaria" ? "Diária" : "Mensal"}
                  </div>
                  <div className="font-display text-lg font-bold text-primary">
                    {fmtBRL(anuncios[c.id]!.valor)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum carro disponível com esses filtros.
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}
