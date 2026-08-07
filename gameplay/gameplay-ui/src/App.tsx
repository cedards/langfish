import React, {useEffect, useState} from 'react';
import {GoFishGameplayClientInterface} from "@langfish/gameplay-api-client";
import {LoadingScreen} from "@langfish/common-ui-components";
import './App.css';
import {PlayGame} from "./playing-a-game/PlayGame";

interface AppProps {
  client: GoFishGameplayClientInterface,
  gameId: string,
}

const App: React.FunctionComponent<AppProps> = ({ client, gameId }) => {
  const [connected, updateConnected] = useState(false);

  useEffect(() => {
    client.connect().then(() => { updateConnected(true); });
    return () => { client.disconnect(); };
  }, [client]);

  return (
    <div className="App">
      {
        connected
          ? <PlayGame client={client} gameId={gameId}/>
          : <LoadingScreen/>
      }
    </div>
  );
};

export default App;
