const Hapi = require('@hapi/hapi');
const Nes = require('@hapi/nes');

const server = new Hapi.Server({ port: 5000 }); // listening on port 5000

const start = async () => {
    await server.register(Nes);
    server.route({
        method: 'POST',
        path: '/message',
        config: {
            id: 'message',
            handler: (request, h) => {
                console.log('Message received:', request.payload.message);
                server.publish("/message", { message: request.payload.message })
                return true;
            }
        }
    });

    server.subscription('/message');

    await server.start();
};

console.log("Starting server")
start();
