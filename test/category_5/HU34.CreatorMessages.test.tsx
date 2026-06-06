import { render, screen, fireEvent } from "@testing-library/react";
import CreatorMessages from "@/app/pages/CreatorMessages";
import "@testing-library/jest-dom";

// Mock scrollIntoView 
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

// Mocks
const pushMock = jest.fn();
const addMessageMock = jest.fn();
const markAsReadMock = jest.fn();

let mockUserData: any;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
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

describe("HU27 - Enviar mensajes a empresas", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Estado por defecto 
    mockUserData = {
      currentUser: {
        id: "creator-1",
        name: "Creator Test",
        avatar: "avatar.png",
      },
      conversations: [
        {
          id: "conv-1",
          participants: [
            { id: "creator-1", name: "Creator Test", type: "creator" },
            { id: "company-1", name: "Company Test", type: "company" },
          ],
          lastMessage: {
            text: "Hola",
            timestamp: new Date().toISOString(),
          },
          unreadByUser: { "creator-1": 1 },
        },
      ],
      messages: [
        {
          id: "msg-1",
          conversationId: "conv-1",
          senderId: "company-1",
          senderName: "Company Test",
          senderAvatar: "logo.png",
          text: "Hola",
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
      creators: [],
      companies: [
        {
          id: "company-1",
          name: "Company Test",
          logo: "logo.png",
        },
      ],
      addMessage: addMessageMock,
      markAsRead: markAsReadMock,
    };
  });

  test("renderiza conversaciones correctamente", () => {
    render(<CreatorMessages />);

    expect(screen.getAllByText("Company Test").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hola").length).toBeGreaterThan(0);
  });

  test("selecciona conversación automáticamente", () => {
    render(<CreatorMessages />);

    expect(screen.getAllByText("Company Test").length).toBeGreaterThan(0);
  });

  test("envía un mensaje correctamente", () => {
    render(<CreatorMessages />);

    const textarea = screen.getByPlaceholderText("messages.typeMessage");
    const sendButton = screen.getByText("common.send");

    fireEvent.change(textarea, { target: { value: "Nuevo mensaje" } });
    fireEvent.click(sendButton);

    expect(addMessageMock).toHaveBeenCalled();
  });

  test("no envía mensaje vacío", () => {
    render(<CreatorMessages />);

    const sendButton = screen.getByText("common.send");

    fireEvent.click(sendButton);

    expect(addMessageMock).not.toHaveBeenCalled();
  });

  test("marca mensajes como leídos al seleccionar conversación", () => {
    render(<CreatorMessages />);

    expect(markAsReadMock).toHaveBeenCalledWith("conv-1", "creator-1");
  });

  test("filtra conversaciones con búsqueda", () => {
    render(<CreatorMessages />);

    const input = screen.getByPlaceholderText(
      "creatorMessages.searchPlaceholder"
    );

    fireEvent.change(input, { target: { value: "Company" } });

    expect(screen.getAllByText("Company Test").length).toBeGreaterThan(0);
  });

  test("muestra estado vacío si no hay conversaciones", () => {

    mockUserData = {
      currentUser: { id: "creator-1", name: "Test" },
      conversations: [],
      messages: [],
      creators: [],
      companies: [],
      addMessage: jest.fn(),
      markAsRead: jest.fn(),
    };

    render(<CreatorMessages />);

    expect(
      screen.getByText("creatorMessages.empty.title")
    ).toBeInTheDocument();
  });
});