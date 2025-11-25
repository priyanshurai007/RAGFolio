# 🚀 RAGfolio - Quick Deployment Guide

## ✅ Project Status: PRODUCTION-READY

Your RAGfolio project is now cleaned and structured for deployment!

---

## 📁 Project Structure

```
RAGfolio/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth & error handling
│   │   └── config/      # Configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/            # React + Vite UI
│   ├── src/
│   │   ├── pages/      # Login, Upload, Chat, Profile
│   │   ├── components/ # ProfileAnalysis, AuthenticityReport
│   │   ├── store/      # State management (Zustand)
│   │   └── lib/        # API client
│   ├── package.json
│   └── vite.config.ts
│
├── parser/              # Python FastAPI service
│   ├── app/
│   │   ├── main.py              # API endpoints
│   │   ├── parser.py            # PDF/DOCX parsing
│   │   ├── link_extractor.py   # Hyperlink extraction
│   │   ├── profile_analyzer.py # GitHub/LinkedIn analysis
│   │   └── section_detector.py # Resume section detection
│   └── requirements.txt
│
├── .env                 # Environment variables (create this!)
├── .gitignore          # Git ignore rules
├── docker-compose.yml  # Docker orchestration
├── setup_database.sql  # PostgreSQL schema
├── README.md           # Main documentation
├── DEPLOYMENT.md       # Deployment instructions
├── start-production.ps1 # Windows start script
└── start-production.sh  # Linux/Mac start script
```

---

## 🎯 3 Ways to Deploy

### 1️⃣ Docker (Easiest - Recommended for Production)

```bash
# 1. Create .env file
cp .env.example .env
# Edit .env with your values

# 2. Build and run
docker-compose up -d

# 3. Check status
docker-compose ps
docker-compose logs -f

# Access: http://localhost:5173
```

**Pros:** One command, isolated, portable  
**Cons:** Requires Docker installed

---

### 2️⃣ Local Development (Fastest for Testing)

**Windows:**
```powershell
# Run the start script
.\start-production.ps1
```

**Linux/Mac:**
```bash
chmod +x start-production.sh
./start-production.sh
```

**Manual (3 terminals):**

Terminal 1 - Parser:
```bash
cd parser
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

**Pros:** Fast iteration, easy debugging  
**Cons:** Need to manage 3 processes

---

### 3️⃣ Cloud Platform (Best for Public Access)

#### Option A: Render (Free Tier Available)

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Create 3 Web Services:
   - **Parser:** Python, `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Backend:** Node, `npm start`
   - **Frontend:** Static Site, build: `npm run build`, publish: `dist`
4. Add PostgreSQL database
5. Set environment variables

#### Option B: Vercel + Railway

- **Frontend on Vercel:** `vercel --prod` (in frontend/)
- **Backend + Parser on Railway:** Connect GitHub repo
- **Database:** Railway PostgreSQL addon

#### Option C: AWS/Azure/GCP

See `DEPLOYMENT.md` for detailed instructions

---

## 🔑 Environment Variables

Create `.env` file in root:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ragfolio

# OpenAI (Required)
OPENAI_API_KEY=sk-proj-your-key-here

# JWT Secret (Generate: openssl rand -base64 32)
JWT_SECRET=your-secure-random-string-here

# Services
PARSER_SERVICE_URL=http://127.0.0.1:8001
PORT=3000

# Vector Database
VECTOR_DB_PROVIDER=faiss
SIMILARITY_THRESHOLD=0.2

# RAG Configuration
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K=5
```

---

## 📋 Pre-Deployment Checklist

### ✅ Before First Run

- [ ] PostgreSQL 16+ installed
- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] OpenAI API key obtained
- [ ] `.env` file created with all variables
- [ ] Database created: `CREATE DATABASE ragfolio;`
- [ ] Database schema loaded: `psql -U postgres -d ragfolio -f setup_database.sql`

### ✅ Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Parser
cd parser && pip install -r requirements.txt
```

### ✅ Test Services

```bash
# Test Parser
curl http://127.0.0.1:8001/health
# Should return: {"status":"healthy","service":"parser"}

# Test Backend
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# Test Frontend
# Open: http://localhost:5173
```

---

## 🎨 Key Features Implemented

### ✅ Core Features
- Resume upload (PDF/DOCX)
- PDF text extraction with pdfplumber
- Section detection (Education, Experience, Skills, Projects)
- Vector embedding with OpenAI
- FAISS vector storage with persistence
- RAG-based Q&A with GPT-4o-mini
- User authentication (JWT)
- PostgreSQL database

