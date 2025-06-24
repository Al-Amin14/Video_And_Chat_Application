import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../contex/socketProvider'
import ReactPlayer from 'react-player'
import peer from '../service/peer'

const Room = () => {

    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null);

    const handlUserJonined = useCallback(
        ({ email, id }) => {
            console.log(`Email ${email} joined room Id is= ${id}`)
            setRemoteSocketId(id)
        },
        [],
    )

    const handleIncommingcall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            })
            setMyStream(stream)
            console.log(`Incoming call `, from, offer)
            const ans = await peer.getAnswer(offer)
            socket.emit('call:accepted', { to: from, ans })
        },
        [socket],
    )

    const handleCalAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans)
            console.log('Call Accepted')
            for (const track of myStream.getTracks()) {
                peer.peer.addTrack(track, myStream)
            }
        },
        [],
    )

    useEffect(() => {

        socket.on('users:joined', handlUserJonined)
        socket.on('incomming:call', handleIncommingcall)
        socket.on('call:accepted', handleCalAccepted)
        return () => {
            socket.off('users:joined', handlUserJonined)
            socket.off('incomming:call', handleIncommingcall)
            socket.off('call:accepted', handleCalAccepted)
        }

    }, [socket])

    const handleCalUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        setMyStream(stream)
        const offer = await peer.getOffer()
        socket.emit('user:call', { to: remoteSocketId, offer })
    }, [remoteSocketId, socket])


    return (
        <div className='flex font-bold text-4xl '>
            <h4 className='font-bold text-4xl'>{remoteSocketId ? 'Connected' : 'Not Connected'}</h4>
            {remoteSocketId && <button className='font-bold' onClick={handleCalUser}>Call</button>}
            <ReactPlayer
                playing
                muted
                height='100px'
                width='200px'
                url={myStream}
            />

        </div>
    )
}

export default Room
