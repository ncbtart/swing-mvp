"use client";
// Importations nécessaires de React
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Définition des types pour le contexte
interface PopupContextType {
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
  title: string;
  message: string;
  setTitle: (title: string) => void;
  setMessage: (message: string) => void;
}

// Création du contexte avec un type par défaut
const PopupContext = createContext<PopupContextType | undefined>(undefined);

// Props type pour le provider
interface PopupProviderProps {
  children: ReactNode;
}

// Provider pour envelopper l'application
export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [isPopupOpen, setPopupOpen] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const openPopup = () => setPopupOpen(true);
  const closePopup = () => setPopupOpen(false);

  return (
    <PopupContext.Provider
      value={{
        isPopupOpen,
        openPopup,
        closePopup,
        title,
        message,
        setTitle,
        setMessage,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const usePopup = (): PopupContextType => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};
