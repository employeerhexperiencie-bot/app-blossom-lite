import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  QrCode,
  Ban,
  Check,
  StopCircle,
  Plus,
  Bell,
  Clock,
  Star,
  Megaphone,
  FileDown,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChecklistForm, ChecklistResumo } from "@/components/proprietario/ChecklistForm";
import { CobrancaPixDialog } from "@/components/proprietario/CobrancaPixDialog";
import { proximoVencimento as proximoVencimentoManual } from "@/lib/pix";
import { combustivelLabel, compararChecklists } from "@/lib/checklist";
import { emAberto, proximoVencimento } from "@/lib/cobrancas";
import {
  fmtBRL,
  fmtData,
  lembretesDefault,
  hojeISO,
  periodicidadeLabel,
  statusContratoLabel,
  type Checklist,
  type Contrato,
  type Pagamento,
} from "@/lib/mock-proprietario";
import {
  useProprietario,
  useCarro,
  usePagamentosDoContrato,
  useChecklistsDoContrato,
} from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/contratos/$id")({
  loader: ({ params }) => ({ id: params.id }),
  head: () => ({ meta: [{ title: "Contrato — TCHI LÉVA" }] }),
  component: Detalhe,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Contrato não encontrado.</div>
  ),
});

type Aba = "geral" | "checklist" | "pagamentos" | "lembretes";
const abaLabel: Record<Aba, string> = {
  geral: "Geral",
  checklist: "Checklist",
  pagamentos: "Pagamentos",
  lembretes: "Lembretes",
};

