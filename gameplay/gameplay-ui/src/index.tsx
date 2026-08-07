import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import {
  GoFishGameplayClient,
  InMemoryGameMembershipRepository,
} from "@langfish/gameplay-api-client";
import {
  LocalStorageGameMembershipRepository,
} from "./playing-a-game/LocalStorageGameMembershipRepository";

const websocketUrl = (process.env.NODE_ENV === "development"
  ? `ws://localhost:5000`
  : `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}/`
) as `ws://${string}` | `wss://${string}`;

const gameMembershipRepo = process.env.NODE_ENV === "development"
  ? InMemoryGameMembershipRepository()
  : LocalStorageGameMembershipRepository();

const client = GoFishGameplayClient(websocketUrl, gameMembershipRepo);

const gameId = /\/play\/(.*)/.exec(window.location.pathname)![1];

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App client={client} gameId={gameId}/>
  </React.StrictMode>,
);
