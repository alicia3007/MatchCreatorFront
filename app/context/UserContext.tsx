"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import api from "../lib/api";

export type UserType = "creator" | "company" | null;

export interface Creator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  publicName: string;
  bio: string;
  contentType: string[];
  socialMedia: {
    platform: string;
    followers: number;
    url: string;
  }[];
  experience: string;
  portfolio: string[];
  availability: string;
  rating: number;
  reviews: Review[];
  birthDate?: string;
  age?: number;
  city?: string;
  education?: string;
  pricing?: {
    platform: string;
    perPost: number;
    perStory: number;
    perLive: number;
  }[];
}

export interface Company {
  id: string;
  name: string;
  email: string;
  logo: string;
  sector: string;
  description: string;
  budget: string;
  objectives: string[];
  rating: number;
  reviews: Review[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  companyId: string;
  companyName: string;
  objective: string;
  budget: string;
  startDate: string;
  endDate: string;
  creatorType: string[];
  socialPlatform: string[];
  requirements: string[];
  status: "active" | "closed";
  applicants: Application[];
  mainImage?: string;
  bannerImage?: string;
}

export interface Application {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  status:
    | "sent"
    | "reviewing"
    | "accepted"
    | "confirmed"
    | "rejected";
  appliedDate: string;
}

export interface Review {
  id: string;
  from: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    type: "creator" | "company" | "system";
  }[];
  campaignId?: string | null;
  lastMessage?: Message;
  unreadCount: number;
  unreadByUser: Record<string, number>;
}

export interface Notification {
  id: string;
  userId: string;
  type: "application" | "accepted" | "rejected";
  title: string;
  message: string;
  campaignId?: string;
  campaignName?: string;
  creatorName?: string;
  read: boolean;
  timestamp: string;
}

export const MATCH_CREATOR_SYSTEM = {
  id: "match-creator-system",
  name: "MatchCreator",
  avatar:
    "https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=400",
  type: "system" as const,
};

interface UserContextType {
  userType: UserType;
  currentUser: Creator | Company | null;
  setUserType: (type: UserType) => void;
  setCurrentUser: (user: Creator | Company | null) => void;
  isLoadingUser: boolean;
  logout: () => void;

  conversations: Conversation[];
  setConversations: (
    updater:
      | Conversation[]
      | ((prev: Conversation[]) => Conversation[]),
  ) => void;
  messages: Message[];
  setMessages: (
    updater: Message[] | ((prev: Message[]) => Message[]),
  ) => void;
  addConversation: (conversation: Conversation) => void;
  addMessage: (message: Message) => void;
  getOrCreateConversation: (
    currentUserId: string,
    currentUserType: "creator" | "company",
    otherUserId: string,
    otherUserType: "creator" | "company" | "system",
  ) => Conversation;
  markAsRead: (conversationId: string, userId?: string) => void;

  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};

const storage = {
  get: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};

export const UserProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [userType, setUserType] = useState<UserType>(() => {
    return (storage.get("userType") as UserType) || null;
  });
const [currentUser, setCurrentUser] = useState<
  Creator | Company | null
