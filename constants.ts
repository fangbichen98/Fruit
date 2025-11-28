
import { RegisteredUser } from './types';

export const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'u1',
    username: 'vip_user',
    password: 'password',
    nickname: '阳光小陈',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    joinDate: Date.now() - 100000000
  },
  {
    id: 'u2',
    username: 'fruit_lover',
    password: 'password',
    nickname: '爱吃水果的喵',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Garfield',
    joinDate: Date.now() - 50000000
  }
];
