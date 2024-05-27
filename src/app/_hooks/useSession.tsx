"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type SessionProviderProps, useSession } from "next-auth/react";
import { type Session } from "next-auth";

interface SessionContextType {
  session: Session | null;
  loading: boolean;
}

// Création du contexte de session
const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
});

// Hook personnalisé pour accéder au contexte de session
export const useSessionContext = () => useContext(SessionContext);

// Composant fournisseur qui encapsule les enfants et gère la session
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    setLoading(false);
  }, [status]);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
};
