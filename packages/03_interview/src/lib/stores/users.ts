export interface User {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export const users: User[] = [
  {
    id: '1',
    name: 'João Silva',
    initials: 'JS',
    avatarColor: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'Maria Santos',
    initials: 'MS',
    avatarColor: 'bg-pink-500',
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    initials: 'CM',
    avatarColor: 'bg-green-500',
  },
];
