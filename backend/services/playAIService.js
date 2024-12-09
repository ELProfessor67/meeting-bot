import { Buffer } from 'node:buffer';
import EventEmitter from 'events';
import WebSocket from 'ws';
import wavefile from 'wavefile';



export class PlayAiService extends EventEmitter {
  socket;
  isOpen = false;
  chunks = []
  constructor(connection) {
    super();
       this.socket = new WebSocket(`${process.env.PLAY_AI_WEBURL}/${process.env.PLAY_AGENT_ID}`);
        this.connection = connection;
      this.socket.onopen = () => {
        console.log('play ai socket connected!');
        this.isOpen = true;
        this.socket.send(JSON.stringify({ type: 'setup', apiKey: process.env.PLAY_AI_SK,outputFormat: "mulaw", outputSampleRate: 8000 }));
      }

      this.socket.onmessage = (message) => {
        const event = JSON.parse(message.data)
        if (event.type === 'audioStream') {
            // const buffer = Buffer.from(event.data,'base64');
            // const wav = new wavefile.WaveFile();
            // wav.fromScratch(1, 8000, '8m', buffer);
            // const payload = wav.toBase64();
            
            // const sendData = {
            //     event: 'media',
            //     media: {
            //         payload
            //     }
            //     }
            // connection.send(JSON.stringify(sendData));



        const buffer = Buffer.from(event.data,'base64');
        this.chunks.push(buffer);

        if(this.chunks.length >= 2){
          const mergeBuffer = Buffer.concat(this.chunks);
          const wav = new wavefile.WaveFile();
          wav.fromScratch(1, 8000, '8m', mergeBuffer);
          const payload = wav.toBase64();
            
          const sendData = {
            event: 'media',
            media: {
              payload
            }
          }
          connection.send(JSON.stringify(sendData));
          this.chunks = [];
        }
        }
      }

      this.socket.onclose = () => {
        this.isOpen = false;
        console.log('play ai socket closed!');
      }

      this.socket.onerror = (error) => {
        this.isOpen = false;
        console.log({ event: 'onerror', error })
      }
  }

  /**
   * Send the payload to Deepgram
   * @param {String} payload A base64 MULAW/8000 audio stream
   */
  send(payload) {
      if(this.isOpen){
        const data = {
            type: 'audioIn',
            data:  payload
        }

        this.socket.send(JSON.stringify(data));
    }
  }

  close(){
    this.socket.close();
  }
}

         