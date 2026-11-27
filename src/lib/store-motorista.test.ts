import { describe, it, expect, beforeEach } from "vitest";
import { useConect } from "./store";

const inicial = useConect.getState();

describe("ficar online", () => {
  beforeEach(() => useConect.setState(inicial, true));

  it("sem check-in do dia não fica online", () => {
    useConect.setState({ checkin: null, statusOperacao: "offline" });
    expect(useConect.getState().ficarOnline()).toBe(false);
    expect(useConect.getState().statusOperacao).toBe("offline");
  });

  it("com check-in de outro dia também não", () => {
    useConect.setState({
      checkin: {
        data: "2020-01-01",
        selfie: true,
        fotoFrontal: true,
        fotoTraseira: true,
        fotoInterna: true,
        iaStatus: "aprovado",
      },
    });
    expect(useConect.getState().ficarOnline()).toBe(false);
  });

  it("com check-in aprovado hoje fica online", () => {
    useConect.getState().iniciarCheckin();
    const dataCheckin = useConect.getState().checkin!.data;
    useConect.setState({
      checkin: {
        data: dataCheckin,
        selfie: true,
        fotoFrontal: true,
        fotoTraseira: true,
        fotoInterna: true,
        iaStatus: "aprovado",
      },
    });
    expect(useConect.getState().ficarOnline()).toBe(true);
    expect(useConect.getState().statusOperacao).toBe("online");
  });
});
