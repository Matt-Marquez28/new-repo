import React, { createContext, useContext, useState } from "react";
import Toast from "../components/shared-ui/Toast";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("info");

  const triggerToast = (msg, variant) => {
    setMessage(msg);
    setVariant(variant);
    setShow(true);
    setTimeout(() => setShow(false), 5000); // Automatically hide after 5 seconds
  };

  return (
    <ToastContext.Provider value={triggerToast}>
      {children}
      <Toast
        show={show}
        message={message}
        variant={variant}
        onClose={() => setShow(false)}
      />
    </ToastContext.Provider>
  );
};
