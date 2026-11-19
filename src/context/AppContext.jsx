import { AppContext } from './contextValue'

export function AppProvider({ children }) {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>
}
