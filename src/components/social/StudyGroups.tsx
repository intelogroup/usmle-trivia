import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  Users, 
  Plus,
  Lock,
  Globe,
  BookOpen,
  UserPlus,
  UserMinus,
  Settings,
  X
} from 'lucide-react';
import { useAppStore } from '../../store';

interface CreateGroupFormData {
  name: string;
  description: string;
  isPublic: boolean;
  category: string;
}

export const StudyGroups: React.FC = () => {
  const { user } = useAppStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: '',
    description: '',
    isPublic: true,
    category: 'General',
  });
  
  // Fetch user's groups and public groups
  const userGroups = useQuery(api.social.getUserStudyGroups, { 
    userId: user?.id || ''
  });
  
  const publicGroups = useQuery(api.social.getPublicStudyGroups, { 
    category: searchCategory || undefined,
    limit: 20
  });
  
  // Mutations
  const createGroup = useMutation(api.social.createStudyGroup);
  const joinGroup = useMutation(api.social.joinStudyGroup);
  const leaveGroup = useMutation(api.social.leaveStudyGroup);
  
  if (!user) {
    return null;
  }
  
  const handleCreateGroup = async () => {
    try {
      await createGroup({
        creatorId: user.id,
        name: formData.name,
        description: formData.description || undefined,
        isPublic: formData.isPublic,
        category: formData.category || undefined,
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        isPublic: true,
        category: 'General',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create study group:', error);
    }
  };
  
  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup({
        groupId: groupId as any,
        userId: user.id,
      });
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };
  
  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup({
        groupId: groupId as any,
        userId: user.id,
      });
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };
  
  const categories = [
    'General',
    'USMLE Step 1',
    'USMLE Step 2',
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Psychiatry',
    'Other'
  ];
  
  // Filter out groups user is already in
  const userGroupIds = new Set(userGroups?.map(g => g._id) || []);
  const availablePublicGroups = publicGroups?.filter(g => !userGroupIds.has(g._id)) || [];
  
  return (
    <div className="space-y-6">
      {/* Create Study Group */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Study Groups
            </CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent>
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Group Name</label>
                <Input
                  placeholder="e.g., USMLE Step 1 Study Buddies"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  placeholder="What's this group about?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg bg-background resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm flex items-center gap-2">
                  {formData.isPublic ? (
                    <>
                      <Globe className="h-4 w-4 text-green-600" />
                      Public (anyone can join)
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-orange-600" />
                      Private (invite only)
                    </>
                  )}
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateGroup}
                  disabled={!formData.name}
                  className="flex-1"
                >
                  Create Group
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* My Study Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {userGroups && userGroups.length > 0 ? (
            <div className="space-y-3">
              {userGroups.map((group) => (
                <div
                  key={group._id}
                  className="p-4 bg-muted/50 rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {group.name}
                        {group.isPublic ? (
                          <Globe className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-orange-600" />
                        )}
                      </h4>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {group.category && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {group.category}
                          </span>
                        )}
                        <span>{group.totalMembers} members</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {group.creatorId === user.id ? (
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeaveGroup(group._id)}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Leave
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Member avatars */}
                  {group.memberDetails && group.memberDetails.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {group.memberDetails.slice(0, 5).map((member) => (
                          <img
                            key={member._id}
                            src={member.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                            alt={member.name}
                            className="w-8 h-8 rounded-full border-2 border-background"
                            title={member.name}
                          />
                        ))}
                      </div>
                      {group.totalMembers > 5 && (
                        <span className="text-sm text-muted-foreground">
                          +{group.totalMembers - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                You haven't joined any study groups yet.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Create one or browse public groups below!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Discover Public Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Discover Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Category Filter */}
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full p-2 border rounded-lg bg-background"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* Groups List */}
            {availablePublicGroups.length > 0 ? (
              <div className="space-y-3">
                {availablePublicGroups.map((group) => (
                  <div
                    key={group._id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{group.name}</h4>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {group.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {group.category && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {group.category}
                            </span>
                          )}
                          <span>{group.members.length} members</span>
                          <span>by {group.creatorName}</span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleJoinGroup(group._id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No public groups found in this category.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};