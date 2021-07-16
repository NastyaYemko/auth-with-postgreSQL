require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware')
const http = require('http')
const {Server} = require('socket.io')


const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app)
const io = new Server(server)

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        server.listen(PORT, () => console.log(`Server is listening on the port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

io.on('connection', (socket) => {
    socket.on('new_notification', function (data) {
        console.log(data.title, data.message);
        io.sockets.emit('show_notification', {
            title: data.title,
            message: data.message
        })
    })
})

start()

