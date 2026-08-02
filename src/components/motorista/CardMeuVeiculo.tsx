import { Link } from "@tanstack/react-router";
import { Car, CalendarClock, FileText, MessageSquare, Wrench, AlertTriangle } from "lucide-react";
import { fmtBRL, veiculoDoMotorista } from "@/lib/mock-operacao";
import { fmtData } from "@/lib/mock-proprietario";

export function CardMeuVeiculo() {
  const v = veiculoDoMotorista();
  const saudeCor = v.saude.score >= 80 ? "text-success" : v.saude.score >= 60 ? "text-warning" : "text-destructive";

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Meu veículo</h2>
        <span className={`font-display text-sm font-black ${saudeCor}`}>Saúde {v.saude.score}</span>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <img src={v.carro.foto} alt={`${v.carro.marca} ${v.carro.modelo}`} className="h-16 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
        <div className="min-w-0">
          <div className="truncate font-semibold">{v.carro.marca} {v.carro.modelo} {v.carro.ano}</div>
          <div className="truncate text-xs text-muted-foreground">
            {v.carro.placa} · {v.carro.km.toLocaleString("pt-BR")} km · {v.alugado ? "Alugado" : "Veículo próprio"}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {v.alugado && v.contrato && (
          <Linha icon={Car} label="Proprietário" valor={v.proprietario} />
        )}
        {v.alugado && v.proximoPagamento && (
          <Linha
            icon={CalendarClock}
            label="Próximo pagamento"
            valor={`${fmtBRL(v.proximoPagamento.valor)} · ${fmtData(v.proximoPagamento.data)}`}
            alerta={v.proximoPagamento.status !== "pago"}
          />
        )}
        <Linha
          icon={Wrench}
          label="Próxima manutenção"
          valor={
            v.proximaManutencao
              ? `${v.proximaManutencao.item}${v.kmParaManutencao !== null ? ` · em ${v.kmParaManutencao.toLocaleString("pt-BR")} km` : ""}`
              : "Sem pendências"
          }
        />
        <Linha
          icon={FileText}
          label="Documentação"
          valor={v.pendencias.length ? `${v.pendencias.length} pendência(s)` : "Tudo em dia"}
          alerta={v.pendencias.length > 0}
        />
        {v.alugado && <Linha icon={MessageSquare} label="Mensagens" valor={`${v.mensagens} não lidas`} />}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to="/motorista/orcamentos" className="rounded-xl border border-border bg-muted py-2 text-center text-xs font-bold uppercase tracking-wider">
          Pedir orçamento
        </Link>
        <Link to="/motorista/alugueis" className="rounded-xl border border-border bg-muted py-2 text-center text-xs font-bold uppercase tracking-wider">
          Trocar de carro
        </Link>
      </div>
    </div>
  );
}

function Linha({ icon: Icon, label, valor, alerta }: { icon: typeof Car; label: string; valor: string; alerta?: boolean }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted px-3 py-2">
      <Icon className={`h-4 w-4 ${alerta ? "text-warning" : "text-muted-foreground"}`} />
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 truncate text-xs font-semibold">
        {alerta && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
        {valor}
      </span>
    </div>
  );
}
