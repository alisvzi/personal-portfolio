"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Trash2 } from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contact");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(`/api/contact/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchMessages();
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Messages</h2>
        <div>
          <Badge variant="outline" className="mr-2">
            Total: {messages.length}
          </Badge>
          <Badge variant="secondary">
            Unread: {messages.filter(m => !m.read).length}
          </Badge>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <MessageSquare className="mx-auto h-12 w-12 text-app-gray" />
            <p className="mt-2 text-app-gray-dark">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MessageCardProps {
  message: Message;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function MessageCard({ message, onMarkAsRead, onDelete }: MessageCardProps) {
  const date = new Date(message.createdAt).toLocaleString();

  return (
    <Card className={message.read ? "opacity-75" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{message.name}</CardTitle>
            <a href={`mailto:${message.email}`} className="text-sm text-app-blue">
                  {message.email}
                </a>
          </div>
          <div className="flex items-center space-x-2">
            {!message.read && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onMarkAsRead(message.id)}
              >
                Mark as Read
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(message.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="whitespace-pre-wrap">{message.message}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-app-gray-dark">{date}</span>
            {!message.read && <Badge>New</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}