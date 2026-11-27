import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Wrench,
  Camera,
  Megaphone,
  Gauge,
  Check,
  Bell,
  Receipt,
  StickyNote,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  fmtBRL,
  fmtData,
  eventoIcone,
  type EventoTipo,
  type ItemManutencao,
  type CustoCategoria,
  type Lembrete,
  statusContratoClasse,
  statusContratoLabel,
} from "@/lib/mock-proprietario";
import { ChecklistResumo } from "@/components/proprietario/ChecklistForm";
import {
  useProprietario,
  todosEventosDoCarro,
  useCarro,
  useManutencaoDoCarro,
  useFinanceiroPorVeiculo,
  useChecklistsDoCarro,
} from "@/lib/store-proprietario";
import { FiltroBar } from "@/components/FiltroBar";
import { descreverRequisitos, nomesNiveis } from "@/lib/requisitos";
import { EnviarOficina } from "@/components/proprietario/EnviarOficina";
import { OrcamentosOficina } from "@/components/proprietario/OrcamentosOficina";
import { VidaUtilPecas } from "@/components/proprietario/VidaUtilPecas";
import { VistoriasPainel, useSituacaoVistoria } from "@/components/proprietario/Vistoria";
import { DocumentosCarro } from "@/components/proprietario/Documentos";
import { DESTAQUE_ANUNCIO, destaqueAtivo, diasDesde } from "@/lib/regras-proprietario";
import { hojeISO } from "@/lib/mock-proprietario";

export const Route = createFileRoute("/proprietario/frota/$carroId")({
  loader: ({ params }) => ({ carroId: params.carroId }),
  head: () => ({ meta: [{ title: "Passaporte do veículo — TCHI LÉVA" }] }),
  component: Passaporte,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Carro não encontrado.</div>
  ),
});

type Aba =
  | "geral"
  | "timeline"
  | "vistorias"
  | "documentos"
  | "manutencao"
  | "contratos"
  | "checklist";

const abas: { key: Aba; label: string }[] = [
  { key: "geral", label: "Visão geral" },
  { key: "timeline", label: "Histórico" },
  { key: "vistorias", label: "Vistorias" },
  { key: "documentos", label: "Documentos" },
  { key: "manutencao", label: "Manutenção" },
  { key: "contratos", label: "Contratos" },
  { key: "checklist", label: "Checklist" },
];

type AdicionarTipo = null | "manutencao" | "custo" | "observacao" | "lembrete";

