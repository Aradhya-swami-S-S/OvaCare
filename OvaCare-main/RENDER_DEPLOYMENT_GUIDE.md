# OvaCare Render Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Set up a free MongoDB Atlas cluster

## Deployment Steps

### 1. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Connect Repository**:
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**:
   - Set `MONGODB_URI` to your Atlas connection string
   - Other variables will be auto-generated

#### Option B: Manual Deployment

1. **Deploy Frontend**:
   - New → Static Site
   - Connect repository
   - Build Command: `cd frontend && npm ci && npm run build`
   - Publish Directory: `frontend/dist`

2. **Deploy Backend**:
   - New → Web Service
   - Connect repository
   - Build Command: `cd backend && npm ci`
   - Start Command: `cd backend && npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ML_API_URL=https://your-ml-api-url.onrender.com
     FRONTEND_URL=https://your-frontend-url.onrender.com
     ```

3. **Deploy ML API**:
   - New → Web Service
   - Connect repository
   - Build Command: `cd pcos-ml-api && pip install -r requirements.txt`
   - Start Command: `cd pcos-ml-api && python app.py`
   - Environment Variables:
     ```
     FLASK_ENV=production
     ```

### 3. Update URLs After Deployment

After all services are deployed, update the environment variables with actual URLs:

1. **Backend Environment Variables**:
   - `ML_API_URL`: https://your-ml-api-service.onrender.com
   - `FRONTEND_URL`: https://your-frontend-service.onrender.com

2. **Frontend Environment Variables**:
   - `VITE_API_URL`: https://your-backend-service.onrender.com
   - `VITE_ML_API_URL`: https://your-ml-api-service.onrender.com
   - `VITE_SOCKET_URL`: https://your-backend-service.onrender.com

### 4. Database Setup

After deployment, seed your database:

1. Go to your backend service logs
2. The app will automatically connect to MongoDB
3. Optionally, run the seed script: `npm run seed`

## Service URLs Structure

Your deployed services will have URLs like:
- Frontend: `https://ovacare-frontend.onrender.com`
- Backend: `https://ovacare-backend.onrender.com`
- ML API: `https://ovacare-ml-api.onrender.com`

## Important Notes

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month limit across all services

### Performance Tips
1. **Keep Services Warm**: Use a service like UptimeRobot to ping your services
2. **Optimize Images**: Compress ML model files if possible
3. **Database Indexing**: Add indexes to frequently queried fields

### Troubleshooting

1. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json/requirements.txt

2. **Connection Issues**:
   - Verify environment variables are set correctly
   - Check service URLs are updated after deployment

3. **ML API Issues**:
   - ML models might take time to load on first request
   - Consider using lighter models for faster startup

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ovacare
JWT_SECRET=your-secure-jwt-secret
ML_API_URL=https://ovacare-ml-api.onrender.com
FRONTEND_URL=https://ovacare-frontend.onrender.com
GROQ_API_KEY=optional-groq-api-key
```

### Frontend (.env)
```
VITE_API_URL=https://ovacare-backend.onrender.com
VITE_ML_API_URL=https://ovacare-ml-api.onrender.com
VITE_SOCKET_URL=https://ovacare-backend.onrender.com
```

## Post-Deployment Testing

1. **Frontend**: Visit your frontend URL and test user registration
2. **Backend**: Test API endpoints via frontend
3. **ML API**: Upload an ultrasound image to test PCOS detection
4. **Real-time Chat**: Test the community chat feature
5. **Database**: Verify data persistence

## Monitoring

- Use Render's built-in logs and metrics
- Set up alerts for service downtime
- Monitor database usage in MongoDB Atlas

## Support

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables
3. Test individual services using their direct URLs
4. Check MongoDB Atlas connection and IP whitelist

Your OvaCare application should now be fully deployed and accessible via the web! 🎉