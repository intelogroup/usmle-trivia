import React, { useState, useEffect } from 'react';
import { Link, useLocation, Routes, Route } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  Settings, 
  UserPlus, 
  BookOpen,
  Clock,
  Star,
  Activity,
  Bell,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface SocialTab {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  count?: number;
}

const socialTabs: SocialTab[] = [
  { id: 'friends', label: 'Friends', icon: Users, href: '/social/friends', count: 12 },
  { id: 'groups', label: 'Groups', icon: BookOpen, href: '/social/groups', count: 3 },
  { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/social/messages', count: 5 },
  { id: 'challenges', label: 'Challenges', icon: Trophy, href: '/social/challenges', count: 2 },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/social/settings' },
];

// Loading component
const LoadingCard: React.FC = () => (
  <Card className="p-4">
    <CardContent className="p-0 text-center">
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1"></div>
        <div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div>
      </div>
    </CardContent>
  </Card>
);

// Social Hub Component (main page)
const SocialHub: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
        
        <div className="space-y-4">
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-2">Social Hub</h1>
        <p className="text-gray-600">Connect with fellow medical students, join study groups, and challenge friends.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Social statistics">
        <Card className="p-4">
          <CardContent className="p-0 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" aria-hidden="true" />
            <div className="text-2xl font-heading font-semibold text-gray-900" aria-label="12 friends">12</div>
            <div className="text-sm text-gray-600">Friends</div>
          </CardContent>
        </Card>
        
        <Card className="p-4">
          <CardContent className="p-0 text-center">
            <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-heading font-semibold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Study Groups</div>
          </CardContent>
        </Card>
        
        <Card className="p-4">
          <CardContent className="p-0 text-center">
            <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-heading font-semibold text-gray-900">5</div>
            <div className="text-sm text-gray-600">Unread Messages</div>
          </CardContent>
        </Card>
        
        <Card className="p-4">
          <CardContent className="p-0 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-heading font-semibold text-gray-900">2</div>
            <div className="text-sm text-gray-600">Active Challenges</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" role="navigation" aria-label="Social navigation">
          {socialTabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.href}
              className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap hover:text-blue-600 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`${tab.label}${tab.count ? ` (${tab.count} items)` : ''}`}
            >
              <tab.icon className="h-5 w-5 mr-2 group-hover:text-blue-600" aria-hidden="true" />
              {tab.label}
              {tab.count && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs font-medium" aria-label={`${tab.count} notifications`}>
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Recent Activity Feed */}
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Activity Items */}
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Sarah Chen</span> accepted your friend request
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  You joined <span className="font-medium">Cardiology Study Group</span>
                </p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Dr. Mike Johnson</span> sent you a message
                </p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Alex Rodriguez</span> challenged you to a quiz
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Find Friends */}
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center mb-4">
              <UserPlus className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-heading font-semibold text-gray-900">Find Friends</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Connect with fellow medical students preparing for USMLE
            </p>
            <Link to="/social/friends">
              <Button className="w-full">
                Find Study Partners
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Study Groups */}
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-heading font-semibold text-gray-900">Study Groups</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Join specialty-focused groups to study collaboratively
            </p>
            <Link to="/social/groups">
              <Button variant="outline" className="w-full">
                Browse Groups
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Popular Study Groups Preview */}
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-gray-900">Popular Study Groups</h3>
            <Link to="/social/groups">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Cardiology Masters</h4>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Advanced cardiology concepts and case studies</p>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>24 members</span>
                <Activity className="h-3 w-3 ml-3 mr-1" />
                <span>Very active</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Neuro Study Circle</h4>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Neurology and neuroanatomy discussions</p>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>18 members</span>
                <Activity className="h-3 w-3 ml-3 mr-1" />
                <span>Active</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Step 1 Prep</h4>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">USMLE Step 1 preparation strategies</p>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>31 members</span>
                <Activity className="h-3 w-3 ml-3 mr-1" />
                <span>Very active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Friends page component
