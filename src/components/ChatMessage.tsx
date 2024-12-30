import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export const ChatMessage = ({ content, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full gap-3 p-4 animate-slide-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8">
        <div className={cn(
          "h-full w-full rounded-full",
          isUser ? "bg-primary" : "bg-secondary"
        )}>
          {isUser ? "U" : "A"}
        </div>
      </Avatar>
      <Card className={cn(
        "max-w-[80%] p-4 shadow-sm",
        isUser ? "bg-chat-user" : "bg-chat-assistant"
      )}>
        <p className="text-sm">{content}</p>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-2 block">
            {timestamp}
          </span>
        )}
      </Card>
    </div>
  );
};