import { createContext, useContext } from "react";

export const Context = createContext<{} | null>(null)

export const useStore = useContext(Context)