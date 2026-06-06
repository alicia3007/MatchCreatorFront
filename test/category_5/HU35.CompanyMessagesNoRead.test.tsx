import { render, screen } from "@testing-library/react";
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

describe("HU35 - Identificar mensajes no leídos (Company)", () => {
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
          unreadByUser: { "company-1": 3 },
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

  test("muestra el contador de mensajes no leídos", () => {
    render(<CompanyMessages />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("no muestra el contador si no hay mensajes no leídos", () => {
    mockUserData.conversations[0].unreadByUser["company-1"] = 0;

    render(<CompanyMessages />);

    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });
});