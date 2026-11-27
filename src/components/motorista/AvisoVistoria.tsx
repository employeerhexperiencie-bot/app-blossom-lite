import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useSituacaoVistoria } from "@/components/proprietario/Vistoria";
import { MOTORISTA_LOGADO_ID } from "@/lib/mock-proprietario";
import { useCarro, useProprietario } from "@/lib/store-proprietario";

/** Aviso na Início do motorista quando a vistoria do carro alugado está pendente. */
export function AvisoVistoria() {
  const contrato = useProprietario((s) =>
    s.contratos.find((c) => c.motoristaId === MOTORISTA_LOGADO_ID && c.status === "ativo"),
  );
  const carro = useCarro(contrato?.carroId);
  const situacao = useSituacaoVistoria(carro?.id ?? "", carro?.km ?? 0);
  if (!carro || !situacao.pendente) return null;
  return (
    <Link
      to="/motorista/vistoria"
      className="flex items-center gap-3 rounded-2xl border border-warning/60 bg-warning/10 p-3 text-xs"
    >
      <Camera className="h-5 w-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <b>Envie a vistoria do {carro.modelo}.</b> {situacao.motivo}.
      </span>
      <span className="shrink-0 font-semibold text-primary">Enviar</span>
    </Link>
  );
}
