import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WebSocketService } from "@/services/websocketService";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new WebSocketService();
    
    // Set up message handler
    wsRef.current.onMessage((content) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    });

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const scrollableArea = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableArea) {
        scrollableArea.scrollTop = scrollableArea.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    
    // Send message through WebSocket
    if (wsRef.current) {
      wsRef.current.sendMessage(content);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
        </div>
      </ScrollArea>
      <ChatInput
        onSend={handleSend}
        onToggleAudio={() => setIsRecording(!isRecording)}
        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
        onToggleScreen={() => setIsScreenSharing(!isScreenSharing)}
        isRecording={isRecording}
        isVideoOn={isVideoOn}
        isScreenSharing={isScreenSharing}
      />
    </Card>
  );
};