import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Search,
  Book,
  Microscope,
  Heart,
  Brain,
  Stethoscope,
  Pill,
  FileText,
  ExternalLink,
  Star,
  Bookmark,
  Clock,
  Target,
  Filter,
  X,
  ChevronRight,
  Image,
  Play,
  Download,
  Share
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MedicalResource {
  id: string;
  title: string;
  type: 'drug' | 'anatomy' | 'pathophysiology' | 'clinical-image' | 'lab-values' | 'procedure';
  category: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  content: string;
  references: string[];
  tags: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  isBookmarked?: boolean;
  viewCount: number;
  rating: number;
}

interface MedicalReferenceCenterProps {
  searchTerm?: string;
  category?: string;
  onResourceSelect?: (resource: MedicalResource) => void;
  className?: string;
}

// Mock data - In a real implementation, this would come from a medical database
const mockResources: MedicalResource[] = [
  {
    id: '1',
    title: 'Cardiac Cycle and Heart Sounds',
    type: 'anatomy',
    category: 'Cardiovascular',
    description: 'Interactive diagram showing the cardiac cycle phases with corresponding heart sounds',
    imageUrl: '/medical/cardiac-cycle.jpg',
    content: 'The cardiac cycle consists of systole (contraction) and diastole (relaxation) phases. S1 occurs at the beginning of systole with closure of AV valves. S2 occurs at the beginning of diastole with closure of semilunar valves.',
    references: ['Guyton & Hall Textbook of Medical Physiology', 'Braunwald\'s Heart Disease'],
    tags: ['cardiac cycle', 'heart sounds', 'physiology', 'murmurs'],
    difficulty: 'basic',
    lastUpdated: new Date('2025-01-15'),
    viewCount: 1250,
    rating: 4.8
  },
  {
    id: '2',
    title: 'Lisinopril (ACE Inhibitor)',
    type: 'drug',
    category: 'Pharmacology',
    description: 'Complete drug profile including mechanism, indications, contraindications, and side effects',
    content: 'Lisinopril is an ACE inhibitor used to treat hypertension and heart failure. Mechanism: Inhibits ACE, reducing angiotensin II formation. Major side effects include dry cough, hyperkalemia, and angioedema.',
    references: ['Goodman & Gilman\'s Pharmacology', 'Clinical Pharmacology Made Simple'],
    tags: ['ACE inhibitor', 'hypertension', 'heart failure', 'cardiovascular'],
    difficulty: 'intermediate',
    lastUpdated: new Date('2025-01-20'),
    viewCount: 890,
    rating: 4.6
  },
  {
    id: '3',
    title: 'Chest X-Ray: Pneumonia vs. Pleural Effusion',
    type: 'clinical-image',
    category: 'Radiology',
    description: 'Side-by-side comparison of chest X-rays showing pneumonia and pleural effusion',
    imageUrl: '/medical/chest-xray-comparison.jpg',
    content: 'Pneumonia typically shows consolidation with air bronchograms. Pleural effusion shows blunting of costophrenic angles and fluid levels. Key differences in appearance and clinical correlation.',
    references: ['Felson\'s Principles of Chest Roentgenology', 'Chest Radiology Made Easy'],
    tags: ['chest x-ray', 'pneumonia', 'pleural effusion', 'radiology'],
    difficulty: 'intermediate',
    lastUpdated: new Date('2025-01-18'),
    viewCount: 2100,
    rating: 4.9
  },
  {
    id: '4',
    title: 'Normal Lab Values Reference',
    type: 'lab-values',
    category: 'Laboratory Medicine',
    description: 'Comprehensive reference for normal laboratory values with age and gender variations',
    content: 'Complete blood count, basic metabolic panel, liver function tests, and other commonly ordered lab values with normal ranges and clinical significance.',
    references: ['Henry\'s Clinical Diagnosis by Laboratory Methods', 'Tietz Fundamentals of Clinical Chemistry'],
    tags: ['lab values', 'reference ranges', 'CBC', 'BMP', 'LFTs'],
    difficulty: 'basic',
    lastUpdated: new Date('2025-01-22'),
    viewCount: 3200,
    rating: 4.7
  },
  {
    id: '5',
    title: 'Neurological Examination Techniques',
    type: 'procedure',
    category: 'Neurology',
    description: 'Step-by-step guide to performing a comprehensive neurological examination',
    videoUrl: '/medical/neuro-exam-video.mp4',
    content: 'Systematic approach to neurological examination including mental status, cranial nerves, motor system, sensory system, reflexes, and coordination testing.',
    references: ['Bates\' Guide to Physical Examination', 'DeJong\'s Neurologic Examination'],
    tags: ['neurological examination', 'clinical skills', 'neurology', 'physical exam'],
    difficulty: 'intermediate',
    lastUpdated: new Date('2025-01-19'),
    viewCount: 1800,
    rating: 4.8
  }
];

