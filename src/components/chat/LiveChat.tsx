import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, Send, X, User, Clock, ChevronLeft, 
  Circle, Search, Phone, Mail
} from "lucide-react";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'agent';
  sender_name: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  agent_id: string;
  agent_name: string;
  agent_email: string;
  agent_phone?: string;
  agent_agency?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  agency?: string;
}

interface UserContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface LiveChatProps {
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'user' | 'agent';
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChat({ 
  currentUserId, 
  currentUserName, 
  currentUserType, 
  isOpen, 
  onClose 
}: LiveChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [users, setUsers] = useState<UserContact[]>([]);
  const [showAgentList, setShowAgentList] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [searchAgent, setSearchAgent] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      // Start polling for new messages
      pollingRef.current = setInterval(() => {
        fetchConversations();
        if (activeConversation) {
          fetchMessages(activeConversation.id);
        }
      }, 3000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen, activeConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3001/api/chat/conversations?userId=${currentUserId}&userType=${currentUserType}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3001/api/chat/messages/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
        // Mark messages as read
        markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(`http://localhost:3001/api/chat/messages/${conversationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          readerId: currentUserId,
          readerType: currentUserType
        })
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/api/agents", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAgents(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const startNewConversation = async (agent: Agent) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: currentUserId,
          userName: currentUserName,
          userEmail: localStorage.getItem("userEmail") || "",
          agentId: agent.id,
          agentName: agent.name,
          agentEmail: agent.email,
          agentPhone: agent.phone,
          agentAgency: agent.agency
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveConversation(data.data);
        setShowAgentList(false);
        fetchMessages(data.data.id);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          senderId: currentUserId,
          senderType: currentUserType,
          senderName: currentUserName,
          message: newMessage
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewMessage("");
        fetchMessages(activeConversation.id);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
  };

  const startNewConversationWithUser = async (user: UserContact) => {
    try {
      const token = localStorage.getItem("authToken");
      const agentData = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch("http://localhost:3001/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          agentId: currentUserId,
          agentName: currentUserName,
          agentEmail: agentData.email || "",
          agentPhone: agentData.phone || "",
          agentAgency: agentData.agency || ""
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveConversation(data.data);
        setShowUserList(false);
        fetchMessages(data.data.id);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleNewChat = () => {
    if (currentUserType === 'user') {
      fetchAgents();
      setShowAgentList(true);
    } else {
      fetchUsers();
      setShowUserList(true);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchAgent.toLowerCase()) ||
    agent.agency?.toLowerCase().includes(searchAgent.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden border bg-background">
      <Card className="h-full flex flex-col border-0">
        {/* Header */}
        <CardHeader className="py-3 px-4 bg-primary text-primary-foreground flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeConversation && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-auto text-primary-foreground hover:bg-primary/80"
                  onClick={() => setActiveConversation(null)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <MessageCircle className="w-5 h-5" />
              <CardTitle className="text-lg font-semibold">
                {activeConversation 
                  ? (currentUserType === 'user' ? activeConversation.agent_name : activeConversation.user_name)
                  : showAgentList 
                    ? 'Select an Agent'
                    : showUserList
                      ? 'Select a User'
                      : 'Messages'
                }
              </CardTitle>
              {getTotalUnreadCount() > 0 && !activeConversation && (
                <Badge variant="secondary" className="ml-2 bg-red-500 text-white">
                  {getTotalUnreadCount()}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-auto text-primary-foreground hover:bg-primary/80"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          {/* Agent List View (for users to start new chat) */}
          {showAgentList && !activeConversation && (
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents..."
                    value={searchAgent}
                    onChange={(e) => setSearchAgent(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredAgents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No agents found</p>
                    </div>
                  ) : (
                    filteredAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors mb-2"
                        onClick={() => startNewConversation(agent)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.agency}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{agent.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAgentList(false)}
                >
                  Back to Messages
                </Button>
              </div>
            </div>
          )}

          {/* User List View (for agents to start new chat) */}
          {showUserList && !activeConversation && (
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors mb-2"
                        onClick={() => startNewConversationWithUser(user)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{user.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowUserList(false)}
                >
                  Back to Messages
                </Button>
              </div>
            </div>
          )}

          {/* Conversations List */}
          {!activeConversation && !showAgentList && !showUserList && (
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b">
                <Button 
                  className="w-full gap-2" 
                  onClick={handleNewChat}
                >
                  <MessageCircle className="w-4 h-4" />
                  {currentUserType === 'user' ? 'Start New Chat with Agent' : 'Start New Chat with User'}
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {conversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No conversations yet</p>
                      <p className="text-sm mt-1">
                        {currentUserType === 'user' 
                          ? 'Start a chat with an agent!'
                          : 'Start a chat with a user!'
                        }
                      </p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors mb-2 ${
                          conversation.unread_count > 0 ? 'bg-blue-50 dark:bg-blue-950' : ''
                        }`}
                        onClick={() => openConversation(conversation)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                              {(currentUserType === 'user' 
                                ? conversation.agent_name 
                                : conversation.user_name
                              ).charAt(0).toUpperCase()}
                            </div>
                            <Circle className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-green-500 fill-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold truncate">
                                {currentUserType === 'user' 
                                  ? conversation.agent_name 
                                  : conversation.user_name
                                }
                              </p>
                              {conversation.last_message_time && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.last_message_time)}
                                </span>
                              )}
                            </div>
                            {currentUserType === 'user' && conversation.agent_agency && (
                              <p className="text-xs text-muted-foreground">{conversation.agent_agency}</p>
                            )}
                            {conversation.last_message && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {conversation.last_message}
                              </p>
                            )}
                          </div>
                          {conversation.unread_count > 0 && (
                            <Badge variant="default" className="bg-blue-500 text-white ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Active Conversation - Messages */}
          {activeConversation && (
            <div className="flex-1 flex flex-col">
              {/* Conversation Partner Info */}
              <div className="p-3 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                    {(currentUserType === 'user' 
                      ? activeConversation.agent_name 
                      : activeConversation.user_name
                    ).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {currentUserType === 'user' 
                        ? activeConversation.agent_name 
                        : activeConversation.user_name
                      }
                    </p>
                    {currentUserType === 'user' && activeConversation.agent_agency && (
                      <p className="text-xs text-muted-foreground">{activeConversation.agent_agency}</p>
                    )}
                  </div>
                  {currentUserType === 'user' && activeConversation.agent_phone && (
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}>
                              <Clock className="w-3 h-3 opacity-60" />
                              <span className="text-xs opacity-60">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !newMessage.trim()} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Chat Toggle Button Component
interface ChatToggleButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export function ChatToggleButton({ onClick, unreadCount = 0 }: ChatToggleButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 left-4 z-40 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all"
      size="icon"
    >
      <MessageCircle className="w-6 h-6" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -left-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
