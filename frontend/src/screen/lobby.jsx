import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../contex/socketProvider';
import { useNavigate } from 'react-router-dom';
import peer from '../service/peer';

function Lobby() {
    const [email, setEmail] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const navigate = useNavigate()

    const socket = useSocket()
    //   console.log(socket)

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            console.log('Email:', email);
            console.log('Room Number:', roomNumber);
            socket.emit('room:join', { email, roomNumber })
        },
        [email, roomNumber, socket],
    )

    const handleJoinroom = useCallback(
        (data) => {
            const { email, roomNumber } = data
            console.log(data)
            navigate(`/room/${roomNumber}`)
        },
        [navigate],
    )


    useEffect(() => {
        socket.on("room:join", handleJoinroom)
        return () => {
            socket.off('room:join', handleJoinroom)
        }

    }, [socket]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Lobby</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Room Number</label>
                        <input
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="123-456-789"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Lobby;
