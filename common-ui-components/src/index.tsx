import React, { FunctionComponent } from "preact";

export const Modal: React.FunctionComponent<{
  show: boolean,
  close: () => void,
}> = ({show, close, children}) => {
  if (!show) return null

  return <div className="modal">
    <div className="message">
      <button className="cancel-button" onClick={close} aria-label="cancel">X</button>
      <div className="modal-body">{children}</div>
    </div>
  </div>
}

export const ConfirmationModal: FunctionComponent<{
  show: boolean,
  confirm: () => void,
  cancel: () => void,
}> = ({show, confirm, cancel, children}) => {
  if (!show) return null

  return <Modal show={show} close={cancel}>
    <h1>{children}</h1>
    <div className="modal-controls">
      <button onClick={confirm} aria-label="confirm">✅</button>
    </div>
  </Modal>
}
export const LoadingScreen: FunctionComponent = ({children}) => {
  return <h1>{children || "Connecting..."}</h1>
}