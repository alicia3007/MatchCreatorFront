"use client";
import "@/i18n/config";
import { UserProvider } from "@/app/context/UserContext";
import HtmlLangSync from "@/app/components/HtmlLangSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <HtmlLangSync />
      {children}
    </UserProvider>
  );
}