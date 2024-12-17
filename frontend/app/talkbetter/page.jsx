'use client'
import { RealTimeAudioPlayer } from '@/services/RealTimeAudioPlayer';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, MoreVertical } from 'lucide-react'
import SoundWave from '@/components/SoundWave';
import { useRouter } from 'next/navigation';

const App = () => {
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const mediaRecorderRef = useRef(null);
    const websocketRef = useRef();
    const soundBufferRef = useRef(null);
    const router = useRouter();
    const streamRef = useRef(null);
    


    const toggleMute = useCallback(() => {
      if (streamRef.current) {
          const audioTrack = streamRef.current.getAudioTracks()[0];
          if (audioTrack) {
            if(isMuted){
              audioTrack.enabled = true;
              setIsMuted(false);
            }else{
              audioTrack.enabled = false;
              setIsMuted(true);
            }
          }
      }
    },[isMuted])

    const endCall = useCallback(() => {
      websocketRef.current?.close();
      soundBufferRef.current.clearQueChunks();
      router.push('/');
    },[]);


    const onConnect = useCallback(() => {
      console.log('connected')
      const data = {
        event: 'start',
        start: {
          user: {
            name: "Manan Rajpout",
          }
        }
      }
      websocketRef.current.send(JSON.stringify(data));
      setTimeout(() => sendStream(),4000);
    },[])

    useEffect(() => {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_MEDIA_SERVER_URL);
        websocketRef.current = ws;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        soundBufferRef.current = new RealTimeAudioPlayer(setIsAISpeaking);
        ws.onopen = onConnect;
        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          switch(data.event){
            case 'media':
              const base64Audio = data.media.payload;
              soundBufferRef.current.addAudioChunk(base64Audio); 
              break;
            case 'clear':
              soundBufferRef.current.clearQueChunks();
              break;
            case 'limit_reached':
                alert("5 Limit Reached!");
                endCall();
                break;
          }
        };

        ws.onclose = () => {
          console.log('close');
        }

        return () => {
            ws.close();
        };
    }, []);

    const sendStream = async () => {
      console.log('start voice called')
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support audio recording.');
            return;
        }

        streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 8000
          }
        });

        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current.ondataavailable = async (event) => {
         
          if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            const blob = event.data;
            const reader = new FileReader();
            reader.onload = () => {
              if(reader.readyState == 2){
                const data = {
                  event: 'media',
                  media: {
                    payload: reader?.result?.split('base64,')[1]
                  }
                }

                websocketRef.current.send(JSON.stringify(data));
              }
            }
            reader.readAsDataURL(blob);
          }
        };

        mediaRecorderRef.current.start(100);
    };


    return (
      <>
        <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
          {/* Header */}
          <header className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Talk Better</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto p-4 flex flex-col items-center justify-center">
            {/* AI Assistant and Audio Visualizer */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center space-y-6 w-full max-w-2xl">
              <div className={`relative w-48 h-48 ${isAISpeaking ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-0 bg-indigo-300 rounded-full opacity-50"></div>
                <div className="absolute inset-2 bg-indigo-100 rounded-full flex items-center justify-center">
                  <img
                    src="/bot-icon.webp"
                    alt="AI Assistant"
                    className="w-32 h-32 rounded-full"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-indigo-700">AI Assistant</h2>
              {/* Audio Visualizer */}
              <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden grid place-items-center">
                
                <SoundWave isAnimating={isAISpeaking}/>
              </div>
            </div>
          </main>

          {/* Control Bar */}
          <div className="bg-white shadow-lg p-4">
            <div className="container mx-auto flex justify-center items-center space-x-6">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                } hover:opacity-80 transition-opacity`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff size={24} />
              </button>
              <button className="p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                <MoreVertical size={24} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
};

export default App;
