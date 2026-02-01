"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Local storage se current user uthao
    const userId = localStorage.getItem("current_user");

    if (userId) {
      // Backend URL (Default port 3001)
      const newSocket = io("http://localhost:3001", {
        query: { user_id: userId },
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
