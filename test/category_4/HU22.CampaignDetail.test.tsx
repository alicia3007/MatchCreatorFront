import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { render, screen, fireEvent } from "@testing-library/react";
import CampaignDetail from "@/app/pages/CampaignDetail";
import { useUser } from "@/app/context/UserContext";
import { useParams, useRouter } from "next/navigation";

i18n.use(initReactI18next).init({
  lng: "es",
  fallbackLng: "es",
  resources: { es: { translation: {} } },
  interpolation: { escapeValue: false },
});

jest.mock("@/app/context/UserContext");
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe("HU22 - Ver detalle de campaña y postularse", () => {
  const mockPush = jest.fn();
  const mockAddApplication = jest.fn();

  const mockCampaign = {
    id: "1",
    name: "Tech Campaign",
    description: "Promote a tech product",
    objective: "Increase awareness",
    companyId: "c1",
    companyName: "Tech Corp",
    budget: "$1000",
    startDate: "2024-01-01",
    endDate: "2024-01-10",
    applicants: [],
    socialPlatform: ["Instagram"],
    requirements: ["Req 1", "Req 2"],
    creatorType: ["Tech"],
  };

  const mockCreator = {
    id: "creator1",
    name: "John Doe",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ id: "1" });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useUser as jest.Mock).mockReturnValue({
      campaigns: [mockCampaign],
      applications: [],
      addApplication: mockAddApplication,
      currentUser: mockCreator,
    });
  });

  test("renderiza el detalle de la campaña correctamente", () => {
    render(<CampaignDetail />);

    expect(screen.getByText("Tech Campaign")).toBeInTheDocument();
    expect(screen.getByText("Promote a tech product")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("$1000")).toBeInTheDocument();
  });

  test("permite postularse a una campaña", () => {
    render(<CampaignDetail />);

    const applyButton = screen.getByText(/apply/i);
    fireEvent.click(applyButton);

    expect(mockAddApplication).toHaveBeenCalledTimes(1);
  });

  test("muestra estado aplicado si ya aplicó", () => {
    (useUser as jest.Mock).mockReturnValue({
      campaigns: [mockCampaign],
      applications: [
        {
          campaignId: "1",
          creatorId: "creator1",
        },
      ],
      addApplication: mockAddApplication,
      currentUser: mockCreator,
    });

    render(<CampaignDetail />);

    expect(screen.getByText(/already/i)).toBeInTheDocument();
  });

  test("maneja campaña no encontrada", () => {
    (useUser as jest.Mock).mockReturnValue({
      campaigns: [],
      applications: [],
      addApplication: mockAddApplication,
      currentUser: mockCreator,
    });

    render(<CampaignDetail />);

    expect(screen.getByText("campaignDetail.notFound")).toBeInTheDocument();
  });
});