>(null);

  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const conversationsRef = useRef<Conversation[]>([]);

  const setConversationsSync = useCallback(
    (
      updater:
        | Conversation[]
        | ((prev: Conversation[]) => Conversation[]),
    ) => {
      setConversations((prev) => {
        const next =
          typeof updater === "function" ? updater(prev) : updater;
        conversationsRef.current = next;
        return next;
      });
    },
    [],
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ═══════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════
  const logout = useCallback(() => {
    storage.remove("token");
    storage.remove("userType");
    storage.remove("currentUserId");
    storage.remove("profileId");

    setCurrentUser(null);
    setUserType(null);
    setConversationsSync([]);
    setMessages([]);
    setNotifications([]);
  }, [setConversationsSync]);

  // ═══════════════════════════════════════════════════════════
  // CARGAR USUARIO ACTUAL AL INICIO
  // ═══════════════════════════════════════════════════════════
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    if (hasFetchedUser.current) return;
    hasFetchedUser.current = true;

    const loadCurrentUser = async () => {
      const token = storage.get("token");
      const savedUserType = storage.get("userType") as UserType;

      if (token && savedUserType) {
        try {
          const { authService } = await import("../api");
          const response = await authService.getMe();

          setUserType(response.userType);
          setCurrentUser(response.profile);
        } catch (error) {
          console.error("Error al cargar usuario:", error);
          logout();
        }
      }

      setIsLoadingUser(false);
    };

    void loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════
  // CARGAR NOTIFICACIONES DEL USUARIO ACTUAL
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const loadNotifications = async () => {
      if (isLoadingUser) return;

      if (!currentUser?.id) {
        setNotifications([]);
        return;
      }

      try {
        const { notificationsService } = await import("../api");
        const data = await notificationsService.getAll();
        setNotifications(data);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };

    void loadNotifications();
  }, [currentUser?.id, isLoadingUser]);

  // ═══════════════════════════════════════════════════════════
  // POLLING GLOBAL DE CONVERSACIONES (contador del sidebar)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isLoadingUser || !currentUser?.id) return;

    const loadConversations = async () => {
      try {
        const { messagesService } = await import("../api");
        const data = await messagesService.getConversations();
        setConversationsSync(data);
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      }
    };

    void loadConversations();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") void loadConversations();
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void loadConversations();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser?.id, isLoadingUser, setConversationsSync]);

  // ═══════════════════════════════════════════════════════════
  // PERSISTIR USERTYPE EN LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (userType) {
      storage.set("userType", userType);
    } else {
      storage.remove("userType");
    }
  }, [userType]);

  // ═══════════════════════════════════════════════════════════
  // FUNCIONES DE CONVERSACIONES Y MENSAJES
  // ═══════════════════════════════════════════════════════════

  const addConversation = useCallback(
    (conversation: Conversation) => {
      setConversationsSync((prev) => {
        const existingById = prev.find((c) => c.id === conversation.id);

        if (existingById) {
          return prev.map((c) =>
            c.id === conversation.id ? { ...c, ...conversation } : c,
          );
        }

        const existingByParticipants = prev.find((c) => {
          const ids = c.participants.map((p) => p.id).sort();
          const newIds = conversation.participants.map((p) => p.id).sort();
          return JSON.stringify(ids) === JSON.stringify(newIds);
        });

        if (existingByParticipants) {
          return prev.map((c) =>
            c.id === existingByParticipants.id
              ? { ...c, ...conversation, id: existingByParticipants.id }
              : c,
          );
        }

        return [...prev, conversation];
      });
    },
    [setConversationsSync],
  );

  const addMessage = useCallback(
    (message: Message) => {
      (async () => {
        try {
          await api.messages.post(message);
        } catch (e) {
          // ignore and continue local
        }
      })();
      setMessages((prev) => [...prev, message]);

      setConversationsSync((prev) =>
        prev.map((c) => {
          if (c.id === message.conversationId) {
            const newUnreadByUser = { ...c.unreadByUser };

            c.participants.forEach((participant) => {
              if (participant.id !== message.senderId) {
                newUnreadByUser[participant.id] =
                  (newUnreadByUser[participant.id] || 0) + 1;
              }
            });

            return {
              ...c,
              lastMessage: message,
              unreadCount: c.unreadCount + 1,
              unreadByUser: newUnreadByUser,
            };
          }

          return c;
        }),
      );
    },
    [setConversationsSync],
  );

  const getOrCreateConversation = useCallback(
    (
      currentUserId: string,
      currentUserType: "creator" | "company",
      otherUserId: string,
      otherUserType: "creator" | "company" | "system",
    ): Conversation => {
      const current = conversationsRef.current;

      const existing = current.find(
        (c) =>
          c.participants.some((p) => p.id === currentUserId) &&
          c.participants.some((p) => p.id === otherUserId),
      );

      if (existing) return existing;

      let otherName = "";
      let otherAvatar = "";

      if (otherUserType === "system") {
        otherName = MATCH_CREATOR_SYSTEM.name;
        otherAvatar = MATCH_CREATOR_SYSTEM.avatar;
      }

      const newConv: Conversation = {
        id: `conv-${currentUserId}-${otherUserId}-${Date.now()}`,
        participants: [
          {
            id: currentUserId,
            name: "",
            avatar: "",
            type: currentUserType,
          },
          {
            id: otherUserId,
            name: otherName,
            avatar: otherAvatar,
            type: otherUserType,
          },
        ],
        campaignId: null,
        lastMessage: undefined,
        unreadCount: 0,
        unreadByUser: {},
      };

      const updated = [...current, newConv];
      conversationsRef.current = updated;
      setConversations(updated);

      return newConv;
    },
    [],
  );

  const markAsRead = useCallback(
    (conversationId: string, userId?: string) => {
      setConversationsSync((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;

          if (userId) {
            const newUnreadByUser = { ...c.unreadByUser };
            newUnreadByUser[userId] = 0;
            return { ...c, unreadCount: 0, unreadByUser: newUnreadByUser };
          }

          return { ...c, unreadCount: 0, unreadByUser: {} };
        }),
      );
    },
    [setConversationsSync],
  );

  // ═══════════════════════════════════════════════════════════
  // FUNCIONES DE NOTIFICACIONES
  // ═══════════════════════════════════════════════════════════

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <UserContext.Provider
      value={{
        userType,
        currentUser,
        setUserType,
        setCurrentUser,
        isLoadingUser,
        logout,

        conversations,
        setConversations: setConversationsSync,
        messages,
        setMessages,
        addConversation,
        addMessage,
        getOrCreateConversation,
        markAsRead,

        notifications,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
