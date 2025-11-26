
import { Product, Order, RegisteredUser } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: '红富士苹果', 
    image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=500&q=80', 
    price: 5.5, 
    unit: '个' 
  },
  { 
    id: '2', 
    name: '进口香蕉', 
    image: 'https://images.unsplash.com/photo-1571771896612-410b95098b3c?auto=format&fit=crop&w=500&q=80', 
    price: 3.5, 
    unit: '把' 
  },
  { 
    id: '3', 
    name: '巨峰葡萄', 
    image: 'https://images.unsplash.com/photo-1596363505729-419056647c40?auto=format&fit=crop&w=500&q=80', 
    price: 18.0, 
    unit: '公斤' 
  },
  { 
    id: '4', 
    name: '赣南脐橙', 
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=500&q=80', 
    price: 8.8, 
    unit: '公斤' 
  },
  { 
    id: '5', 
    name: '丹东草莓', 
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=500&q=80', 
    price: 35.0, 
    unit: '盒' 
  },
  { 
    id: '6', 
    name: '牛油果', 
    image: 'https://images.unsplash.com/photo-1523049673856-6468baca292f?auto=format&fit=crop&w=500&q=80', 
    price: 9.9, 
    unit: '个' 
  },
  { 
    id: '7', 
    name: '麒麟西瓜', 
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=500&q=80', 
    price: 45.0, 
    unit: '个' 
  },
  { 
    id: '8', 
    name: '大台芒', 
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=500&q=80', 
    price: 12.0, 
    unit: '个' 
  },
];

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

// Helper to generate mock orders over the last year with standardized IDs
const generateMockOrders = (): Order[] => {
  let tempOrders: Omit<Order, 'id'>[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  
  // Use mock users for order history
  const mockUsers = INITIAL_USERS;
  
  // 1. Generate Raw Data for past 365 days
  for (let i = 0; i < 365; i++) {
    const isRecent = i < 30;
    const orderChance = isRecent ? 0.9 : 0.4;
    
    if (Math.random() > orderChance) continue;

    const dailyOrderCount = Math.floor(Math.random() * (isRecent ? 6 : 3)) + 1;
    
    // Base time for this day (start of day roughly)
    const baseTime = now - (i * dayMs);

    for (let j = 0; j < dailyOrderCount; j++) {
      const productIndex1 = Math.floor(Math.random() * INITIAL_PRODUCTS.length);
      const productIndex2 = Math.floor(Math.random() * INITIAL_PRODUCTS.length);
      
      const item1 = { ...INITIAL_PRODUCTS[productIndex1], quantity: Math.floor(Math.random() * 3) + 1 };
      const item2 = { ...INITIAL_PRODUCTS[productIndex2], quantity: Math.floor(Math.random() * 2) + 1 };
      
      const items = productIndex1 === productIndex2 ? [item1] : [item1, item2];
      const total = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      
      // Random time offset within the day (0 to 24 hours)
      // To ensure sorting works, we assign random times
      const timeOffset = Math.floor(Math.random() * 86300000); 
      const timestamp = new Date(baseTime).setHours(0,0,0,0) + timeOffset;
      
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];

      tempOrders.push({
        user: { nickname: user.nickname, avatar: user.avatar, isGuest: false, username: user.username },
        items: items,
        total: total,
        timestamp: timestamp,
        status: Math.random() > 0.1 ? 'completed' : 'pending'
      });
    }
  }

  // 2. Sort all orders by timestamp ascending to assign sequential IDs
  tempOrders.sort((a, b) => a.timestamp - b.timestamp);

  // 3. Assign IDs: ORD-YYYYMMDD-XXXX
  const dateCounters: Record<string, number> = {};
  
  const finalOrders: Order[] = tempOrders.map(order => {
    const d = new Date(order.timestamp);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateKey = `${year}${month}${day}`;

    if (!dateCounters[dateKey]) {
        dateCounters[dateKey] = 0;
    }
    dateCounters[dateKey]++;
    
    const sequence = dateCounters[dateKey].toString().padStart(4, '0');
    const id = `ORD-${dateKey}-${sequence}`;

    return { ...order, id };
  });

  // 4. Return sorted by newest first for display
  return finalOrders.sort((a, b) => b.timestamp - a.timestamp);
};

export const INITIAL_ORDERS: Order[] = generateMockOrders();
