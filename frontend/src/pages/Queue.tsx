import React, { useState } from 'react';
import { Header, Stats, Filters, MessageList } from '@components/Queue';
import { QueueMessage } from '@types';

const Queue: React.FC = () => {
  const [messages, setMessages] = useState<QueueMessage[]>([
    {
      id: 1,
      type: 'email',
      content: 'Customer support request from john@example.com',
      status: 'pending',
      priority: 'high',
      created_at: '2024-01-15T10:30:00Z',
      agent: 'Support Agent',
    },
    {
      id: 2,
      type: 'chat',
      content: 'Live chat message from user session #12345',
      status: 'processing',
      priority: 'medium',
      created_at: '2024-01-15T10:25:00Z',
      agent: 'Chat Agent',
    },
    {
      id: 3,
      type: 'task',
      content: 'Data processing task for workflow #789',
      status: 'completed',
      priority: 'low',
      created_at: '2024-01-15T10:20:00Z',
      agent: 'Data Agent',
    },
    {
      id: 4,
      type: 'notification',
      content: 'System alert: High CPU usage detected',
      status: 'failed',
      priority: 'high',
      created_at: '2024-01-15T10:15:00Z',
      agent: 'System Agent',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      <Header />
      <Stats messages={messages} />
      <Filters 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />
      <MessageList 
        messages={messages}
        filteredMessages={filteredMessages}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
      />
    </div>
  );
};

export default Queue;