function Passaporte() {
  const { carroId } = Route.useLoaderData();
  const c = useCarro(carroId);
  const [aba, setAba] = useState<Aba>("geral");
  const extras = useProprietario((s) => s.eventosExtras);
  const contratos = useProprietario((s) => s.contratos);
  const anuncio = useProprietario((s) => s.anuncios[carroId]);
  const lembretesVeiculo = useProprietario((s) => s.lembretesVeiculo);
  const financeiro = useFinanceiroPorVeiculo();
  const checklistsCarro = useChecklistsDoCarro(carroId);

  const [adicionar, setAdicionar] = useState<AdicionarTipo>(null);

  if (!c) throw notFound();

  const eventos = todosEventosDoCarro(c.id, extras);
  const manutencao = useManutencaoDoCarro(c.id);
  const contratosVeiculo = contratos.filter((ct) => ct.carroId === c.id);
  const fin = financeiro.find((f) => f.carroId === c.id) ?? { receita: 0, custos: 0 };
  const meusLembretes = lembretesVeiculo.filter((l) => l.carroId === c.id && !l.feito);

  return (
    <div className="mx-auto min-h-screen max-w-screen-sm bg-background pb-10">
      <div className="relative h-48">
        <img src={c.foto} alt={c.modelo} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <Link
          to="/proprietario/frota"
          className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {anuncio?.publicado && (
          <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase text-primary-foreground shadow-glow">
            Publicado
          </span>
        )}
      </div>

      <div className="px-5">
        <h1 className="font-street text-2xl font-black uppercase leading-none">
          {c.marca} {c.modelo}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {c.ano} · Placa {c.placa} · {c.km.toLocaleString("pt-BR")} km
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Kpi label="Receita" value={fmtBRL(fin.receita)} />
          <Kpi label="Custos" value={fmtBRL(fin.custos)} />
          <Kpi
            label="Lucro"
            value={fmtBRL(fin.receita - fin.custos)}
            tone={fin.receita - fin.custos >= 0 ? "success" : "danger"}
          />
        </div>

        <div className="mt-4">
          <AdicionarMenu onSelect={setAdicionar} />
        </div>

        <div className="mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {abas.map((a) => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                aba === a.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {aba === "geral" && (
            <div className="flex flex-col gap-3">
              <ResumoCarro
                eventos={eventos}
                contratos={contratosVeiculo.length}
                custos={fin.custos}
              />
              <OrcamentosOficina carroId={c.id} />
              <AnuncioBloco
                carroId={c.id}
                sugerido={{ diaria: c.diaria, mensal: c.mensal, caucao: c.caucao }}
              />
              <KmBloco carroId={c.id} kmAtual={c.km} onVistoria={() => setAba("vistorias")} />
              {meusLembretes.length > 0 && <LembretesBloco lembretes={meusLembretes} />}
              <Info k="Marca / Modelo" v={`${c.marca} ${c.modelo}`} />
              <Info k="Ano" v={String(c.ano)} />
              <Info k="Placa" v={c.placa} />
              {(c.cor || c.combustivel) && (
                <Info k="Cor / Combustível" v={`${c.cor ?? "—"} · ${c.combustivel ?? "—"}`} />
              )}
              {c.renavam && <Info k="RENAVAM" v={c.renavam} />}
              {c.chassi && <Info k="Chassi" v={c.chassi} />}
              {c.observacoes && <Info k="Observações" v={c.observacoes} />}
              <Info k="Cidade" v={c.cidade} />
              <Info k="Seguro" v={c.seguro ? "Ativo" : "Sem seguro"} />
              <Info
                k="Diária / Mensal / Caução"
                v={`R$ ${c.diaria} · R$ ${c.mensal} · R$ ${c.caucao}`}
              />
              {c.motoristaAtual && <Info k="Motorista atual" v={c.motoristaAtual} />}
            </div>
          )}

          {aba === "timeline" && <TimelinePanel eventos={eventos} />}

          {aba === "vistorias" && <VistoriasPainel carroId={c.id} kmAtual={c.km} />}

          {aba === "documentos" && <DocumentosCarro carroId={c.id} />}

          {aba === "manutencao" && (
            <div className="flex flex-col gap-3">
              <OrcamentosOficina carroId={c.id} />
              <VidaUtilPecas
                carro={c}
                manutencao={manutencao}
                onRegistrar={() => setAdicionar("manutencao")}
              />
              <ManutencaoPanel
                carroId={c.id}
                kmAtual={c.km}
                itens={manutencao}
                onNova={() => setAdicionar("manutencao")}
              />
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
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusContratoClasse[ct.status]}`}
                  >
                    {statusContratoLabel[ct.status]}
                  </span>
                </Link>
              ))}
              {contratosVeiculo.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem contratos.</p>
              )}
            </div>
          )}

          {aba === "checklist" && (
            <div className="flex flex-col gap-3">
              {checklistsCarro.map((ck) => {
                const ct = contratosVeiculo.find((x) => x.id === ck.contratoId);
                return (
                  <div
                    key={ck.id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-card"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="font-street text-sm font-black uppercase tracking-wider">
                        {ck.tipo === "entrada" ? "Entrega" : "Devolução"}
                      </div>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {fmtData(ck.data)}
                      </span>
                    </div>
                    <ChecklistResumo checklist={ck} />
                    {ct && (
                      <Link
                        to="/proprietario/contratos/$id"
                        params={{ id: ct.id }}
                        className="mt-3 block text-xs font-semibold text-primary underline"
                      >
                        Contrato de {ct.motoristaNome}
                      </Link>
                    )}
                  </div>
                );
              })}
              {checklistsCarro.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum checklist ainda. Ele é feito pelo contrato, na entrega e na devolução do
                  carro.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {adicionar && (
        <AdicionarModal
          tipo={adicionar}
          carroId={c.id}
          kmAtual={c.km}
          onClose={() => setAdicionar(null)}
        />
      )}
    </div>
  );
}

// -------- Novos componentes --------

function AdicionarMenu({ onSelect }: { onSelect: (t: Exclude<AdicionarTipo, null>) => void }) {
  const items = [
    { t: "manutencao" as const, label: "Manutenção", icon: <Wrench className="h-4 w-4" /> },
    { t: "custo" as const, label: "Custo", icon: <Receipt className="h-4 w-4" /> },
    { t: "observacao" as const, label: "Observação", icon: <StickyNote className="h-4 w-4" /> },
    { t: "lembrete" as const, label: "Lembrete", icon: <Bell className="h-4 w-4" /> },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((i) => (
        <button
          key={i.t}
          onClick={() => onSelect(i.t)}
          className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-2.5 shadow-card active:scale-95"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            {i.icon}
          </span>
          <span className="text-[10px] font-semibold uppercase">{i.label}</span>
        </button>
      ))}
    </div>
  );
}

function ResumoCarro({
  eventos,
  contratos,
  custos,
}: {
  eventos: ReturnType<typeof todosEventosDoCarro>;
  contratos: number;
  custos: number;
}) {
  const manuts = eventos.filter(
    (e) => e.tipo === "troca-oleo" || e.tipo === "troca-pneu" || e.tipo === "revisao",
  ).length;
  const ultima = eventos.find(
    (e) => e.tipo === "troca-oleo" || e.tipo === "troca-pneu" || e.tipo === "revisao",
  );
  const motoristas = new Set(
    eventos
      .filter((e) => e.tipo === "locacao")
      .map((e) => e.titulo.replace(/^Alugado para\s*/i, "")),
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="font-street text-sm font-black uppercase tracking-wider text-muted-foreground">
        Resumo do carro
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <ResumoItem k="Eventos no histórico" v={String(eventos.length)} />
        <ResumoItem k="Manutenções" v={String(manuts)} />
        <ResumoItem k="Contratos" v={String(contratos)} />
        <ResumoItem k="Custos acumulados" v={fmtBRL(custos)} />
        <ResumoItem k="Última manutenção" v={ultima ? fmtData(ultima.data) : "—"} />
        <ResumoItem k="Motoristas passados" v={String(motoristas.size)} />
      </div>
    </div>
  );
}

function ResumoItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className="font-street text-sm font-black">{v}</div>
    </div>
  );
}

function LembretesBloco({ lembretes }: { lembretes: Lembrete[] }) {
  const concluir = useProprietario((s) => s.concluirLembrete);
  const remover = useProprietario((s) => s.removerLembrete);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <div className="font-street text-sm font-black uppercase">Lembretes ativos</div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {lembretes.map((l) => (
          <div
            key={l.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-xl border border-border bg-background p-2.5"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{l.titulo}</div>
              <div className="text-[10px] uppercase text-muted-foreground">
                {fmtData(l.dataAlvo)}
                {l.recorrencia !== "nenhuma" && ` · ${l.recorrencia}`}
              </div>
            </div>
            <button
              onClick={() => {
                concluir(l.id);
                toast.success("Lembrete concluído");
              }}
              className="grid h-8 w-8 place-items-center rounded-lg bg-success/15 text-success"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => remover(l.id)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelinePanel({ eventos }: { eventos: ReturnType<typeof todosEventosDoCarro> }) {
  const [tipo, setTipo] = useState<string>("todos");
  const [periodo, setPeriodo] = useState<string>("tudo");
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const hoje = new Date();
    const cutoff: Record<string, number | null> = { "30d": 30, "90d": 90, ano: 365, tudo: null };
    const dias = cutoff[periodo];
    return eventos.filter((e) => {
      if (tipo !== "todos") {
        if (tipo === "manutencao" && !["troca-oleo", "troca-pneu", "revisao"].includes(e.tipo))
          return false;
        if (tipo !== "manutencao" && e.tipo !== tipo) return false;
      }
      if (dias) {
        const d = new Date(e.data);
        const diff = (hoje.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > dias) return false;
      }
      if (busca && !e.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [eventos, tipo, periodo, busca]);

  const ativos = (tipo !== "todos" ? 1 : 0) + (periodo !== "tudo" ? 1 : 0);

  return (
    <div className="space-y-3">
      <FiltroBar
        busca={busca}
        onBusca={setBusca}
        buscaPlaceholder="Buscar no histórico..."
        ativos={ativos}
        onLimpar={() => {
          setTipo("todos");
          setPeriodo("tudo");
          setBusca("");
        }}
        chips={[
          {
            key: "tipo",
            label: "Tipo",
            value: tipo,
            onChange: setTipo,
            options: [
              { value: "todos", label: "Todos" },
              { value: "manutencao", label: "Manutenção" },
              { value: "custo", label: "Custo" },
              { value: "km", label: "KM" },
              { value: "locacao", label: "Locação" },
              { value: "multa", label: "Multa" },
              { value: "documento", label: "Documento" },
              { value: "observacao", label: "Observação" },
            ],
          },
          {
            key: "periodo",
            label: "Período",
            value: periodo,
            onChange: setPeriodo,
            options: [
              { value: "30d", label: "30 dias" },
              { value: "90d", label: "90 dias" },
              { value: "ano", label: "1 ano" },
              { value: "tudo", label: "Tudo" },
            ],
          },
        ]}
      />
      <ol className="relative border-l border-border pl-5">
        {filtrados.map((e) => (
          <li key={e.id} className="mb-4">
            <span className="absolute -left-3 grid h-6 w-6 place-items-center rounded-full bg-card text-sm shadow-card ring-1 ring-border">
              {eventoIcone(e.tipo)}
            </span>
            <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate font-semibold">{e.titulo}</div>
                <div className="shrink-0 text-[10px] uppercase text-muted-foreground">
                  {fmtData(e.data)}
                </div>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                {e.km && <span>{e.km.toLocaleString("pt-BR")} km</span>}
                {e.valor !== undefined && <span>{fmtBRL(e.valor)}</span>}
                {e.categoria && <span className="text-[10px] uppercase">{e.categoria}</span>}
                {e.origemKm && <span className="text-[10px] uppercase">via {e.origemKm}</span>}
              </div>
              {e.descricao && <p className="mt-1 text-xs text-muted-foreground">{e.descricao}</p>}
            </div>
          </li>
        ))}
        {filtrados.length === 0 && (
          <p className="ml-2 text-sm text-muted-foreground">Nenhum evento encontrado.</p>
        )}
      </ol>
    </div>
  );
}

function ManutencaoPanel({
  carroId: _cid,
  kmAtual,
  itens,
  onNova,
}: {
  carroId: string;
  kmAtual: number;
  itens: ItemManutencao[];
  onNova: () => void;
}) {
  const [status, setStatus] = useState<string>("todos");

  const filtradas = itens.filter((m) => {
    if (status === "todos") return true;
    const restante = m.proximoKm ? m.proximoKm - kmAtual : null;
    if (status === "vencida") return restante !== null && restante < 0;
    if (status === "proxima") return restante !== null && restante >= 0 && restante < 1000;
    if (status === "emdia") return restante === null || restante >= 1000;
    return true;
  });

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" variant="outline" className="w-full rounded-xl" onClick={onNova}>
        <Plus className="mr-2 h-4 w-4" /> Registrar manutenção
      </Button>
      <FiltroBar
        ativos={status !== "todos" ? 1 : 0}
        onLimpar={() => setStatus("todos")}
        chips={[
          {
            key: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "todos", label: "Todos" },
              { value: "vencida", label: "Vencida" },
              { value: "proxima", label: "Próxima" },
              { value: "emdia", label: "Em dia" },
            ],
          },
        ]}
      />
      {filtradas.map((m) => (
        <ItemManutencaoCard key={m.id} m={m} kmAtual={kmAtual} />
      ))}
      {filtradas.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum item neste filtro.</p>
      )}
    </div>
  );
}

// -------- Modais unificados de adicionar --------

function AdicionarModal({
  tipo,
  carroId,
  kmAtual,
  onClose,
}: {
  tipo: Exclude<AdicionarTipo, null>;
  carroId: string;
  kmAtual: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-background p-5 shadow-glow sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-street text-lg font-black uppercase">
            {tipo === "manutencao" && "Nova manutenção"}
            {tipo === "custo" && "Novo custo"}
            {tipo === "observacao" && "Nova observação"}
            {tipo === "lembrete" && "Novo lembrete"}
          </h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {tipo === "manutencao" && (
          <ManutencaoForm carroId={carroId} kmAtual={kmAtual} onDone={onClose} />
        )}
        {tipo === "custo" && <CustoForm carroId={carroId} onDone={onClose} />}
        {tipo === "observacao" && <ObservacaoForm carroId={carroId} onDone={onClose} />}
        {tipo === "lembrete" && <LembreteForm carroId={carroId} onDone={onClose} />}
      </div>
    </div>
  );
}

function ManutencaoForm({
  carroId,
  kmAtual,
  onDone,
}: {
  carroId: string;
  kmAtual: number;
  onDone: () => void;
}) {
  const registrar = useProprietario((s) => s.registrarManutencao);
  const [item, setItem] = useState<ItemManutencao["item"]>("Óleo");
  const [km, setKm] = useState(kmAtual);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [valor, setValor] = useState(180);
  const [obs, setObs] = useState("");
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Item</Label>
        <select
          value={item}
          onChange={(e) => setItem(e.target.value as ItemManutencao["item"])}
          className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
        >
          {[
            "Óleo",
            "Filtro de óleo",
            "Filtro de ar",
            "Freios",
            "Pneus",
            "Alinhamento",
            "Balanceamento",
            "Correia",
            "Fluídos",
          ].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">KM</Label>
          <Input
            className="mt-1"
            type="number"
            value={km}
            onChange={(e) => setKm(+e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Data</Label>
          <Input
            className="mt-1"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Valor R$</Label>
          <Input
            className="mt-1"
            type="number"
            value={valor}
            onChange={(e) => setValor(+e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Observações</Label>
        <Textarea rows={2} className="mt-1" value={obs} onChange={(e) => setObs(e.target.value)} />
      </div>
      <Button
        className="w-full rounded-xl gradient-primary text-primary-foreground"
        onClick={() => {
          registrar({ carroId, item, km, data, valor, observacoes: obs });
          toast.success("Manutenção registrada");
          onDone();
        }}
      >
        Salvar
      </Button>
    </div>
  );
}

function CustoForm({ carroId, onDone }: { carroId: string; onDone: () => void }) {
  const registrar = useProprietario((s) => s.registrarCustoAvulso);
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CustoCategoria>("outro");
  const [valor, setValor] = useState(0);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Descrição</Label>
        <Input
          className="mt-1"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Lavagem completa..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Categoria</Label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CustoCategoria)}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="lavagem">Lavagem</option>
            <option value="multa">Multa</option>
            <option value="estacionamento">Estacionamento</option>
            <option value="ipva">IPVA</option>
            <option value="combustivel">Combustível</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Valor R$</Label>
          <Input
            className="mt-1"
            type="number"
            value={valor}
            onChange={(e) => setValor(+e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Data</Label>
        <Input
          className="mt-1"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>
      <Button
        className="w-full rounded-xl gradient-primary text-primary-foreground"
        onClick={() => {
          if (!descricao || !valor) {
            toast.error("Preencha descrição e valor");
            return;
          }
          registrar({ carroId, descricao, categoria, valor, data });
          toast.success("Custo registrado");
          onDone();
        }}
      >
        Salvar custo
      </Button>
    </div>
  );
}

function ObservacaoForm({ carroId, onDone }: { carroId: string; onDone: () => void }) {
  const registrar = useProprietario((s) => s.registrarObservacao);
  const [texto, setTexto] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Observação</Label>
        <Textarea
          rows={4}
          className="mt-1"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Anote qualquer detalhe do carro..."
        />
      </div>
      <div>
        <Label className="text-xs">Data</Label>
        <Input
          className="mt-1"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>
      <Button
        className="w-full rounded-xl gradient-primary text-primary-foreground"
        onClick={() => {
          if (!texto) {
            toast.error("Escreva uma observação");
            return;
          }
          registrar({ carroId, texto, data });
          toast.success("Observação salva");
          onDone();
        }}
      >
        Salvar
      </Button>
    </div>
  );
}

function LembreteForm({ carroId, onDone }: { carroId: string; onDone: () => void }) {
  const criar = useProprietario((s) => s.criarLembrete);
  const [titulo, setTitulo] = useState("");
  const [dataAlvo, setDataAlvo] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  );
  const [recorrencia, setRecorrencia] = useState<Lembrete["recorrencia"]>("nenhuma");
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Título</Label>
        <Input
          className="mt-1"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Renovar seguro..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Data</Label>
          <Input
            className="mt-1"
            type="date"
            value={dataAlvo}
            onChange={(e) => setDataAlvo(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Recorrência</Label>
          <select
            value={recorrencia}
            onChange={(e) => setRecorrencia(e.target.value as Lembrete["recorrencia"])}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="nenhuma">Nenhuma</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      </div>
      <Button
        className="w-full rounded-xl gradient-primary text-primary-foreground"
        onClick={() => {
          if (!titulo) {
            toast.error("Dê um título");
            return;
          }
          criar({ carroId, titulo, dataAlvo, recorrencia });
          toast.success("Lembrete criado");
          onDone();
        }}
      >
        Criar lembrete
      </Button>
    </div>
  );
}

// -------- Componentes reutilizados --------

function AnuncioBloco({
  carroId,
  sugerido,
}: {
  carroId: string;
  sugerido: { diaria: number; mensal: number; caucao: number };
}) {
  const anuncio = useProprietario((s) => s.anuncios[carroId]);
  const publicar = useProprietario((s) => s.publicarVeiculo);
  const despublicar = useProprietario((s) => s.despublicarVeiculo);
  const destacar = useProprietario((s) => s.destacarAnuncio);
  const [aberto, setAberto] = useState(false);
  // Um anúncio pausado volta preenchido com as condições anteriores.
  const [periodicidade, setPeriodicidade] = useState<"diaria" | "mensal">(
    anuncio?.periodicidade ?? "diaria",
  );
  const [valor, setValor] = useState(anuncio?.valor ?? sugerido.diaria);
  const [caucao, setCaucao] = useState(anuncio?.caucao ?? sugerido.caucao);
  const [requisitos, setRequisitos] = useState(
    anuncio?.requisitos ?? "CNH B há mais de 2 anos, sem multas graves.",
  );
  const [obs, setObs] = useState(anuncio?.observacoes ?? "");
  const [nivelMinimo, setNivelMinimo] = useState(anuncio?.nivelMinimo ?? "");
  const [notaMinima, setNotaMinima] = useState(
    anuncio?.notaMinima ? String(anuncio.notaMinima) : "",
  );

  if (anuncio?.publicado) {
    return (
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <div className="font-street text-sm font-black uppercase">Anunciado no marketplace</div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {fmtBRL(anuncio.valor)} · {anuncio.periodicidade} · caução {fmtBRL(anuncio.caucao)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Requisitos: {descreverRequisitos(anuncio)}
        </div>
        {destaqueAtivo(anuncio.destaqueAte, hojeISO()) ? (
          <div className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            Em destaque até {fmtData(anuncio.destaqueAte!)}: aparece primeiro para os motoristas.
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Carro parado custa todo dia. O destaque coloca o anúncio no topo do marketplace.
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => {
              despublicar(carroId);
              toast("Anúncio pausado");
            }}
          >
            Pausar anúncio
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-xl gradient-primary text-primary-foreground"
            onClick={() => {
              if (destacar(carroId))
                toast.success(
                  `Anúncio em destaque por ${DESTAQUE_ANUNCIO.dias} dias (${fmtBRL(DESTAQUE_ANUNCIO.preco)} nos custos do carro)`,
                );
            }}
          >
            {destaqueAtivo(anuncio.destaqueAte, hojeISO())
              ? `+${DESTAQUE_ANUNCIO.dias} dias de destaque`
              : `Destacar · ${fmtBRL(DESTAQUE_ANUNCIO.preco)}`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <div className="font-street text-sm font-black uppercase">Marketplace</div>
        </div>
        {!aberto && (
          <Button
            size="sm"
            className="rounded-xl gradient-primary text-primary-foreground"
            onClick={() => setAberto(true)}
          >
            Disponibilizar
          </Button>
        )}
      </div>
      {!aberto ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Publique para motoristas verem seu veículo e enviarem solicitações.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Periodicidade</Label>
              <select
                value={periodicidade}
                onChange={(e) => setPeriodicidade(e.target.value as "diaria" | "mensal")}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                <option value="diaria">Diária</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input
                className="mt-1"
                type="number"
                value={valor}
                onChange={(e) => setValor(+e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Caução (R$)</Label>
              <Input
                className="mt-1"
                type="number"
                value={caucao}
                onChange={(e) => setCaucao(+e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nível mínimo no Clube</Label>
              <select
                value={nivelMinimo}
                onChange={(e) => setNivelMinimo(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                <option value="">Qualquer nível</option>
                {nomesNiveis.slice(1).map((n) => (
                  <option key={n} value={n}>
                    {n} ou acima
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Nota mínima</Label>
              <select
                value={notaMinima}
                onChange={(e) => setNotaMinima(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                <option value="">Qualquer nota</option>
                <option value="4.5">4,5 ou mais</option>
                <option value="4.7">4,7 ou mais</option>
                <option value="4.9">4,9 ou mais</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Motoristas Bigode e Veinho já pagam caução menor pelo benefício do Clube.
          </p>
          <div>
            <Label className="text-xs">Requisitos</Label>
            <Textarea
              rows={2}
              className="mt-1"
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea
              rows={2}
              className="mt-1"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Regras, restrições..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 rounded-xl gradient-primary text-primary-foreground"
              onClick={() => {
                publicar(carroId, {
                  publicado: true,
                  periodicidade,
                  valor,
                  caucao,
                  requisitos,
                  observacoes: obs,
                  nivelMinimo: nivelMinimo || undefined,
                  notaMinima: notaMinima ? Number(notaMinima) : undefined,
                });
                toast.success("Veículo publicado no marketplace 🚀");
                setAberto(false);
              }}
            >
              Publicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function KmBloco({
  carroId,
  kmAtual,
  onVistoria,
}: {
  carroId: string;
  kmAtual: number;
  onVistoria: () => void;
}) {
  const situacao = useSituacaoVistoria(carroId, kmAtual);
  return (
    <div
      className={`rounded-2xl border p-4 shadow-card ${situacao.pendente ? "border-warning/60 bg-warning/5" : "border-border bg-card"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <div className="font-street text-sm font-black uppercase">Quilometragem</div>
        </div>
        <div className="text-lg font-black">{kmAtual.toLocaleString("pt-BR")} km</div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {situacao.pendente ? "Vistoria pendente: " : ""}
        {situacao.motivo}.
      </p>
      <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl" onClick={onVistoria}>
        <Camera className="mr-2 h-4 w-4" /> Vistorias com fotos
      </Button>
    </div>
  );
}

