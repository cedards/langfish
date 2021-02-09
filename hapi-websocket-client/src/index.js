import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {GoFishGameplayClient} from "@langfish/go-fish-websocket-client/dist/browser-client";

const client = process.env.NODE_ENV === "development"
  ? new GoFishGameplayClient(`ws://localhost:5000`)
  : new GoFishGameplayClient(`ws://${document.location.host}/`)

ReactDOM.render(
  <React.StrictMode>
    <App client={client}/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
