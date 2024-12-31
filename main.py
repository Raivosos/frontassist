"""Main application entry point."""

import asyncio
import sys
import traceback
import argparse
from websockets.asyncio.client import connect
import json
import cv2

from config import URI, MODEL
from media_handlers import MediaHandler
from audio_handlers import AudioHandler
from websocket_client import WebSocketClient

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

if sys.version_info < (3, 11, 0):
    import taskgroup, exceptiongroup
    asyncio.TaskGroup = taskgroup.TaskGroup
    asyncio.ExceptionGroup = exceptiongroup.ExceptionGroup

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--mode",
        type=str,
        default="camera",
        help="pixels to stream from",
        choices=["camera", "screen"],
    )
    return parser.parse_args()

class AudioLoop:
    def __init__(self, mode):
        self.mode = mode
        self.audio_in_queue = None
        self.out_queue = None
        self.ws = None
        self.media_handler = MediaHandler()
        self.audio_handler = AudioHandler()
        self.message_queue = asyncio.Queue()
        print("AudioLoop initialized successfully")

    async def get_frames(self):
        print("Starting camera capture...")
        cap = await asyncio.to_thread(cv2.VideoCapture, 0)
        while True:
            frame = await asyncio.to_thread(self.media_handler._get_frame, cap)
            if frame is None:
                break
            await asyncio.sleep(1.0)
            msg = {"realtime_input": {"media_chunks": [frame]}}
            await self.out_queue.put(msg)
        cap.release()

    async def get_screen(self):
        print("Starting screen capture...")
        while True:
            frame = await asyncio.to_thread(self.media_handler._get_screen)
            if frame is None:
                break
            await asyncio.sleep(1.0)
            msg = {"realtime_input": {"media_chunks": [frame]}}
            await self.out_queue.put(msg)

    async def send_realtime(self):
        print("Starting realtime message sender...")
        while True:
            msg = await self.out_queue.get()
            await self.ws.send(json.dumps(msg))

    async def process_frontend_messages(self):
        print("Starting frontend message processor...")
        while True:
            try:
                message = await self.message_queue.get()
                print(f"Received message from frontend: {message}")
                if message:
                    await self.ws.send(json.dumps({
                        "client_content": {
                            "turn_complete": True,
                            "turns": [{"role": "user", "parts": [{"text": message}]}],
                        }
                    }))
            except Exception as e:
                print(f"Error processing frontend message: {e}")

    async def run(self):
        print("Starting AudioLoop...")
        try:
            print(f"Connecting to WebSocket at {URI}...")
            async with (
                await connect(URI, additional_headers={"Content-Type": "application/json"}) as ws,
                asyncio.TaskGroup() as tg,
            ):
                self.ws = ws
                print("WebSocket connection established")
                
                ws_client = WebSocketClient(ws, self.message_queue)
                await ws_client.startup(MODEL)
                print("WebSocket client initialized")

                self.audio_in_queue = asyncio.Queue()
                self.out_queue = asyncio.Queue(maxsize=5)

                print("Starting tasks...")
                tg.create_task(self.process_frontend_messages())
                tg.create_task(self.send_realtime())
                tg.create_task(self.audio_handler.listen_audio(self.out_queue))
                
                if self.mode == "camera":
                    tg.create_task(self.get_frames())
                elif self.mode == "screen":
                    tg.create_task(self.get_screen())
                    
                tg.create_task(ws_client.receive_audio(self.audio_in_queue))
                tg.create_task(self.audio_handler.play_audio(self.audio_in_queue))

                print("All tasks started successfully")
                
                # Keep the connection alive
                while True:
                    await asyncio.sleep(1)

        except asyncio.CancelledError:
            print("Server shutdown requested")
            pass
        except ExceptionGroup as EG:
            print("Error occurred:", str(EG))
            self.audio_handler.audio_stream.close()
            traceback.print_exception(EG)
        except Exception as e:
            print(f"Unexpected error: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    print("Starting server...")
    args = parse_args()
    main = AudioLoop(args.mode)
    try:
        asyncio.run(main.run())
    except KeyboardInterrupt:
        print("\nServer shutdown requested by user")
    except Exception as e:
        print(f"Fatal error: {e}")
        traceback.print_exc()