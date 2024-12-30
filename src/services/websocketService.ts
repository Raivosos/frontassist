import { toast } from "sonner";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageCallback: ((message: string) => void) | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket('ws://localhost:8000');  // Adjust the port to match your Python server

      this.ws.onopen = () => {
        console.log('Connected to WebSocket server');
        toast.success('Connected to assistant');
      };

      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log('Received message:', response);
        
        if (this.messageCallback && response.serverContent?.modelTurn?.parts?.[0]?.text) {
          this.messageCallback(response.serverContent.modelTurn.parts[0].text);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };

      this.ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
        toast.error('Disconnected from assistant');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      toast.error('Failed to connect to assistant');
    }
  }

  public sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = {
        client_content: {
          turn_complete: true,
          turns: [{ role: "user", parts: [{ text: message }] }],
        }
      };
      this.ws.send(JSON.stringify(msg));
    } else {
      toast.error('Not connected to assistant');
    }
  }

  public onMessage(callback: (message: string) => void) {
    this.messageCallback = callback;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}