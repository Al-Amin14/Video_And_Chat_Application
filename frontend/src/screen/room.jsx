import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from '../contex/socketProvider'

const RoomPage = () => {
    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const currStream = useRef(null)
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handlUserJonined = useCallback(
        ({ email, id }) => {
            console.log(`Email ${email} joined room Id is= ${id}`)
            setRemoteSocketId(id)
        },
        [],
    )

    const handleCalUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        currStream.current = stream
        const offer = await peer.getOffer()
        socket.emit('user:call', { to: remoteSocketId, offer })
        setMyStream(stream)
    }, [remoteSocketId, socket])

    const handleIncommingcall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            })
            currStream.current = stream
            setMyStream(stream)
            console.log(`Incoming call `, from, offer)
            const ans = await peer.getAnswer(offer)
            socket.emit('call:accepted', { to: from, ans })
        },
        [socket],

    )

    const sendStreams = useCallback(() => {
        var res = currStream.current
        for (const track of myStream.getTracks()) {
            //  peer.peer.addTrack(track, myStream);
            peer.peer.addTrack(track, res)
        }
    },
        [myStream],
    )


    const handleCalAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans)
            console.log('Call Accepted')
            sendStreams()
        },
        [sendStreams],
    )



    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId })
    },
        [remoteSocketId, socket],
    )


    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded)
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
        }
    }, [handleNegoNeeded]);

    const handleNegoIncomming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer)
        console.log("_________________________________")
        socket.emit('peer:nego:done', { to: from, ans })
    },
        [socket],
    )

    const handleNegoFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans)
    },
        [],
    )


    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams
            console.log("  Got Tracks!!!! ")
            setRemoteStream(remoteStream[0])
        })
    }, []);



    useEffect(() => {

        socket.on('users:joined', handlUserJonined)
        socket.on('incomming:call', handleIncommingcall)
        socket.on('call:accepted', handleCalAccepted)
        socket.on('peer:nego:needed', handleNegoIncomming)
        socket.on('peer:nego:final', handleNegoFinal)
        return () => {
            socket.off('users:joined', handlUserJonined)
            socket.off('incomming:call', handleIncommingcall)
            socket.off('call:accepted', handleCalAccepted)
            socket.off('peer:nego:needed', handleNegoIncomming)
            socket.off('peer:nego:final', handleNegoFinal)
        }

    }, [socket, handlUserJonined, handleIncommingcall, handleCalAccepted, handleNegoIncomming, handleNegoFinal])

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-6">
            <h1 className="text-3xl font-bold text-blue-700">Room Page</h1>
            <h4 className="text-lg">
                {remoteSocketId ? (
                    <span className="text-green-600 font-semibold">Connected</span>
                ) : (
                    <span className="text-red-600 font-semibold">No one in room</span>
                )}
            </h4>

            <div className="flex space-x-4">
                {myStream && (
                    <button
                        onClick={sendStreams}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Send Stream
                    </button>
                )}
                {remoteSocketId && (
                    <button
                        onClick={handleCalUser}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        CALL
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {myStream && (
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">My Stream</h2>
                        <ReactPlayer
                            playing
                            muted
                            height="200px"
                            width="100%"
                            url={myStream}
                        />
                    </div>
                )}

                {remoteStream && (
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Remote Stream</h2>
                        <ReactPlayer
                            playing
                            muted
                            height="200px"
                            width="100%"
                            url={remoteStream}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomPage;
