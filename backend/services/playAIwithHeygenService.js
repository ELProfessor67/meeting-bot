import EventEmitter from 'events';
import WebSocket from 'ws';

export class PlayAiServiceWithHeygen extends EventEmitter {
  socket;
  isOpen = false;
  chunks = []
 
  constructor() {
    super();
       this.socket = new WebSocket(`${process.env.PLAY_AI_WEBURL}/${process.env.PLAY_AGENT_ID}`);
       
      this.socket.onopen = () => {
        console.log('play ai socket connected!');
        this.isOpen = true;
        this.socket.send(JSON.stringify({ type: 'setup', apiKey: process.env.PLAY_AI_SK,outputFormat: "mulaw", outputSampleRate: 8000 }));
      }

      this.socket.onmessage = (message) => {
        const event = JSON.parse(message.data)
          if(event.type == "onAgentTranscript"){
            this.emit('transcription',event.message);
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

         