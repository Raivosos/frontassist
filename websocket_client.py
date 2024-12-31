"""WebSocket client for handling communication with the API."""

import json
import base64
from websockets.asyncio.client import connect
from config import URI, ASSISTANT_CONFIG
import asyncio

class WebSocketClient:
    def __init__(self, ws, message_queue):
        self.ws = ws
        self.message_queue = message_queue
        print("WebSocket client initialized")

    async def startup(self, model):
        print(f"Starting WebSocket client with model: {model}")
        setup_msg = {
            "setup": {
                "model": f"models/{model}",
                "systemInstruction": ASSISTANT_CONFIG["systemInstruction"]
            }
        }
        await self.ws.send(json.dumps(setup_msg))
        raw_response = await self.ws.recv()
        print("Received startup response from server")
        return json.loads(raw_response)

    async def receive_audio(self, audio_in_queue):
        print("Starting audio receiver...")
        async for raw_response in self.ws:
            try:
                response = json.loads(raw_response)
                print("Received response from server:", response)

                try:
                    b64data = response["serverContent"]["modelTurn"]["parts"][0]["inlineData"]["data"]
                    pcm_data = base64.b64decode(b64data)
                    audio_in_queue.put_nowait(pcm_data)
                except KeyError:
                    pass

                try:
                    if response["serverContent"]["turnComplete"]:
                        print("\nEnd of turn")
                        while not audio_in_queue.empty():
                            audio_in_queue.get_nowait()
                except KeyError:
                    pass
            except Exception as e:
                print(f"Error processing WebSocket message: {e}")