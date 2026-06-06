import { render, screen } from "@testing-library/react";
import CreatorMessages from "@/app/pages/CreatorMessages";
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

describe("HU35 - Identificar mensajes no leídos (Creator)", () => {
  beforeEach(() => {
    mockUserData = {
      currentUser: { id: "creator-1", name: "Creator Test" },
      conversations: [
        {
          id: "conv-1",
          participants: [
            { id: "creator-1", type: "creator" },
            { id: "company-1", name: "Company Test", type: "company" },
          ],
          lastMessage: {
            text: "Hola",
            timestamp: new Date().toISOString(),
          },
          unreadByUser: { "creator-1": 2 },
        },
      ],
      messages: [],
      creators: [],
      companies: [
        { id: "company-1", name: "Company Test", logo: "logo.png" },
      ],
      addMessage: jest.fn(),
      markAsRead: jest.fn(),
    };
  });

  test("muestra el contador de mensajes no leídos", () => {
    render(<CreatorMessages />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("no muestra el contador si no hay mensajes no leídos", () => {
    mockUserData.conversations[0].unreadByUser["creator-1"] = 0;

    render(<CreatorMessages />);

    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});