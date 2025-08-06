# 🚀 MedQuiz Pro - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** and npm
- **Git** for version control
- A **Convex account** (free at [convex.dev](https://convex.dev))

## Quick Setup (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/intelogroup/usmle-trivia.git
cd usmle-trivia
npm install
```

### 2. Set Up Convex Backend
```bash
# Install Convex CLI globally (if not already installed)
npm install -g convex

# Login to Convex
npx convex login

# Create a new Convex project
npx convex init

# Deploy the backend
npm run convex:deploy
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your Convex deployment URL
# VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Seed the Database
```bash
# Start development server
npm run dev

# In your browser, go to http://localhost:5173
# Click the "🛠️ Dev Tools" button in the bottom-right corner
# Click "🌱 Seed Sample Questions" to populate the database
```

### 5. Test the Application
```bash
# Register a new user account
# Take a quiz to verify everything works
# Check the progress and social features
```

## Detailed Setup Guide

### Setting Up Convex

1. **Create Account**: Go to [convex.dev](https://convex.dev) and sign up
2. **Create Project**: Follow the onboarding to create a new project
3. **Get URL**: Copy your deployment URL from the dashboard
4. **Configure Environment**: Add the URL to `.env.local`

### Database Schema

The app uses the following Convex collections:
- **users** - User profiles and statistics  
- **questions** - USMLE-style quiz questions
- **quizSessions** - Quiz attempts and results
- **friendships** - User friend relationships
- **studyGroups** - Collaborative study groups
- **challenges** - Quiz competitions between users
- **bookmarks** - User-saved questions
- **flaggedQuestions** - Questions reported for review
- **leaderboard** - Global performance rankings

### Sample Data

The application includes:
- **10 Sample Questions** - High-quality USMLE-style medical questions
- **Database Seeder** - Built-in tool to populate questions
- **Dev Tools** - Development utilities accessible in browser

### Development Workflow

```bash
# Start Convex backend (Terminal 1)
npm run convex:dev

# Start frontend development server (Terminal 2) 
npm run dev

# Run tests (Terminal 3)
npm run test

# Type checking
npm run type-check

# Code quality
npm run lint
```

## Production Deployment

### Environment Setup
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy Convex functions
npm run convex:deploy
```

### Hosting Options

**Recommended: Netlify**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

**Alternative: Vercel**
1. Import GitHub repository
2. Set framework preset to "Vite"
3. Add environment variables
4. Deploy

## Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Convex connection issues**
```bash
# Check your environment variable
echo $VITE_CONVEX_URL

# Verify Convex deployment
npx convex dashboard
```

**Database seeding fails**
```bash
# Check browser console for errors
# Verify Convex URL is correct
# Try refreshing and seeding again
```

**Build errors**
```bash
# Run TypeScript check
npm run type-check

# Fix any type errors before building
npm run build
```

## Feature Testing Checklist

### Core Features
- [ ] User registration and login
- [ ] Quiz taking (Quick, Timed, Custom modes)
- [ ] Question answering and results
- [ ] Dashboard statistics
- [ ] Progress tracking

### Advanced Features  
- [ ] Spaced repetition recommendations
- [ ] Question bookmarking
- [ ] Quiz review functionality
- [ ] Social features (friends, groups)
- [ ] Challenge system
- [ ] Leaderboards

### Technical Verification
- [ ] Mobile responsiveness
- [ ] Real-time data updates
- [ ] Error handling
- [ ] Database persistence
- [ ] Authentication flows

## Support & Resources

### Documentation
- `README.md` - Project overview and quick start
- `DEVELOPER_HANDOFF.md` - Complete technical documentation
- `CLAUDE.md` - Project vision and architecture

### Key Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run test suite
npm run convex:dev   # Start Convex backend
npm run convex:deploy # Deploy backend functions
```

### Getting Help
- Check browser console for error messages
- Verify all environment variables are set
- Ensure Convex backend is running
- Try clearing browser cache and cookies

**Your MedQuiz Pro application is now ready for development and deployment! 🎉**