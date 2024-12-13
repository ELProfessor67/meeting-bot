import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import classNames from 'classnames'
import React, { forwardRef, useEffect } from 'react'
import AudioPulse from '../audio-pulse/AudioPulse';

const MeetingView = forwardRef(({videoRef,videoStream},ref) => {
    const { client, connected, connect, disconnect, volume } = useLiveAPIContext();

    
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        }
    },[])
    return (
        <>
            <video
                className={classNames("stream", {
                    hidden: !videoRef.current || !videoStream
                })}
                ref={ref}
                autoPlay
                playsInline
            />

            {
                connected && !videoStream &&
                <div className="action-button no-action outlined">
                    <AudioPulse volume={volume} active={connected} hover={false} />
                </div>
            }

            {
                !connected && 
                <h2 className='text-3xl text-white'>Connecting...</h2>
            }
        </>
    )
})

export default MeetingView