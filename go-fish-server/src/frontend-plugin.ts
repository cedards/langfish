import {Server, ServerOptions} from "@hapi/hapi";
import * as Inert from "@hapi/inert"
import * as Path from "path";

export const FrontendPlugin = {
    name: "go-fish-frontend",
    register: async function (server: Server, options: ServerOptions) {
        await server.register(Inert)
        server.route({
            method: 'GET',
            path: '/{path*}',
            options: {
                auth: false,
                cors: { origin: ['*'] },
            },
            handler: {
                directory: {
                    path: Path.join(__dirname, 'build'),
                    listing: true
                }
            }
        })
    }
}