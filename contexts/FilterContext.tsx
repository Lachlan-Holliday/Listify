import React, { createContext, useContext, useState } from 'react';

type FilterContextType = {
  showFilter: () => void;
  hideFilter: () => void;
  isFilterVisible: boolean;
};

const FilterContext = createContext<FilterContextType>({
  showFilter: () => {},
  hideFilter: () => {},
  isFilterVisible: false,
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const showFilter = () => setIsFilterVisible(true);
  const hideFilter = () => setIsFilterVisible(false);

  return (
    <FilterContext.Provider value={{ showFilter, hideFilter, isFilterVisible }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => useContext(FilterContext); 