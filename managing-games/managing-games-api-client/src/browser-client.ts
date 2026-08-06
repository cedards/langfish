export interface GoFishManagingGamesClientInterface {
  createGame(template: Array<{ value: string, image?: string }>): Promise<string>,
}

export function GoFishManagingGamesClient(
  apiEndpoint: `http://${string}` | `https://${string}`,
): GoFishManagingGamesClientInterface {

  return {
    async createGame(template: Array<{ value: string; image?: string }>): Promise<string> {
      const url = `${apiEndpoint}${apiEndpoint.endsWith("/") ? "" : "/"}api/game`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({template: template}),
      });
      if(!response.ok) throw new Error(`Failed to create game: ${response.status}`);
      return await response.text();
    },
  };

}