const SocialFriends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'find'>('friends');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">Connect with fellow medical students in your USMLE journey.</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Find Friends
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'friends' as const, label: 'My Friends', count: 12 },
            { key: 'requests' as const, label: 'Requests', count: 3 },
            { key: 'find' as const, label: 'Find Friends' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'friends' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Friend Cards */}
          {[
            { name: 'Sarah Chen', level: 'Level 8', points: '2,840', specialty: 'Cardiology', status: 'Online', avatar: 'SC' },
            { name: 'Dr. Mike Johnson', level: 'Level 12', points: '4,920', specialty: 'Neurology', status: 'Offline', avatar: 'MJ' },
            { name: 'Alex Rodriguez', level: 'Level 6', points: '1,650', specialty: 'Surgery', status: 'Online', avatar: 'AR' },
            { name: 'Emily Davis', level: 'Level 9', points: '3,280', specialty: 'Pediatrics', status: 'Studying', avatar: 'ED' },
            { name: 'James Wilson', level: 'Level 7', points: '2,110', specialty: 'Internal Medicine', status: 'Online', avatar: 'JW' },
            { name: 'Lisa Park', level: 'Level 10', points: '3,750', specialty: 'Psychiatry', status: 'Offline', avatar: 'LP' }
          ].map((friend, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{friend.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{friend.name}</h4>
                    <p className="text-sm text-gray-600">{friend.specialty}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    friend.status === 'Online' ? 'bg-green-400' :
                    friend.status === 'Studying' ? 'bg-yellow-400' : 'bg-gray-300'
                  }`} />
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>{friend.level}</span>
                  <span>{friend.points} pts</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h3 className="text-lg font-heading font-semibold text-gray-900">Friend Requests</h3>
          
          {/* Incoming Requests */}
          <div className="space-y-3">
            {[
              { name: 'Maria Gonzalez', specialty: 'Radiology', level: 'Level 5', mutualFriends: 3 },
              { name: 'David Kim', specialty: 'Pathology', level: 'Level 8', mutualFriends: 1 },
              { name: 'Rachel Brown', specialty: 'Emergency Medicine', level: 'Level 7', mutualFriends: 2 }
            ].map((request, index) => (
              <Card key={index} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{request.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{request.name}</h4>
                        <p className="text-sm text-gray-600">{request.specialty} • {request.level}</p>
                        <p className="text-xs text-gray-500">{request.mutualFriends} mutual friends</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">Accept</Button>
                      <Button size="sm" variant="outline">Decline</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'find' && (
        <div className="space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="search"
                placeholder="Search medical students..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button>Search</Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Suggested Friends */}
            {[
              { name: 'Kevin Liu', specialty: 'Oncology', level: 'Level 9', mutualFriends: 4, accuracy: '87%' },
              { name: 'Amanda Foster', specialty: 'Dermatology', level: 'Level 6', mutualFriends: 2, accuracy: '91%' },
              { name: 'Robert Taylor', specialty: 'Orthopedics', level: 'Level 11', mutualFriends: 1, accuracy: '85%' },
              { name: 'Jennifer Lee', specialty: 'Anesthesiology', level: 'Level 8', mutualFriends: 3, accuracy: '89%' }
            ].map((person, index) => (
              <Card key={index} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">{person.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{person.name}</h4>
                      <p className="text-sm text-gray-600">{person.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>{person.level}</span>
                      <span>{person.accuracy} accuracy</span>
                    </div>
                    <p className="text-xs text-gray-500">{person.mutualFriends} mutual friends</p>
                  </div>
                  
                  <Button size="sm" className="w-full">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Friend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SocialGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-groups' | 'public' | 'create'>('my-groups');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-2">Study Groups</h1>
          <p className="text-gray-600">Join specialty-focused groups to study collaboratively with peers.</p>
        </div>
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'my-groups' as const, label: 'My Groups', count: 3 },
            { key: 'public' as const, label: 'Public Groups', count: 24 },
            { key: 'create' as const, label: 'Create Group' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                  activeTab === tab.key
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* My Groups Tab */}
      {activeTab === 'my-groups' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Cardiology Masters',
              description: 'Advanced cardiology concepts and case studies for Step 2',
              category: 'Cardiology',
              members: 24,
              isPublic: true,
              isAdmin: false,
              activity: 'Very Active',
              lastMessage: '2 hours ago',
              unreadCount: 5
            },
            {
              name: 'Neuro Study Circle',
              description: 'Neuroanatomy, pathophysiology, and clinical correlations',
              category: 'Neurology',
              members: 18,
              isPublic: false,
              isAdmin: true,
              activity: 'Active',
              lastMessage: '6 hours ago',
              unreadCount: 0
            },
            {
              name: 'Step 1 Prep Squad',
              description: 'Comprehensive USMLE Step 1 preparation strategies',
              category: 'General',
              members: 31,
              isPublic: true,
              isAdmin: false,
              activity: 'Very Active',
              lastMessage: '1 hour ago',
              unreadCount: 12
            }
          ].map((group, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-heading font-semibold text-gray-900">{group.name}</h3>
                      {group.isAdmin && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">Admin</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  </div>
                  {group.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {group.unreadCount}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{group.category}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      group.activity === 'Very Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {group.activity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{group.members} members</span>
                    </div>
                    <span>Last: {group.lastMessage}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Open Chat
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Public Groups Tab */}
      {activeTab === 'public' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex space-x-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>All Categories</option>
              <option>Cardiology</option>
              <option>Neurology</option>
              <option>Surgery</option>
              <option>Pediatrics</option>
              <option>Internal Medicine</option>
              <option>Psychiatry</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>All Activity Levels</option>
              <option>Very Active</option>
              <option>Active</option>
              <option>Moderate</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Emergency Medicine Heroes',
                description: 'Fast-paced EM cases and protocols discussion',
                category: 'Emergency Medicine',
                members: 42,
                activity: 'Very Active',
                creator: 'Dr. Sarah Mitchell'
              },
              {
                name: 'Pediatric Pathways',
                description: 'Pediatric medicine concepts and developmental milestones',
                category: 'Pediatrics',
                members: 28,
                activity: 'Active',
                creator: 'Emily Chen'
              },
              {
                name: 'Surgery Study Sessions',
                description: 'Surgical techniques, anatomy, and case discussions',
                category: 'Surgery',
                members: 35,
                activity: 'Very Active',
                creator: 'Dr. Robert Kim'
              },
              {
                name: 'Radiology Reading Room',
                description: 'Image interpretation and diagnostic radiology',
                category: 'Radiology',
                members: 19,
                activity: 'Moderate',
                creator: 'Lisa Wang'
              },
              {
                name: 'Internal Medicine Masters',
                description: 'Comprehensive internal medicine review and cases',
                category: 'Internal Medicine',
                members: 56,
                activity: 'Very Active',
                creator: 'Dr. Ahmed Hassan'
              },
              {
                name: 'Psychiatry & Mental Health',
                description: 'Psychiatric disorders and treatment approaches',
                category: 'Psychiatry',
                members: 22,
                activity: 'Active',
                creator: 'Dr. Jennifer Lopez'
              }
            ].map((group, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{group.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        group.activity === 'Very Active' 
                          ? 'bg-green-100 text-green-700' 
                          : group.activity === 'Active'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {group.activity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{group.members} members</span>
                      </div>
                      <span>by {group.creator}</span>
                    </div>
                  </div>

                  <Button size="sm" className="w-full">
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Group Tab */}
      {activeTab === 'create' && (
        <Card className="p-8 max-w-2xl mx-auto">
          <CardContent className="p-0">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-2">Create Study Group</h2>
                <p className="text-gray-600">Start a new study group and connect with fellow medical students.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology Case Studies"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe the purpose and focus of your study group..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Select a medical specialty</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Surgery</option>
                    <option>Pediatrics</option>
                    <option>Internal Medicine</option>
                    <option>Emergency Medicine</option>
                    <option>Psychiatry</option>
                    <option>Radiology</option>
                    <option>General/Mixed Topics</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <label className="text-sm text-gray-700">Make this group public (anyone can join)</label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button className="flex-1">Create Group</Button>
                  <Button variant="outline" className="flex-1">Cancel</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SocialMessages: React.FC = () => {
  return (
    <div className="grid md:grid-cols-3 h-[600px]">
      {/* Chat List */}
      <div className="border-r border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-heading font-semibold text-gray-900">Messages</h1>
          <Button size="sm">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
        
        {[
          { name: 'Sarah Chen', lastMessage: 'Thanks for the cardiology notes!', time: '2h ago', unread: 2, avatar: 'SC', online: true },
          { name: 'Cardiology Masters', lastMessage: 'New case study posted', time: '4h ago', unread: 5, avatar: 'CM', online: false },
          { name: 'Alex Rodriguez', lastMessage: 'Ready for the challenge?', time: '1d ago', unread: 0, avatar: 'AR', online: true },
          { name: 'Study Group Chat', lastMessage: 'Meeting tomorrow at 3 PM', time: '2d ago', unread: 1, avatar: 'SG', online: false }
        ].map((chat, index) => (
          <div key={index} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">{chat.avatar}</span>
                </div>
                {chat.online && <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{chat.name}</h4>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Chat Window */}
      <div className="md:col-span-2 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">SC</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Sarah Chen</h3>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-medium">SC</span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
              <p className="text-sm text-gray-900">Hey! Did you finish reviewing the cardiology cases?</p>
              <span className="text-xs text-gray-500 mt-1">10:30 AM</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white rounded-lg p-3 shadow-sm max-w-xs">
              <p className="text-sm">Yes! Just finished. The ECG interpretations were challenging.</p>
              <span className="text-xs text-blue-100 mt-1">10:32 AM</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-medium">SC</span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
              <p className="text-sm text-gray-900">Thanks for sharing your notes! They were really helpful 📚</p>
              <span className="text-xs text-gray-500 mt-1">2 hours ago</span>
            </div>
          </div>
        </div>
        
        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialChallenges: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-2">Challenges</h1>
          <p className="text-gray-600">Compete with friends in quiz challenges to test your medical knowledge.</p>
        </div>
        <Button>
          <Trophy className="h-4 w-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Active Challenges */}
        <Card className="p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Active Challenges</h3>
            <div className="space-y-4">
              {[
                { opponent: 'Alex Rodriguez', category: 'Cardiology', questions: 10, yourScore: null, opponentScore: null, status: 'pending', timeLeft: '2 days left' },
                { opponent: 'Sarah Chen', category: 'Neurology', questions: 15, yourScore: 12, opponentScore: null, status: 'waiting', timeLeft: '1 day left' }
              ].map((challenge, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">vs {challenge.opponent}</h4>
                        <p className="text-sm text-gray-600">{challenge.category} • {challenge.questions} questions</p>
                        <p className="text-xs text-gray-500">{challenge.timeLeft}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {challenge.yourScore !== null ? `Your Score: ${challenge.yourScore}/${challenge.questions}` : 'Not taken'}
                      </p>
                      <Button size="sm" className="mt-2">
                        {challenge.status === 'pending' ? 'Accept Challenge' : 'Take Quiz'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completed Challenges */}
        <Card className="p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Recent Results</h3>
            <div className="space-y-4">
              {[
                { opponent: 'Emily Davis', category: 'Surgery', yourScore: 8, opponentScore: 6, result: 'won', date: '2 days ago' },
                { opponent: 'Dr. Mike Johnson', category: 'Internal Medicine', yourScore: 11, opponentScore: 13, result: 'lost', date: '1 week ago' }
              ].map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        result.result === 'won' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Trophy className={`h-6 w-6 ${
                          result.result === 'won' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">vs {result.opponent}</h4>
                        <p className="text-sm text-gray-600">{result.category}</p>
                        <p className="text-xs text-gray-500">{result.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${result.result === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                        {result.result === 'won' ? 'You Won!' : 'You Lost'}
                      </p>
                      <p className="text-sm text-gray-600">{result.yourScore} - {result.opponentScore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SocialSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-2">Social Settings</h1>
        <p className="text-gray-600">Manage your privacy and social interaction preferences.</p>
      </div>

      <Card className="p-6">
        <CardContent className="p-0 space-y-6">
          <div>
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Profile Visibility</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Make profile discoverable</h4>
                  <p className="text-sm text-gray-600">Allow other users to find and connect with you</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Show online status</h4>
                  <p className="text-sm text-gray-600">Let friends see when you're online and studying</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Show study statistics</h4>
                  <p className="text-sm text-gray-600">Display your quiz scores and progress to friends</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Communication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Allow friend requests</h4>
                  <p className="text-sm text-gray-600">Receive friend requests from other medical students</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Allow challenge invitations</h4>
                  <p className="text-sm text-gray-600">Receive quiz challenges from friends</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Group invitations</h4>
                  <p className="text-sm text-gray-600">Allow friends to invite you to study groups</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">New messages</h4>
                  <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Challenge results</h4>
                  <p className="text-sm text-gray-600">Notify when challenge results are available</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Study group activity</h4>
                  <p className="text-sm text-gray-600">Updates from your study groups</p>
                </div>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Social Router Component
export const Social: React.FC = () => {
  return (
    <Routes>
      <Route index element={<SocialHub />} />
      <Route path="friends" element={<SocialFriends />} />
      <Route path="groups" element={<SocialGroups />} />
      <Route path="messages" element={<SocialMessages />} />
      <Route path="challenges" element={<SocialChallenges />} />
      <Route path="settings" element={<SocialSettings />} />
    </Routes>
  );
};