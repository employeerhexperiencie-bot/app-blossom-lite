import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  FileWarning,
  Megaphone,
  Plus,
  Wrench,
} from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { documentosMock, fmtBRL, hojeISO } from "@/lib/mock-proprietario";
import {
  useCarros,
  useManutencaoTodos,
  useProprietario,
  useTodosEventos,
} from "@/lib/store-proprietario";
import { emAberto, serieMensal } from "@/lib/cobrancas";
import { acoesDoDia, ocupacaoDaFrota, type Acao, type TipoAcao } from "@/lib/acoes-proprietario";

export const Route = createFileRoute("/proprietario/")({
  head: () => ({ meta: [{ title: "Início — Proprietário TCHI LÉVA" }] }),
  component: Inicio,
});

// A Início responde "o que precisa de mim hoje?": uma lista de ações em ordem de prioridade.
function Inicio() {
  const carros = useCarros();
  const contratos = useProprietario((s) => s.contratos);
  const pagamentos = useProprietario((s) => s.pagamentos);
  const solicitacoes = useProprietario((s) => s.solicitacoes);
  const checklists = useProprietario((s) => s.checklists);
  const anuncios = useProprietario((s) => s.anuncios);
  const perfil = useProprietario((s) => s.perfil);
  const manutencao = useManutencaoTodos();
  const eventos = useTodosEventos();
  const [verTodas, setVerTodas] = useState(false);
  const hoje = hojeISO();

  const acoes = acoesDoDia({
    hoje,
    carros,
    contratos,
    pagamentos,
    solicitacoes,
    checklists,
    documentos: documentosMock,
    manutencao,
    anuncios,
  });
  const ocupacao = ocupacaoDaFrota(carros);
  const [{ receita }] = serieMensal(pagamentos, eventos, [hoje.slice(0, 7)]);
  const emAtraso = pagamentos
    .filter((p) => emAberto(p) && p.status === "atrasado")
    .reduce((a, p) => a + p.valor, 0);
  const visiveis = verTodas ? acoes : acoes.slice(0, 6);
  const primeiroNome = perfil.nome.split(" ")[0];

  return (
    <>
      <PageSection>
        <h1 className="font-display text-xl font-bold">
          {primeiroNome ? `Olá, ${primeiroNome}` : "Olá"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {acoes.length === 0
            ? "Nada pendente hoje."
            : `${acoes.length} coisa${acoes.length > 1 ? "s" : ""} precisa${acoes.length > 1 ? "m" : ""} de você.`}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            to="/proprietario/frota"
            className="rounded-2xl border border-border bg-card p-3 text-center shadow-card"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ocupação
            </div>
            <div className="font-street text-2xl font-black text-primary">
              {ocupacao.percentual}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {ocupacao.alugados} de {ocupacao.rodaveis} carros
            </div>
          </Link>
          <Link
            to="/proprietario/financeiro"
            className="rounded-2xl border border-border bg-card p-3 text-center shadow-card"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Recebido no mês
            </div>
            <div className="font-street text-lg font-black leading-8">{fmtBRL(receita)}</div>
          </Link>
          <Link
            to="/proprietario/financeiro"
            className="rounded-2xl border border-border bg-card p-3 text-center shadow-card"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Em atraso
            </div>
            <div
              className={`font-street text-lg font-black leading-8 ${emAtraso > 0 ? "text-destructive" : ""}`}
            >
              {fmtBRL(emAtraso)}
            </div>
          </Link>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">
          Precisa de você hoje
        </h2>
        {acoes.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-success" /> Tudo em dia. Bom trabalho!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visiveis.map((a) => (
              <AcaoCard key={a.id} acao={a} />
            ))}
            {acoes.length > 6 && (
              <button
                onClick={() => setVerTodas(!verTodas)}
                className="text-center text-xs font-semibold text-primary underline"
              >
                {verTodas ? "Mostrar menos" : `Ver todas (${acoes.length})`}
              </button>
            )}
          </div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/proprietario/agenda"
            className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm font-semibold shadow-card"
          >
            <CalendarClock className="h-4 w-4 text-primary" /> Agenda da frota
          </Link>
          <Link
            to="/proprietario/frota/novo"
            className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm font-semibold shadow-card"
          >
            <Plus className="h-4 w-4 text-primary" /> Cadastrar carro
          </Link>
        </div>
      </PageSection>
    </>
  );
}

const icone: Record<TipoAcao, typeof Banknote> = {
  atraso: Banknote,
  proposta: FileText,
  checklist: ClipboardCheck,
  documento: FileWarning,
  manutencao: Wrench,
  fim_contrato: Clock,
  carro_parado: Megaphone,
  aguardando_aceite: Clock,
};

const tom: Record<Acao["urgencia"], string> = {
  alta: "bg-destructive/15 text-destructive",
  media: "bg-warning/20 text-warning-foreground",
  baixa: "bg-muted text-muted-foreground",
};

function AcaoCard({ acao }: { acao: Acao }) {
  const Icon = icone[acao.tipo];
  const classe =
    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card hover:border-primary/40";
  const conteudo = (
    <>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${tom[acao.urgencia]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="truncate font-semibold">{acao.titulo}</div>
        <div className="truncate text-xs text-muted-foreground">{acao.descricao}</div>
      </div>
      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
        {acao.botao}
      </span>
    </>
  );
  const d = acao.destino;
  if (d.to === "/proprietario/contratos/$id")
    return (
      <Link to={d.to} params={{ id: d.id }} className={classe}>
        {conteudo}
      </Link>
    );
  if (d.to === "/proprietario/solicitacoes/$id")
    return (
      <Link to={d.to} params={{ id: d.id }} className={classe}>
        {conteudo}
      </Link>
    );
  return (
    <Link to={d.to} params={{ carroId: d.carroId }} className={classe}>
      {conteudo}
    </Link>
  );
}
