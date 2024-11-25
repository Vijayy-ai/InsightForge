import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { createChatBotMessage } from 'react-chatbot-kit';
import { 
  ActionProviderProps, 
  MessageParserProps, 
  ChatBotState, 
  IMessageOptions 
} from '@/types/chatbot';

const config = {
  initialMessages: [
    createChatBotMessage("Welcome to InsightForge! 👋", {
      widget: "overview",
      loading: true,
    } as IMessageOptions),
    createChatBotMessage("How can I help you analyze your data today?", {
      delay: 500,
    } as IMessageOptions),
  ],
  botName: "InsightBot",
  customStyles: {
    botMessageBox: {
      backgroundColor: "#376B7E",
    },
    chatButton: {
      backgroundColor: "#376B7E",
    },
  },
};

const MessageParser = ({ children, actions }: MessageParserProps) => {
  const parse = (message: string) => {
    const lowerCase = message.toLowerCase();

    if (lowerCase.includes('report') || lowerCase.includes('analysis')) {
      actions.handleReportRequest();
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement, {
          parse: parse,
          actions: {},
        });
      })}
    </div>
  );
};

const ActionProvider = ({ createChatBotMessage, setState, children }: ActionProviderProps) => {
  const handleReportRequest = () => {
    const botMessage = createChatBotMessage(
      "I'll help you generate a report. Please provide the following details:\n1. Data source\n2. Type of analysis\n3. Specific metrics you're interested in",
      { delay: 500 }
    );

    setState((prev: ChatBotState) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement, {
          actions: {
            handleReportRequest,
          },
        });
      })}
    </div>
  );
};

export default function ChatbotInterface() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center space-x-2"
          aria-label="Open chat assistant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span>Chat with AI</span>
        </button>
      )}
      
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
              aria-label="Close chat assistant"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </div>
        </div>
      )}
    </div>
  );
} 