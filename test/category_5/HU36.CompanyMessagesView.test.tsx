import { render, screen, fireEvent } from "@testing-library/react";
import CompanyMessages from "@/app/pages/CompanyMessages";
import "@testing-library/jest-dom";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

let mockUserData: any;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/app/context/UserContext", () => ({
  useUser: () => mockUserData,
  MATCH_CREATOR_SYSTEM: {
    id: "system",
    name: "System",
    avatar: "system.png",
  },
}));

describe("HU29 - Ver lista de conversaciones (Company)", () => {
  beforeEach(() => {
    mockUserData = {
      currentUser: { id: "company-1", name: "Company Test" },
      conversations: [
        {
          id: "conv-1",
          participants: [
            { id: "company-1", type: "company" },
            { id: "creator-1", name: "Creator Test", type: "creator" },
          ],
          lastMessage: {
            text: "Hola empresa",
            timestamp: new Date().toISOString(),
            senderId: "creator-1",
          },
          unreadByUser: { "company-1": 1 },
        },
      ],
      messages: [],
      creators: [
        {
          id: "creator-1",
          name: "Creator Test",
          publicName: "Creator Test",
          avatar: "avatar.png",
        },
      ],
      companies: [],
      addMessage: jest.fn(),
      markAsRead: jest.fn(),
    };
  });

  test("muestra la lista de conversaciones", () => {
    render(<CompanyMessages />);

    expect(screen.getAllByText("Creator Test").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hola empresa").length).toBeGreaterThan(0);
  });

  test("permite buscar conversaciones", () => {
    render(<CompanyMessages />);

    const input = screen.getByPlaceholderText(
      "companyMessages.searchPlaceholder"
    );

    fireEvent.change(input, { target: { value: "Creator" } });

    expect(screen.getAllByText("Creator Test").length).toBeGreaterThan(0);
  });

  test("muestra estado vacío si no hay conversaciones", () => {
    mockUserData.conversations = [];

    render(<CompanyMessages />);

    expect(
      screen.getByText("companyMessages.empty.title")
    ).toBeInTheDocument();
  });
});