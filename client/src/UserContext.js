import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [value, setValue] = useState();
  
  return (
    <UserContext.Provider value={{ value, setValue }}>
      {children}
    </UserContext.Provider>
  );
};
