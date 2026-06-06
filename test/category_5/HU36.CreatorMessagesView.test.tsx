import { render, screen, fireEvent } from "@testing-library/react";
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

describe("HU29 - Ver lista de conversaciones (Creator)", () => {
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
          unreadByUser: { "creator-1": 1 },
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

  test("muestra la lista de conversaciones", () => {
    render(<CreatorMessages />);

    expect(screen.getAllByText("Company Test").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hola").length).toBeGreaterThan(0);
  });

  test("permite buscar conversaciones", () => {
    render(<CreatorMessages />);

    const input = screen.getByPlaceholderText(
      "creatorMessages.searchPlaceholder"
    );

    fireEvent.change(input, { target: { value: "Company" } });

    expect(screen.getAllByText("Company Test").length).toBeGreaterThan(0);
  });

  test("muestra estado vacío si no hay conversaciones", () => {
    mockUserData.conversations = [];

    render(<CreatorMessages />);

    expect(
      screen.getByText("creatorMessages.empty.title")
    ).toBeInTheDocument();
  });
});