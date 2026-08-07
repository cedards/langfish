import React from 'react';
import {Card} from "@langfish/go-fish-engine";
import { render, screen } from '@testing-library/preact';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MyPlayArea } from "./MyPlayArea";

describe('MyPlayArea', function () {
  let playerInfo: { hand: Array<Card>, sets: Array<Array<Card>>, name?: string };
  let selectedCards: Array<number>;
  let updateSelectedCards: (cardIds: Array<number>) => void;
  let renamePlayer: (name: string) => void;
  let score: (cardIds: Array<number>) => void;
  let user: UserEvent;

  beforeEach(function () {
    updateSelectedCards = jest.fn();
    score = jest.fn();
    renamePlayer = jest.fn();
    user = userEvent.setup();
    selectedCards = [];
  });

  describe("when the player doesn't have a name yet", () => {
    beforeEach(async () => {
      playerInfo = {
        hand: [],
        sets: [],
      };

      render(<MyPlayArea
        playerInfo={playerInfo}
        selectedCards={selectedCards}
        updateSelectedCards={updateSelectedCards}
        score={score}
        renamePlayer={renamePlayer}
        hideOrShowCard={jest.fn()}
        leaveGame={jest.fn()}
        currentTurn={true}
      />);
    });

    test('initially setting the player name', async function () {
      expect(screen.queryByLabelText(/your name/)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/your name/), "talapas");
      expect(renamePlayer).not.toHaveBeenCalled();

      await user.click(screen.getByLabelText(/save name/));
      expect(renamePlayer).toHaveBeenCalledWith("talapas");
    });
  });

  describe("when the player's name has previously been set", () => {
    beforeEach(function () {
      playerInfo = {
        name: "talapas",
        hand: [],
        sets: [],
      };

      render(<MyPlayArea
        playerInfo={playerInfo}
        selectedCards={selectedCards}
        updateSelectedCards={updateSelectedCards}
        score={score}
        renamePlayer={renamePlayer}
        hideOrShowCard={jest.fn()}
        leaveGame={jest.fn()}
        currentTurn={true}
      />);
    });

    test('updating the player name', async function () {
      expect(screen.queryByText(/talapas/)).toBeInTheDocument();

      await user.click(screen.getByLabelText(/edit name/));
      await user.type(
        screen.getByLabelText(/your name/),
        "{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}lilu",
      );

      expect(renamePlayer).not.toHaveBeenCalled();
      await user.click(screen.getByLabelText(/save name/));
      expect(renamePlayer).toHaveBeenCalledWith("lilu");
    });
  });
});
