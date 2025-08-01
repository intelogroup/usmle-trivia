# 🏥 USMLE Trivia App - Strategic Development Guide (2025)

## 🎯 Project Vision
Build a comprehensive medical quiz application for USMLE preparation that rivals UWorld and AMBOSS, featuring modern React architecture, Appwrite backend, and industry-leading user experience.

## 📊 Current Status: **FOUNDATION COMPLETE ✅**
- **Architecture**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Appwrite BaaS integration ready
- **State Management**: Zustand configured
- **Layout System**: Responsive mobile/desktop layouts implemented
- **Testing**: Vitest configured with passing tests
- **Build Status**: ✅ No TypeScript errors, builds successfully

## 🚀 **PHASE 1: APPWRITE SETUP & MCP INTEGRATION** (Priority: HIGH)

### Manual Setup Required (Your Tasks):
1. **Create Appwrite Cloud Account**
   - Visit: https://cloud.appwrite.io
   - Create new project: "usmle-trivia"
   - Copy Project ID and Endpoint
   - Generate API key with full permissions

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Appwrite credentials
   ```

### MCP Server Installation (2025 Best Practice):
```bash
# Install UV (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create MCP configuration
mkdir -p ~/.config/claude-desktop
```

**MCP Configuration** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "appwrite": {
      "command": "uvx",
      "args": ["mcp-server-appwrite", "--databases", "--users"],
      "env": {
        "APPWRITE_PROJECT_ID": "your-project-id",
        "APPWRITE_API_KEY": "your-api-key",
        "APPWRITE_ENDPOINT": "https://cloud.appwrite.io/v1"
      }
    }
  }
}
```

### Database Schema Design:
```javascript
// Collections to create via MCP:
const COLLECTIONS = {
  users: {
    name: 'users',
    permissions: ['read', 'write'],
    attributes: [
      { key: 'email', type: 'string', required: true },
      { key: 'name', type: 'string', required: true },
      { key: 'points', type: 'integer', default: 0 },
      { key: 'level', type: 'integer', default: 1 },
      { key: 'streak', type: 'integer', default: 0 },
      { key: 'accuracy', type: 'float', default: 0 },
      { key: 'preferences', type: 'string' } // JSON string
    ]
  },
  questions: {
    name: 'questions',
    attributes: [
      { key: 'question', type: 'string', required: true },
      { key: 'options', type: 'string', required: true }, // JSON array
      { key: 'correctAnswer', type: 'integer', required: true },
      { key: 'explanation', type: 'string', required: true },
      { key: 'category', type: 'string', required: true },
      { key: 'difficulty', type: 'string', required: true }, // easy|medium|hard
      { key: 'tags', type: 'string' }, // JSON array
      { key: 'imageUrl', type: 'string' }
    ]
  },
  quiz_sessions: {
    name: 'quiz_sessions',
    attributes: [
      { key: 'userId', type: 'string', required: true },
      { key: 'mode', type: 'string', required: true }, // quick|timed|custom
      { key: 'questions', type: 'string', required: true }, // JSON array
      { key: 'answers', type: 'string' }, // JSON array
      { key: 'score', type: 'integer', default: 0 },
      { key: 'timeSpent', type: 'integer', default: 0 },
      { key: 'status', type: 'string', default: 'active' } // active|completed
    ]
  }
};
```

## 🔧 **PHASE 2: AUTHENTICATION ENHANCEMENT** (2025 Standards)

### Modern Auth Service Pattern:
```typescript
// Enhanced authentication with 2025 best practices
export class AuthService {
  private client: Client;
  private account: Account;
  
  constructor() {
    this.client = new Client()
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
    this.account = new Account(this.client);
  }

  // OAuth providers for 2025
  async loginWithGoogle() {
    return this.account.createOAuth2Session('google', 
      `${window.location.origin}/auth/success`,
      `${window.location.origin}/auth/failure`
    );
  }

  // Email verification (required for production)
  async sendVerificationEmail() {
    return this.account.createVerification(
      `${window.location.origin}/verify-email`
    );
  }

  // Session management with refresh
  async refreshSession() {
    try {
      return await this.account.getSession('current');
    } catch (error) {
      // Handle refresh logic
      throw new Error('Session expired');
    }
  }
}
```

### Security Best Practices (2025):
1. **Rate Limiting**: Implement client-side request throttling
2. **Input Validation**: Sanitize all user inputs
3. **HTTPS Only**: Enforce secure connections
4. **Session Security**: Implement session timeout and refresh
5. **Password Policy**: Enforce strong passwords

## 📱 **PHASE 3: CORE QUIZ FUNCTIONALITY**

### Question Bank Architecture:
```typescript
interface QuestionBank {
  // USMLE-specific structure
  questions: {
    stem: string;           // Clinical scenario
    options: string[];      // A, B, C, D choices
    correct: number;        // Index of correct answer
    explanation: string;    // Detailed rationale
    category: USMLECategory;
    difficulty: Difficulty;
    tags: string[];         // Searchable tags
    media?: {
      type: 'image' | 'diagram';
      url: string;
      caption?: string;
    };
    references?: string[];  // Medical literature
  }[];
}

// USMLE Categories (2025 Content Outline)
enum USMLECategory {
  ANATOMY = 'anatomy',
  BIOCHEMISTRY = 'biochemistry',
  PHYSIOLOGY = 'physiology',
  PATHOLOGY = 'pathology',
  PHARMACOLOGY = 'pharmacology',
  MICROBIOLOGY = 'microbiology',
  IMMUNOLOGY = 'immunology',
  BEHAVIORAL_SCIENCE = 'behavioral-science'
}
```

