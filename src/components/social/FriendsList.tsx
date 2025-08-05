import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  Users, 
  UserPlus, 
  UserX,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  Loader2
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useSearchUsers } from '../../services/convexAuth';

export const FriendsList: React.FC = () => {
  const { user } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch friends and pending requests
  const friends = useQuery(api.social.getUserFriends, { 
    userId: user?.id || '',
    status: 'accepted'
  });
  
  const pendingRequests = useQuery(api.social.getPendingRequests, { 
    userId: user?.id || ''
  });
  
  const sentRequests = useQuery(api.social.getUserFriends, { 
    userId: user?.id || '',
    status: 'pending'
  });
  
  // Search users
  const searchResults = useSearchUsers(searchTerm, 10);
  
  // Mutations
  const sendFriendRequest = useMutation(api.social.sendFriendRequest);
  const acceptRequest = useMutation(api.social.acceptFriendRequest);
  const removeFriend = useMutation(api.social.removeFriend);
  
  if (!user) {
    return null;
  }
  
  const handleSendRequest = async (toUserId: string) => {
    try {
      await sendFriendRequest({
        fromUserId: user.id,
        toUserId: toUserId as any,
      });
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };
  
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest({
        friendshipId: requestId as any,
        userId: user.id,
      });
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };
  
  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await removeFriend({
        friendshipId: friendshipId as any,
        userId: user.id,
      });
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };
  
  // Filter out existing friends and pending requests from search results
  const existingFriendIds = new Set([
    ...(friends?.map(f => f.friend._id) || []),
    ...(pendingRequests?.map(r => r.sender._id) || []),
    ...(sentRequests?.filter(r => !r.friendship.isInitiator).map(r => r.friend._id) || []),
  ]);
  
  const filteredSearchResults = searchResults?.filter(
    result => result._id !== user.id && !existingFriendIds.has(result._id)
  );
  
  return (
    <div className="space-y-6">
      {/* Search for Friends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(true);
                }}
                className="pl-10"
              />
            </div>
            
            {searchTerm && filteredSearchResults && filteredSearchResults.length > 0 && (
              <div className="space-y-2">
                {filteredSearchResults.map((result) => (
                  <div
                    key={result._id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={result.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                        alt={result.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">Level {result.level}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(result._id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm && filteredSearchResults?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No users found matching "{searchTerm}"
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Friend Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request.request._id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={request.sender.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                      alt={request.sender.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{request.sender.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Level {request.sender.level} • {request.sender.points} points
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request.request._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFriend(request.request._id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Friends ({friends?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends && friends.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {friends.map((friend) => (
                <div
                  key={friend.friendship._id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.friend.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                      alt={friend.friend.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{friend.friend.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Level {friend.friend.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {friend.friend.accuracy}% accuracy
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFriend(friend.friendship._id)}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No friends yet. Search for users above to add friends!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Sent Requests */}
      {sentRequests && sentRequests.filter(r => r.friendship.isInitiator).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Sent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentRequests
                .filter(r => r.friendship.isInitiator)
                .map((request) => (
                  <div
                    key={request.friendship._id}
                    className="flex items-center justify-between p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={request.friend.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                        alt={request.friend.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{request.friend.name}</span>
                    </div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};