"use client";

import {
  useUser,
  MATCH_CREATOR_SYSTEM,
} from "../context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import CreatorSidebar from "../components/CreatorSidebar";
import {
  MessageSquare, Send, Search, Clock, CheckCircle,
  ShieldCheck, Loader2, ArrowRight,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { messagesService, applicationsService, campaignsService } from "../api";
import Image from "next/image";
import type { Creator, Company, Conversation, Message, Application } from "../context/UserContext";

export default function CreatorMessages() {
  const { t } = useTranslation();
  const {
    currentUser, isLoadingUser, conversations, setConversations,
    messages, setMessages, addMessage, markAsRead,
  } = useUser();

  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("conversationId");
  const initialMessageParam = searchParams.get("initialMessage");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationIdParam ?? null);
  const [messageText, setMessageText] = useState(initialMessageParam ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Aplicación relacionada con la conversación del sistema
  const [relatedApplication, setRelatedApplication] = useState<Application | null>(null);
  const [confirmingCollaboration, setConfirmingCollaboration] = useState(false);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const data = await messagesService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [setMessages]);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await messagesService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
    } finally {
      setLoadingConversations(false);
    }
  }, [setConversations]);

  useEffect(() => {
    if (isLoadingUser) return;
    if (!currentUser?.id) { setLoadingConversations(false); return; }

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
  }, [currentUser?.id, isLoadingUser, loadConversations]);

  useEffect(() => {
    if (selectedConversationId) void loadMessages(selectedConversationId);
    else setMessages([]);
  }, [selectedConversationId, loadMessages, setMessages]);

  useEffect(() => {
    if (!selectedConversationId || !currentUser?.id) return;
    const readConversation = async () => {
      try {
        await messagesService.markAsRead(selectedConversationId, currentUser.id);
      } catch {}
      markAsRead(selectedConversationId, currentUser.id);
    };
    void readConversation();
  }, [selectedConversationId, currentUser?.id, markAsRead]);

  useEffect(() => {
    if (conversationIdParam) {
      setSelectedConversationId(conversationIdParam);
      router.replace("/creator/messages");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const getConversationsWithDetails = useCallback(() => {
    return conversations
      .filter((c: Conversation) => c.participants.some((p) => p.id === currentUser?.id))
      .map((c: Conversation) => {
        const other = c.participants.find((p) => p.id !== currentUser?.id);
        if (!other) return { ...c, otherUser: null };
        const isSystem = other.type === "system" || other.id === MATCH_CREATOR_SYSTEM.id;
        return {
          ...c,
          otherUser: {
            id: other.id,
            name: other.name,
            type: other.type,
            displayName: other.name || (isSystem ? MATCH_CREATOR_SYSTEM.name : ""),
            avatar: other.avatar || "",
            isSystem,
          },
        };
      });
  }, [conversations, currentUser?.id]);

  const conversationsWithDetails = getConversationsWithDetails();
  const selectedConversation = conversationsWithDetails.find((c) => c.id === selectedConversationId);
  const isSystemConversation = selectedConversation?.otherUser?.isSystem === true;

  const conversationMessages = messages.filter(
    (m: Message) => m.conversationId === selectedConversationId,
  );

  const filteredConversations = conversationsWithDetails.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser?.displayName?.toLowerCase().includes(q) ||
      c.lastMessage?.text?.toLowerCase().includes(q)
    );
  });

  // ═══════════════════════════════════════════════════════════
  // CARGAR APLICACIÓN RELACIONADA
  // ═══════════════════════════════════════════════════════════
  const loadRelatedApplication = useCallback(async () => {
    if (!currentUser?.id) return;

    const campaignId = selectedConversation?.campaignId;
    if (!campaignId) {
      setRelatedApplication(null);
      return;
    }

    try {
      const applications = await applicationsService.getMine();
      const match = applications.find((a) => a.campaignId === campaignId);
      setRelatedApplication(match ?? null);
    } catch {
      setRelatedApplication(null);
    }
  }, [currentUser?.id, selectedConversation?.campaignId]);

  useEffect(() => {
    if (isSystemConversation) void loadRelatedApplication();
    else setRelatedApplication(null);
  }, [isSystemConversation, loadRelatedApplication]);

  // ═══════════════════════════════════════════════════════════
  // CONFIRMAR COLABORACIÓN
  // ═══════════════════════════════════════════════════════════
  const handleConfirmCollaboration = async () => {
    if (!relatedApplication) return;
    setConfirmingCollaboration(true);
    try {
      await applicationsService.confirm(relatedApplication.id);
      const updated = await applicationsService.getById(relatedApplication.id);
      setRelatedApplication(updated);
      if (selectedConversationId) void loadMessages(selectedConversationId);
    } catch (error) {
      console.error("Error al confirmar colaboración:", error);
    } finally {
      setConfirmingCollaboration(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // IR AL CHAT CON LA EMPRESA
  // ═══════════════════════════════════════════════════════════
  const handleGoToCompanyChat = async () => {
    if (!relatedApplication || !currentUser) return;
    try {
      const campaign = await campaignsService.getById(relatedApplication.campaignId);
      const conversation = await messagesService.getOrCreateConversation({
        currentUserId: currentUser.id,
        currentUserType: "creator",
        otherUserId: campaign.companyId,
        otherUserType: "company",
      });

      await loadConversations();
      setSelectedConversationId(conversation.id);
    } catch (error) {
      console.error("Error al ir al chat:", error);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ENVIAR MENSAJE
  // ═══════════════════════════════════════════════════════════
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !selectedConversationId || !currentUser) return;
    if (selectedConversation?.otherUser?.isSystem) return;
    setSendingMessage(true);
    try {
      const currentUserTyped = currentUser as Creator & Company;
      const senderAvatar = currentUserTyped.avatar || currentUserTyped.logo || "";
      const newMessage = await messagesService.sendMessage({
        conversationId: selectedConversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar,
        text: messageText.trim(),
      });
      addMessage(newMessage);
      setMessageText("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setSendingMessage(false);
    }
  }, [messageText, selectedConversationId, currentUser, selectedConversation?.otherUser?.isSystem, addMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  }, [handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diffInHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    if (diffInHours < 48) return t("creatorMessages.time.yesterday");
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  // ═══════════════════════════════════════════════════════════
  // BOTÓN DE ACCIÓN SEGÚN ESTADO DE LA APLICACIÓN
  // ═══════════════════════════════════════════════════════════
  const renderSystemActionButton = () => {
    if (!isSystemConversation) return null;

    if (!relatedApplication) {
      return (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            {t("creatorMessages.chat.systemReadOnly")}
          </div>
        </div>
      );
    }

    if (relatedApplication.status === "accepted") {
      return (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-green-800 mb-3">
              ¡Tu postulación fue aceptada! ¿Deseas confirmar tu participación?
            </p>
            <button
              onClick={() => void handleConfirmCollaboration()}
              disabled={confirmingCollaboration}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              {confirmingCollaboration
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirmando...</>
                : <><CheckCircle className="w-4 h-4" /> Confirmar colaboración</>}
            </button>
          </div>
        </div>
      );
    }

    if (relatedApplication.status === "confirmed") {
      return (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-emerald-800 mb-3">
              ¡Eres parte de la campaña! Contacta directamente a la empresa.
            </p>
            <button
              onClick={() => void handleGoToCompanyChat()}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Ir al chat con la empresa
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          {t("creatorMessages.chat.systemReadOnly")}
        </div>
      </div>
    );
  };

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t("messages.loginRequired")}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105"
          >
            {t("common.login")}
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = "#7C3AED";
  const bubbleGradient = "linear-gradient(to bottom right, #7C3AED, #A78BFA)";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CreatorSidebar />
      <main className="flex-1 overflow-hidden flex" style={{ height: "calc(100vh - 0px)" }}>

        {/* Lista de conversaciones */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Header de la lista */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-black text-[#1F2937] mb-4 flex items-center gap-2">
              <MessageSquare className="w-7 h-7" style={{ color: primaryColor }} />
              {t("messages.title")}
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("creatorMessages.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primaryColor}20, #A78BFA20)` }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                </div>
                <p className="text-gray-500 font-medium">{t("common.loading")}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">{t("creatorMessages.empty.title")}</p>
                <p className="text-gray-400 text-sm mt-1">{t("creatorMessages.empty.subtitle")}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((c) => {
                  const isSelected = selectedConversationId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConversationId(c.id)}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-all relative
                        ${isSelected
                          ? "bg-gradient-to-r from-[#EDE9FE] to-[#F5F3FF] border-l-4 border-[#7C3AED] shadow-sm"
                          : "hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                    >
                      <div className="relative flex-shrink-0">
                        {c.otherUser?.avatar ? (
                          <img
                            src={c.otherUser.avatar}
                            alt={c.otherUser.displayName}
                            className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${isSelected ? "border-[#7C3AED]" : "border-gray-200"}`}
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full bg-gray-200 border-2 ${isSelected ? "border-[#7C3AED]" : "border-gray-200"}`} />
                        )}
                        {c.otherUser?.isSystem && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <ShieldCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <p className={`font-bold truncate transition-colors ${isSelected ? "text-[#7C3AED]" : "text-[#1F2937]"}`}>
                              {c.otherUser?.displayName}
                            </p>
                            {c.otherUser?.isSystem && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                          </div>
                          {c.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatTime(c.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {c.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {c.lastMessage.senderId === currentUser.id ? t("creatorMessages.youPrefix") : ""}
                            {c.lastMessage.text}
                          </p>
                        )}
                        {(c.unreadByUser[currentUser.id] ?? 0) > 0 && (
                          <div
                            className="mt-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {c.unreadByUser[currentUser.id]}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          {selectedConversation && selectedConversation.otherUser ? (
            <>
              {/* Header del chat */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                <div className="relative">
                  {selectedConversation.otherUser.avatar ? (
                    <img
                      src={selectedConversation.otherUser.avatar}
                      alt={selectedConversation.otherUser.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2"
                      style={{ borderColor: isSystemConversation ? "#3B82F6" : primaryColor }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 border-2" style={{ borderColor: isSystemConversation ? "#3B82F6" : primaryColor }} />
                  )}
                  {isSystemConversation && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-[#1F2937]">{selectedConversation.otherUser.displayName}</h2>
                    {isSystemConversation && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-500">
                    {isSystemConversation
                      ? t("creatorMessages.chat.systemSubtitle")
                      : selectedConversation.otherUser.type === "creator"
                        ? t("creatorMessages.chat.creatorType")
                        : t("creatorMessages.chat.companyType")}
                  </p>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primaryColor}20, #A78BFA20)` }}>
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                    </div>
                    <p className="text-gray-500">{t("common.loading")}</p>
                  </div>
                ) : conversationMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primaryColor}20, #A78BFA20)` }}>
                      <MessageSquare className="w-10 h-10" style={{ color: primaryColor }} />
                    </div>
                    <p className="text-gray-600 font-medium">{t("creatorMessages.chat.emptyTitle")}</p>
                    <p className="text-gray-400 text-sm mt-1">{t("creatorMessages.chat.emptySubtitle")}</p>
                  </div>
                ) : (
                  <>
                    {conversationMessages.map((message: Message) => {
                      const isMyMessage = message.senderId === currentUser.id;
                      const isSystemMessage = message.senderId === MATCH_CREATOR_SYSTEM.id;
                      return (
                        <div key={message.id} className={`flex items-end gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
                          <div className="relative flex-shrink-0">
                            {message.senderAvatar ? (
                              <img
                                src={message.senderAvatar}
                                alt={message.senderName}
                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-200" />
                            )}
                            {isSystemMessage && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                <CheckCircle className="w-3 h-3 text-white fill-current" />
                              </div>
                            )}
                          </div>
                          <div className={`max-w-md flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}>
                            {isSystemMessage && (
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-bold text-blue-600">MatchCreator</span>
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                              </div>
                            )}
                            <div
                              className="px-4 py-2.5 shadow-sm"
                              style={{
                                background: isSystemMessage
                                  ? "linear-gradient(to bottom right, #3B82F6, #60A5FA)"
                                  : isMyMessage
                                    ? bubbleGradient
                                    : "#FFFFFF",
                                borderRadius: isMyMessage ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0",
                                border: !isMyMessage && !isSystemMessage ? "1px solid #E5E7EB" : "none",
                              }}
                            >
                              <p
                                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                                style={{ color: isMyMessage || isSystemMessage ? "white" : "#1F2937" }}
                              >
                                {message.text}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 px-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input / Botón sistema */}
              {isSystemConversation
                ? renderSystemActionButton()
                : (
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end gap-3">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={t("messages.typeMessage")}
                        rows={1}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none outline-none focus:border-[#7C3AED] transition-colors text-sm text-gray-800"
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                      />
                      <button
                        onClick={() => void handleSendMessage()}
                        disabled={!messageText.trim() || sendingMessage}
                        className="px-5 py-3 rounded-2xl text-white font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                        style={{ background: messageText.trim() ? bubbleGradient : "#D1D5DB" }}
                      >
                        {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {t("common.send")}
                      </button>
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: `linear-gradient(to bottom right, ${primaryColor}20, #A78BFA20)` }}
                >
                  <MessageSquare className="w-12 h-12" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{t("creatorMessages.selectConversation.title")}</h3>
                <p className="text-gray-500">{t("creatorMessages.selectConversation.subtitle")}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}