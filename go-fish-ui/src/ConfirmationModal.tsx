import React from "react/index";

export const ConfirmationModal: React.FunctionComponent<{
    show: boolean,
    confirm: () => void,
    cancel: () => void,
}> = ({show, confirm, cancel, children}) => {
    if (!show) return null

    return <div className="modal">
        <h1>{children}</h1>
        <div className="modal-controls">
            <button onClick={confirm} aria-label="confirm">✅</button>
            <button onClick={cancel} aria-label="cancel">❌</button>
        </div>
    </div>
}