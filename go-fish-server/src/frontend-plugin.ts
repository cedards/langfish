import {Server} from "@hapi/hapi";
import * as Inert from "@hapi/inert";
import { join, dirname } from "path";
import { findPackageJSON } from "node:module";
import { pathToFileURL } from "node:url";

export const FrontendPlugin = {
  name: "go-fish-frontend",
  register: async function (server: Server): Promise<void> {
    await server.register(Inert);

    const goFishManageGamesUiDirectory = dirname(pathToFileURL(findPackageJSON("@langfish/managing-games-ui", __filename) || "").pathname);
    const goFishUiDirectory = dirname(pathToFileURL(findPackageJSON("@langfish/gameplay-ui", __filename) || "").pathname);

    server.route({
      method: 'GET',
      path: '/play/{gameId*}',
      options: {
        auth: false,
        cors: { origin: ['*'] },
      },
      handler: {
        file: {
          path: join(goFishUiDirectory, "build", "index.html"),
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/gameplay/{path*}',
      options: {
        auth: false,
        cors: { origin: ['*'] },
      },
      handler: {
        directory: {
          path: join(goFishUiDirectory, "build"),
          listing: true,
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/{path*}',
      options: {
        auth: false,
        cors: { origin: ['*'] },
      },
      handler: {
        directory: {
          path: join(goFishManageGamesUiDirectory, "build"),
          listing: true,
        },
      },
    });

  },
};