Deployment Guide for WeatherHub

This guide will help you deploy your WeatherHub application to Netlify or Vercel without any issues.

Prerequisites

Before deploying, make sure you have:
- A GitHub account with your code pushed to a repository
- A free account on Netlify or Vercel
- Your WeatherAPI key from weatherapi.com

Important Note About API Keys

The config.js file contains your API key directly in the code. While this works for testing, it's not secure for production. However, since WeatherHub is a client-side application, the API key will be visible in the browser anyway. For better security in the future, consider using a backend proxy.

Deploying to Netlify

Step 1: Push Your Code to GitHub
Make sure all your files are committed and pushed to your GitHub repository.

Step 2: Connect to Netlify
1. Go to app.netlify.com and sign in
2. Click "Add new site" then "Import an existing project"
3. Choose "GitHub" and authorize Netlify to access your repositories
4. Select your WeatherHub repository

Step 3: Configure Build Settings
- Build command: Leave empty (no build needed)
- Publish directory: . (dot, meaning root directory)
- Click "Deploy site"

Step 4: Verify HTTPS
Once deployed, Netlify automatically provides HTTPS. Your site URL will be something like:
https://your-app-name.netlify.app

The app should work immediately because:
- Your API_BASE_URL already uses https (not http)
- The config.js file is included in your deployment
- No build step is required

Deploying to Vercel

Step 1: Push Your Code to GitHub
Ensure all files are committed and pushed.

Step 2: Import to Vercel
1. Go to vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Select your WeatherHub project

Step 3: Configure Project Settings
- Framework Preset: Other (or leave as detected)
- Build Command: Leave empty
- Output Directory: Leave empty or use .
- Install Command: Leave empty

Step 4: Deploy
Click "Deploy" and wait for the build to complete.

Common Deployment Issues and Solutions

Issue 1: Blank Page or 7-Day Forecast Not Showing

Solution: Check the browser console for errors
1. Open your deployed site
2. Press F12 or right-click and select "Inspect"
3. Go to the "Console" tab
4. Look for red error messages

If you see "Mixed Content" errors:
- Your config.js should already use https://api.weatherapi.com
- Make sure you didn't hardcode http:// anywhere in script.js

If you see "401 Unauthorized" or "403 Forbidden":
- Your API key might be invalid or rate-limited
- Get a new key from weatherapi.com if needed

Issue 2: Config.js Not Loading

Solution: Verify file structure
Make sure your deployed files include:
- index.html
- style.css
- script.js
- config.js (this is critical!)

Check the HTML file includes both scripts in order:
```html
<script src="config.js"></script>
<script src="script.js"></script>
```

Issue 3: API Rate Limiting

WeatherAPI free tier allows:
- 1,000,000 calls per month
- That's about 33,000 per day

If you exceed this, you'll see errors. Monitor your usage in the WeatherAPI dashboard.

Issue 4: Favorites Not Working

Favorites use localStorage which works fine in all browsers. If they're not saving:
1. Check browser console for errors
2. Make sure localStorage is not blocked by browser privacy settings
3. Try in incognito/private mode to test

Security Best Practices for Production

While your current setup works, here are recommendations for a production app:

1. Use Environment Variables (Advanced)
Instead of committing config.js with the API key, use build-time environment variables:

For Netlify:
- Go to Site Settings > Environment Variables
- Add: WEATHER_API_KEY = your_key_here
- Update your code to read from process.env (requires a build step)

For Vercel:
- Go to Project Settings > Environment Variables
- Add: WEATHER_API_KEY = your_key_here
- Same code update needed

2. Use a Backend Proxy (Recommended for Production)
Create a serverless function that:
- Stores the API key securely on the server
- Your frontend calls your function, not WeatherAPI directly
- Your function forwards requests to WeatherAPI

This prevents:
- API key exposure in client code
- Direct API calls that can be abused
- Rate limit issues from malicious users

Quick Verification Checklist

Before deploying, verify:
- [ ] All files are committed to Git
- [ ] config.js exists and uses https://
- [ ] index.html loads config.js before script.js
- [ ] .gitignore is properly configured
- [ ] You have a valid WeatherAPI key
- [ ] The app works on localhost

After deploying, test:
- [ ] Site loads without errors
- [ ] Search for different cities works
- [ ] 7-day forecast displays correctly
- [ ] Favorites can be added and removed
- [ ] All weather details show correctly
- [ ] Responsive design works on mobile

Getting Help

If you encounter issues:

1. Check browser console for specific errors
2. Verify the API is responding: Visit this URL in your browser
   https://api.weatherapi.com/v1/forecast.json?key=YOUR_KEY&q=London&days=7&aqi=yes
   (Replace YOUR_KEY with your actual key)
3. Check Netlify/Vercel deployment logs
4. Ensure all files deployed correctly

Your app should work perfectly on both platforms since it's already configured correctly with HTTPS and the forecast endpoint!
