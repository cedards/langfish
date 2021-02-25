import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
    GoFishGameplayClient,
    InMemoryGameMembershipRepository
} from "@langfish/go-fish-gameplay-client";
import {
    LocalStorageGameMembershipRepository
} from "./playing-a-game/LocalStorageGameMembershipRepository";

const websocketUrl = process.env.NODE_ENV === "development"
    ? `ws://localhost:5000`
    : `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}/`

const gameMembershipRepo = process.env.NODE_ENV === "development"
    ? InMemoryGameMembershipRepository()
    : LocalStorageGameMembershipRepository()

const client = GoFishGameplayClient(websocketUrl, gameMembershipRepo)

const templatesClient = {
    getTemplates(): Promise<Array<{ name: string, template: Array<{ value: string, image?: string }>}>> {
        return fetch("/templates").then(response => response.json())
    }
}

const preloadedImages = [
    { value: "yaablukaX", image: "https://drive.google.com/uc?id=1Urnd6hmYmhClVrmiLrQgQXl50P9-dgiq" },
    { value: "yaachiX", image: "https://drive.google.com/uc?id=1fO7WLTpuZfE6QbcQ3JXp-2vIqRHQ1BgZ" },
    { value: "chaaskaX", image: "https://drive.google.com/uc?id=1omBLfjxii-lGP9YlvwzWWkywZBbdZ6Y3" },
    { value: "duularaX", image: "https://drive.google.com/uc?id=1W4AF4kdm3sTRh6u866kPAVyZbLumPygY" },
    { value: "laaqudaX", image: "https://drive.google.com/uc?id=100dYiKXe7h2mulMgT3wRypAaXA5GNzr8" },
    { value: "isuX", image: "https://drive.google.com/uc?id=13dXX78-s0ONZWeRm6YKcuna06M6jTpg6" },
    { value: "chagiX", image: "https://drive.google.com/uc?id=1Yv_WO-vofoPmVxXCzeaz9X4PAHhTjRVD" },
    { value: "saliguX", image: "https://drive.google.com/uc?id=1A30saS6PUg4nM62YcxRPcNda2zGTNJXT" },
    { value: "nuusiX", image: "https://drive.google.com/uc?id=1ABGZpiQlwmeRUu4DWnSJVQx4SqeyhXqY" },
    { value: "qungaayuX", image: "https://drive.google.com/uc?id=1yKGOKFafoOXTih3ZAPrJozxLkwNLuv8h" },
    { value: "kartuufilaX", image: "https://drive.google.com/uc?id=1xxWFaBw66TxvAg72LgMXHQwTwzXjnES6" },
    { value: "nuugiX", image: "https://drive.google.com/uc?id=12YuP1KrGJiQtuDeyAOgV4htZ6v6Ivkgz" },
    { value: "stuuluX", image: "https://drive.google.com/uc?id=1CfQtpVaBDylfvE-tNloGhr2BHC90SklV" },
].map(card => {
    const img = new Image()
    img.src = card.image
    return img
})

ReactDOM.render(
  <React.StrictMode>
    <App client={client} templatesClient={templatesClient}/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
