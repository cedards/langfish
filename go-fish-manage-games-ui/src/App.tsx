import React, {useEffect, useState} from 'react';
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client"
import {LoadingScreen} from "./utility-screens/LoadingScreen";
import {TemplatesClientInterface} from "./creating-a-game/TemplatesClientInterface";
import {CreateGame} from "./creating-a-game/CreateGame";
import './App.css';

interface AppProps {
    client: GoFishGameplayClientInterface,
    templatesClient: TemplatesClientInterface
}

const App: React.FunctionComponent<AppProps> = ({ client, templatesClient }) => {
    const [connected, updateConnected] = useState(false)

    useEffect(() => {
        client.connect().then(() => { updateConnected(true) })
        return () => { client.disconnect() }
    }, [])

    return (
        <div className="App">
            {
                connected
                    ? <CreateGame templatesClient={templatesClient} gameplayClient={client}/>
                    : <LoadingScreen/>
            }
        </div>
    );
};

export default App;
