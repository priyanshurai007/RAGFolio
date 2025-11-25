import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Loader, User, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I can answer questions about your resume. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await resumeAPI.query(id!, input);
      const { answer, sources } = response.data;
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: answer,
        sources: sources,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is the candidate's educational background?",
    "What are their key technical skills?",
    "Tell me about their work experience",
    "What projects have they worked on?",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Interview Assistant</h1>
        
        <div className="mb-4 flex flex-wrap gap-2">
          <p className="text-sm text-gray-600 w-full mb-2">Try asking:</p>
          {sampleQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => setInput(question)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full"
            >
              {question}
            </button>
          ))}
        </div>
        
        <div className="border rounded-lg h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      message.role === 'user' ? 'bg-primary-100' : 'bg-gray-100'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>
                  
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p className="font-medium">Sources:</p>
                        {message.sources.map((source, sidx) => (
                          <p key={sidx}>
                            • {source.metadata.section} (score: {source.score.toFixed(2)})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader className="animate-spin h-5 w-5" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the resume..."
                className="input flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-primary"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
