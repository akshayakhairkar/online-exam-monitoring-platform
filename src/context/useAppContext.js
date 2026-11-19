import { useContext } from 'react'
import { AppContext } from './contextValue'

export function useAppContext() {
  return useContext(AppContext)
}
