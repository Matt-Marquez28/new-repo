import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { useUser } from "./user.context";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    let newSocket;
    if (user) {
      newSocket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:4000", {
        query: { userId: user._id },
      });
      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.close();
      }
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
