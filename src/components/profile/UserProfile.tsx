import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGetUserProfile, useUpdateUserProfile } from '../../services/convexAuth';
import { 
  User, 
  Trophy, 
  Target, 
  BookOpen, 
  Users, 
  Edit2, 
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAppStore } from '../../store';

const avatars = [
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor1',
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor2',
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor3',
  'https://api.dicebear.com/7.x/personas/svg?seed=doctor4',
  'https://api.dicebear.com/7.x/personas/svg?seed=nurse1',
  'https://api.dicebear.com/7.x/personas/svg?seed=nurse2',
  'https://api.dicebear.com/7.x/personas/svg?seed=medstudent1',
  'https://api.dicebear.com/7.x/personas/svg?seed=medstudent2',
];

const medicalLevels = [
  'Medical Student',
  'Resident',
  'Fellow',
  'Attending Physician',
  'Other Healthcare Professional'
];

const specialties = [
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics/Gynecology',
  'Psychiatry',
  'Emergency Medicine',
  'Family Medicine',
  'Radiology',
  'Anesthesiology',
  'Pathology',
  'Other'
];

const studyGoals = [
  'USMLE Step 1',
  'USMLE Step 2 CK',
  'USMLE Step 2 CS',
  'USMLE Step 3',
  'Board Review',
  'General Knowledge',
  'Other'
];

export const UserProfile: React.FC = () => {
  const { user } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // Fetch user profile with stats
  const userProfile = useGetUserProfile(user?.id || '');
  const updateProfile = useUpdateUserProfile();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    medicalLevel: '',
    specialties: [] as string[],
    studyGoals: '',
  });
  
  React.useEffect(() => {
    if (userProfile && !isEditing) {
      setFormData({
        name: userProfile.name || '',
        avatar: userProfile.avatar || avatars[0],
        medicalLevel: userProfile.medicalLevel || '',
        specialties: userProfile.specialties || [],
        studyGoals: userProfile.studyGoals || '',
      });
    }
  }, [userProfile, isEditing]);
  
  if (!user || !userProfile) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>Loading profile...</p>
      </div>
    );
  }
  
  const handleSave = async () => {
    try {
      await updateProfile({
        userId: user.id,
        updates: {
          name: formData.name,
          avatar: formData.avatar,
          medicalLevel: formData.medicalLevel || undefined,
          specialties: formData.specialties.length > 0 ? formData.specialties : undefined,
          studyGoals: formData.studyGoals || undefined,
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={formData.avatar || avatars[0]}
                  alt={formData.name}
                  className="w-24 h-24 rounded-full border-4 border-primary/20"
                />
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* User Info */}
              <div className="space-y-2">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold"
                    placeholder="Your Name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                )}
                <p className="text-muted-foreground">{userProfile.email}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>Level {userProfile.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>{userProfile.points} points</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Edit/Save Buttons */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setShowAvatarPicker(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
          
          {/* Avatar Picker */}
          {isEditing && showAvatarPicker && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-3">Choose an avatar:</p>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {avatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, avatar }));
                      setShowAvatarPicker(false);
                    }}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.avatar === avatar 
                        ? 'border-primary bg-primary/10' 
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full rounded-full" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Professional Information */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Medical Level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Medical Level</label>
              <select
                value={formData.medicalLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalLevel: e.target.value }))}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Select your level</option>
                {medicalLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            {/* Study Goals */}
            <div>
              <label className="text-sm font-medium mb-2 block">Study Goals</label>
              <select
                value={formData.studyGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, studyGoals: e.target.value }))}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Select your goal</option>
                {studyGoals.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
            
            {/* Specialties */}
            <div>
              <label className="text-sm font-medium mb-2 block">Specialties of Interest</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {specialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      formData.specialties.includes(specialty)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background border-muted hover:border-primary'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile.stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Average score</p>
            <div className="mt-2 text-sm">
              <p>{userProfile.stats.totalQuizzes} quizzes completed</p>
              <p>{userProfile.stats.totalQuestions} questions answered</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile.accuracy}%</div>
            <p className="text-xs text-muted-foreground">Overall accuracy</p>
            <div className="mt-2 text-sm">
              <p>{userProfile.streak} day streak</p>
              <p>{userProfile.stats.bookmarkedQuestions} bookmarks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Stats</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile.stats.friendCount}</div>
            <p className="text-xs text-muted-foreground">Study friends</p>
            <div className="mt-2 text-sm">
              <p>{userProfile.stats.studyGroupCount} study groups</p>
              <p className="text-muted-foreground">Active learner</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Professional Info Display (when not editing) */}
      {!isEditing && (userProfile.medicalLevel || userProfile.studyGoals || (userProfile.specialties && userProfile.specialties.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userProfile.medicalLevel && (
              <div>
                <p className="text-sm text-muted-foreground">Medical Level</p>
                <p className="font-medium">{userProfile.medicalLevel}</p>
              </div>
            )}
            {userProfile.studyGoals && (
              <div>
                <p className="text-sm text-muted-foreground">Study Goals</p>
                <p className="font-medium">{userProfile.studyGoals}</p>
              </div>
            )}
            {userProfile.specialties && userProfile.specialties.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specialties of Interest</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.specialties.map(specialty => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userProfile.totalQuizzes >= 1 && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium">First Quiz</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            )}
            {userProfile.totalQuizzes >= 10 && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Quiz Master</p>
                <p className="text-xs text-muted-foreground">10 quizzes</p>
              </div>
            )}
            {userProfile.accuracy >= 80 && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Sharp Shooter</p>
                <p className="text-xs text-muted-foreground">80%+ accuracy</p>
              </div>
            )}
            {userProfile.streak >= 7 && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Week Warrior</p>
                <p className="text-xs text-muted-foreground">7 day streak</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};