import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Megaphone, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { fmtBRL, fmtData, hojeISO, periodicidadeLabel } from "@/lib/mock-proprietario";
import { useCarros, useProprietario } from "@/lib/store-proprietario";
import { diasEntre } from "@/lib/cobrancas";

export const Route = createFileRoute("/proprietario/frota/anuncios")({
  head: () => ({
    meta: [
      { title: "Meus anúncios — TCHI LÉVA" },
      {
        name: "description",
        content: "Anúncios dos seus carros para motoristas do TCHI LÉVA e as propostas recebidas.",
      },
    ],
  }),
  component: MeusAnuncios,
});

// Os carros do dono anunciados para os motoristas. A vitrine para quem quer alugar fica no app do motorista.
function MeusAnuncios() {
  const carros = useCarros();
  const anuncios = useProprietario((s) => s.anuncios);
  const solicitacoes = useProprietario((s) => s.solicitacoes);
  const publicar = useProprietario((s) => s.publicarVeiculo);
  const despublicar = useProprietario((s) => s.despublicarVeiculo);
  const hoje = hojeISO();

  const comAnuncio = carros.filter((c) => anuncios[c.id]);
  const semAnuncio = carros.filter((c) => !anuncios[c.id] && c.status === "disponivel");

  return (
    <>
      <PageSection>
        <Link
          to="/proprietario/frota"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Frota
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h1 className="font-street text-2xl font-black uppercase">Meus anúncios</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Carros que os motoristas veem em Aluguéis. As propostas chegam como notificação.
        </p>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {comAnuncio.map((c) => {
            const a = anuncios[c.id]!;
            const doCarro = solicitacoes.filter((s) => s.carroId === c.id);
            const pendentes = doCarro.filter((s) => s.status === "pendente");
            const dias = a.publicadoEm ? diasEntre(a.publicadoEm, hoje) : undefined;
            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-3 shadow-card ${
                  a.publicado ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={c.foto} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">
                      {c.marca} {c.modelo}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fmtBRL(a.valor)} · {periodicidadeLabel[a.periodicidade]} · caução{" "}
                      {fmtBRL(a.caucao)}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      a.publicado ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {a.publicado ? "No ar" : "Pausado"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Numero rotulo="Propostas" valor={String(doCarro.length)} />
                  <Numero
                    rotulo="Sem resposta"
                    valor={String(pendentes.length)}
                    destaque={pendentes.length > 0}
                  />
                  <Numero
                    rotulo="No ar há"
                    valor={
                      a.publicado && dias != null ? `${dias} dia${dias === 1 ? "" : "s"}` : "—"
                    }
                  />
                </div>
                {a.publicadoEm && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Publicado em {fmtData(a.publicadoEm)}
                  </p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {a.publicado ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        despublicar(c.id);
                        toast("Anúncio pausado");
                      }}
                    >
                      <Pause className="mr-1 h-3.5 w-3.5" /> Pausar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      disabled={c.status !== "disponivel"}
                      onClick={() => {
                        publicar(c.id, a);
                        toast.success("Anúncio no ar de novo");
                      }}
                    >
                      <Play className="mr-1 h-3.5 w-3.5" /> Publicar
                    </Button>
                  )}
                  <Link
                    to="/proprietario/frota/$carroId"
                    params={{ carroId: c.id }}
                    className="grid place-items-center rounded-xl border border-border bg-card text-xs font-semibold"
                  >
                    Editar no carro
                  </Link>
                </div>
              </div>
            );
          })}
          {comAnuncio.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum carro anunciado ainda.</p>
          )}
        </div>
      </PageSection>

      {semAnuncio.length > 0 && (
        <PageSection className="pt-0">
          <h2 className="mb-2 font-street text-xs font-black uppercase tracking-wider text-muted-foreground">
            Livres e sem anúncio
          </h2>
          <div className="flex flex-col gap-2">
            {semAnuncio.map((c) => (
              <Link
                key={c.id}
                to="/proprietario/frota/$carroId"
                params={{ carroId: c.id }}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {c.marca} {c.modelo}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Parado. Publique para receber propostas.
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary">Anunciar</span>
              </Link>
            ))}
          </div>
        </PageSection>
      )}
    </>
  );
}

function Numero({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{rotulo}</div>
      <div className={`font-semibold ${destaque ? "text-primary" : ""}`}>{valor}</div>
    </div>
  );
}
