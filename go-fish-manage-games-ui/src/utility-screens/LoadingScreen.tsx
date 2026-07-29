import React, { FunctionComponent, ReactNode } from "react";

export const LoadingScreen: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
    return <h1>{ children || "Connecting..."}</h1>
}