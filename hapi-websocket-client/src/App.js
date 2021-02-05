import './App.css';
import {useEffect, useState} from "react";
import Nes from "@hapi/nes/lib/client";

const client = new Nes.Client(`ws://localhost:5000`);

function App() {
  const [messages, updateMessages] = useState([]);
  const [newMessage, updateNewMessage] = useState("");

  useEffect(() => {
    client.connect().then(() => {
      client.subscribe('/message', (payload) => {
        updateMessages(oldMessages => oldMessages.concat(payload.message));
      })
    })

    return () => {
      client.unsubscribe('/message', null)
    }
  }, [])

  const postMessage = (e) => {
    e.preventDefault();
    client.request({
      path: "message",
      method: "POST",
      payload: { message: newMessage } }
    )
    updateNewMessage("")
  }

  console.log("messages", messages);
  return (
    <div className="App">
      <div className="chatlog">
        { messages.map((message, index) => {
          return <div key={index}>{message}</div>
        }) }
      </div>
      <form className="chat-input" onSubmit={postMessage}>
        <input value={newMessage} onChange={(e) => {
          updateNewMessage(e.target.value);
        }}/>
      </form>
    </div>
  );
}

export default App;
