import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Car,
  DollarSign,
  Settings,
  Brain,
  Sparkles
} from 'lucide-react';


const AIAssistant = ({ isOnline = false, onMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState('online');

  const aiResponses = {
    greeting: [
      "Hello! I'm AutoCare AI, your virtual assistant! 🤖 How can I help you today?",
      "Welcome! I'm here to assist you with AutoCare Pro services! ⚡",
      "Hi there! I'm your AI assistant, ready to rock and help! 🎸"
    ],
    service: [
      "I can help you with service requests! What type of service do you need?",
      "Great! Let me guide you through the service booking process.",
      "I'll assist you with your service request. What's the issue with your vehicle?"
    ],
    payment: [
      "I can help you with payment processing! What payment method do you prefer?",
      "Let me guide you through the payment process. We accept M-Pesa and other methods.",
      "I'll assist you with your payment. What amount do you need to pay?"
    ],
    general: [
      "I'm here to help! What would you like to know about AutoCare Pro?",
      "I can assist you with various services. What do you need help with?",
      "Let me help you navigate AutoCare Pro! What can I do for you?"
    ],
    offline: [
      "I notice no admins are online right now. I'll take charge and help you! 🤖",
      "Don't worry! I'm here to assist you while the admins are away.",
      "I'm your AI assistant, ready to help you with AutoCare Pro services!"
    ]
  };

  const aiPersonality = {
    name: "AutoCare AI",
    emoji: "🤖",
    status: aiStatus,
    capabilities: [
      "Service Request Processing",
      "Payment Assistance", 
      "General Inquiries",
      "24/7 Support",
      "Quick Responses"
    ]
  };

  useEffect(() => {
    // Initialize AI with welcome message
    if (!isOnline) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        text: aiResponses.offline[Math.floor(Math.random() * aiResponses.offline.length)],
        timestamp: new Date(),
        isAI: true
      };
      setMessages([welcomeMessage]);
    }
  }, [isOnline]);

  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let response = "";
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('service') || lowerMessage.includes('repair') || lowerMessage.includes('maintenance')) {
      response = aiResponses.service[Math.floor(Math.random() * aiResponses.service.length)];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('money')) {
      response = aiResponses.payment[Math.floor(Math.random() * aiResponses.payment.length)];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
    } else {
      response = aiResponses.general[Math.floor(Math.random() * aiResponses.general.length)];
    }

    // Add AI-specific responses based on keywords
    if (lowerMessage.includes('admin') || lowerMessage.includes('human')) {
      response = "I'm your AI assistant! While admins are offline, I can help you with most tasks. What do you need assistance with?";
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      response = "I understand this is urgent! I'll prioritize your request and notify admins immediately when they come online. What's the emergency?";
    }

    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      text: response,
      timestamp: new Date(),
      isAI: true
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date(),
      isAI: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Generate AI response
    await generateAIResponse(inputMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
                  <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                {aiPersonality.emoji}
              </motion.div>
              <div>
                <CardTitle className="gradient-text text-xl">
                  {aiPersonality.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`status-badge ${aiStatus === 'online' ? 'approved' : 'pending'}`}>
                    {aiStatus === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                  <span className="text-sm text-gray-400">AI Assistant</span>
                </div>
              </div>
            </div>
            
            {!isOnline && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-500">Admins Offline</span>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* AI Capabilities */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Capabilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {aiPersonality.capabilities.map((capability, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto space-y-3 p-2">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.isAI ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.isAI ? 'message-bubble received' : 'message-bubble sent'}`}>
                    <div className="flex items-start gap-2">
                      {message.isAI && (
                        <Bot className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="message-bubble received">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-400" />
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about AutoCare Pro..."
              className="form-input flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              className="btn-epic"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {[
              "Service Request",
              "Payment Help", 
              "General Info",
              "Emergency"
            ].map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputMessage(action);
                  handleSendMessage();
                }}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                {action}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIAssistant; 