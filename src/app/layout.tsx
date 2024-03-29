import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { PopupProvider } from "@/app/_hooks/usePopUp";
import PopUp from "./popup";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "SWING - CRM",
  description: "SWING - CRM",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <PopupProvider>
            {children}
            <PopUp />
          </PopupProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
