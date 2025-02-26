import React, {PropsWithChildren} from "react";

export const Modal: React.FunctionComponent<PropsWithChildren<{
    show: boolean,
    close: () => void,
}>> = ({show, close, children}) => {
    if (!show) return null

    return <div className="modal">
        <div className="message">
            <button className="cancel-button" onClick={close} aria-label="cancel">X</button>
            <div className="modal-body">{children}</div>
        </div>
    </div>
}