function Detalhe() {
  const { id } = Route.useLoaderData();
  const contrato = useProprietario((s) => s.contratos.find((c) => c.id === id));
  const pagamentos = usePagamentosDoContrato(id);
  const checklists = useChecklistsDoContrato(id);
  const registrarPagamento = useProprietario((s) => s.registrarPagamento);
  const registrarPagamentoDetalhado = useProprietario((s) => s.registrarPagamentoDetalhado);
  const suspender = useProprietario((s) => s.suspenderContrato);
  const lembretesSalvos = useProprietario((s) => s.lembretes[id]);
  const salvarLembretes = useProprietario((s) => s.salvarLembretes);
  const anuncio = useProprietario((s) => (contrato ? s.anuncios[contrato.carroId] : undefined));
  const perfil = useProprietario((s) => s.perfil);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const publicar = useProprietario((s) => s.publicarVeiculo);
  const motoristaAceitar = useProprietario((s) => s.motoristaAceitarContrato);
  const [aba, setAba] = useState<Aba>("geral");
  const [encerrando, setEncerrando] = useState(false);

  const carro = useCarro(contrato?.carroId);
  if (!contrato) throw notFound();

  const entrada = checklists.find((c) => c.tipo === "entrada");
  const devolucao = checklists.find((c) => c.tipo === "devolucao");
  const emAndamento = contrato.status === "ativo" || contrato.status === "suspenso";

  return (
    <>
      <PageSection>
        <Link
          to="/proprietario/contratos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Contratos
        </Link>

        <div className="mt-3 rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
            Contrato
          </div>
          <div className="font-street text-2xl font-black uppercase">{contrato.motoristaNome}</div>
          <div className="mt-1 text-xs opacity-90">
            {carro ? `${carro.marca} ${carro.modelo} · ${carro.placa}` : "—"}
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span>Valor {fmtBRL(contrato.valor)}</span>
            <span className="capitalize">{periodicidadeLabel[contrato.periodicidade]}</span>
            <span>Caução {fmtBRL(contrato.caucao)}</span>
          </div>
        </div>

        {contrato.status === "aguardando_aceite" && (
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 text-xs">
              <p>
                <b>Aguardando o motorista aceitar.</b> O contrato aparece no app dele, em Aluguéis.
                O carro só fica alugado depois do aceite.
              </p>
              {contrato.renovacaoDe && (
                <>
                  <p className="mt-1 text-muted-foreground">
                    Renovação do contrato anterior com {contrato.motoristaNome}.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 rounded-xl"
                    onClick={() => {
                      motoristaAceitar(contrato.id);
                      toast.success("Renovação aceita: o contrato está ativo");
                    }}
                  >
                    Motorista aceitou (registrar)
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        {contrato.status === "recusado" && (
          <div className="mt-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            O motorista recusou este contrato. O carro continua disponível.
          </div>
        )}
        {contrato.status === "ativo" && !entrada && (
          <button
            onClick={() => setAba("checklist")}
            className="mt-3 w-full rounded-2xl border border-warning/50 bg-warning/10 p-3 text-left text-xs"
          >
            <b>Falta o checklist de entrada.</b> Registre km, combustível e avarias na entrega do
            carro: é a base para o acerto da caução na devolução.
          </button>
        )}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(abaLabel) as Aba[]).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                aba === a
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              {abaLabel[a]}
            </button>
          ))}
        </div>

        {aba === "geral" && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Info k="Início" v={fmtData(contrato.inicio)} />
              <Info k="Fim" v={contrato.fim ? fmtData(contrato.fim) : "Em aberto"} />
              <Info k="Status" v={statusContratoLabel[contrato.status]} />
              {carro && <Info k="Veículo" v={`${carro.marca} ${carro.modelo}`} />}
            </div>

            {contrato.observacoes && (
              <p className="rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
                {contrato.observacoes}
              </p>
            )}

            <Button
              variant="outline"
              className="w-full rounded-xl"
              disabled={gerandoPdf}
              onClick={async () => {
                setGerandoPdf(true);
                try {
                  // A biblioteca de PDF só é carregada quando o dono pede o arquivo.
                  const { baixarContratoPdf } = await import("@/lib/contrato-pdf");
                  await baixarContratoPdf({
                    contrato,
                    carro,
                    proprietarioNome: perfil.nome || "Proprietário",
                  });
                  toast.success("Contrato em PDF baixado");
                } catch {
                  toast.error("Não foi possível gerar o PDF");
                } finally {
                  setGerandoPdf(false);
                }
              }}
            >
              {gerandoPdf ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Baixar contrato (PDF)
            </Button>

            {contrato.status === "encerrado" && <ResumoEncerramento contrato={contrato} />}

            {contrato.status === "encerrado" && <RenovarBloco contrato={contrato} />}

            {contrato.status === "encerrado" && anuncio && !anuncio.publicado && (
              <Button
                className="w-full rounded-xl gradient-primary text-primary-foreground"
                onClick={() => {
                  publicar(contrato.carroId, anuncio);
                  toast.success("Anúncio publicado de novo");
                }}
              >
                <Megaphone className="mr-2 h-4 w-4" /> Republicar o carro
              </Button>
            )}

            {emAndamento && !encerrando && (
              <div className="grid grid-cols-2 gap-2">
                {contrato.status === "ativo" ? (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      suspender(contrato.id);
                      toast("Contrato suspenso");
                    }}
                  >
                    <StopCircle className="mr-2 h-4 w-4" /> Suspender
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setEncerrando(true)}
                >
                  <Ban className="mr-2 h-4 w-4" /> Encerrar
                </Button>
              </div>
            )}

            {emAndamento && encerrando && (
              <EncerrarPanel
                contrato={contrato}
                kmCarro={carro?.km ?? 0}
                entrada={entrada}
                devolucao={devolucao}
                onCancelar={() => setEncerrando(false)}
                onConcluido={() => setEncerrando(false)}
              />
            )}
          </div>
        )}

        {aba === "checklist" && (
          <ChecklistPanel
            contrato={contrato}
            kmCarro={carro?.km ?? 0}
            entrada={entrada}
            devolucao={devolucao}
          />
        )}

        {aba === "pagamentos" && (
          <PagamentosPanel
            contrato={contrato}
            pagamentos={pagamentos}
            onRegistrar={registrarPagamento}
            onRegistrarDetalhado={registrarPagamentoDetalhado}
          />
        )}

        {aba === "lembretes" && (
          <LembretesPanel
            atual={lembretesSalvos ?? lembretesDefault}
            onSalvar={(cfg) => {
              salvarLembretes(id, cfg);
              toast.success("Lembretes atualizados");
            }}
          />
        )}
      </PageSection>
    </>
  );
}

