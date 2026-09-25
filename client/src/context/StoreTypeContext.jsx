"use client";

import { createContext, useContext, useState } from "react";

const StoreTypeContext = createContext();

export const useStoreType = () => {
    const context = useContext(StoreTypeContext);
    if (!context) {
        throw new Error("useStoreType must be used within a StoreTypeProvider");
    }
    return context;
};

export const StoreTypeProvider = ({ children }) => {
    // null = "All / no filter" (default). Otherwise a StoreVertical's id.
    // In-memory only - intentionally NOT persisted (no localStorage), so every
    // fresh visit / reload starts back at "All".
    const [activeStoreType, setActiveStoreTypeState] = useState(null);

    const setActiveStoreType = (storeType) => {
        setActiveStoreTypeState(storeType);
    };

    return (
        <StoreTypeContext.Provider
            value={{
                activeStoreType,
                setActiveStoreType,
                isLoaded: true,
            }}
        >
            {children}
        </StoreTypeContext.Provider>
    );
};
