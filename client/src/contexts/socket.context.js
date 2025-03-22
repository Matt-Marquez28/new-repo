import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { useUser } from "./user.context";

// Create the SocketContext
const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

// SocketProvider will manage the socket state and provide it to child components
export const SocketProvider = ({ children }) => {
  const { user } = useUser(); // Access user data from context
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Initialize socket connection when user is available
      const socketInstance = io("https://peso-8oly.onrender.com", {
        query: {
          userId: user.accountData._id,
        },
        transports: ["websocket", "polling"], // Ensures fallback
      });
      setSocket(socketInstance);

      return () => {
        socketInstance.close(); // Clean up the socket connection on component unmount
      };
    } else {
      // Close the socket connection if there's no user
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]); // Depend on user instead of undefined variables

  return (
    <SocketContext.Provider value={[socket, setSocket]}>
      {children}
    </SocketContext.Provider>
  );
};
