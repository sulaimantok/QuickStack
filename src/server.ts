import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import webSocketHandler from './socket-io'
import { Server } from 'socket.io'

// Source: https://nextjs.org/docs/app/building-your-application/configuring/custom-server

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {

    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true)
        handle(req, res, parsedUrl)
    });

    webSocketHandler.initializeSocketIo(server);
    //const io = new Server(server);


    server.listen(port)

    console.log(
        `> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV
        }`
    )
});

