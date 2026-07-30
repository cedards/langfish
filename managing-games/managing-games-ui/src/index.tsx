import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoFishManagingGamesClient } from "@langfish/managing-games-api-client";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Deck, DeckTemplateSource } from "@langfish/managing-games-domain";

const apiEndpoint = (process.env.NODE_ENV === "development"
    ? `http://localhost:5000`
    : `${document.location.protocol}//${document.location.host}/`
) as `http://${string}` | `https://${string}`;

const client = GoFishManagingGamesClient(apiEndpoint)

const templatesClient: DeckTemplateSource = {
    async getTemplates(): Promise<Array<{ name: string, template: Deck }>> {
        const response = await fetch("/api/templates")
        if (!response.ok) throw new Error("Call to get templates was not successful")
        return await response.json()
    }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App client={client} templatesClient={templatesClient}/>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
