import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/UI';
import { MessageSquare } from 'lucide-react';
import MessageItem from './MessageItem';

interface QueueMessage {
  id: number;
  type: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  agent: string;
}

interface MessageListProps {
  messages: QueueMessage[];
  filteredMessages: QueueMessage[];
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  filteredMessages, 
  searchTerm, 
  statusFilter, 
  priorityFilter,
  className = '' 
}) => {
  const hasFilters = searchTerm || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Queue Messages</CardTitle>
        <CardDescription>
          {filteredMessages.length} of {messages.length} messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'No messages in the queue at the moment.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageList;
