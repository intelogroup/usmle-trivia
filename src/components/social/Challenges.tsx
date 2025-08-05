import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  Swords, 
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  BookOpen,
  Award,
  TrendingUp,
  User
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export const Challenges: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  
  // Fetch friends and challenges
  const friends = useQuery(api.social.getUserFriends, { 
    userId: user?.id || '',
    status: 'accepted'
  });
  
  const challenges = useQuery(api.social.getUserChallenges, { 
    userId: user?.id || ''
  });
  
  // Mutations
  const createChallenge = useMutation(api.social.createChallenge);
  const acceptChallenge = useMutation(api.social.acceptChallenge);
  
  if (!user) {
    return null;
  }
  
  const handleCreateChallenge = async () => {
    if (!selectedFriend) return;
    
    try {
      await createChallenge({
        challengerId: user.id,
        challengedId: selectedFriend as any,
        category: selectedCategory || undefined,
        questionCount,
      });
      
      // Reset form
      setSelectedFriend('');
      setSelectedCategory('');
      setQuestionCount(10);
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };
  
  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await acceptChallenge({
        challengeId: challengeId as any,
        userId: user.id,
      });
      
      // Navigate to quiz with challenge mode
      navigate(`/quiz/challenge?challengeId=${challengeId}`);
    } catch (error) {
      console.error('Failed to accept challenge:', error);
    }
  };
  
  const handleStartChallenge = (challengeId: string) => {
    // Navigate to quiz with challenge mode
    navigate(`/quiz/challenge?challengeId=${challengeId}`);
  };
  
  const categories = [
    'All Categories',
    'Anatomy',
    'Physiology',
    'Pathology',
    'Pharmacology',
    'Microbiology',
    'Biochemistry',
  ];
  
  // Group challenges by status
  const pendingChallenges = challenges?.filter(c => c.status === 'pending') || [];
  const activeChallenges = challenges?.filter(c => c.status === 'accepted') || [];
  const completedChallenges = challenges?.filter(c => c.status === 'completed') || [];
  
  return (
    <div className="space-y-6">
      {/* Create New Challenge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Challenge a Friend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Friend Selection */}
            <div>
              <label className="text-sm font-medium mb-1 block">Select Friend</label>
              <select
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Choose a friend...</option>
                {friends?.map((friend) => (
                  <option key={friend.friend._id} value={friend.friend._id}>
                    {friend.friend.name} (Level {friend.friend.level})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Question Count */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Number of Questions: {questionCount}
              </label>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
            
            <Button
              onClick={handleCreateChallenge}
              disabled={!selectedFriend}
              className="w-full"
            >
              <Swords className="h-4 w-4 mr-2" />
              Send Challenge
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Challenges */}
      {pendingChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Challenges ({pendingChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingChallenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="p-4 bg-orange-50 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={challenge.opponent.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                        alt={challenge.opponent.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">
                          {challenge.isChallenger ? 'You challenged' : 'Challenged by'} {challenge.opponent.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {challenge.category || 'All Categories'} • {challenge.questionCount} questions
                        </p>
                      </div>
                    </div>
                    
                    {!challenge.isChallenger && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptChallenge(challenge._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    {challenge.isChallenger && (
                      <span className="text-sm text-orange-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Waiting for response
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Active Challenges ({activeChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeChallenges.map((challenge) => {
                const myScore = challenge.isChallenger ? challenge.challengerScore : challenge.challengedScore;
                const opponentScore = challenge.isChallenger ? challenge.challengedScore : challenge.challengerScore;
                const hasCompleted = myScore !== undefined;
                
                return (
                  <div
                    key={challenge._id}
                    className="p-4 bg-green-50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={challenge.opponent.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                          alt={challenge.opponent.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">vs {challenge.opponent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {challenge.category || 'All Categories'} • {challenge.questionCount} questions
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {hasCompleted ? (
                          <div>
                            <p className="text-sm font-medium">Your Score: {myScore}%</p>
                            {opponentScore !== undefined && (
                              <p className="text-sm text-muted-foreground">
                                Opponent: {opponentScore}%
                              </p>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleStartChallenge(challenge._id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start Quiz
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Challenge History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedChallenges.slice(0, 5).map((challenge) => {
                const myScore = challenge.isChallenger ? challenge.challengerScore : challenge.challengedScore;
                const opponentScore = challenge.isChallenger ? challenge.challengedScore : challenge.challengerScore;
                const isWinner = challenge.winnerId === user.id;
                const isTie = challenge.winnerId === undefined && myScore === opponentScore;
                
                return (
                  <div
                    key={challenge._id}
                    className={`p-4 rounded-lg ${
                      isWinner ? 'bg-green-50' : isTie ? 'bg-yellow-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={challenge.opponent.avatar || 'https://api.dicebear.com/7.x/personas/svg?seed=default'}
                          alt={challenge.opponent.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            vs {challenge.opponent.name}
                            {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                            {isTie && <span className="text-xs text-muted-foreground">(Tie)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {challenge.category || 'All Categories'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          isWinner ? 'text-green-600' : isTie ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {myScore}% - {opponentScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(challenge.completedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* No Challenges Message */}
      {(!challenges || challenges.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No challenges yet. Challenge a friend to a quiz battle!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};