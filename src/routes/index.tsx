import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/tchileva-logo.png.asset.json";
import { profileLabels, type ProfileKey } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TCHI LÉVA — escolha seu perfil" },
      { name: "description", content: "Motoristas, oficinas, proprietários, passageiros e lojas em um só app." },
    ],
  }),
  component: Splash,
});

const order: ProfileKey[] = ["motorista", "proprietario", "oficina", "passageiro", "loja"];

function Splash() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col bg-background">
      <header className="gradient-warm relative overflow-hidden px-6 pb-10 pt-14">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-xs font-semibold text-primary shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Clube do Motorista
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 shadow-glow">
            <img src={logo.url} alt="TCHI LÉVA" className="block h-auto w-full" loading="eager" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Um ecossistema para motoristas economizarem, oficinas crescerem e proprietários alugarem com tranquilidade.
          </p>
        </div>
      </header>

      <section className="flex-1 px-5 pb-10 pt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Como você quer entrar?
        </p>
        <div className="flex flex-col gap-3">
          {order.map((key, i) => {
            const p = profileLabels[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to="/auth"
                  search={{ perfil: key }}
                  className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-2xl">
                    {p.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-base font-bold">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Protótipo navegável.</strong> Sem cadastro real — escolha um perfil e explore.
        </div>

        <Link
          to="/admin"
          className="mt-3 block text-center text-[11px] font-medium text-muted-foreground/70 underline-offset-2 hover:text-primary hover:underline"
        >
          Acesso administrador TCHI LÉVA →
        </Link>
      </section>
    </div>
  );
}
