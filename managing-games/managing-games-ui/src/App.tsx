import React from 'react';
import { GoFishManagingGamesClientInterface } from "@langfish/managing-games-api-client";
import {TemplatesClientInterface} from "./creating-a-game/TemplatesClientInterface";
import {CreateGame} from "./creating-a-game/CreateGame";
import './App.css';

interface AppProps {
  client: GoFishManagingGamesClientInterface,
  templatesClient: TemplatesClientInterface
}

const App: React.FunctionComponent<AppProps> = ({ client, templatesClient }) => {
  return (
    <div className="App">
      <CreateGame templatesClient={templatesClient} managingGamesClient={client}/>
    </div>
  );
};

export default App;
