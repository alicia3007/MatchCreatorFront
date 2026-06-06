import { render, screen, fireEvent } from "@testing-library/react";
import CompanyCampaignDetail from "@/app/pages/CompanyCampaignDetail";
import { useUser } from "@/app/context/UserContext";
import { useParams, useRouter } from "next/navigation";

// Mocks
jest.mock("@/app/context/UserContext");
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("HU17 - Aceptar postulante", () => {
  const pushMock = jest.fn();
  const updateApplicationMock = jest.fn();
  const addMessageMock = jest.fn();
  const addNotificationMock = jest.fn();
  const addConversationMock = jest.fn();
  const getOrCreateConversationMock = jest.fn(() => ({
    id: "conv-1",
  }));

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ id: "1" });
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    (useUser as jest.Mock).mockReturnValue({
      campaigns: [
        {
          id: "1",
          name: "Test Campaign",
          companyId: "comp-1",
          companyName: "Test Company",
          budget: "$1000",
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          status: "active",
          socialPlatform: ["Instagram"],
        },
      ],
      applications: [
        {
          id: "app-1",
          campaignId: "1",
          creatorId: "creator-1",
          status: "sent",
          appliedDate: "2024-01-01",
        },
      ],
      creators: [
        {
          id: "creator-1",
          name: "John Doe",
          publicName: "@john",
          avatar: "img.jpg",
          bio: "creator bio",
          rating: 4.5,
          socialMedia: [{ followers: 1000 }],
          contentType: ["Tech"],
        },
      ],
      companies: [
        {
          id: "comp-1",
          logo: "logo.png",
        },
      ],
      currentUser: {
        id: "comp-1",
        name: "Test Company",
        logo: "logo.png",
      },
      userType: "company",

      // Funciones importantes
      updateApplication: updateApplicationMock,
      addMessage: addMessageMock,
      addNotification: addNotificationMock,
      addConversation: addConversationMock,
      getOrCreateConversation: getOrCreateConversationMock,

      // No usados pero necesarios
      updateCampaign: jest.fn(),
      conversations: [],
    });
  });

  test("renderiza postulantes correctamente", () => {
    render(<CompanyCampaignDetail />);

    // Cambiar al tab de postulantes
    fireEvent.click(screen.getByText("companyCampaignDetail.tabs.applicants"));

    // Ahora sí debe aparecer
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

  test("acepta un postulante correctamente", () => {
    render(<CompanyCampaignDetail />);

    // Ir a tab applicants
    fireEvent.click(screen.getByText("companyCampaignDetail.tabs.applicants"));

    // Botón aceptar
    const acceptButton = screen.getByText("campaigns.accept");
    fireEvent.click(acceptButton);

    // Verifica actualización de estado
    expect(updateApplicationMock).toHaveBeenCalledWith("app-1", {
      status: "accepted",
    });

    // Crear conversación
    expect(getOrCreateConversationMock).toHaveBeenCalled();

    // Se envía mensaje
    expect(addMessageMock).toHaveBeenCalled();

    // Se crea notificación
    expect(addNotificationMock).toHaveBeenCalled();

    // Redirección
    expect(pushMock).toHaveBeenCalledWith("/company/messages");
  });

  test("rechaza un postulante correctamente", () => {
    window.confirm = jest.fn(() => true);

    render(<CompanyCampaignDetail />);

    fireEvent.click(screen.getByText("companyCampaignDetail.tabs.applicants"));

    const rejectButton = screen.getByText("campaigns.reject");
    fireEvent.click(rejectButton);

    expect(updateApplicationMock).toHaveBeenCalledWith("app-1", {
      status: "rejected",
    });

    expect(addNotificationMock).toHaveBeenCalled();
  });

  test("maneja campaña no encontrada", () => {
    (useUser as jest.Mock).mockReturnValue({
      campaigns: [],
      applications: [],
    });

    render(<CompanyCampaignDetail />);

    expect(
      screen.getByText("companyCampaignDetail.notFound")
    ).toBeInTheDocument();
  });
});