"""Main application file."""
import asyncio
from websockets.asyncio.client import connect
from config import URI, ASSISTANT_CONFIG
from websocket_client import WebSocketClient
import queue

class AudioLoop:
    def __init__(self):
        self.audio_in_queue = queue.Queue()

    async def run(self):
        async with connect(URI) as ws:
            client = WebSocketClient(ws)
            await client.startup(ASSISTANT_CONFIG["model"])
            
            await asyncio.gather(
                client.send_text(),
                client.receive_audio(self.audio_in_queue)
            )

if __name__ == "__main__":
    main = AudioLoop()
    asyncio.run(main.run())