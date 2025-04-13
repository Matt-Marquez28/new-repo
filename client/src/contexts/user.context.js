import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../utils/constants";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  // Fetch user data from the API
  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${ACCOUNT_API_END_POINT}/refresh-user-data`, {
        withCredentials: true, 
      });
      setUser(res?.data?.userData); 
    } catch (error) {
      console.error(
        "Failed to fetch user data:",
        error.response?.data?.message || error.message
      );
      setUser(null);
    } finally {
      setLoading(false); 
    }
  };

  // Fetch user data when the provider mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {!loading && children} {/* Render children only after data is loaded */}
    </UserContext.Provider>
  );
};
