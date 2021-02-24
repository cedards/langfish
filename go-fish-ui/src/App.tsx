import React, {useEffect, useState} from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client"
import {LoadingScreen} from "./LoadingScreen";
import {TemplatesClientInterface} from "./creating-a-game/TemplatesClientInterface";
import {CreateGame} from "./creating-a-game/CreateGame";
import './App.css';
import {PlayGame} from "./playing-a-game/PlayGame";

interface AppProps {
    client: GoFishGameplayClientInterface,
    templatesClient: TemplatesClientInterface
}

function App({ client, templatesClient }: AppProps) {
    const [connected, updateConnected] = useState(false)

    useEffect(() => {
        client.connect().then(() => { updateConnected(true) })
        return () => { client.disconnect() }
    }, [])

    return (
        <div className="App"><BrowserRouter>
            {
                connected
                    ? <Switch>
                        <Route path="/game/:gameId">
                            <PlayGame client={client}/>
                        </Route>
                        <Route path="/">
                            <CreateGame templatesClient={templatesClient} gameplayClient={client}/>
                        </Route>
                    </Switch>
                    : <LoadingScreen/>
            }
        </BrowserRouter></div>
    );
}

export default App;
