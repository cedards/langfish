import './App.css';
import {useEffect, useState} from "react";
import Nes from "@hapi/nes/lib/client";

const client = new Nes.Client(`ws://localhost:5000`);

function App() {
  const [playerName, updatePlayerName] = useState(null);
  const [gameState, updateGameState] = useState(null);

  useEffect(() => {
    client.connect().then(() => {
      client.subscribe('/game', (payload) => {
        console.log("received message:", payload);
        switch(payload.type) {
          case "SET_NAME":
            updatePlayerName(payload.name)
            break
          case "UPDATE_GAME_STATE":
            updateGameState(payload.state)
            break
          default:
            console.warn("Didn't know how to handle message of type", payload.type)
        }
      })
    })

    return () => {
      client.unsubscribe('/game', null)
    }
  }, [])

  const draw = (e) => {
    e.preventDefault();
    if(!playerName) return;

    client.request({
        path: "game",
        method: "POST",
        payload: {
          type: "DRAW",
          player: playerName
        }
      }
    )
  }

  return (
    <div className="App">
      {
        (!!playerName && gameState)
          ? <GameTable playerName={playerName} game={gameState} draw={draw}/>
          : <LoadingScreen/>
      }
    </div>
  );
}

const LoadingScreen = () => <h1>Connecting...</h1>

const GameTable = ({ playerName, game, draw }) => <div>
  <h1>😀 {playerName}</h1>
  <ul className="my-hand">
    { game.players[playerName].hand.map(card => <li className="revealed-card">{card.value}</li>) }
  </ul>
  <p>There are {game.deck.length} cards left in the deck. <button onClick={draw}>Draw a card</button></p>
  {
    Object.keys(game.players).filter(player => player !== playerName).map(player => <div>
        <h3>{player}</h3>
        <ul className="other-player-hand">
          {game.players[player].hand.map(card => <li className="hidden-card"/>)}
        </ul>
    </div>)
  }
</div>

export default App;
