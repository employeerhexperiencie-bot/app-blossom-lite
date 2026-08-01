import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Camera, Check, Play, Plus, Trash2 } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaudeVeiculoCard } from "@/components/SaudeVeiculoCard";
import { useOficina, useOrdem } from "@/lib/store-oficina";
import { catalogoMock, fmtBRL, iconeCategoria, labelCategoria, statusOSInfo, totalOS } from "@/lib/mock-oficina";
import { toast } from "sonner";

export const Route = createFileRoute("/oficina/servicos/$osId")({
  head: () => ({
    meta: [
      { title: "Ordem de serviço — Centro de Serviços TCHI LÉVA" },
      { name: "description", content: "Checklist, serviços, peças, atualizações e conclusão da ordem de serviço." },
      { property: "og:title", content: "Ordem de serviço — Centro de Serviços TCHI LÉVA" },
      { property: "og:description", content: "Acompanhe o atendimento do início à entrega." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detalhe,
});

const abas = ["resumo", "checklist", "servicos", "pecas", "updates", "finalizar"] as const;
const abaLabel: Record<(typeof abas)[number], string> = {
  resumo: "Resumo",
  checklist: "Checklist",
  servicos: "Serviços",
  pecas: "Peças",
  updates: "Updates",
  finalizar: "Finalizar",
};

function Detalhe() {
  const { osId } = Route.useParams();
  const os = useOrdem(osId);
  const store = useOficina();
  const [aba, setAba] = useState<(typeof abas)[number]>("resumo");

  // dialogs
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [dataAg, setDataAg] = useState(new Date().toISOString().slice(0, 10));
  const [horaAg, setHoraAg] = useState("09:00");

  // checklist
  const [km, setKm] = useState(String(os?.checklist?.km ?? os?.km ?? ""));
  const [combustivel, setCombustivel] = useState(os?.checklist?.combustivel ?? "1/2");
  const [obsCheck, setObsCheck] = useState(os?.checklist?.observacoes ?? "");
  const [fotos, setFotos] = useState(os?.checklist?.fotos ?? 0);

  // serviço
  const [servOpen, setServOpen] = useState(false);
  const [servNome, setServNome] = useState("");
  const [servValor, setServValor] = useState("");
  const [servTempo, setServTempo] = useState("");

  // peça
  const [pecaOpen, setPecaOpen] = useState(false);
  const [pecaNome, setPecaNome] = useState("");
  const [pecaQtd, setPecaQtd] = useState("1");
  const [pecaValor, setPecaValor] = useState("");
  const [pecaForn, setPecaForn] = useState("");

  // update
  const [updTexto, setUpdTexto] = useState("");
  const [updMidia, setUpdMidia] = useState<"nenhum" | "foto" | "video">("nenhum");

  // conclusão
  const [garantia, setGarantia] = useState("3");
  const [obsFinal, setObsFinal] = useState("");
  const [fotosFinal, setFotosFinal] = useState(0);

  if (!os) {
    return (
      <PageSection>
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Ordem de serviço não encontrada.
        </div>
      </PageSection>
    );
  }

  const total = totalOS(os);
  const st = statusOSInfo[os.status];

  return (
    <>
      <PageSection>
        <Link to="/oficina/servicos" search={{ status: "todos" }} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl">{iconeCategoria(os.categoria)}</div>
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-black">{os.veiculo}</div>
              <div className="truncate text-xs text-muted-foreground">{os.codigo} · {os.placa} · {labelCategoria(os.categoria)}</div>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${st.cls}`}>{st.label}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Cliente</div>
              <div className="truncate text-sm font-semibold">{os.clienteNome}</div>
            </div>
            <div className="rounded-xl bg-muted/60 p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Total</div>
              <div className="font-display font-black">{fmtBRL(total || os.valorEstimado || 0)}</div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
          {abas.map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                aba === a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {abaLabel[a]}
            </button>
          ))}
        </div>
      </PageSection>

      {aba === "resumo" && (
        <PageSection className="space-y-4 pt-0">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pedido</div>
            <p className="mt-1 text-sm">{os.descricao}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Origem:</span> {os.origem}</div>
              <div><span className="text-muted-foreground">Contato:</span> {os.clienteTelefone}</div>
              <div><span className="text-muted-foreground">Agendado:</span> {os.dataAgendada ?? "—"} {os.hora ?? ""}</div>
              <div><span className="text-muted-foreground">KM:</span> {os.km?.toLocaleString("pt-BR") ?? "—"}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {os.status === "solicitado" && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => { store.recusarSolicitacao(os.id); toast("Solicitação recusada."); }}>
                  Recusar
                </Button>
                <Button className="rounded-xl gradient-primary text-primary-foreground" onClick={() => { store.aceitarSolicitacao(os.id); toast.success("Solicitação aceita!"); }}>
                  Aceitar
                </Button>
              </div>
            )}
            {(os.status === "aceito" || os.status === "agendado") && (
              <>
                <Button variant="outline" className="rounded-xl" onClick={() => setAgendarOpen(true)}>
                  {os.status === "agendado" ? "Reagendar" : "Agendar horário"}
                </Button>
                <Button
                  className="rounded-xl gradient-primary text-primary-foreground"
                  onClick={() => { store.iniciarAtendimento(os.id); toast.success("Atendimento iniciado!"); setAba("checklist"); }}
                >
                  <Play className="mr-2 h-4 w-4" /> Iniciar atendimento
                </Button>
              </>
            )}
            {os.status === "em_atendimento" && (
              <Button className="rounded-xl" variant="outline" onClick={() => setAba("finalizar")}>
                Ir para conclusão
              </Button>
            )}
          </div>

          <SaudeVeiculoCard km={os.checklist?.km ?? os.km ?? 30000} />
        </PageSection>
      )}

      {aba === "checklist" && (
        <PageSection className="pt-0">
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div>
              <Label>Quilometragem de entrada</Label>
              <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder="38000" />
            </div>
            <div>
              <Label>Combustível</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["vazio", "1/4", "1/2", "3/4", "cheio"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCombustivel(c)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      combustivel === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Fotos de entrada</Label>
              <button
                onClick={() => setFotos((f) => f + 1)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground"
              >
                <Camera className="h-4 w-4" /> Adicionar foto ({fotos})
              </button>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={obsCheck} onChange={(e) => setObsCheck(e.target.value)} placeholder="Avarias, riscos, itens no veículo..." />
            </div>
            <Button
              className="w-full rounded-xl gradient-primary text-primary-foreground"
              onClick={() => {
                store.salvarChecklist(os.id, {
                  km: Number(km) || 0,
                  combustivel,
                  fotos,
                  observacoes: obsCheck,
                  feitoEm: new Date().toISOString().slice(0, 10),
                });
                toast.success("Checklist salvo!");
                setAba("servicos");
              }}
            >
              Salvar checklist
            </Button>
          </div>
        </PageSection>
      )}

      {aba === "servicos" && (
        <PageSection className="pt-0">
          <Button className="w-full rounded-xl gradient-primary text-primary-foreground" onClick={() => setServOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar serviço
          </Button>
          <div className="mt-3 flex flex-col gap-2">
            {os.servicos.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Nenhum serviço adicionado.
              </div>
            )}
            {os.servicos.map((s) => (
              <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{s.nome}</div>
                  <div className="text-xs text-muted-foreground">{s.tempoMin} min</div>
                </div>
                <div className="font-display font-bold">{fmtBRL(s.valor)}</div>
                <button onClick={() => store.removerServico(os.id, s.id)} className="text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {aba === "pecas" && (
        <PageSection className="pt-0">
          <Button className="w-full rounded-xl gradient-primary text-primary-foreground" onClick={() => setPecaOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Registrar peça
          </Button>
          <div className="mt-3 flex flex-col gap-2">
            {os.pecas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Nenhuma peça registrada.
              </div>
            )}
            {os.pecas.map((p) => (
              <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{p.produto}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.quantidade}x · {p.fornecedor}</div>
                </div>
                <div className="font-display font-bold">{fmtBRL(p.valorUnit * p.quantidade)}</div>
                <button onClick={() => store.removerPeca(os.id, p.id)} className="text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-muted/60 p-3">
            <span className="text-sm font-semibold">Orçamento total</span>
            <span className="font-display text-lg font-black">{fmtBRL(total)}</span>
          </div>
        </PageSection>
      )}

      {aba === "updates" && (
        <PageSection className="pt-0">
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <Textarea value={updTexto} onChange={(e) => setUpdTexto(e.target.value)} placeholder="Ex: Pastilhas trocadas, iniciando teste de rodagem." />
            <div className="flex gap-1.5">
              {(["nenhum", "foto", "video"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setUpdMidia(m)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                    updMidia === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                  }`}
                >
                  {m === "nenhum" ? "Só texto" : m}
                </button>
              ))}
            </div>
            <Button
              className="w-full rounded-xl gradient-primary text-primary-foreground"
              onClick={() => {
                if (!updTexto.trim()) return toast.error("Escreva a atualização.");
                store.enviarAtualizacao(os.id, { texto: updTexto, midia: updMidia });
                setUpdTexto("");
                setUpdMidia("nenhum");
                toast.success("Atualização enviada ao proprietário e ao motorista.");
              }}
            >
              Enviar atualização
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {os.atualizacoes.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-3 shadow-card">
                <div className="text-xs text-muted-foreground">{a.data} · {a.midia === "nenhum" ? "texto" : a.midia}</div>
                <div className="mt-1 text-sm">{a.texto}</div>
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {aba === "finalizar" && (
        <PageSection className="pt-0">
          {os.status === "concluido" && os.conclusao ? (
            <div className="rounded-2xl border border-success/40 bg-success/10 p-4">
              <div className="flex items-center gap-2 font-semibold text-success">
                <Check className="h-4 w-4" /> Serviço concluído em {os.conclusao.data}
              </div>
              <div className="mt-2 text-sm">Total {fmtBRL(os.conclusao.valorTotal)} · garantia {os.conclusao.garantiaMeses} meses</div>
              {os.conclusao.observacoes && <p className="mt-1 text-xs text-muted-foreground">{os.conclusao.observacoes}</p>}
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                <span className="text-sm font-semibold">Valor total</span>
                <span className="font-display text-lg font-black">{fmtBRL(total)}</span>
              </div>
              <div>
                <Label>Fotos finais</Label>
                <button
                  onClick={() => setFotosFinal((f) => f + 1)}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground"
                >
                  <Camera className="h-4 w-4" /> Adicionar foto ({fotosFinal})
                </button>
              </div>
              <div>
                <Label>Garantia (meses)</Label>
                <Input type="number" value={garantia} onChange={(e) => setGarantia(e.target.value)} />
              </div>
              <div>
                <Label>Observações finais</Label>
                <Textarea value={obsFinal} onChange={(e) => setObsFinal(e.target.value)} placeholder="Recomendações para o cliente" />
              </div>
              <Button
                className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
                onClick={() => {
                  if (total <= 0) return toast.error("Adicione ao menos um serviço ou peça.");
                  store.concluirOS(os.id, {
                    valorTotal: total,
                    garantiaMeses: Number(garantia) || 0,
                    observacoes: obsFinal,
                    fotos: fotosFinal,
                  });
                  toast.success("Serviço concluído! Proprietário e motorista notificados.");
                  setAba("resumo");
                }}
              >
                <Check className="mr-2 h-4 w-4" /> Concluir serviço
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Ao concluir, o passaporte digital do veículo, o plano de manutenção e o financeiro são atualizados automaticamente.
              </p>
            </div>
          )}
        </PageSection>
      )}

      {/* Agendar */}
      <Dialog open={agendarOpen} onOpenChange={setAgendarOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Agendar atendimento</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Data</Label><Input type="date" value={dataAg} onChange={(e) => setDataAg(e.target.value)} /></div>
            <div><Label>Hora</Label><Input type="time" value={horaAg} onChange={(e) => setHoraAg(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAgendarOpen(false)}>Cancelar</Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={() => { store.agendar(os.id, dataAg, horaAg); setAgendarOpen(false); toast.success("Agendado!"); }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Serviço */}
      <Dialog open={servOpen} onOpenChange={setServOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Adicionar serviço</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {catalogoMock.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setServNome(c.nome); setServValor(String(c.preco)); setServTempo(String(c.tempoMin)); }}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold"
                >
                  {c.nome}
                </button>
              ))}
            </div>
            <div><Label>Serviço</Label><Input value={servNome} onChange={(e) => setServNome(e.target.value)} placeholder="Troca de óleo" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor</Label><Input type="number" value={servValor} onChange={(e) => setServValor(e.target.value)} /></div>
              <div><Label>Tempo (min)</Label><Input type="number" value={servTempo} onChange={(e) => setServTempo(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setServOpen(false)}>Cancelar</Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={() => {
                if (!servNome.trim()) return toast.error("Informe o serviço.");
                store.addServico(os.id, { nome: servNome, valor: Number(servValor) || 0, tempoMin: Number(servTempo) || 0 });
                setServNome(""); setServValor(""); setServTempo(""); setServOpen(false);
                toast.success("Serviço adicionado.");
              }}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Peça */}
      <Dialog open={pecaOpen} onOpenChange={setPecaOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Registrar peça</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Produto</Label><Input value={pecaNome} onChange={(e) => setPecaNome(e.target.value)} placeholder="Óleo 5W30" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantidade</Label><Input type="number" value={pecaQtd} onChange={(e) => setPecaQtd(e.target.value)} /></div>
              <div><Label>Valor unit.</Label><Input type="number" value={pecaValor} onChange={(e) => setPecaValor(e.target.value)} /></div>
            </div>
            <div><Label>Fornecedor</Label><Input value={pecaForn} onChange={(e) => setPecaForn(e.target.value)} placeholder="Auto Peças Grajaú" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPecaOpen(false)}>Cancelar</Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={() => {
                if (!pecaNome.trim()) return toast.error("Informe o produto.");
                store.addPeca(os.id, {
                  produto: pecaNome,
                  quantidade: Number(pecaQtd) || 1,
                  valorUnit: Number(pecaValor) || 0,
                  fornecedor: pecaForn || "—",
                });
                setPecaNome(""); setPecaQtd("1"); setPecaValor(""); setPecaForn(""); setPecaOpen(false);
                toast.success("Peça registrada.");
              }}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
