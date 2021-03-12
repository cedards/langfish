import {GameMembershipRepository} from "@langfish/go-fish-gameplay-client";

type SchemaInLocalStorage = { [key: string]: { playerId: string, expirationTime: number }}
const localStorageKey = "gameMemberships"
const entryLifespan = 6 // hours
    * 60 * 60 * 1000    // in milliseconds

function get(): SchemaInLocalStorage {
    return JSON.parse(window.localStorage.getItem(localStorageKey) || '{}')
}

function save(repo: SchemaInLocalStorage) {
    console.log("local storage contents will now be:", repo)
    window.localStorage.setItem(localStorageKey, JSON.stringify(repo))
}

export function LocalStorageGameMembershipRepository(): GameMembershipRepository {
    const oldRepo: SchemaInLocalStorage = get()
    const repoWithoutOldEntries = Object.keys(oldRepo)
        .filter(gameId => oldRepo[gameId].expirationTime > new Date().getTime())
        .reduce((entries, nextGameId) => ({...entries, [nextGameId]: oldRepo[nextGameId]}), {})
    save(repoWithoutOldEntries)

    return {
        getPlayerIdFor(gameId: string) {
            const lookedUpEntry = get()[gameId];
            return (lookedUpEntry || {}).playerId || null
        },
        savePlayerIdFor(gameId: string, playerId: string) {
            const repo = get()
            repo[gameId] = { playerId, expirationTime: new Date().getTime() + entryLifespan }
            save(repo)
        }
    }
}