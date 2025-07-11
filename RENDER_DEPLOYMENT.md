# Deploy BetWisdom to Render

This guide will help you deploy the BetWisdom football analytics application to Render.

## ✅ Build Issue Fixed

**The "vite: not found" error has been resolved!** Essential build tools have been moved from devDependencies to dependencies, so your next deployment will build successfully.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Sportmonks API Key**: Get your API key from [Sportmonks](https://www.sportmonks.com)

## Deployment Steps

### 1. Connect GitHub to Render

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub account if not already connected
4. Select the repository containing this code

### 2. Configure the Web Service

**Basic Settings:**
- **Name**: `betwisdom-football-analytics`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (deploy from root)

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Node Version**: `18` (or latest LTS)

### 3. Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
SPORTMONKS_API_KEY=your_sportmonks_api_key_here
```

**Note**: Don't set PORT manually - Render sets this automatically.

**To add environment variables:**
1. Go to your service settings
2. Click "Environment" tab
3. Add each variable with key and value

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. The build process takes 2-5 minutes
4. Your app will be available at `https://your-service-name.onrender.com`

## Alternative Deployment Methods

### Option A: Using render.yaml (Recommended)

The project includes a `render.yaml` file for easy deployment:

1. In Render dashboard, go to "Blueprint"
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` file
4. Add your `SPORTMONKS_API_KEY` in environment variables
5. Deploy

### Option B: Docker Deployment

If you prefer Docker:

1. Select "Docker" as runtime in Render
2. Use the included `Dockerfile`
3. Add environment variables
4. Deploy

## Post-Deployment

### 1. Test Your Application

Visit your Render URL and verify:
- ✅ Home page loads correctly
- ✅ Language switcher works (English/Georgian)
- ✅ Team selection displays available teams
- ✅ Team analysis generates results

### 2. Monitor Logs

Check Render logs if issues occur:
1. Go to your service dashboard
2. Click "Logs" tab
3. Monitor for any errors

### 3. Custom Domain (Optional)

To use your own domain:
1. Go to service "Settings"
2. Add custom domain
3. Update DNS records as instructed

## Troubleshooting

### Common Issues

**Build Fails:**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json` (not devDependencies)
- Review build logs for specific errors
- Ensure build tools (vite, esbuild, typescript) are in dependencies

**API Not Working:**
- Verify `SPORTMONKS_API_KEY` is set correctly
- Check API key permissions and quota
- Review server logs for API errors

**App Not Loading:**
- Ensure `PORT` environment variable is set
- Check if start command is correct
- Verify build completed successfully

### Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Sportmonks API**: [docs.sportmonks.com](https://docs.sportmonks.com)

## Application Details

**Features:**
- Georgian/English language support
- Football team analysis and comparison
- Real-time data from Sportmonks API
- Responsive design with Tailwind CSS

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite
- Backend: Node.js + Express
- Styling: Tailwind CSS + shadcn/ui
- API: Sportmonks Football API v3.0

**Free Tier Limitations:**
- Render free tier includes 750 hours/month
- App sleeps after 15 minutes of inactivity
- Sportmonks free plan has limited team data

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `SPORTMONKS_API_KEY` | Your Sportmonks API token | Yes |
| `PORT` | Port number (default: 5000) | No |

## Build Information

**Build Process:**
1. `npm install` - Install dependencies
2. `vite build` - Build React frontend to `dist/public`
3. `esbuild` - Bundle Express server to `dist/index.js`

**File Structure After Build:**
```
dist/
├── public/          # Frontend static files
└── index.js         # Bundled server
```

The Express server serves both API routes and static frontend files from the `dist` directory.