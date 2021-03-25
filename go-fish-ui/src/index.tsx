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
        return fetch("/templates")
            .then(response => {
                if(!response.ok) throw new Error("Call to get templates was not successful")
                return response.json()
            })
    }
}

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
