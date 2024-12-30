import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Video, Monitor } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreen: () => void;
  isRecording: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
}

export const ChatInput = ({
  onSend,
  onToggleAudio,
  onToggleVideo,
  onToggleScreen,
  isRecording,
  isVideoOn,
  isScreenSharing,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant={isRecording ? "destructive" : "secondary"}
        size="icon"
        onClick={onToggleAudio}
        className="shrink-0"
      >
        <Mic className="h-4 w-4" />
      </Button>
      <Button
        variant={isVideoOn ? "destructive" : "secondary"}
        size="icon"
        onClick={onToggleVideo}
        className="shrink-0"
      >
        <Video className="h-4 w-4" />
      </Button>
      <Button
        variant={isScreenSharing ? "destructive" : "secondary"}
        size="icon"
        onClick={onToggleScreen}
        className="shrink-0"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1"
      />
      <Button onClick={handleSend} className="shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};