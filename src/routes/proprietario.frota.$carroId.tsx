import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { carros } from "@/lib/mock-data";
import {
  documentosMock,
  manutencaoMock,
  fmtBRL,
  fmtData,
  eventoIcone,
  financeiroPorVeiculo,
  type EventoTipo,
} from "@/lib/mock-proprietario";
import { useProprietario, todosEventosDoCarro } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/frota/$carroId")({
  loader: ({ params }) => {
    const c = carros.find((x) => x.id === params.carroId);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.modelo} — TCHI LÉVA` : "Carro" }],
  }),
  component: Passaporte,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Carro não encontrado.</div>,
});

type Aba = "geral" | "timeline" | "documentos" | "manutencao" | "contratos" | "checklist";

const abas: { key: Aba; label: string }[] = [
  { key: "geral", label: "Visão geral" },
  { key: "timeline", label: "Linha do tempo" },
  { key: "documentos", label: "Documentos" },
  { key: "manutencao", label: "Manutenção" },
  { key: "contratos", label: "Contratos" },
  { key: "checklist", label: "Checklist" },
];

function Passaporte() {
  const c = Route.useLoaderData();
  const [aba, setAba] = useState<Aba>("geral");
  const extras = useProprietario((s) => s.eventosExtras);
  const contratos = useProprietario((s) => s.contratos);
  const addEvento = useProprietario((s) => s.addEvento);

  const eventos = todosEventosDoCarro(c.id, extras);
  const docs = documentosMock.filter((d) => d.carroId === c.id);
  const manutencao = manutencaoMock.filter((m) => m.carroId === c.id);
  const contratosVeiculo = contratos.filter((ct) => ct.carroId === c.id);
  const fin = financeiroPorVeiculo.find((f) => f.carroId === c.id) ?? { receita: 0, custos: 0 };

  return (
    <div className="mx-auto min-h-screen max-w-screen-sm bg-background pb-10">
      <div className="relative h-48">
        <img src={c.foto} alt={c.modelo} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <Link to="/proprietario/frota" className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-5">
        <h1 className="font-street text-2xl font-black uppercase leading-none">{c.marca} {c.modelo}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{c.ano} · Placa {c.placa} · {c.km.toLocaleString("pt-BR")} km</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Kpi label="Receita" value={fmtBRL(fin.receita)} />
          <Kpi label="Custos" value={fmtBRL(fin.custos)} />
          <Kpi label="Lucro" value={fmtBRL(fin.receita - fin.custos)} tone={fin.receita - fin.custos >= 0 ? "success" : "danger"} />
        </div>

        <div className="mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {abas.map((a) => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                aba === a.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {aba === "geral" && (
            <div className="flex flex-col gap-3">
              <Info k="Marca / Modelo" v={`${c.marca} ${c.modelo}`} />
              <Info k="Ano" v={String(c.ano)} />
              <Info k="Placa" v={c.placa} />
              <Info k="KM" v={c.km.toLocaleString("pt-BR")} />
              <Info k="Cidade" v={c.cidade} />
              <Info k="Seguro" v={c.seguro ? "Ativo" : "Sem seguro"} />
              <Info k="Diária / Mensal / Caução" v={`R$ ${c.diaria} · R$ ${c.mensal} · R$ ${c.caucao}`} />
              {c.motoristaAtual && <Info k="Motorista atual" v={c.motoristaAtual} />}
            </div>
          )}

          {aba === "timeline" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="mb-3 w-full rounded-xl"
                onClick={() => {
                  const tipos: EventoTipo[] = ["outro", "revisao", "troca-oleo"];
                  const tipo = tipos[0];
                  addEvento({ carroId: c.id, tipo, titulo: "Anotação manual", data: new Date().toISOString().slice(0, 10) });
                  toast.success("Evento adicionado à linha do tempo");
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar evento
              </Button>
              <ol className="relative border-l border-border pl-5">
                {eventos.map((e) => (
                  <li key={e.id} className="mb-4">
                    <span className="absolute -left-3 grid h-6 w-6 place-items-center rounded-full bg-card text-sm shadow-card ring-1 ring-border">
                      {eventoIcone(e.tipo)}
                    </span>
                    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate font-semibold">{e.titulo}</div>
                        <div className="shrink-0 text-[10px] uppercase text-muted-foreground">{fmtData(e.data)}</div>
                      </div>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        {e.km && <span>{e.km.toLocaleString("pt-BR")} km</span>}
                        {e.valor && <span>{fmtBRL(e.valor)}</span>}
                      </div>
                      {e.descricao && <p className="mt-1 text-xs text-muted-foreground">{e.descricao}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {aba === "documentos" && (
            <div className="flex flex-col gap-2">
              {docs.map((d) => (
                <div key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                  <div className="min-w-0">
                    <div className="font-semibold">{d.tipo}</div>
                    <div className="text-xs text-muted-foreground">Vence em {fmtData(d.vencimento)}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    d.status === "ok" ? "bg-success/15 text-success" :
                    d.status === "vencendo" ? "bg-warning/20 text-warning-foreground" :
                    "bg-destructive/15 text-destructive"
                  }`}>
                    {d.status === "ok" ? "Em dia" : d.status === "vencendo" ? "Vencendo" : "Vencido"}
                  </span>
                </div>
              ))}
              {docs.length === 0 && <p className="text-sm text-muted-foreground">Nenhum documento cadastrado.</p>}
            </div>
          )}

          {aba === "manutencao" && (
            <div className="flex flex-col gap-2">
              {manutencao.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-card p-3 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{m.item}</div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {m.intervaloKm ? `${m.intervaloKm.toLocaleString("pt-BR")} km` : ""}
                      {m.intervaloMeses ? ` · ${m.intervaloMeses}m` : ""}
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Última: {fmtData(m.ultimaData)} · {m.ultimoKm.toLocaleString("pt-BR")} km</span>
                    {m.proximoKm && <span>Próxima: {m.proximoKm.toLocaleString("pt-BR")} km</span>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full rounded-xl"
                    onClick={() => toast("Integração com oficinas em breve")}
                  >
                    <Wrench className="mr-2 h-4 w-4" /> Enviar para oficina parceira
                  </Button>
                </div>
              ))}
              {manutencao.length === 0 && <p className="text-sm text-muted-foreground">Plano de manutenção não configurado.</p>}
            </div>
          )}

          {aba === "contratos" && (
            <div className="flex flex-col gap-2">
              {contratosVeiculo.map((ct) => (
                <Link
                  key={ct.id}
                  to="/proprietario/contratos/$id"
                  params={{ id: ct.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{ct.motoristaNome}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {fmtBRL(ct.valor)} · {ct.periodicidade} · desde {fmtData(ct.inicio)}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    ct.status === "ativo" ? "bg-success/15 text-success" :
                    ct.status === "suspenso" ? "bg-warning/20 text-warning-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {ct.status}
                  </span>
                </Link>
              ))}
              {contratosVeiculo.length === 0 && <p className="text-sm text-muted-foreground">Sem contratos.</p>}
            </div>
          )}

          {aba === "checklist" && (
            <div className="flex flex-col gap-3">
              <ChecklistCard tipo="entrada" />
              <ChecklistCard tipo="devolucao" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  const cls = tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-street text-base font-black ${cls}`}>{value}</div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right text-sm font-semibold">{v}</span>
    </div>
  );
}

function ChecklistCard({ tipo }: { tipo: "entrada" | "devolucao" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-street text-sm font-black uppercase tracking-wider">
          Checklist de {tipo}
        </div>
        <span className="text-[10px] uppercase text-muted-foreground">
          {tipo === "entrada" ? "início do contrato" : "final do contrato"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field k="KM" v="—" />
        <Field k="Combustível" v="—" />
        <Field k="Pneus" v="—" />
        <Field k="Avarias" v="Nenhuma" />
      </div>
      <Button
        size="sm"
        variant="outline"
        className="mt-3 w-full rounded-xl"
        onClick={() => toast.success(`Checklist de ${tipo} registrado (mock)`)}
      >
        <Plus className="mr-2 h-4 w-4" /> Preencher checklist
      </Button>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold">{v}</div>
    </div>
  );
}
