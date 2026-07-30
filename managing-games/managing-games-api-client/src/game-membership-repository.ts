export interface GameMembershipRepository {
    getPlayerIdFor(gameId: string): string | null

    savePlayerIdFor(gameId: string, playerId: string): void
}

export function InMemoryGameMembershipRepository(): GameMembershipRepository {
    const _repo: {[gameId: string]: string} = {}

    return {
        getPlayerIdFor(gameId: string): string | null {
            return _repo[gameId] || null;
        },

        savePlayerIdFor(gameId: string, playerId: string): void {
            _repo[gameId] = playerId
        }
    }
}