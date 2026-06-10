import React, { createContext, useContext, useState, useCallback } from 'react';

const QuickViewContext = createContext(null);

export const QuickViewProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const openQuickView = useCallback((item) => {
    setActiveItem(item);
    setIsOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    // Don't clear activeItem immediately so that fade-out transitions can use the data
  }, []);

  return (
    <QuickViewContext.Provider value={{ isOpen, activeItem, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
};

export const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
};
