import { render, screen, fireEvent } from "@testing-library/react";
import AvailableCampaigns from "@/app/pages/AvailableCampaigns";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

// 🔹 Mocks
jest.mock("@/app/context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // devuelve la key tal cual
    i18n: { language: "en-US" },
  }),
}));

describe("HU21 - Filtrar campañas", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useUser as jest.Mock).mockReturnValue({
      currentUser: { contentType: ["tech"] },
      campaigns: [
        {
          id: "1",
          name: "Tech Campaign",
          description: "Tech stuff",
          companyName: "TechCorp",
          creatorType: ["availableCampaigns.filters.contentTypes.tech"],
          socialPlatform: ["platforms.instagram"],
          budget: "$300",
          applicants: [],
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          status: "active",
        },
        {
          id: "2",
          name: "Fitness Campaign",
          description: "Fitness stuff",
          companyName: "FitCorp",
          creatorType: ["availableCampaigns.filters.contentTypes.fitness"],
          socialPlatform: ["platforms.youtube"],
          budget: "$3000",
          applicants: [],
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          status: "active",
        },
      ],
    });
  });

  test("filtra campañas por tipo de contenido", () => {
    render(<AvailableCampaigns />);

    // 🔹 Ambas campañas visibles inicialmente
    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.getByText("Fitness Campaign")).toBeInTheDocument();

    // Abrir dropdown de content type
    fireEvent.click(
      screen.getByText("availableCampaigns.filters.contentType")
    );

    // Seleccionar filtro "tech"
    fireEvent.click(
      screen.getByLabelText(
        "availableCampaigns.filters.contentTypes.tech"
      )
    );

    // Solo debe quedar la campaña tech
    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(
      screen.queryByText("Fitness Campaign")
    ).not.toBeInTheDocument();
  });

  test("filtra campañas por plataforma", () => {
    render(<AvailableCampaigns />);

    // Ambas campañas visibles inicialmente
    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.getByText("Fitness Campaign")).toBeInTheDocument();

    // Abrir dropdown plataforma
    fireEvent.click(
      screen.getByText("availableCampaigns.filters.platform")
    );

    // Seleccionar Instagram
    fireEvent.click(
      screen.getByLabelText("platforms.instagram")
    );

    // Solo debe quedar la campaña con Instagram
    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(
      screen.queryByText("Fitness Campaign")
    ).not.toBeInTheDocument();
  });

  test("limpiar filtros restaura todas las campañas", () => {
    render(<AvailableCampaigns />);

    // Aplicar filtro
    fireEvent.click(
      screen.getByText("availableCampaigns.filters.contentType")
    );
    fireEvent.click(
      screen.getByLabelText(
        "availableCampaigns.filters.contentTypes.tech"
      )
    );

    // Verifica que filtró
    expect(
      screen.queryByText("Fitness Campaign")
    ).not.toBeInTheDocument();

    // Limpiar filtros
    fireEvent.click(
      screen.getByText(/availableCampaigns.filters.clear/i)
    );

    // Ambas campañas vuelven
    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.getByText("Fitness Campaign")).toBeInTheDocument();
  });
});
