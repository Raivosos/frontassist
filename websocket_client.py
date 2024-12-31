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

    async def startup(self, model):
        setup_msg = {
            "setup": {
                "model": f"models/{model}",
                "systemInstruction": ASSISTANT_CONFIG["systemInstruction"]
            }
        }
        await self.ws.send(json.dumps(setup_msg))
        raw_response = await self.ws.recv()
        return json.loads(raw_response)

    async def receive_audio(self, audio_in_queue):
        async for raw_response in self.ws:
            response = json.loads(raw_response)

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