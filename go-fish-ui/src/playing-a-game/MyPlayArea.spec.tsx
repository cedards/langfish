import React from 'react'
import {Card} from "@langfish/go-fish-engine"
import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyPlayArea } from "./MyPlayArea"

describe('MyPlayArea', function () {
    let playerInfo: { hand: Array<Card>, sets: Array<Array<Card>>, name?: string }
    let selectedCards: Array<number>
    let updateSelectedCards: (cardIds: Array<number>) => void
    let renamePlayer: (name: string) => void
    let score: (cardIds: Array<number>) => void
    let rerender: (component: React.ReactElement) => void;

    beforeEach(function () {
        playerInfo = {
            hand: [],
            sets: [],
        }
        selectedCards = []
        updateSelectedCards = jest.fn()
        score = jest.fn()
        renamePlayer = jest.fn()

        rerender = render(<MyPlayArea
            playerInfo={playerInfo}
            selectedCards={selectedCards}
            updateSelectedCards={updateSelectedCards}
            score={score}
            renamePlayer={renamePlayer}
        />).rerender
    })

    test('displaying the player name', function () {
        expect(screen.queryByText(/\?\?\?/)).toBeInTheDocument()
        expect(screen.queryByText(/talapas/)).not.toBeInTheDocument()
        expect(screen.getByLabelText(/edit name/).classList).toContain("highlight")

        rerender(<MyPlayArea
            playerInfo={{
                name: "talapas",
                hand: [],
                sets: [],
            }}
            selectedCards={selectedCards}
            updateSelectedCards={updateSelectedCards}
            score={score}
            renamePlayer={renamePlayer}
        />)

        expect(screen.queryByText(/\?\?\?/)).not.toBeInTheDocument()
        expect(screen.queryByText(/talapas/)).toBeInTheDocument()
        expect(screen.getByLabelText(/edit name/).classList).not.toContain("highlight")
    })

    test('setting the player name', function () {
        expect(screen.queryByText(/\?\?\?/)).toBeInTheDocument()
        expect(screen.queryByLabelText(/edit name/)).toBeInTheDocument()
        expect(screen.queryByLabelText(/your name/)).not.toBeInTheDocument()

        userEvent.click(screen.getByLabelText(/edit name/))
        expect(screen.queryByLabelText(/your name/)).toBeInTheDocument()

        userEvent.type(screen.getByLabelText(/your name/), "talapas")

        expect(renamePlayer).not.toHaveBeenCalled()
        userEvent.click(screen.getByLabelText(/save name/))
        expect(renamePlayer).toHaveBeenCalledWith("talapas")
        expect(screen.queryByLabelText(/your name/)).not.toBeInTheDocument()
    })
})
