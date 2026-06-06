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

describe("HU18 - Rechazar postulante", () => {
  const updateApplicationMock = jest.fn();
  const addMessageMock = jest.fn();
  const addNotificationMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ id: "1" });
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

    (useUser as jest.Mock).mockReturnValue({
      campaigns: [
        {
          id: "1",
          name: "Test Campaign",
          companyId: "comp-1",
          companyName: "Test Company",
          status: "active",
          socialPlatform: ["Instagram"],
          startDate: "2024-01-01",
          endDate: "2024-01-10",
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
          bio: "bio",
          rating: 4,
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
      },
      userType: "company",

      updateApplication: updateApplicationMock,
      addMessage: addMessageMock,
      addNotification: addNotificationMock,

      // Necesarios aunque no se usen directamente
      getOrCreateConversation: jest.fn(),
      addConversation: jest.fn(),
      updateCampaign: jest.fn(),
      conversations: [],
    });
  });

  test("rechaza un postulante correctamente", () => {
    
    window.confirm = jest.fn(() => true);

    render(<CompanyCampaignDetail />);

    
    fireEvent.click(screen.getByText("companyCampaignDetail.tabs.applicants"));

    
    const rejectBtn = screen.getByText("campaigns.reject");
    fireEvent.click(rejectBtn);

   
    expect(updateApplicationMock).toHaveBeenCalledWith("app-1", {
      status: "rejected",
    });

    
    expect(addMessageMock).toHaveBeenCalled();

    
    expect(addNotificationMock).toHaveBeenCalled();
  });

  test("no rechaza si el usuario cancela confirm", () => {
    window.confirm = jest.fn(() => false);

    render(<CompanyCampaignDetail />);

    fireEvent.click(screen.getByText("companyCampaignDetail.tabs.applicants"));

    const rejectBtn = screen.getByText("campaigns.reject");
    fireEvent.click(rejectBtn);

    expect(updateApplicationMock).not.toHaveBeenCalled();
    expect(addNotificationMock).not.toHaveBeenCalled();
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