'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsService, AnalyticsData, UserData } from '@/services/analyticsService';

export default function Analytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [dailyActiveUsers, setDailyActiveUsers] = useState<UserData[]>([]);
  const [paidUsers, setPaidUsers] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState<'total' | 'daily' | 'paid' | 'misc'>('total');
  const [miscSubTab, setMiscSubTab] = useState<'region' | 'features'>('region');
  const [dataLoading, setDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(25);
  const router = useRouter();

  // Regional analytics data (showing top 10 for better chart visualization)
  const regionalData = [
    { country: 'India', percentage: '99%', value: 99, color: 'bg-blue-500' },
    { country: 'USA', percentage: '<0.5%', value: 0.4, color: 'bg-green-500' },
    { country: 'Nepal', percentage: '<0.5%', value: 0.3, color: 'bg-purple-500' },
    { country: 'Saudi Arabia', percentage: '<0.1%', value: 0.08, color: 'bg-orange-500' },
    { country: 'Myanmar', percentage: '<0.1%', value: 0.07, color: 'bg-pink-500' },
    { country: 'Pakistan', percentage: '<0.1%', value: 0.06, color: 'bg-indigo-500' },
    { country: 'Ireland', percentage: '<0.1%', value: 0.05, color: 'bg-teal-500' },
    { country: 'Kenya', percentage: '<0.1%', value: 0.04, color: 'bg-cyan-500' },
    { country: 'Netherlands', percentage: '<0.1%', value: 0.04, color: 'bg-rose-500' },
    { country: 'Others', percentage: '<0.1%', value: 0.02, color: 'bg-slate-400' }
  ];

  // Most used features data
  const featuresData = [
    { feature: 'Revision Mode', icon: '📚', description: 'Study and review content', usage: 85, color: 'bg-blue-500' },
    { feature: 'Viva Mode', icon: '🎤', description: 'Interactive Q&A sessions', usage: 72, color: 'bg-green-500' },
    { feature: 'Interactive Mode', icon: '🎯', description: 'Engaging learning activities', usage: 68, color: 'bg-purple-500' },
    { feature: 'Practice Mode', icon: '✍️', description: 'Hands-on practice exercises', usage: 59, color: 'bg-orange-500' }
  ];

   useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated');
    const email = localStorage.getItem('userEmail');
    
    if (authStatus === 'true' && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      fetchAnalyticsData();
    } else {
      router.push('/login');
    }
    
    setIsLoading(false);
  }, [router]);

  const fetchAnalyticsData = async () => {
    setDataLoading(true);
    try {
      // Fetch analytics data
      const analytics = await AnalyticsService.getUserAnalytics();
      setAnalyticsData(analytics);
      
      // Fetch all users
      const users = await AnalyticsService.getAllUsers();
      setAllUsers(users);
      
      // Fetch daily active users
      const activeUsers = await AnalyticsService.getDailyActiveUsers();
      setDailyActiveUsers(activeUsers);
      
      // Fetch paid users
      const paidUsersData = await AnalyticsService.getPaidUsers();
      console.log('Setting paid users data:', paidUsersData);
      setPaidUsers(paidUsersData);
      
      // Reset to first page when data changes
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Pagination logic
  const getCurrentUsers = () => {
    const users = activeTab === 'total' ? allUsers : 
                  activeTab === 'daily' ? dailyActiveUsers : paidUsers;
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    console.log(`getCurrentUsers for ${activeTab}:`, { 
      totalUsers: users.length, 
      currentPage, 
      usersPerPage,
      currentUsers: currentUsers.length,
      users: currentUsers 
    });
    return currentUsers;
  };

  const getTotalPages = () => {
    const users = activeTab === 'total' ? allUsers : 
                  activeTab === 'daily' ? dailyActiveUsers : paidUsers;
    return Math.ceil(users.length / usersPerPage);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleTabChange = (tab: 'total' | 'daily' | 'paid' | 'misc') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when switching tabs
    // Reset misc sub-tab when switching to misc tab
    if (tab === 'misc') {
      setMiscSubTab('region');
    }
  };

  const handleMiscSubTabChange = (subTab: 'region' | 'features') => {
    setMiscSubTab(subTab);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Welcome back, {userEmail}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-700 dark:text-slate-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                +{analyticsData?.usersGrowth || 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Total Users (Users are of after 25 August 2025)</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {dataLoading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-20 rounded"></div>
              ) : (
                analyticsData?.totalUsers?.toLocaleString() || '0'
              )}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">vs last month</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                +{analyticsData?.dailyActiveGrowth || 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Daily Active Users</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {dataLoading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-16 rounded"></div>
              ) : (
                analyticsData?.dailyActiveUsers?.toLocaleString() || '0'
              )}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">last 24 hours</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                +{analyticsData?.paidUsersGrowth || 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Paid Users</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {dataLoading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-16 rounded"></div>
              ) : (
                analyticsData?.paidUsers?.toLocaleString() || '0'
              )}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">vs last month</p>
          </div>

        </div>

        {/* Users Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Users Overview</h3>
              <button
                onClick={fetchAnalyticsData}
                disabled={dataLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-lg transition-colors text-blue-700 dark:text-blue-300 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => handleTabChange('total')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'total'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                All Users 
              </button>
              <button
                onClick={() => handleTabChange('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'daily'
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Daily Active 
              </button>
              <button
                onClick={() => handleTabChange('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'paid'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Paid Users 
              </button>
              <button
                onClick={() => handleTabChange('misc')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'misc'
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Miscellaneous Analytics
              </button>
            </div>
          </div>

          {/* DAU Performance Note */}
          {activeTab === 'daily' && (
            <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Performance Note
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    We are displaying only a fraction of the daily active users to optimize loading time. 
                    The stats card shows the complete count, but this list shows a sample for performance reasons.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Content Area */}
          <div className="overflow-x-auto">
            {activeTab === 'misc' ? (
              // Miscellaneous Analytics with Sub-tabs
              <div>
                {/* Sub-tab Navigation */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleMiscSubTabChange('region')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        miscSubTab === 'region'
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Users by Region
                    </button>
                    <button
                      onClick={() => handleMiscSubTabChange('features')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        miscSubTab === 'features'
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Most Used Features
                    </button>
                  </div>
                </div>

                {/* Sub-tab Content */}
                <div className="p-6">
                  {miscSubTab === 'region' ? (
                    // Users by Region
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Users by Region</h3>
                      
                      {/* Bar Chart */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                        <div className="relative">
                          {/* Y-axis label */}
                          <div className="absolute -left-8 top-1/2 transform -rotate-90 text-sm font-medium text-slate-600 dark:text-slate-400">
                            Percentage (%)
                          </div>
                          
                          {/* Chart area */}
                          <div className="ml-4">
                            {/* Y-axis */}
                            <div className="flex h-80 items-end space-x-2 border-l-2 border-b-2 border-slate-300 dark:border-slate-600 pl-4 pb-4">
                              {regionalData.map((region, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                  {/* Bar */}
                                  <div className="relative w-full max-w-12">
                                    <div 
                                      className={`${region.color} rounded-t-md transition-all duration-1000 ease-out hover:opacity-80`}
                                      style={{ 
                                        height: region.country === 'India' ? '280px' : `${Math.max(region.value * 10, 8)}px`,
                                        animationDelay: `${index * 100}ms`
                                      }}
                                    ></div>
                                    {/* Value label on top of bar */}
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                      {region.percentage}
                                    </div>
                                  </div>
                                  {/* X-axis label */}
                                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 transform -rotate-45 origin-left whitespace-nowrap">
                                    {region.country}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* X-axis label */}
                            <div className="text-center mt-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                              Countries
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Summary stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">30+</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Total Countries</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">99%</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">India Dominance</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">5</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Continents</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Most Used Features
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Most Used Features</h3>
                      
                      {/* Bar Chart */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                        <div className="relative">
                          {/* Y-axis label */}
                          <div className="absolute -left-8 top-1/2 transform -rotate-90 text-sm font-medium text-slate-600 dark:text-slate-400">
                            Usage Rate (%)
                          </div>
                          
                          {/* Chart area */}
                          <div className="ml-4">
                            {/* Y-axis */}
                            <div className="flex h-80 items-end space-x-8 border-l-2 border-b-2 border-slate-300 dark:border-slate-600 pl-4 pb-4">
                              {featuresData.map((feature, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center max-w-20">
                                  {/* Bar */}
                                  <div className="relative w-full">
                                    <div 
                                      className={`${feature.color} rounded-t-md transition-all duration-1000 ease-out hover:opacity-80 w-full`}
                                      style={{ 
                                        height: `${(feature.usage / 100) * 280}px`,
                                        animationDelay: `${index * 150}ms`
                                      }}
                                    ></div>
                                    {/* Value label on top of bar */}
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                      {feature.usage}%
                                    </div>
                                  </div>
                                  {/* Icon and label */}
                                  <div className="mt-3 text-center">
                                    <div className="text-2xl mb-1">{feature.icon}</div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                      {feature.feature}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* X-axis label */}
                            <div className="text-center mt-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                              Features
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Feature details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featuresData.map((feature, index) => (
                          <div key={index} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="text-xl">{feature.icon}</div>
                              <div className={`w-3 h-3 ${feature.color} rounded-full`}></div>
                              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {index + 1}. {feature.feature}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 ml-8">
                              {feature.description}
                            </p>
                            <div className="mt-2 ml-8">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {feature.usage}% usage rate
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Users List for other tabs
              <>
                {dataLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">User</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {getCurrentUsers().length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 px-6 text-center text-slate-500 dark:text-slate-400">
                        {activeTab === 'total' ? 'No users found' : 
                         activeTab === 'daily' ? 'No active users in the last 24 hours' : 
                         'No paid users found'}
                      </td>
                    </tr>
                  ) : (
                    getCurrentUsers().map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {user.name || 'Anonymous User'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                          {user.email || 'No email'}
                        </td>
                      </tr>
                    ))
                  )}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
          
          {/* Pagination */}
          {!dataLoading && activeTab !== 'misc' && (activeTab === 'total' ? allUsers : activeTab === 'daily' ? dailyActiveUsers : paidUsers).length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, (activeTab === 'total' ? allUsers : activeTab === 'daily' ? dailyActiveUsers : paidUsers).length)} of {(activeTab === 'total' ? allUsers : activeTab === 'daily' ? dailyActiveUsers : paidUsers).length} users
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current page
                        return page === 1 || 
                               page === getTotalPages() || 
                               Math.abs(page - currentPage) <= 2;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-3 py-2 text-slate-400 dark:text-slate-500">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === getTotalPages()}
                    className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
