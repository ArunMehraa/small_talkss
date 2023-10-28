const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const connectDB = require('./config/db');
const colors = require('colors');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 1000;
const NODE_ENV = process.env.NODE_ENV || 'production';

const app = express();
connectDB();

app.use(express.json());

// app.get('/', (req, res) => {
//     res.send('API is running successfully');
// });

app.use(cors({ origin: '*' }))

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

//--------Deployment Code--------//

const __dirname1 = path.resolve();
if(NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname1, '/frontend/build')));
    app.get('*', (req, res) => {res.sendFile(path.resolve(__dirname1, 'frontend', 'build', 'index.html')) });
}
else{
    app.get('/', (req, res) => {
        res.send('API is running ...');
    });
}


//--------Deployment Code--------//

app.use(notFound);
app.use(errorHandler);


const server = app.listen(PORT, () => {
    console.log('server started on port', PORT);
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'https://small-talks-c376.onrender.com',
    },
});

io.on('connection', (socket) => {
    console.log('connected to socket.io');
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('joined room ' + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) {
            return console.log('chat.users not defined')
        }

        chat.users.forEach(user => {
            if (user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        })
    })

    socket.off("setup", () => {
        console.log('User DISCONNECTED');
        socket.leave(userData._id);

    })
});
