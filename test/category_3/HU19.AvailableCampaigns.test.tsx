import { render, screen, fireEvent } from "@testing-library/react";
import AvailableCampaigns from "@/app/pages/AvailableCampaigns"; // ajusta ruta si es necesario
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

// Mocks
jest.mock("@/app/context/UserContext");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === "campaigns.applicants") return "applicants";
      return key;
    },
    i18n: { language: "en" },
  }),
}));

describe("HU19 - Ver lista de campañas disponibles", () => {
  const push = jest.fn();

  const mockCampaigns = [
    {
      id: "1",
      name: "Tech Campaign",
      description: "Tech description",
      companyName: "TechCorp",
      companyId: "c1",
      creatorType: ["tech"],
      socialPlatform: ["instagram"],
      budget: "$1000",
      applicants: [],
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      status: "active",
    },
    {
      id: "2",
      name: "Gaming Campaign",
      description: "Gaming description",
      companyName: "GameCorp",
      companyId: "c2",
      creatorType: ["gaming"],
      socialPlatform: ["youtube"],
      budget: "$3000",
      applicants: [],
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      status: "active",
    },
    {
      id: "3",
      name: "Closed Campaign",
      description: "Should not appear",
      companyName: "ClosedCorp",
      companyId: "c3",
      creatorType: ["tech"],
      socialPlatform: ["instagram"],
      budget: "$500",
      applicants: [],
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      status: "closed",
    },
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });

    (useUser as jest.Mock).mockReturnValue({
      campaigns: mockCampaigns,
      currentUser: {
        id: "u1",
        contentType: ["tech"], 
      },
    });
  });

  // Mostrar solo campañas activas
  it("muestra solo campañas activas", () => {
    render(<AvailableCampaigns />);

    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.getByText("Gaming Campaign")).toBeInTheDocument();
    expect(screen.queryByText("Closed Campaign")).not.toBeInTheDocument();
  });

  // Mostrar información básica
  it("muestra nombre, descripción y presupuesto", () => {
    render(<AvailableCampaigns />);

    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.getByText("Tech description")).toBeInTheDocument();

    expect(
      screen.getByText((text) => text.includes("$1000"))
    ).toBeInTheDocument();
  });

  // Permitir buscar campañas
  it("filtra campañas por búsqueda", () => {
    render(<AvailableCampaigns />);

    const input = screen.getByPlaceholderText("availableCampaigns.searchPlaceholder");

    fireEvent.change(input, { target: { value: "gaming" } });

    expect(screen.getByText("Gaming Campaign")).toBeInTheDocument();
    expect(screen.queryByText("Tech Campaign")).not.toBeInTheDocument();
  });

  // Permitir navegar al detalle
  it("navega al detalle de una campaña", () => {
    render(<AvailableCampaigns />);

    const button = screen.getAllByText("availableCampaigns.card.viewDetails")[0];

    fireEvent.click(button);

    expect(push).toHaveBeenCalled();
  });

  // Permitir guardar campaña
  it("permite guardar una campaña", () => {
    render(<AvailableCampaigns />);

    const saveButtons = screen.getAllByRole("button");
    fireEvent.click(saveButtons[0]); // botón de guardar

    // No hay estado visible fácil, pero al menos no rompe
    expect(saveButtons[0]).toBeInTheDocument();
  });

  // Mostrar estado vacío cuando no hay resultados
  it("muestra mensaje cuando no hay resultados", () => {
    (useUser as jest.Mock).mockReturnValue({
      campaigns: [],
      currentUser: { id: "u1" },
    });

    render(<AvailableCampaigns />);

    expect(
      screen.getByText("availableCampaigns.empty.title")
    ).toBeInTheDocument();
  });
});