export interface ChatBotMessage {
  message: string;
  type: 'bot' | 'user';
  id: string;
  loading?: boolean;
  widget?: string;
}

export interface ChatBotState {
  messages: ChatBotMessage[];
  loading: boolean;
}

export interface IMessageOptions {
  widget?: string;
  loading?: boolean;
  delay?: number;
}

export interface ActionProviderProps {
  createChatBotMessage: (message: string, options?: IMessageOptions) => ChatBotMessage;
  setState: (fn: (prevState: ChatBotState) => ChatBotState) => void;
  children: React.ReactNode;
}

export interface MessageParserProps {
  children: React.ReactNode;
  actions: {
    handleReportRequest: () => void;
  };
} 