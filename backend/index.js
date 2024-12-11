import Fastify from 'fastify';
import dotenv from 'dotenv';
import fastifyFormBody from '@fastify/formbody';
import fastifyWs from '@fastify/websocket';
import fastifySocketIo from 'fastify-socket.io';
import {TranscriptionService} from './services/TranscribtionService.js';
import { SYSTEM_PROMTP, WELCOME_MESSAGE } from './constant/promptConstant.js';
import { textToSpeechService } from './services/realTimeSpeechService.js';
import { promptLLM } from './services/promtLLMservice.js';
import { PlayAiService } from './services/playAIService.js';
import axios from 'axios';
import fastifyCors from 'fastify-cors';
import { promptLLMWithoutMedia } from './services/promtServiceWithMedia.js';


// Load environment variables from .env file
dotenv.config();

// Retrieve the OpenAI API key from environment variables
const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key. Please set it in the .env file.');
    process.exit(1);
}

// Initialize Fastify
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);
fastify.register(fastifySocketIo, {
    cors: {
      origin: '*', // Adjust CORS as needed
    }
});

fastify.register(fastifyCors, { 
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

const PORT = process.env.PORT || 5002;

// Session management
const sessions = new Map();



// Root Route
fastify.get('/', async (request, reply) => {
    reply.send({ message: 'Media Stream Server is running!' });
});

fastify.post('/get-access-token',async (request,reply) => {
    const API_KEY = process.env.HEYGEN_API_KEY;
    try {
        //Ask the server for a secure Access Token
        const response = await axios.post('https://api.heygen.com/v1/streaming.create_token', {}, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        reply.send({token: response.data.data.token});
    } catch (error) {
        console.error('Error retrieving access token:', error);
        reply.status(500).send({ error: 'Failed to retrieve access token' });
    }
})

// WebSocket route for talk better
fastify.register(async (fastify) => {
    fastify.get('/media-stream', { websocket: true }, (connection, req) => {
        const config = {
            stopStream: false,
            assistantSpeaking: false,
            user: {
                name: undefined,
                email: undefined
            }
        }
        
        const  transcriptionService = new TranscriptionService();
        const TTSService = textToSpeechService(connection,config,WELCOME_MESSAGE);
        const userChat = [{role: "system",content: SYSTEM_PROMTP},{role: 'assistant',content: WELCOME_MESSAGE}];
        
        // Handle incoming messages from Twilio
        connection.on('message', async (message) => {
            try {
           
                const data = JSON.parse(message);                
                switch (data.event) {
                    case 'start':
                        config.user.name = data?.start?.user?.name;
                        config.user.email = data?.start?.user?.email;
                        console.log('user conneted',config.user.name)
                       
                        break;
                    case 'media':
                        transcriptionService.send(data.media.payload);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error, 'Message:', message);
            }
        });

        transcriptionService.on('transcription', async (transcript_text) => {
            if(!transcript_text) return

            console.log('User', transcript_text);

            if(transcript_text){
                config.stopStream = true;
                connection.send(
                    JSON.stringify({
                      event: 'clear',
                    })
                );
            }

            userChat.push({role: 'user',content: transcript_text});
            const assistantResponse = await promptLLM(TTSService,userChat,config,transcript_text);
            userChat.push({role: 'assistant',content: assistantResponse});
            console.log('Assistant', assistantResponse);
        })

        // Handle connection close and log transcript
        connection.on('close', async () => {
            console.log(`Client disconnected`);
            TTSService.close();
            transcriptionService.close();
        });
    });
});




// WebSocket route for playai
fastify.register(async (fastify) => {
    fastify.get('/play-ai', { websocket: true }, (connection, req) => {
        const config = {
            user: {
                name: undefined,
                email: undefined
            }
        }

        const playAiservice = new PlayAiService(connection);
        // Handle incoming messages from Twilio
        connection.on('message', async (message) => {
            try {
                const data = JSON.parse(message);                
                switch (data.event) {
                    case 'start':
                        config.user.name = data?.start?.user?.name;
                        config.user.email = data?.start?.user?.email;
                        console.log('user conneted',config.user.name)
                       
                        break;
                    case 'media':
                        playAiservice.send(data.media.payload);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error, 'Message:', message);
            }
        });


        // Handle connection close and log transcript
        connection.on('close', async () => {
           playAiservice.close();
        });
    });
});

const sendTextToHeyGenServer = async (session_id,token,text) => {
    try {
        const response = await axios.post(
            `https://api.heygen.com/v1/streaming.task`,
            {
              session_id: session_id,
              text,
              task_type: 'repeat',
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
        );

        
    } catch (error) {
        console.log(error?.response?.data?.message || error?.message)
    }
}
// HeyGen
fastify.register(async (fastify) => {
    fastify.get('/heygen', { websocket: true }, (connection, req) => {

        const config = {
            user: {
                name: undefined,
                email: undefined
            },
            sessionToken: undefined,
            sessionData: undefined
        }

        const  transcriptionService = new TranscriptionService();
        const userChat = [{role: "system",content: SYSTEM_PROMTP},{role: 'assistant',content: WELCOME_MESSAGE}];

        // Handle incoming messages from Twilio
        connection.on('message', async (message) => {
            try {
                const data = JSON.parse(message);                
                switch (data.event) {
                    case 'start':
                        config.user.name = data?.start?.user?.name;
                        config.user.email = data?.start?.user?.email;
                        config.sessionData = data.start.sessionData;
                        config.sessionToken = data.start.sessionToken;
                        sendTextToHeyGenServer(config.sessionData.session_id,config.sessionToken,WELCOME_MESSAGE);
                        console.log('user conneted',config.user.name);
                        break;
                    case 'media':
                        transcriptionService.send(data.media.payload);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error, 'Message:', message);
            }
        });

        transcriptionService.on('transcription', async (transcript_text) => {
            if(!transcript_text) return
            console.log('User', transcript_text);
            userChat.push({role: 'user',content: transcript_text});
            const assistantResponse = await promptLLMWithoutMedia(userChat,config,transcript_text);
            sendTextToHeyGenServer(config.sessionData.session_id,config.sessionToken,assistantResponse);
            userChat.push({role: 'assistant',content: assistantResponse});
            console.log('assistant: ',assistantResponse);
        });

        // Handle connection close and log transcript
        connection.on('close', async () => {
            console.log(`Client disconnected`);
            transcriptionService.close();
        });
    });
});


fastify.listen({ port: PORT }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening on port ${PORT}`);
});