function ItemManutencaoCard({ m, kmAtual }: { m: ItemManutencao; kmAtual: number }) {
  const carro = useCarro(m.carroId);
  const restante = m.proximoKm ? m.proximoKm - kmAtual : null;
  // O item também vence pelo tempo (ex.: óleo a cada 6 meses), mesmo rodando pouco.
  const vencidoTempo =
    !!m.intervaloMeses && diasDesde(m.ultimaData, hojeISO()) > m.intervaloMeses * 30.4;
  const alerta = (restante !== null && restante < 1000) || vencidoTempo;
  return (
    <div
      className={`rounded-2xl border p-3 shadow-card ${alerta ? "border-warning/60 bg-warning/5" : "border-border bg-card"}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">{m.item}</div>
        <span className="text-[10px] uppercase text-muted-foreground">
          {m.intervaloKm ? `${m.intervaloKm.toLocaleString("pt-BR")} km` : ""}
          {m.intervaloMeses ? ` · ${m.intervaloMeses}m` : ""}
        </span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span>
          Última: {fmtData(m.ultimaData)} · {m.ultimoKm.toLocaleString("pt-BR")} km
        </span>
        {m.proximoKm && (
          <span className={alerta ? "font-semibold text-warning-foreground" : ""}>
            Próxima: {m.proximoKm.toLocaleString("pt-BR")} km
            {restante !== null && restante > 0 && ` (faltam ${restante.toLocaleString("pt-BR")})`}
          </span>
        )}
        {vencidoTempo && (
          <span className="col-span-2 font-semibold text-warning-foreground">
            Vencido pelo tempo: troca a cada {m.intervaloMeses} meses
          </span>
        )}
      </div>
      {carro && <EnviarOficina carro={carro} item={m} />}
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
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

export type _KeepEventoTipo = EventoTipo;
