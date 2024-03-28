"use client";

import { useEffect } from "react";
import Popup from "./_components/core/PopUp";
import { usePopup } from "./_hooks/usePopUp";

export default function PopUp() {
  const { isPopupOpen, closePopup, title, message } = usePopup();

  useEffect(() => {
    if (isPopupOpen) {
      const timer = setTimeout(() => {
        closePopup();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPopupOpen, closePopup]);

  if (isPopupOpen)
    return <Popup title={title} message={message} onClose={closePopup} />;

  return "";
}