function PagamentosPanel({
  contrato,
  pagamentos,
  onRegistrar,
  onRegistrarDetalhado,
}: {
  contrato: Contrato;
  pagamentos: Pagamento[];
  onRegistrar: (id: string) => void;
  onRegistrarDetalhado: (
    contratoId: string,
    dados: { valor: number; data: string; forma: Pagamento["forma"] },
  ) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(contrato.valor);
  const [data, setData] = useState(hojeISO());
  const [forma, setForma] = useState<Pagamento["forma"]>("Pix");
  const [limite, setLimite] = useState(20);
  const [cobrandoId, setCobrandoId] = useState<string | null>(null);
  const cobrando = pagamentos.find((p) => p.id === cobrandoId) ?? null;
  const gerarCobranca = useProprietario((s) => s.gerarCobranca);
  const temChavePix = useProprietario((s) => !!s.perfil.chavePix);
  const carro = useCarro(contrato.carroId);
  const navigate = useNavigate();

  const ordenados = [...pagamentos].sort((a, b) =>
    (a.vencimento ?? a.data) < (b.vencimento ?? b.data) ? 1 : -1,
  );
  const abertos = pagamentos.filter(emAberto);
  const atrasados = abertos.filter((p) => p.status === "atrasado");
  const totalAberto = abertos.reduce((a, p) => a + p.valor, 0);
  const recebido = pagamentos.filter((p) => p.status === "pago").reduce((a, p) => a + p.valor, 0);
  const proximo =
    contrato.status === "ativo" && contrato.cobrancaDesde
      ? proximoVencimento(contrato.cobrancaDesde, contrato.periodicidade, hojeISO())
      : undefined;

  return (
    <div className="mt-4">
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Info k="Recebido" v={fmtBRL(recebido)} />
        <Info k="Em aberto" v={fmtBRL(totalAberto)} />
        <Info k="Atrasados" v={String(atrasados.length)} />
      </div>
      {proximo && (
        <p className="mb-3 text-xs text-muted-foreground">
          Cobrança automática ligada. Próximo vencimento em {fmtData(proximo)}.
        </p>
      )}
      {!contrato.cobrancaDesde && contrato.status === "ativo" && (
        <p className="mb-3 text-xs text-muted-foreground">
          Contrato registrado à mão: os pagamentos são lançados manualmente.
        </p>
      )}

      {contrato.status === "ativo" && (
        <Button
          size="sm"
          className="mb-2 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
          onClick={() => {
            if (!temChavePix) {
              toast("Cadastre sua chave Pix para gerar cobranças");
              navigate({ to: "/proprietario/perfil" });
              return;
            }
            // Cobrança avulsa: vence depois da última registrada, além das geradas automaticamente.
            const ultimo = ordenados[0]?.vencimento ?? ordenados[0]?.data;
            const novoId = gerarCobranca(contrato.id, {
              valor: contrato.valor,
              vencimento: proximoVencimentoManual(ultimo, contrato.periodicidade),
            });
            setCobrandoId(novoId);
          }}
        >
          <QrCode className="mr-2 h-4 w-4" /> Gerar cobrança Pix
        </Button>
      )}
      {!aberto ? (
        <Button
          size="sm"
          variant="outline"
          className="mb-3 w-full rounded-xl"
          onClick={() => setAberto(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Registrar pagamento recebido
        </Button>
      ) : (
        <div className="mb-3 rounded-2xl border border-primary/40 bg-primary/5 p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            {abertos.length > 0
              ? "Quita a cobrança em aberto mais antiga deste contrato."
              : "Não há cobrança em aberto: será lançado como pagamento avulso."}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Valor</Label>
              <Input
                className="mt-1"
                type="number"
                value={valor}
                onChange={(e) => setValor(+e.target.value)}
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
              <Label className="text-xs">Forma</Label>
              <select
                value={forma}
                onChange={(e) => setForma(e.target.value as Pagamento["forma"])}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartão</option>
                <option>Transferência</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
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
                onRegistrarDetalhado(contrato.id, { valor, data, forma });
                toast.success("Pagamento registrado");
                setAberto(false);
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {ordenados.slice(0, limite).map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-card"
          >
            <div className="min-w-0">
              <div className="font-semibold">{fmtBRL(p.valor)}</div>
              <div className="truncate text-xs text-muted-foreground">
                {p.status === "pago"
                  ? `Pago em ${fmtData(p.pagoEm ?? p.data)} · ${p.forma}`
                  : `Vence em ${fmtData(p.vencimento ?? p.data)}`}
                {p.cobradoEm && " · cobrança enviada"}
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                p.status === "pago"
                  ? "bg-success/15 text-success"
                  : p.status === "pendente"
                    ? "bg-warning/20 text-warning-foreground"
                    : "bg-destructive/15 text-destructive"
              }`}
            >
              {p.status}
            </span>
            {p.status !== "pago" ? (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                aria-label="Cobrar com Pix"
                onClick={() => setCobrandoId(p.id)}
              >
                <QrCode className="h-4 w-4 text-primary" />
              </Button>
            ) : (
              <span className="w-8" />
            )}
            {p.status !== "pago" ? (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                aria-label="Marcar como pago"
                onClick={() => {
                  onRegistrar(p.id);
                  toast.success("Pagamento marcado como recebido");
                }}
              >
                <Check className="h-4 w-4 text-success" />
              </Button>
            ) : (
              <span className="w-8" />
            )}
          </div>
        ))}
        {ordenados.length > limite && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setLimite(limite + 20)}
          >
            Mostrar mais ({ordenados.length - limite} restantes)
          </Button>
        )}
        {pagamentos.length === 0 && (
          <p className="text-sm text-muted-foreground">Sem pagamentos registrados.</p>
        )}
      </div>
      <CobrancaPixDialog
        pagamento={cobrando}
        motoristaNome={contrato.motoristaNome}
        veiculo={carro ? `${carro.marca} ${carro.modelo}` : "veículo"}
        onClose={() => setCobrandoId(null)}
      />
    </div>
  );
}

function LembretesPanel({
  atual,
  onSalvar,
}: {
  atual: typeof lembretesDefault;
  onSalvar: (cfg: typeof lembretesDefault) => void;
}) {
  const [cfg, setCfg] = useState(atual);
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-street text-sm font-black uppercase">Lembretes ao locatário</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Com sua autorização, enviamos lembretes automáticos ao motorista.
        </p>

        <div className="mt-4 space-y-3">
          <Toggle
            checked={cfg.vencimentoAluguel}
            onChange={(v) => setCfg({ ...cfg, vencimentoAluguel: v })}
            label="Vencimento do aluguel"
            desc="Aviso antes da data de vencimento."
          />
          {cfg.vencimentoAluguel && (
            <div className="pl-6">
              <Label className="text-xs">Antecedência</Label>
              <select
                value={cfg.antecedenciaDias}
                onChange={(e) => setCfg({ ...cfg, antecedenciaDias: +e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                <option value={0}>No dia</option>
                <option value={1}>1 dia antes</option>
                <option value={3}>3 dias antes</option>
              </select>
            </div>
          )}
          <Toggle
            checked={cfg.fotoPainelMensal}
            onChange={(v) => setCfg({ ...cfg, fotoPainelMensal: v })}
            label="Foto do painel (KM)"
            desc="Pedido mensal de foto para atualizar KM."
          />
          <Toggle
            checked={cfg.documentacao}
            onChange={(v) => setCfg({ ...cfg, documentacao: v })}
            label="Documentação"
            desc="Lembrete de docs vencendo."
          />
        </div>
        <Button
          className="mt-4 w-full rounded-xl gradient-primary text-primary-foreground"
          onClick={() => onSalvar(cfg)}
        >
          Salvar preferências
        </Button>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-current"
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </label>
  );
}

function Info({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className={`text-sm font-semibold ${className}`}>{v}</div>
    </div>
  );
}

function ChecklistPanel({
  contrato,
  kmCarro,
  entrada,
  devolucao,
}: {
  contrato: Contrato;
  kmCarro: number;
  entrada?: Checklist;
  devolucao?: Checklist;
}) {
  const salvar = useProprietario((s) => s.salvarChecklist);
  const [editando, setEditando] = useState<Checklist["tipo"] | null>(null);
  const podeEntrada = contrato.status === "ativo" || contrato.status === "suspenso";
  const podeDevolucao = podeEntrada && !!entrada;

  const bloco = (
    tipo: Checklist["tipo"],
    atual: Checklist | undefined,
    pode: boolean,
    aviso: string,
  ) => (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-street text-sm font-black uppercase tracking-wider">
          {tipo === "entrada" ? "Entrega do carro" : "Devolução do carro"}
        </div>
        {atual && (
          <span className="text-[10px] uppercase text-muted-foreground">{fmtData(atual.data)}</span>
        )}
      </div>
      {editando === tipo ? (
        <ChecklistForm
          tipo={tipo}
          kmInicial={
            tipo === "devolucao" && entrada ? Math.max(kmCarro, entrada.itens.km) : kmCarro
          }
          atual={atual?.itens}
          onCancelar={() => setEditando(null)}
          onSalvar={(itens) => {
            salvar({ contratoId: contrato.id, tipo, itens });
            toast.success("Checklist salvo no Passaporte do carro");
            setEditando(null);
          }}
        />
      ) : atual ? (
        <>
          <ChecklistResumo checklist={atual} />
          {pode && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full rounded-xl"
              onClick={() => setEditando(tipo)}
            >
              Refazer checklist
            </Button>
          )}
        </>
      ) : pode ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => setEditando(tipo)}
        >
          <Plus className="mr-2 h-4 w-4" /> Preencher checklist
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">{aviso}</p>
      )}
    </div>
  );

  return (
    <div className="mt-4 flex flex-col gap-3">
      {bloco(
        "entrada",
        entrada,
        podeEntrada,
        "Disponível depois que o motorista aceitar o contrato.",
      )}
      {bloco("devolucao", devolucao, podeDevolucao, "Faça primeiro o checklist de entrada.")}
    </div>
  );
}

function EncerrarPanel({
  contrato,
  kmCarro,
  entrada,
  devolucao,
  onCancelar,
  onConcluido,
}: {
  contrato: Contrato;
  kmCarro: number;
  entrada?: Checklist;
  devolucao?: Checklist;
  onCancelar: () => void;
  onConcluido: () => void;
}) {
  const salvarChecklist = useProprietario((s) => s.salvarChecklist);
  const finalizar = useProprietario((s) => s.finalizarContrato);
  const [desconto, setDesconto] = useState(0);
  const [motivo, setMotivo] = useState("");
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const diff = compararChecklists(entrada, devolucao);

  return (
    <div className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
      <div className="font-street text-sm font-black uppercase tracking-wider">
        Encerrar contrato
      </div>

      {!devolucao ? (
        <>
          <p className="text-xs text-muted-foreground">
            Passo 1 de 2: registre como o carro voltou.
            {!entrada &&
              " Este contrato não tem checklist de entrada, então não haverá comparação."}
          </p>
          <ChecklistForm
            tipo="devolucao"
            kmInicial={entrada ? Math.max(kmCarro, entrada.itens.km) : kmCarro}
            onCancelar={onCancelar}
            onSalvar={(itens) => {
              salvarChecklist({ contratoId: contrato.id, tipo: "devolucao", itens });
              toast.success("Checklist de devolução salvo");
            }}
          />
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Passo 2 de 2: acerto da caução e avaliação.
          </p>
          {diff ? (
            <div className="rounded-xl border border-border bg-card p-3 text-xs">
              <div className="mb-1 font-semibold">Entrega x devolução</div>
              <ul className="space-y-1">
                <li>{diff.kmRodados.toLocaleString("pt-BR")} km rodados no contrato</li>
                <li className={diff.combustivelMenor ? "text-destructive" : ""}>
                  Combustível: {combustivelLabel[entrada!.itens.combustivel]} →{" "}
                  {combustivelLabel[devolucao.itens.combustivel]}
                </li>
                <li className={diff.pneusPiores ? "text-destructive" : ""}>
                  Pneus: {entrada!.itens.pneus} → {devolucao.itens.pneus}
                </li>
                <li className={diff.novasAvarias ? "text-destructive" : ""}>
                  {diff.novasAvarias ? `Avarias novas: ${diff.novasAvarias}` : "Sem avarias novas"}
                </li>
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              Sem checklist de entrada para comparar.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Desconto na caução (R$)</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                max={contrato.caucao}
                value={desconto}
                onChange={(e) =>
                  setDesconto(Math.min(contrato.caucao, Math.max(0, +e.target.value)))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Devolver ao motorista</Label>
              <div className="mt-1 flex h-10 items-center rounded-lg border border-border bg-background px-3 text-sm font-semibold">
                {fmtBRL(contrato.caucao - desconto)}
              </div>
            </div>
          </div>
          {desconto > 0 && (
            <div>
              <Label className="text-xs">Motivo do desconto</Label>
              <Input
                className="mt-1"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex.: risco na porta"
              />
            </div>
          )}

          <div>
            <Label className="text-xs">Avaliação do motorista</Label>
            <Estrelas nota={nota} onChange={setNota} />
            <Textarea
              className="mt-2"
              rows={2}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentário opcional"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button
              disabled={desconto > 0 && !motivo.trim()}
              className="flex-1 rounded-xl gradient-primary text-primary-foreground"
              onClick={() => {
                finalizar(contrato.id, {
                  desconto,
                  motivo: motivo.trim() || undefined,
                  nota,
                  comentario: comentario.trim() || undefined,
                });
                toast.success("Contrato encerrado e carro liberado");
                onConcluido();
              }}
            >
              <Check className="mr-2 h-4 w-4" /> Encerrar contrato
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/** Renovar com o mesmo motorista: mesmas condições (editáveis), sem passar pelo anúncio de novo. */
function RenovarBloco({ contrato }: { contrato: Contrato }) {
  const navigate = useNavigate();
  const renovar = useProprietario((s) => s.renovarContrato);
  const ocupado = useProprietario((s) =>
    s.contratos.some(
      (c) =>
        c.carroId === contrato.carroId &&
        c.id !== contrato.id &&
        (c.status === "ativo" || c.status === "aguardando_aceite" || c.status === "suspenso"),
    ),
  );
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(contrato.valor);
  const [caucao, setCaucao] = useState(contrato.caucao);
  const [periodicidade, setPeriodicidade] = useState(contrato.periodicidade);

  if (ocupado) return null;
  const nota = contrato.avaliacao?.nota;

  if (!aberto)
    return (
      <Button variant="outline" className="w-full rounded-xl" onClick={() => setAberto(true)}>
        Renovar com {contrato.motoristaNome.split(" ")[0]}
        {nota ? ` (nota ${nota})` : ""}
      </Button>
    );

  return (
    <div className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
      <div className="text-sm font-semibold">Renovar com {contrato.motoristaNome}</div>
      <div className="grid grid-cols-3 gap-2">
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
          <Label className="text-xs">Período</Label>
          <select
            value={periodicidade}
            onChange={(e) => setPeriodicidade(e.target.value as Contrato["periodicidade"])}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="diaria">Diária</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
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
      <p className="text-[11px] text-muted-foreground">
        O motorista recebe o contrato para aceitar. Faça o checklist de entrada de novo na entrega.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="rounded-xl" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
        <Button
          className="rounded-xl gradient-primary text-primary-foreground"
          disabled={valor <= 0}
          onClick={() => {
            const novo = renovar(contrato.id, { valor, periodicidade, caucao });
            if (!novo)
              return toast.error("Não foi possível renovar: o carro já tem outro contrato.");
            toast.success("Renovação enviada ao motorista");
            navigate({ to: "/proprietario/contratos/$id", params: { id: novo } });
          }}
        >
          Enviar renovação
        </Button>
      </div>
    </div>
  );
}

function ResumoEncerramento({ contrato }: { contrato: Contrato }) {
  if (!contrato.acerto && !contrato.avaliacao) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-xs">
      <div className="mb-2 font-semibold">Encerramento</div>
      {contrato.acerto && (
        <p>
          Caução {fmtBRL(contrato.acerto.caucao)} · desconto {fmtBRL(contrato.acerto.desconto)}
          {contrato.acerto.motivo ? ` (${contrato.acerto.motivo})` : ""} · devolvido{" "}
          {fmtBRL(contrato.acerto.devolvido)}
        </p>
      )}
      {contrato.avaliacao && (
        <p className="mt-1">
          Avaliação: {contrato.avaliacao.nota} de 5
          {contrato.avaliacao.comentario ? ` — ${contrato.avaliacao.comentario}` : ""}
        </p>
      )}
    </div>
  );
}

function Estrelas({ nota, onChange }: { nota: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-1 flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} estrelas`}>
          <Star
            className={`h-6 w-6 ${n <= nota ? "fill-warning text-warning" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}
