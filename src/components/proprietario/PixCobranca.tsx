import { Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmtBRL, fmtData } from "@/lib/mock-proprietario";
import { useProprietario } from "@/lib/store-proprietario";
import { gerarPixCopiaECola } from "@/lib/pix";

/**
 * Mostra o QR Code e o Pix copia e cola de uma cobrança, com a chave do proprietário.
 * `paraMotorista` muda os textos para quem vai pagar.
 */
export function PixCobranca({
  aberto,
  onFechar,
  valor,
  identificador,
  descricao,
  vencimento,
  paraMotorista = false,
}: {
  aberto: boolean;
  onFechar: () => void;
  valor: number;
  identificador: string;
  descricao: string;
  vencimento?: string;
  paraMotorista?: boolean;
}) {
  const perfil = useProprietario((s) => s.perfil);
  const codigo = perfil.chavePix
    ? gerarPixCopiaECola({
        chave: perfil.chavePix,
        nome: perfil.nome || "Proprietario",
        cidade: perfil.cidade,
        valor,
        identificador,
      })
    : null;

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{paraMotorista ? "Pagar com Pix" : "Cobrar com Pix"}</DialogTitle>
        </DialogHeader>
        <div className="text-sm">
          <div className="font-display text-2xl font-bold">{fmtBRL(valor)}</div>
          <div className="text-xs text-muted-foreground">
            {descricao}
            {vencimento ? ` · vence em ${fmtData(vencimento)}` : ""}
          </div>
        </div>

        {codigo ? (
          <div className="space-y-3">
            <div className="mx-auto w-fit rounded-xl bg-white p-3">
              <QRCodeSVG value={codigo} size={200} />
            </div>
            <div className="break-all rounded-xl border border-border bg-background p-2 font-mono text-[10px] text-muted-foreground">
              {codigo}
            </div>
            <Button
              className="w-full rounded-xl gradient-primary text-primary-foreground"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(codigo)
                  .then(() => toast.success("Pix copia e cola copiado"))
                  .catch(() => toast.error("Não foi possível copiar"));
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copiar Pix copia e cola
            </Button>
            <p className="text-[11px] text-muted-foreground">
              {paraMotorista
                ? `O pagamento vai para ${perfil.nome || "o proprietário"}. Ele confirma o recebimento no app.`
                : "Envie ao motorista. Depois que o dinheiro cair, marque a cobrança como paga."}
            </p>
          </div>
        ) : paraMotorista ? (
          <p className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            O proprietário ainda não cadastrou a chave Pix. Combine o pagamento com ele.
          </p>
        ) : (
          <div className="rounded-xl border border-warning/50 bg-warning/10 p-3 text-sm">
            {perfil.chavePix
              ? "A chave Pix cadastrada não é válida."
              : "Cadastre sua chave Pix para cobrar por aqui."}{" "}
            <Link
              to="/proprietario/perfil"
              className="font-semibold text-primary underline"
              onClick={onFechar}
            >
              Ir para o Perfil
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