### ✅ Advanced Features (UNIQUE!)
- **Hyperlink extraction from PDFs** - Solves LaTeX/Word resume issue
- **GitHub profile analysis** - Repos, stars, commits, languages, activity
- **LeetCode profile verification** - Problems solved
- **LinkedIn profile check** - Accessibility verification  
- **Portfolio analysis** - Technology detection
- **Authenticity scoring** - Resume claim verification
- **Profile dashboard** - Visual display of all findings

---

## 🐛 Troubleshooting

### Parser won't start
```bash
# Check Python
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r parser/requirements.txt

# Check port
netstat -ano | findstr :8001  # Windows
lsof -i :8001  # Linux/Mac
```

### Backend connection errors
```bash
# Check PostgreSQL
psql -U postgres -d ragfolio -c "SELECT 1;"

# Verify .env DATABASE_URL
# Check backend/src/config/index.ts

# Check port
netstat -ano | findstr :3000  # Windows
```

### Frontend build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Resumes
- `POST /api/resumes/upload` - Upload resume (multipart/form-data)
- `GET /api/resumes` - List user's resumes
- `GET /api/resumes/:id` - Get resume with profile analysis
- `POST /api/resumes/:id/query` - Ask questions about resume
- `GET /api/resumes/:id/authenticity` - Get authenticity report
- `DELETE /api/resumes/:id` - Delete resume

---

## 🔒 Security Notes

- JWT tokens for authentication
- Passwords hashed with bcrypt
- SQL injection protection
- File upload validation
- CORS configured
- Rate limiting recommended for production

---

## 📈 Next Steps (Optional Enhancements)

1. **Caching:** Add Redis for faster responses
2. **CDN:** Use Cloudflare for static assets
3. **Monitoring:** Add Sentry for error tracking
4. **Analytics:** Implement user activity tracking
5. **Email:** Add email verification
6. **Export:** PDF report generation
7. **Sharing:** Public resume links
8. **Mobile:** Responsive design improvements

---

## 💡 Tips

- Keep `.env` file secure (never commit to git)
- Use environment-specific configs for dev/prod
- Monitor OpenAI API usage and costs
- Backup database regularly
- Set up SSL/HTTPS for production
- Use PM2 or systemd for process management
- Configure log rotation
- Set up health checks and alerts

---

## 📞 Support

- Check `DEPLOYMENT.md` for detailed deployment guides
- See `README.md` for feature documentation
- Review logs in each service for errors
- Test with `curl` commands to isolate issues

---

## 🎉 You're Ready!

Your RAGfolio project is now:
- ✅ Cleaned of unnecessary files
- ✅ Properly structured
- ✅ Production-ready
- ✅ Deployment scripts included
- ✅ Documentation complete

**Start now:** `.\start-production.ps1` (Windows) or `./start-production.sh` (Linux/Mac)

**Deploy now:** `docker-compose up -d`

---

## ☁️ AWS Deployment Steps (Complete Guide)

### Prerequisites
- AWS Account (sign up at aws.amazon.com)
- AWS CLI installed: `winget install Amazon.AWSCLI`
- Credit card (AWS Free Tier available)

### Step 1: Install AWS CLI & Configure

```powershell
# Install AWS CLI
winget install Amazon.AWSCLI

# Configure credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output: json
```

**Get AWS Credentials:**
1. Go to AWS Console → IAM
2. Create new user with `AdministratorAccess`
3. Create access key → Copy keys

### Step 2: Create RDS PostgreSQL Database

```powershell
# Create database
aws rds create-db-instance `
  --db-instance-identifier ragfolio-db `
  --db-instance-class db.t3.micro `
  --engine postgres `
  --master-username postgres `
  --master-user-password YourStrongPassword123! `
  --allocated-storage 20 `
  --publicly-accessible `
  --backup-retention-period 7

# Wait 5-10 minutes for creation
aws rds describe-db-instances --db-instance-identifier ragfolio-db

# Get endpoint URL (save this)
```

**Connect & Setup Database:**
```powershell
# Install pgAdmin or use psql
psql -h your-rds-endpoint.amazonaws.com -U postgres -d postgres
# Enter password
CREATE DATABASE ragfolio;
\c ragfolio
# Copy and paste contents of setup_database.sql
```

### Step 3: Deploy Backend (Elastic Beanstalk)

