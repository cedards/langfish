import React from "react/index";

export const Modal: React.FunctionComponent<{
    show: boolean,
    close: () => void,
}> = ({show, close, children}) => {
    if (!show) return null

    return <div className="modal">
        <div className="message">
            <button className="cancel-button" onClick={close} aria-label="cancel">X</button>
            <div className="modalBody">{children}</div>
        </div>
    </div>
}
