// Geração do contrato de locação em PDF, no navegador.
// A biblioteca (@react-pdf/renderer) é carregada só quando o usuário pede o PDF.
// O texto é um MODELO para o piloto: precisa de revisão jurídica antes de uso real.

import type { Carro } from "./mock-data";
import type { Contrato } from "./mock-proprietario";
import { fmtBRL, fmtData } from "./mock-proprietario";

export type DadosContratoPdf = {
  contrato: Contrato;
  carro?: Carro;
  proprietarioNome: string;
};

const periodicidadeTexto: Record<Contrato["periodicidade"], string> = {
  diaria: "por dia",
  semanal: "por semana",
  mensal: "por mês",
};

export async function baixarContratoPdf({ contrato, carro, proprietarioNome }: DadosContratoPdf) {
  const { Document, Page, Text, View, StyleSheet, pdf } = await import("@react-pdf/renderer");

  const s = StyleSheet.create({
    page: { padding: 48, fontSize: 10.5, fontFamily: "Helvetica", lineHeight: 1.5, color: "#111" },
    titulo: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
    sub: { fontSize: 9, color: "#555", marginBottom: 18 },
    secao: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 4 },
    linha: { flexDirection: "row", marginBottom: 2 },
    rotulo: { width: 130, color: "#555" },
    valor: { flex: 1 },
    clausula: { marginBottom: 6, textAlign: "justify" },
    assinaturas: { flexDirection: "row", justifyContent: "space-between", marginTop: 48 },
    assinatura: {
      width: "45%",
      borderTopWidth: 1,
      borderTopColor: "#111",
      paddingTop: 4,
      textAlign: "center",
    },
    aviso: {
      position: "absolute",
      bottom: 28,
      left: 48,
      right: 48,
      fontSize: 8,
      color: "#888",
      textAlign: "center",
    },
  });

  const veiculo = carro
    ? `${carro.marca} ${carro.modelo} ${carro.ano} · placa ${carro.placa}`
    : "Veículo não identificado";

  const Linha = ({ k, v }: { k: string; v: string }) => (
    <View style={s.linha}>
      <Text style={s.rotulo}>{k}</Text>
      <Text style={s.valor}>{v}</Text>
    </View>
  );

  const doc = (
    <Document title={`Contrato de locação — ${contrato.motoristaNome}`} author="TCHI LÉVA">
      <Page size="A4" style={s.page}>
        <Text style={s.titulo}>Contrato de Locação de Veículo</Text>
        <Text style={s.sub}>
          Contrato nº {contrato.id} · gerado em {fmtData(new Date().toISOString().slice(0, 10))}{" "}
          pela plataforma TCHI LÉVA
        </Text>

        <Text style={s.secao}>1. Partes</Text>
        <Linha k="Locador (proprietário)" v={proprietarioNome} />
        <Linha k="Locatário (motorista)" v={contrato.motoristaNome} />

        <Text style={s.secao}>2. Veículo</Text>
        <Linha k="Veículo" v={veiculo} />
        {carro?.renavam ? <Linha k="RENAVAM" v={carro.renavam} /> : null}
        {carro?.chassi ? <Linha k="Chassi" v={carro.chassi} /> : null}
        {carro?.cor ? <Linha k="Cor" v={carro.cor} /> : null}
        <Linha
          k="Quilometragem na entrega"
          v={carro ? `${carro.km.toLocaleString("pt-BR")} km` : "—"}
        />
        <Linha k="Seguro" v={carro?.seguro ? "Ativo" : "Sem seguro informado"} />

        <Text style={s.secao}>3. Valores e prazo</Text>
        <Linha
          k="Valor do aluguel"
          v={`${fmtBRL(contrato.valor)} ${periodicidadeTexto[contrato.periodicidade]}`}
        />
        <Linha k="Caução" v={fmtBRL(contrato.caucao)} />
        <Linha k="Início" v={fmtData(contrato.inicio)} />
        <Linha k="Término" v={contrato.fim ? fmtData(contrato.fim) : "Prazo indeterminado"} />
        <Linha k="Forma de pagamento" v="Pix, na data de cada vencimento" />

        <Text style={s.secao}>4. Condições</Text>
        <Text style={s.clausula}>
          4.1 O locatário pagará o aluguel na periodicidade acima. Atrasos poderão levar à suspensão
          do contrato e ao bloqueio do uso do veículo, após aviso prévio pelo aplicativo.
        </Text>
        <Text style={s.clausula}>
          4.2 A caução será devolvida no encerramento, descontados débitos de aluguel, multas de
          trânsito do período e danos não decorrentes do uso normal, apurados no checklist de
          devolução.
        </Text>
        <Text style={s.clausula}>
          4.3 O locatário enviará foto do painel quando solicitado, para registro da quilometragem,
          e informará qualquer avaria ou manutenção necessária.
        </Text>
        <Text style={s.clausula}>
          4.4 Manutenções preventivas seguem o plano registrado no Passaporte do veículo e serão
          realizadas preferencialmente em Centros de Serviços parceiros.
        </Text>
        <Text style={s.clausula}>
          4.5 Multas de trânsito cometidas durante a locação são de responsabilidade do locatário,
          que fará a indicação de condutor quando solicitado.
        </Text>
        {contrato.observacoes ? (
          <>
            <Text style={s.secao}>5. Observações combinadas</Text>
            <Text style={s.clausula}>{contrato.observacoes}</Text>
          </>
        ) : null}

        <View style={s.assinaturas}>
          <Text style={s.assinatura}>
            {proprietarioNome}
            {"\n"}Locador
          </Text>
          <Text style={s.assinatura}>
            {contrato.motoristaNome}
            {"\n"}Locatário
          </Text>
        </View>

        <Text style={s.aviso} fixed>
          Modelo gerado pelo protótipo TCHI LÉVA. Revise com um advogado antes de usar como contrato
          definitivo.
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = contrato.motoristaNome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const nomeArquivo = `contrato-${slug}-${contrato.id}.pdf`;
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
