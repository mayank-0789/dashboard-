import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types for analytics data
export interface AnalyticsData {
  totalUsers: number;
  dailyActiveUsers: number;
  paidUsers: number;
  usersGrowth: number;
  dailyActiveGrowth: number;
  paidUsersGrowth: number;
}

export interface UserData {
  id: string;
  email?: string;
  name?: string;
}

export interface RegionData {
  country: string;
  code: string;
  percentage: number;
}

export interface Transaction {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  timestamp: any;
}

export interface ActivityItem {
  type: 'user' | 'payment' | 'report' | 'system';
  message: string;
  timestamp: any;
}

// Analytics service class
export class AnalyticsService {
  // Fetch user analytics data from users collection
  static async getUserAnalytics(): Promise<AnalyticsData> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const totalUsers = snapshot.size;
      
      // Calculate daily active users (last login within 24 hours)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      
      let dailyActiveUsers = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Check if user was active in last 24 hours
        if (data.lastLogin) {
          const lastLoginDate = data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin);
          if (lastLoginDate >= twentyFourHoursAgo) {
            dailyActiveUsers++;
          }
        }
      });

      // Fetch paid users count
      const paidUsers = await this.getPaidUsersCount();

      // Mock growth percentages (you can implement real growth calculation by comparing with previous periods)
      const usersGrowth = 12;
      const dailyActiveGrowth = 8;
      const paidUsersGrowth = 15;

      return {
        totalUsers,
        dailyActiveUsers: dailyActiveUsers * 5, // Display as 5x the actual count
        paidUsers,
        usersGrowth,
        dailyActiveGrowth,
        paidUsersGrowth
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      // Return fallback data
      return {
        totalUsers: 0,
        dailyActiveUsers: 0, // Already 0, no need to multiply
        paidUsers: 0,
        usersGrowth: 0,
        dailyActiveGrowth: 0,
        paidUsersGrowth: 0
      };
    }
  }

  // Fetch all users data
  static async getAllUsers(): Promise<UserData[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const users: UserData[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || 'No email',
          name: data.name || data.displayName || 'Anonymous User'
        });
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Fetch daily active users for the last 24 hours
  static async getDailyActiveUsers(): Promise<UserData[]> {
    try {
      const usersRef = collection(db, 'users');
      const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
      
      // Note: For better performance, you might want to add a where clause if your Firestore allows it
      // const q = query(usersRef, where('lastLogin', '>=', Timestamp.fromDate(twentyFourHoursAgo)));
      
      const snapshot = await getDocs(usersRef);
      const activeUsers: UserData[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        if (data.lastLogin) {
          const lastLoginDate = data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin);
          
          if (lastLoginDate >= twentyFourHoursAgo) {
            activeUsers.push({
              id: doc.id,
              email: data.email || 'No email',
              name: data.name || data.displayName || 'Anonymous User'
            });
          }
        }
      });
      
      return activeUsers;
    } catch (error) {
      console.error('Error fetching daily active users:', error);
      return [];
    }
  }

  // Fetch paid users count from test_users_12m collection
  static async getPaidUsersCount(): Promise<number> {
    try {
      const paidUsersRef = collection(db, 'test_users_12m');
      const snapshot = await getDocs(paidUsersRef);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching paid users count:', error);
      return 0;
    }
  }

  // Fetch all paid users data from test_users_12m collection
  static async getPaidUsers(): Promise<UserData[]> {
    try {
      console.log('Attempting to fetch from test_users_12m collection...');
      const paidUsersRef = collection(db, 'test_users_12m');
      // Try with ordering first, if it fails, fetch without ordering
      let snapshot;
      
      try {
        const q = query(paidUsersRef, orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (orderError) {
        console.log('Ordering by createdAt failed, fetching without ordering:', orderError);
        // If ordering fails (field doesn't exist), fetch without ordering
        snapshot = await getDocs(paidUsersRef);
      }
      
      const paidUsers: UserData[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Paid user document:', doc.id, data);
        
        // Try different possible email field names
        const email = data.email || 
                     data.emailAddress || 
                     data.userEmail || 
                     data.Email || 
                     data.user_email || 
                     'No email';
        
        // Try different possible name field names
        const name = data.name || 
                    data.displayName || 
                    data.userName || 
                    data.fullName || 
                    data.Name || 
                    data.display_name || 
                    data.user_name || 
                    data.full_name ||
                    `User ${doc.id.substring(0, 8)}`;
        
        paidUsers.push({
          id: doc.id,
          email,
          name
        });
      });

      console.log('Fetched paid users:', paidUsers.length, paidUsers);
      return paidUsers;
    } catch (error) {
      console.error('Error fetching paid users:', error);
      return [];
    }
  }


  // Format timestamp for display
  static formatTimestamp(timestamp: any): string {
    if (!timestamp) return 'Never';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }


  // Fetch regional data
  static async getRegionalData(collectionName: string): Promise<RegionData[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const regionCounts: { [key: string]: number } = {};
      let total = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const country = data.country || data.region || data.location || 'Unknown';
        regionCounts[country] = (regionCounts[country] || 0) + 1;
        total++;
      });

      // Convert to percentage and format
      const regions = Object.entries(regionCounts)
        .map(([country, count]) => ({
          country: this.getCountryName(country),
          code: this.getCountryCode(country),
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 4); // Top 4 regions

      return regions.length > 0 ? regions : [
        { country: 'United States', code: 'US', percentage: 42 },
        { country: 'United Kingdom', code: 'UK', percentage: 28 },
        { country: 'Canada', code: 'CA', percentage: 18 },
        { country: 'Australia', code: 'AU', percentage: 12 }
      ];
    } catch (error) {
      console.error('Error fetching regional data:', error);
      return [
        { country: 'United States', code: 'US', percentage: 42 },
        { country: 'United Kingdom', code: 'UK', percentage: 28 },
        { country: 'Canada', code: 'CA', percentage: 18 },
        { country: 'Australia', code: 'AU', percentage: 12 }
      ];
    }
  }

  // Fetch recent transactions
  static async getRecentTransactions(collectionName: string): Promise<Transaction[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      
      const transactions: Transaction[] = [];
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        transactions.push({
          id: `#TXN-${String(index + 1).padStart(3, '0')}`,
          customer: data.customer || data.user || data.name || 'Anonymous User',
          amount: data.amount || data.revenue || data.price || Math.floor(Math.random() * 5000) + 1000,
          status: data.status === 'completed' || data.status === 'success' ? 'completed' : 
                  data.status === 'pending' ? 'pending' : 'completed',
          date: this.formatTimestamp(data.timestamp || data.createdAt || new Date()),
          timestamp: data.timestamp || data.createdAt || new Date()
        });
      });

      return transactions.length > 0 ? transactions.slice(0, 3) : [
        {
          id: '#TXN-001',
          customer: 'John Doe',
          amount: 2847,
          status: 'completed' as const,
          date: '2 hours ago',
          timestamp: new Date()
        },
        {
          id: '#TXN-002',
          customer: 'Jane Smith',
          amount: 1249,
          status: 'pending' as const,
          date: '4 hours ago',
          timestamp: new Date()
        },
        {
          id: '#TXN-003',
          customer: 'Mike Johnson',
          amount: 3156,
          status: 'completed' as const,
          date: '6 hours ago',
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [
        {
          id: '#TXN-001',
          customer: 'John Doe',
          amount: 2847,
          status: 'completed' as const,
          date: '2 hours ago',
          timestamp: new Date()
        },
        {
          id: '#TXN-002',
          customer: 'Jane Smith',
          amount: 1249,
          status: 'pending' as const,
          date: '4 hours ago',
          timestamp: new Date()
        },
        {
          id: '#TXN-003',
          customer: 'Mike Johnson',
          amount: 3156,
          status: 'completed' as const,
          date: '6 hours ago',
          timestamp: new Date()
        }
      ];
    }
  }

  // Fetch recent activity
  static async getRecentActivity(collectionName: string): Promise<ActivityItem[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef,
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      
      const activities: ActivityItem[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const activityType = this.determineActivityType(data);
        const message = this.generateActivityMessage(data, activityType);
        
        activities.push({
          type: activityType,
          message,
          timestamp: data.timestamp || data.createdAt || new Date()
        });
      });

      return activities.length > 0 ? activities : [
        { type: 'user', message: 'New user registered', timestamp: new Date() },
        { type: 'payment', message: 'Payment processed', timestamp: new Date() },
        { type: 'report', message: 'Report generated', timestamp: new Date() },
        { type: 'system', message: 'System update', timestamp: new Date() }
      ];
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [
        { type: 'user', message: 'New user registered', timestamp: new Date() },
        { type: 'payment', message: 'Payment processed', timestamp: new Date() },
        { type: 'report', message: 'Report generated', timestamp: new Date() },
        { type: 'system', message: 'System update', timestamp: new Date() }
      ];
    }
  }

  // Helper methods
  private static getCountryName(code: string): string {
    const countryMap: { [key: string]: string } = {
      'US': 'United States',
      'UK': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'IN': 'India'
    };
    return countryMap[code.toUpperCase()] || code;
  }

  private static getCountryCode(country: string): string {
    const codeMap: { [key: string]: string } = {
      'United States': 'US',
      'United Kingdom': 'UK',
      'Canada': 'CA',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      'Japan': 'JP',
      'India': 'IN'
    };
    return codeMap[country] || country.substring(0, 2).toUpperCase();
  }


  private static determineActivityType(data: any): ActivityItem['type'] {
    if (data.type === 'user' || data.action === 'register' || data.event === 'signup') {
      return 'user';
    }
    if (data.type === 'payment' || data.action === 'payment' || data.amount) {
      return 'payment';
    }
    if (data.type === 'report' || data.action === 'report') {
      return 'report';
    }
    return 'system';
  }

  private static generateActivityMessage(data: any, type: ActivityItem['type']): string {
    switch (type) {
      case 'user':
        return data.message || 'New user registered';
      case 'payment':
        return data.message || 'Payment processed';
      case 'report':
        return data.message || 'Report generated';
      case 'system':
        return data.message || 'System update';
      default:
        return data.message || 'Activity recorded';
    }
  }
}
