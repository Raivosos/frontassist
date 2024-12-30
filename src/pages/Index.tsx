import { ChatContainer } from "@/components/ChatContainer";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Personal Assistant</h1>
          <ThemeToggle />
        </div>
        <div className="animate-fade-in">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default Index;