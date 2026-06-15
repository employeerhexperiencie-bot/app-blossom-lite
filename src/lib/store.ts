import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileKey } from "./mock-data";

type ConectState = {
  perfilAtivo: ProfileKey | null;
  nomeUsuario: string;
  setPerfil: (p: ProfileKey) => void;
  setNome: (n: string) => void;
  logout: () => void;
};

export const useConect = create<ConectState>()(
  persist(
    (set) => ({
      perfilAtivo: null,
      nomeUsuario: "",
      setPerfil: (p) => set({ perfilAtivo: p }),
      setNome: (n) => set({ nomeUsuario: n }),
      logout: () => set({ perfilAtivo: null, nomeUsuario: "" }),
    }),
    { name: "conect-state" }
  )
);
