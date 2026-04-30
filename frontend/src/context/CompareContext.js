import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);
const MAX_COMPARE = 3;

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (college) => {
    if (compareList.length >= MAX_COMPARE) return false;
    if (compareList.find((c) => c.id === college.id)) return false;
    setCompareList((prev) => [...prev, college]);
    return true;
  };

  const removeFromCompare = (id) => {
    setCompareList((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (id) => compareList.some((c) => c.id === id);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare, MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
};
