# RAGfolio - Render Deployment Guide

## Production Infrastructure

### Deployed Services

- **Database**: PostgreSQL (dpg-d4ir3cgdl3ps73dedu40-a)
- **Parser Service**: <https://ragfolio-parser.onrender.com>
- **Backend Service**: <https://ragfolio-backend.onrender.com>
- **Frontend Service**: <https://ragfolio-yxqd.onrender.com>

## Deployment Process

### 1. Push Code to GitHub

Render automatically deploys from your GitHub repository:

```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

Each push triggers automatic builds on all Render services.

### 2. Configure Environment Variables

#### Database Service (PostgreSQL)

No configuration needed. Render provides:

- **Database Name**: ragfolio
- **User**: priyanshu
- **Password**: (auto-generated)
- **Internal URL**: Use this for backend connection

#### Backend Service

Set these environment variables in Render dashboard:

```env
DATABASE_URL=postgresql://priyanshu:PASSWORD@dpg-d4ir3cgdl3ps73dedu40-a/ragfolio
PARSER_SERVICE_URL=https://ragfolio-parser.onrender.com
JWT_SECRET=your-production-secret-key
OPENAI_API_KEY=your-openai-api-key
PORT=3000
NODE_ENV=production
```

**Build Command**: `npm install && npm run build`  
**Start Command**: `npm start`

#### Parser Service

Set these environment variables:

```env
PORT=8001
```

**Build Command**: `pip install -r requirements.txt`  
**Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8001`

#### Frontend Service

Set these environment variables:

```env
VITE_API_URL=https://ragfolio-backend.onrender.com
```

**Build Command**: `npm install && npm run build`  
**Start Command**: `npm run preview`

### 3. Database Setup

Connect to Render PostgreSQL and run the schema:

**Option 1: Using psql locally**

```powershell
# Get External Database URL from Render dashboard
psql postgresql://priyanshu:PASSWORD@dpg-d4ir3cgdl3ps73dedu40-a.oregon-postgres.render.com/ragfolio -f setup_database.sql
```

**Option 2: Using Render Shell**

1. Go to Database service in Render dashboard
2. Click "Shell" tab
3. Copy and paste contents of `setup_database.sql`
4. Execute

### 4. Verify Deployment

Check each service:

**Parser Health Check:**

```powershell
curl https://ragfolio-parser.onrender.com/health
```

Expected: `{"status":"healthy"}`

**Backend Health Check:**

```powershell
curl https://ragfolio-backend.onrender.com/health
```

**Frontend:**

Open <https://ragfolio-yxqd.onrender.com> in browser.

## Monitoring

### Check Build Logs

1. Go to Render dashboard
2. Select service (Backend/Parser/Frontend)
3. Click "Logs" tab
4. Filter by "Events" or "Deploys"

### Common Build Issues

#### Backend Build Fails

**Error**: TypeScript type definitions missing

**Solution**: Already fixed - all @types packages in package.json

#### Parser Build Fails

**Error**: pydantic-core compilation error

**Solution**: Already fixed - using pydantic==2.5.0 (prebuilt wheels)

#### Frontend Build Fails

**Error**: Environment variable not set

**Solution**: Ensure `VITE_API_URL` is set in Render dashboard

### Runtime Issues

#### Database Connection Errors

- Verify `DATABASE_URL` uses Internal Database URL
- Check if database schema is created
- Ensure database service is running

#### CORS Errors

- Backend CORS is configured for all origins
- Check browser console for specific error
- Verify `VITE_API_URL` points to correct backend URL

#### Parser Not Responding

- Check Parser service logs
- Verify `PARSER_SERVICE_URL` in backend matches Parser service URL
- Test Parser health endpoint

## Updating Deployment

### Code Changes

1. Make changes locally
2. Test locally using `start-production.ps1`
3. Commit and push to GitHub:

   ```powershell
   git add .
   git commit -m "Update message"
   git push origin main
   ```

4. Render auto-deploys within 2-5 minutes

### Environment Variable Changes

1. Go to Render dashboard
2. Select service
3. Click "Environment" tab
4. Update variable
5. Click "Save Changes"
6. Service auto-restarts

### Database Schema Changes

1. Update `setup_database.sql` locally
2. Connect to Render PostgreSQL
3. Run migration:

   ```powershell
   psql EXTERNAL_DATABASE_URL -f setup_database.sql
   ```

## Troubleshooting

### Build Failures

**Check build logs** in Render dashboard:

- Look for dependency installation errors
- Check for TypeScript compilation errors
- Verify Python package compatibility

### Service Crashes

**Check runtime logs**:

1. Go to service in Render dashboard
2. Click "Logs" tab
3. Look for error messages
4. Check memory usage (free tier has limits)

### Database Connection Issues

**Verify connection string**:

- Use Internal URL for backend (faster)
- Use External URL for local connections
- Check password is correct
- Ensure database service is running

### Performance Issues

Render free tier services:

- Spin down after 15 minutes of inactivity
- Take 30-60 seconds to spin up on first request
- Limited CPU/memory resources

**Solution**: Upgrade to paid tier for production use.

## Cost Optimization

### Free Tier Limits

- 750 hours/month per service
- Services spin down after inactivity
- Slower performance than paid tiers

### Recommendations

For production deployment:

1. Upgrade database to paid tier (persistent, faster)
2. Consider upgrading backend (most used service)
3. Frontend can stay on free tier (static build)
4. Parser can stay on free tier (low usage)

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong OpenAI API key
- [ ] Rotate database password
- [ ] Enable Render 2FA
- [ ] Review CORS configuration
- [ ] Check rate limiting settings
- [ ] Monitor API usage
- [ ] Set up error tracking (Sentry, etc.)

## Backup Strategy

### Database Backups

Render PostgreSQL (free tier):

- No automatic backups
- Manual backup:

  ```powershell
  pg_dump EXTERNAL_DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```

### Code Backups

- Primary: GitHub repository
- Keep local copies
- Tag releases: `git tag v1.0.0 && git push origin v1.0.0`

## Support

### Render Support

- Free tier: Community support only
- Paid tier: Email support
- Status page: <https://status.render.com>

### Application Issues

- Check service logs first
- Review error messages
- Test locally to isolate issue
- Check GitHub commits for breaking changes