const getResourceIcon = (type: MedicalResource['type']) => {
  switch (type) {
    case 'drug':
      return <Pill className="h-4 w-4" />;
    case 'anatomy':
      return <Brain className="h-4 w-4" />;
    case 'pathophysiology':
      return <Microscope className="h-4 w-4" />;
    case 'clinical-image':
      return <Image className="h-4 w-4" />;
    case 'lab-values':
      return <FileText className="h-4 w-4" />;
    case 'procedure':
      return <Stethoscope className="h-4 w-4" />;
    default:
      return <Book className="h-4 w-4" />;
  }
};

const getDifficultyColor = (difficulty: MedicalResource['difficulty']) => {
  switch (difficulty) {
    case 'basic':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const MedicalReferenceCenter: React.FC<MedicalReferenceCenterProps> = ({
  searchTerm = '',
  category = '',
  onResourceSelect,
  className
}) => {
  const [resources, setResources] = useState<MedicalResource[]>(mockResources);
  const [filteredResources, setFilteredResources] = useState<MedicalResource[]>(mockResources);
  const [selectedResource, setSelectedResource] = useState<MedicalResource | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'views' | 'updated'>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const categories = Array.from(new Set(resources.map(r => r.category)));
  const types = Array.from(new Set(resources.map(r => r.type)));

  // Filter and search resources
  useEffect(() => {
    let filtered = resources;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.content.toLowerCase().includes(query) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Type filter
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    // Sort resources
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'views':
          return b.viewCount - a.viewCount;
        case 'updated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        default:
          return 0; // relevance - would implement proper relevance scoring
      }
    });

    setFilteredResources(filtered);
  }, [resources, searchQuery, selectedCategory, selectedType, sortBy]);

  const handleResourceClick = (resource: MedicalResource) => {
    setSelectedResource(resource);
    onResourceSelect?.(resource);
  };

  const toggleBookmark = (resourceId: string) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, isBookmarked: !resource.isBookmarked }
          : resource
      )
    );
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Book className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Medical Reference Center</h2>
            <p className="text-muted-foreground text-sm">
              Quick access to clinical resources, drug information, and medical images
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search medical resources, drugs, anatomy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    <option value="views">Views</option>
                    <option value="updated">Last Updated</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resource List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Resources ({filteredResources.length})
            </h3>
          </div>

          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredResources.map(resource => (
                <Card
                  key={resource.id}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50",
                    selectedResource?.id === resource.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleResourceClick(resource)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted/50 rounded-lg">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{resource.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {resource.description}
                          </p>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                              {resource.category}
                            </span>
                            <span className={cn(
                              'px-2 py-1 rounded-md text-xs border',
                              getDifficultyColor(resource.difficulty)
                            )}>
                              {resource.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(resource.id);
                          }}
                          className={cn(
                            "h-8 w-8 p-0",
                            resource.isBookmarked ? "text-yellow-600" : "text-muted-foreground"
                          )}
                        >
                          <Bookmark className="h-3 w-3" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{resource.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{formatViewCount(resource.viewCount)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{resource.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Resource Detail */}
        {selectedResource ? (
          <Card className="lg:sticky lg:top-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getResourceIcon(selectedResource.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedResource.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {selectedResource.category} • {selectedResource.difficulty}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResource(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Media */}
              {selectedResource.imageUrl && (
                <div className="relative">
                  <img
                    src={selectedResource.imageUrl}
                    alt={selectedResource.title}
                    className="w-full rounded-lg border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/90"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedResource.videoUrl && (
                <div className="relative bg-muted rounded-lg p-8 text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Video content available
                  </p>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Play Video
                  </Button>
                </div>
              )}

              {/* Content */}
              <div>
                <h4 className="font-semibold mb-3">Content</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedResource.content}
                </p>
              </div>

              {/* Tags */}
              {selectedResource.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {selectedResource.references.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">References</h4>
                  <ul className="space-y-2">
                    {selectedResource.references.map((ref, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span className="text-muted-foreground">{ref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full View
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => toggleBookmark(selectedResource.id)}
                  className={cn(
                    selectedResource.isBookmarked && "text-yellow-600 bg-yellow-50"
                  )}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:sticky lg:top-4">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Book className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Resource</h3>
                <p className="text-muted-foreground">
                  Click on any resource to view detailed information, images, and references.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};