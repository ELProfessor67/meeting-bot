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


const PORT = process.env.PORT || 5002;

// Session management
const sessions = new Map();



// Root Route
fastify.get('/', async (request, reply) => {
    reply.send({ message: 'Media Stream Server is running!' });
});


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