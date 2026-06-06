import { render, screen, fireEvent } from "@testing-library/react";
import AvailableCampaigns from "@/app/pages/AvailableCampaigns"; // ajusta ruta si es necesario
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

jest.mock("@/app/context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

describe("HU20 - Buscar campañas por texto", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    (useUser as jest.Mock).mockReturnValue({
      currentUser: { id: "creator1" },
      campaigns: [
        {
          id: "1",
          name: "Tech Campaign",
          description: "Campaña de tecnología",
          companyName: "TechCorp",
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
          name: "Food Campaign",
          description: "Campaña de comida",
          companyName: "FoodCorp",
          creatorType: ["food"],
          socialPlatform: ["youtube"],
          budget: "$2000",
          applicants: [],
          startDate: "2024-03-01",
          endDate: "2024-04-01",
          status: "active",
        },
      ],
    });
  });

  // Mostrar todas las campañas al inicio
  it("muestra todas las campañas activas por defecto", () => {
    render(<AvailableCampaigns />);

    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.getByText("Food Campaign")).toBeInTheDocument();
  });

  // Filtrar por nombre
  it("filtra campañas por nombre", () => {
    render(<AvailableCampaigns />);

    const input = screen.getByPlaceholderText("availableCampaigns.searchPlaceholder");

    fireEvent.change(input, { target: { value: "tech" } });

    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.queryByText("Food Campaign")).not.toBeInTheDocument();
  });

  // Filtrar por descripción
  it("filtra campañas por descripción", () => {
    render(<AvailableCampaigns />);

    const input = screen.getByPlaceholderText("availableCampaigns.searchPlaceholder");

    fireEvent.change(input, { target: { value: "comida" } });

    expect(screen.getByText("Food Campaign")).toBeInTheDocument();
    expect(screen.queryByText("Tech Campaign")).not.toBeInTheDocument();
  });

  // Filtrar por nombre de empresa
  it("filtra campañas por companyName", () => {
    render(<AvailableCampaigns />);

    const input = screen.getByPlaceholderText("availableCampaigns.searchPlaceholder");

    fireEvent.change(input, { target: { value: "techcorp" } });

    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.queryByText("Food Campaign")).not.toBeInTheDocument();
  });

  // No mostrar resultados si no hay match
  it("muestra estado vacío cuando no hay coincidencias", () => {
    render(<AvailableCampaigns />);

    const input = screen.getByPlaceholderText("availableCampaigns.searchPlaceholder");

    fireEvent.change(input, { target: { value: "xyz" } });

    expect(screen.queryByText("Tech Campaign")).not.toBeInTheDocument();
    expect(screen.queryByText("Food Campaign")).not.toBeInTheDocument();

    expect(screen.getByText("availableCampaigns.empty.title")).toBeInTheDocument();
  });
});