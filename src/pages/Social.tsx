import React, { useState } from 'react';
import { FriendsList } from '../components/social/FriendsList';
import { StudyGroups } from '../components/social/StudyGroups';
import { Challenges } from '../components/social/Challenges';
import { Button } from '../components/ui/Button';
import { Users, UserPlus, Swords } from 'lucide-react';

export const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'challenges'>('friends');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social</h1>
        <p className="text-muted-foreground mt-1">
          Connect with other medical students and create study groups
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'friends' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('friends')}
          className="rounded-b-none"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Friends
        </Button>
        <Button
          variant={activeTab === 'groups' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('groups')}
          className="rounded-b-none"
        >
          <Users className="h-4 w-4 mr-2" />
          Study Groups
        </Button>
        <Button
          variant={activeTab === 'challenges' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('challenges')}
          className="rounded-b-none"
        >
          <Swords className="h-4 w-4 mr-2" />
          Challenges
        </Button>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'groups' && <StudyGroups />}
        {activeTab === 'challenges' && <Challenges />}
      </div>
    </div>
  );
};