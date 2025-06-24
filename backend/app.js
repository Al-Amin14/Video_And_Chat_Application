import { Server } from "socket.io";

const io = new Server(8000, {
    cors: true
})

const emailtoSocketMap = new Map()
const socketidToEmailMap = new Map()


io.on('connection', (socket) => {
    console.log(` Socket Connected  `, socket.id)
    socket.on('room:join', (data) => {
        const { email, room } = data
        emailtoSocketMap.set(email, socket.id)
        socketidToEmailMap.set(socket.id, email)
        io.to(room).emit('users:joined', { email, id: socket.id })
        socket.join(room)
        io.to(socket.id).emit('room:join', data)
    })
    socket.on('user:call', ({ to, offer }) => {
        console.log(`Getting user call here i am now ${to}`)
        io.to(to).emit('incomming:call', { from: socket.id, offer })
    })

    socket.on('call:accepted',({to,ans})=>{
        io.to(to).emit('call:accepted',{from:socket.id,ans})
    })

}) 