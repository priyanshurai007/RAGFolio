# RAGfolio Deployment Guide

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

**Prerequisites:**
- Docker & Docker Compose installed

**Steps:**

1. **Prepare environment:**
```bash
cp .env.example .env
# Edit .env with your production values
```

2. **Build and run:**
```bash
docker-compose up -d
```

3. **Check status:**
```bash
docker-compose ps
docker-compose logs -f
```

4. **Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Parser API: http://localhost:8001

---

### Option 2: Manual Server Deployment

#### A. Backend Deployment (Node.js)

**On Ubuntu/Debian:**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Setup database
sudo -u postgres psql
CREATE DATABASE ragfolio;
\q

# Clone and setup
git clone <your-repo>
cd RAGfolio/backend
npm install
npm run build

# Setup environment
cp ../.env.example ../.env
# Edit .env with production values

# Run with PM2
npm install -g pm2
pm2 start dist/index.js --name ragfolio-backend
pm2 save
pm2 startup
```

#### B. Parser Deployment (Python)

```bash
# Install Python 3.9+
sudo apt-get install python3 python3-pip python3-venv

# Setup parser
cd RAGfolio/parser
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with systemd
sudo nano /etc/systemd/system/ragfolio-parser.service
```

**Service file content:**
```ini
[Unit]
Description=RAGfolio Parser Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/RAGfolio/parser
Environment="PATH=/path/to/RAGfolio/parser/venv/bin"
ExecStart=/path/to/RAGfolio/parser/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable ragfolio-parser
sudo systemctl start ragfolio-parser
sudo systemctl status ragfolio-parser
```

#### C. Frontend Deployment

**Build for production:**
```bash
cd frontend
npm install
npm run build
```

**Option 1: Serve with Nginx**

```bash
sudo apt-get install nginx

# Copy build to nginx
sudo cp -r dist/* /var/www/html/

# Configure nginx
sudo nano /etc/nginx/sites-available/ragfolio
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ragfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Option 2: Serve with Node.js**

```bash
npm install -g serve
pm2 start "serve -s dist -p 5173" --name ragfolio-frontend
```

---

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Render (Full Stack)

1. Connect your GitHub repo
2. Add three services:
   - **Frontend:** Static Site (build: `npm run build`, publish: `dist`)
   - **Backend:** Web Service (build: `npm install && npm run build`, start: `npm start`)
   - **Parser:** Web Service (build: `pip install -r requirements.txt`, start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
3. Add PostgreSQL database
4. Configure environment variables

#### Railway

1. Connect GitHub repo
2. Add services for frontend, backend, parser
3. Add PostgreSQL plugin
4. Deploy automatically on push

#### Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Create apps
heroku create ragfolio-backend
heroku create ragfolio-parser

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a ragfolio-backend

# Configure
heroku config:set OPENAI_API_KEY=your_key -a ragfolio-backend
heroku config:set PARSER_SERVICE_URL=https://ragfolio-parser.herokuapp.com -a ragfolio-backend

# Deploy backend
git subtree push --prefix backend heroku-backend main

# Deploy parser
git subtree push --prefix parser heroku-parser main
```

---

## 🔐 Production Checklist

### Environment Variables
- [ ] Generate strong JWT_SECRET
- [ ] Use production OpenAI API key
- [ ] Configure production database URL
- [ ] Set NODE_ENV=production
- [ ] Update CORS origins to production URLs

### Security
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS only for your domain
- [ ] Use strong database passwords
- [ ] Backup database regularly

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Enable Redis for caching (optional)
- [ ] Monitor with tools like PM2, New Relic

### Monitoring
- [ ] Set up error logging (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Database backup schedule
- [ ] SSL certificate renewal

---

## 📊 Environment Variables Reference

### Required
```env
DATABASE_URL=postgresql://user:pass@host:5432/ragfolio
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
```

### Optional
```env
PORT=3000
NODE_ENV=production
PARSER_SERVICE_URL=http://parser:8001
VECTOR_DB_PROVIDER=faiss
SIMILARITY_THRESHOLD=0.2
CHUNK_SIZE=500
TOP_K=5
```

---

## 🐛 Troubleshooting

### Parser service crashes
- Check Python version (3.9+)
- Verify all dependencies installed
- Check logs: `journalctl -u ragfolio-parser -f`

### Backend can't connect to database
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify network connectivity
- Check firewall rules

### Frontend can't reach backend
- Update API URLs in frontend `.env`
- Check CORS configuration
- Verify backend is running
- Check proxy settings

### OpenAI API errors
- Verify API key is valid
- Check API quota/billing
- Monitor rate limits
- Check network connectivity

---

## 📞 Support

For deployment issues, check:
1. Service logs
2. Database connectivity
3. Environment variables
4. Port availability
5. Firewall rules

For help: [Create an issue](https://github.com/yourusername/RAGfolio/issues)
