export type Card = { value: string, image?: string };
export type Deck = Array<Card>;
export type DeckTemplate = { name: string, template: Deck };

export interface DeckTemplateSource {
  getTemplates(): Promise<Array<DeckTemplate>>
}

export interface Game {
  id: string | null,
  deck: Deck,
}

export function Game(deck: Deck): Game {
  return {
    id: null,
    deck,
  };
}

export interface GameRepository {
  getGame: (gameId: string) => Promise<Game | null>
  saveGame: (game: Game) => Promise<string>
}