import asyncio
import websockets
import json
from websockets.server import serve
from config import ASSISTANT_CONFIG

async def handle_websocket(websocket):
    try:
        print("Client connected")
        async for message in websocket:
            try:
                data = json.loads(message)
                print("Received message:", data)
                
                # Exemplo de resposta - ajuste conforme sua lógica
                response = {
                    "serverContent": {
                        "modelTurn": {
                            "parts": [
                                {
                                    "text": "Resposta do assistente"
                                }
                            ]
                        }
                    }
                }
                
                await websocket.send(json.dumps(response))
            except json.JSONDecodeError:
                print("Invalid JSON received")
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

async def main():
    print("Starting WebSocket server on port 8000...")
    async with serve(handle_websocket, "localhost", 8000):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())