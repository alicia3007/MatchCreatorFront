import { render, screen, fireEvent } from "@testing-library/react";
import MyCampaigns from "@/app/pages/MyCampaigns"; // ajusta si cambia la ruta
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === "myCampaigns.applicantsCount") {
        return `${params.count} applicants`;
      }
      return key;
    },
  }),
}));

describe("HU13 - Ver lista de campañas propias", () => {
  const pushMock = jest.fn();
  const updateCampaignMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useUser as jest.Mock).mockReturnValue({
      currentUser: { id: "company-1", name: "Empresa Test" },
      updateCampaign: updateCampaignMock,
      campaigns: [
        {
          id: "1",
          name: "Campaña A",
          description: "Descripción A",
          companyId: "company-1",
          status: "active",
          applicants: [],
          startDate: "2024-01-01",
          endDate: "2024-02-01",
          budget: "$1000",
          creatorType: ["tech"],
        },
        {
          id: "2",
          name: "Campaña B",
          description: "Descripción B",
          companyId: "company-1",
          status: "closed",
          applicants: [],
          startDate: "2024-03-01",
          endDate: "2024-04-01",
          budget: "$2000",
          creatorType: ["gaming"],
        },
        {
          id: "3",
          name: "Campaña AJENA",
          description: "No debería verse",
          companyId: "company-2",
          status: "active",
          applicants: [],
          startDate: "2024-01-01",
          endDate: "2024-02-01",
        },
      ],
    });
  });

  // Renderizar campañas propias
  it("muestra solo campañas de la empresa actual", () => {
    render(<MyCampaigns />);

    expect(screen.getByText("Campaña A")).toBeInTheDocument();
    expect(screen.getByText("Campaña B")).toBeInTheDocument();

    expect(screen.queryByText("Campaña AJENA")).not.toBeInTheDocument();
  });

  // Mostrar info básica
  it("muestra descripción y presupuesto", () => {
    render(<MyCampaigns />);

    expect(screen.getByText("Descripción A")).toBeInTheDocument();
    expect(
        screen.getByText((content) => content.includes("$1000"))
    ).toBeInTheDocument();
  });

  // Navegar detalle
  it("permite navegar al detalle de una campaña", () => {
    render(<MyCampaigns />);

    fireEvent.click(screen.getAllByText("myCampaigns.actions.viewDetail")[0]);

    expect(pushMock).toHaveBeenCalledWith("/company/campaigns/1");
  });

  // Activar o cerrar campaña
  it("permite cambiar estado de la campaña", () => {
    render(<MyCampaigns />);

    const toggleButton = screen.getByText("myCampaigns.actions.close");
    fireEvent.click(toggleButton);

    expect(updateCampaignMock).toHaveBeenCalledWith("1", {
      status: "closed",
    });
  });

  // Estado vacío
  it("muestra mensaje cuando no hay campañas", () => {
    (useUser as jest.Mock).mockReturnValue({
      currentUser: { id: "company-1" },
      campaigns: [],
      updateCampaign: updateCampaignMock,
    });

    render(<MyCampaigns />);

    expect(
      screen.getByText("myCampaigns.empty.title")
    ).toBeInTheDocument();
  });

  // Crear nueva campaña
  it("navega a crear nueva campaña", () => {
    render(<MyCampaigns />);

    fireEvent.click(screen.getByText("myCampaigns.newCampaign"));

    expect(pushMock).toHaveBeenCalledWith("/company/campaigns/new");
  });
});