import { ChatContainer } from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <h1 className="text-4xl font-bold text-center mb-8">Personal Assistant</h1>
        <ChatContainer />
      </div>
    </div>
  );
};

export default Index;