```powershell
cd backend

# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
eb init -p node.js-18 ragfolio-backend --region us-east-1

# Create environment
eb create ragfolio-backend-env

# Set environment variables
eb setenv `
  DATABASE_URL=postgresql://postgres:YourPassword@your-rds-endpoint:5432/ragfolio `
  OPENAI_API_KEY=your-openai-key `
  JWT_SECRET=your-jwt-secret `
  PARSER_SERVICE_URL=http://your-parser-url:8001 `
  NODE_ENV=production

# Deploy
eb deploy

# Get URL
eb open
```

### Step 4: Deploy Parser (Elastic Beanstalk - Python)

```powershell
cd ..\parser

# Initialize EB for Python
eb init -p python-3.9 ragfolio-parser --region us-east-1

# Create Procfile for EB
@"
web: uvicorn app.main:app --host 0.0.0.0 --port 8080
"@ | Out-File -FilePath Procfile -Encoding ASCII

# Create environment
eb create ragfolio-parser-env

# Deploy
eb deploy

# Get parser URL
eb open
# Save this URL (e.g., http://ragfolio-parser-env.us-east-1.elasticbeanstalk.com)
```

**Update Backend with Parser URL:**
```powershell
cd ..\backend
eb setenv PARSER_SERVICE_URL=http://your-parser-url.elasticbeanstalk.com
eb deploy
```

### Step 5: Deploy Frontend (S3 + CloudFront)

```powershell
cd ..\frontend

# Update API URL in .env
@"
VITE_API_URL=http://your-backend-url.elasticbeanstalk.com
"@ | Out-File -FilePath .env.production -Encoding UTF8

# Build
npm run build

# Create S3 bucket
$BUCKET_NAME = "ragfolio-frontend-$(Get-Random)"
aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Configure for static website
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Upload files
aws s3 sync dist/ s3://$BUCKET_NAME --acl public-read

# Create CloudFront distribution (optional, for HTTPS & CDN)
aws cloudfront create-distribution `
  --origin-domain-name $BUCKET_NAME.s3.amazonaws.com `
  --default-root-object index.html

# Access your site
Write-Output "Frontend URL: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
```

### Step 6: Configure Security Groups

```powershell
# Get RDS security group ID
$RDS_SG = aws rds describe-db-instances --db-instance-identifier ragfolio-db --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' --output text

# Allow backend to access RDS
aws ec2 authorize-security-group-ingress `
  --group-id $RDS_SG `
  --protocol tcp `
  --port 5432 `
  --source-group <backend-security-group-id>
```

### Quick AWS Deployment (Alternative - Using Docker on EC2)

```powershell
# 1. Launch EC2 instance
aws ec2 run-instances `
  --image-id ami-0c55b159cbfafe1f0 `
  --instance-type t3.medium `
  --key-name your-key-pair `
  --security-group-ids sg-xxxxxxxx `
  --user-data file://ec2-user-data.sh

# 2. Create ec2-user-data.sh:
@"
#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone and run
cd /home/ec2-user
git clone <your-repo-url> ragfolio
cd ragfolio
docker-compose up -d
"@ | Out-File -FilePath ec2-user-data.sh -Encoding UTF8

# 3. SSH into instance
ssh -i your-key.pem ec2-user@<instance-ip>

# 4. Configure .env and restart
cd ragfolio
nano .env
docker-compose restart
```

### Cost Estimate (AWS Free Tier)
- **RDS db.t3.micro:** Free for 12 months (750 hrs/month)
- **EC2 t3.micro:** Free for 12 months (750 hrs/month)
- **S3:** 5GB free forever
- **Elastic Beanstalk:** No additional charge
- **CloudFront:** 50GB/month free for 12 months

**Total: ~$0-5/month** (after free tier: ~$20-30/month)

### Monitoring & Logs

```powershell
# Backend logs
cd backend
eb logs

# Parser logs
cd parser
eb logs

# Check status
eb status
```

### Cleanup (Stop Costs)

```powershell
# Delete Elastic Beanstalk environments
eb terminate ragfolio-backend-env
cd ..\parser
eb terminate ragfolio-parser-env

# Delete RDS
aws rds delete-db-instance --db-instance-identifier ragfolio-db --skip-final-snapshot

# Delete S3 bucket
aws s3 rb s3://$BUCKET_NAME --force
```

### Troubleshooting

**Backend can't connect to RDS:**
- Check security groups allow port 5432
- Verify DATABASE_URL is correct
- Check RDS is publicly accessible

**Parser service crashes:**
- Check `eb logs` for errors
- Verify all dependencies in requirements.txt
- Check Python version matches

**Frontend shows API errors:**
- Update VITE_API_URL in .env.production
- Rebuild: `npm run build`
- Re-upload to S3

---

Good luck with your interviews! 🚀
