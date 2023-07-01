import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {

  const name = localStorage.getItem('user');
  const val = name ? name : ""
  const [value, setValue] = useState(val);
  
  return (
    <UserContext.Provider value={{ value, setValue }}>
      {children}
    </UserContext.Provider>
  );
};
