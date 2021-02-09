import './App.css';
import {useEffect, useState} from "react";

function App({ client }) {
  const [playerName, updatePlayerName] = useState(null);
  const [gameState, updateGameState] = useState(null);

  useEffect(() => {
    client.connect().then(() => {
      client.joinGame('game1')
      client.onSetPlayerName(updatePlayerName)
      client.onUpdateGameState(updateGameState)
    })

    return () => {
      client.disconnect()
    }
  }, [])

  const draw = (e) => {
    e.preventDefault();
    client.draw()
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
    { game.players[playerName].hand.map(card => <li className="revealed-card" key={card.id}>{card.value}</li>) }
  </ul>
  <p>There are {game.deck.length} cards left in the deck. <button onClick={draw}>Draw a card</button></p>
  {
    Object.keys(game.players).filter(player => player !== playerName).map(player => <div>
        <h3>{player}</h3>
        <ul className="other-player-hand">
          {game.players[player].hand.map(card => <li className="hidden-card" key={card.id} />)}
        </ul>
    </div>)
  }
</div>

export default App;
