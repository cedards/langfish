import React, { FunctionComponent } from "react/index";

export const LoadingScreen: FunctionComponent = ({ children }) => {
    return <h1>{ children || "Connecting..."}</h1>
}