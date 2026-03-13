export interface Interview {
  id: string;
  title: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  timestamp: Date;
  sender: 'user' | 'ai';
  content: string;
  type: 'text' | 'code' | 'image';
}

export interface Metrics {
  progress: number;
  estimatedHours: string;
  budget: string;
}

export interface Note {
  summary: string;
  metrics: Metrics;
  tags: string[];
  content: string;
}
