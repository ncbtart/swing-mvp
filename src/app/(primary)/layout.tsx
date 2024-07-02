"use client";

import Header from "../_components/Header";
import SideMenu from "../_components/SideMenu";

import { PopupProvider } from "@/app/_hooks/usePopUp";
import { PannierProvider } from "../_hooks/usePannierAo";
import { SessionProvider } from "../_hooks/useSession";
import { SessionProvider as NextAuthProvider } from "next-auth/react";

import PopUp from "../popup";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider>
      <SessionProvider>
        <PannierProvider>
          <PopupProvider>
            <div className="flex min-h-screen">
              <SideMenu />
              <div className="flex-grow">
                <Header />
                <main className="mx-auto">{children}</main>
              </div>
            </div>
            <PopUp />
          </PopupProvider>
        </PannierProvider>
      </SessionProvider>
    </NextAuthProvider>
  );
}
