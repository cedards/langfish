import React, {useEffect, useState} from 'react';
import {BrowserRouter, Route, Routes} from "react-router";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client"
import {LoadingScreen} from "./utility-screens/LoadingScreen";
import {TemplatesClientInterface} from "./creating-a-game/TemplatesClientInterface";
import {CreateGame} from "./creating-a-game/CreateGame";
import './App.css';
import {PlayGame} from "./playing-a-game/PlayGame";

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
        <div className="App"><BrowserRouter>
            {
                connected
                    ? <Routes>
                        <Route path="/play/:gameId" element={<PlayGame client={client}/>}/>
                        <Route path="/" element={<CreateGame templatesClient={templatesClient} gameplayClient={client}/>}/>
                    </Routes>
                    : <LoadingScreen/>
            }
        </BrowserRouter></div>
    );
};

export default App;
