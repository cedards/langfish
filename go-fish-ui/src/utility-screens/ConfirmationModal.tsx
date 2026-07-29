import React from "react";
import { FunctionComponent, PropsWithChildren } from "react";
import {Modal} from "./Modal";

export const ConfirmationModal: FunctionComponent<PropsWithChildren<{
    show: boolean,
    confirm: () => void,
    cancel: () => void,
}>> = ({show, confirm, cancel, children}) => {
    if (!show) return null

    return <Modal show={show} close={cancel}>
        <h1>{children}</h1>
        <div className="modal-controls">
            <button onClick={confirm} aria-label="confirm">✅</button>
        </div>
    </Modal>
}
