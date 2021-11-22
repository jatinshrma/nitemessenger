require('dotenv').config();
const io = require("socket.io")(process.env.SOCKETPORT, {
    cors: {
        origin: process.env.CLIENTHOST,
        methods: ["GET", "POST"]
    },
});

let users = [];

// add user
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
}

// remove user
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId != socketId);
}

// get user
const getUser = async (userId) => {
    return await users.find(user => user.userId === userId)
}

io.on("connection", socket => {

    console.log('user got online');
    io.emit("chatOpen", true);

    socket.on("addUser", username => {
        addUser(username, socket.id);
        io.emit("getUsers", users)
    })

    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", users);
    })

    // send & get message
    socket.on("sendMessage", async ({ sender, reciever, message, chatLength, date }) => {

        const user = await getUser(reciever);
        io.to(user.socketId).emit("getMessage", {
            sender,
            reciever,
            message,
            date
        });
    });
});