import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../utils/constants";
import { ACCOUNT_API_END_POINT } from "../utils/constants";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initially null, no reliance on local storage
  const [loading, setLoading] = useState(true); // Tracks whether user data is being loaded

  // Fetch user data from the API
  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${ACCOUNT_API_END_POINT}/refresh-user-data`, {
        withCredentials: true, // Ensures cookies (for authentication) are sent
      });
      setUser(res?.data?.userData); // Update user state with the fetched data
      console.log("Fetched user data");
    } catch (error) {
      console.error(
        "Failed to fetch user data:",
        error.response?.data?.message || error.message
      );
      setUser(null); // Clear user state if fetching fails
    } finally {
      setLoading(false); // Stop the loading state
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