### Quiz Modes (Industry Standard):
1. **Quick Quiz**: 5-10 questions, untimed, mixed topics
2. **Timed Practice**: 20-40 questions with time pressure
3. **Custom Quiz**: User-defined parameters
4. **Weak Areas**: AI-powered focus on improvement areas
5. **Review Mode**: Previously incorrect questions

### Performance Analytics:
```typescript
interface Analytics {
  overall: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
    improvementTrend: number[];
  };
  
  byCategory: Record<USMLECategory, {
    accuracy: number;
    questionsAttempted: number;
    weakAreas: string[];
  }>;
  
  studyPatterns: {
    dailyStreak: number;
    sessionsPerWeek: number;
    averageSessionLength: number;
    peakPerformanceTime: string;
  };
}
```

## 🎮 **PHASE 4: GAMIFICATION & ENGAGEMENT**

### Point System:
- Correct Answer: 10 points
- First Attempt Bonus: +5 points
- Speed Bonus: +3 points (under average time)
- Streak Multiplier: x1.5 after 5+ correct
- Daily Login: 5 points

### Achievement System:
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    type: 'accuracy' | 'streak' | 'category' | 'speed';
    threshold: number;
    category?: USMLECategory;
  };
  reward: {
    points: number;
    badge: string;
  };
}
```

## 🚀 **PHASE 5: PRODUCTION DEPLOYMENT**

### Netlify Configuration (Optimized):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://cloud.appwrite.io"

# Cache optimization
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Performance Optimization:
1. **Code Splitting**: Route-based lazy loading
2. **Image Optimization**: WebP format, lazy loading
3. **Bundle Analysis**: Keep JavaScript < 300KB
4. **CDN**: Leverage Netlify's global CDN
5. **Caching**: Implement service worker for offline support

## 📋 **DEVELOPMENT WORKFLOW (2025)**

### Daily Development Process:
```bash
# 1. Start development
npm run dev

# 2. Run tests continuously
npm run test

# 3. Type checking
npm run type-check

# 4. Before committing
npm run lint
npm run build
npm run test:run

# 5. Commit with conventional commits
git commit -m "feat(auth): add Google OAuth integration"
```

### Code Quality Standards:
- **TypeScript**: Strict mode enabled
- **ESLint**: No warnings allowed
- **Prettier**: Consistent formatting
- **Testing**: >80% code coverage
- **Accessibility**: WCAG 2.1 AA compliance

## 🎯 **SUCCESS METRICS & KPIs**

### Technical Metrics:
- **Performance**: Lighthouse score >90
- **Accessibility**: Perfect accessibility score
- **SEO**: Optimized meta tags and structure
- **Bundle Size**: <500KB total
- **Loading Speed**: <2s initial load

### User Experience Metrics:
- **Session Duration**: >10 minutes average
- **Engagement Rate**: >70% daily return
- **Quiz Completion**: >85% completion rate
- **Accuracy Improvement**: Measurable learning curve

## 🚨 **CRITICAL SUCCESS FACTORS**

### Must-Have Features for MVP:
1. ✅ User registration and authentication
2. ✅ Responsive mobile/desktop design
3. 🔄 Question bank with 100+ USMLE questions
4. 🔄 Basic quiz modes (quick, timed)
5. 🔄 Score tracking and history
6. 🔄 Progress analytics

### Technical Requirements:
- **Mobile-First**: Perfect mobile experience
- **Offline Support**: Basic offline functionality
- **Real-time Sync**: Cross-device progress sync
- **Security**: Production-grade security practices
- **Scalability**: Handle 1000+ concurrent users

## 📚 **LEARNING RESOURCES & REFERENCES**

### Official Documentation:
- [Appwrite Docs](https://appwrite.io/docs) - Complete API reference
- [React 18 Features](https://react.dev/blog/2022/03/29/react-v18) - Latest React patterns
- [TypeScript 5.8](https://www.typescriptlang.org/docs/) - Type system mastery
- [Vite Guide](https://vitejs.dev/guide/) - Build tool optimization

### Medical Content Standards:
- [USMLE Content Outline](https://www.usmle.org/exam-content) - Official exam structure
- [NBME Guidelines](https://www.nbme.org/) - Question writing standards
- [Medical Education Best Practices](https://www.aamc.org/) - Learning methodology

### Performance & Security:
- [Web Vitals](https://web.dev/vitals/) - Performance metrics
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Security checklist
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - WCAG 2.1 reference

## 🔄 **NEXT IMMEDIATE ACTIONS**

### High Priority (Do Now):
1. 🎯 Create Appwrite project and get credentials
2. 🎯 Install and configure MCP server
3. 🎯 Set up database collections via MCP
4. 🎯 Test authentication flow

### Medium Priority (This Week):
1. 📝 Create sample question data (50+ questions)
2. 🔧 Implement quiz-taking interface
3. 📊 Add basic analytics dashboard
4. 📱 Test mobile experience thoroughly

### Low Priority (Next Sprint):
1. 🎮 Add gamification features
2. 📈 Implement advanced analytics
3. 🚀 Optimize for production deployment
4. 🧪 Add comprehensive test coverage

---

## 💡 **DEVELOPMENT PHILOSOPHY**

> **"Build for Friday 5PM deployment"** - Every feature should be production-ready, well-tested, and maintainable by other developers.

### Core Principles:
1. **User-First**: Every decision prioritizes user experience
2. **Mobile-First**: Mobile experience drives desktop design
3. **Performance-First**: Speed and responsiveness are non-negotiable
4. **Security-First**: Protect user data at all costs
5. **Accessibility-First**: Inclusive design for all users

**Ready to build the future of medical education! 🚀**