// features/engineering/context/RFLPContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const RFLPContext = createContext();

export const RFLPProvider = ({ children }) => {
  const [rflpData, setRflpData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      const storedData = localStorage.getItem('rflpData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setRflpData(parsedData);
        } catch (error) {
          console.error('Fehler beim Parsen von rflpData aus localStorage:', error);
          setRflpData({});
        }
      } else {
        setRflpData({});
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <RFLPContext.Provider value={{ rflpData, setRflpData, isLoading }}>
      {children}
    </RFLPContext.Provider>
  );
};

export const useRFLP = () => useContext(RFLPContext);