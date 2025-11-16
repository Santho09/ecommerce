# 🚀 Deployment Guide

This guide covers multiple deployment options for your e-commerce application.

## 📋 Pre-Deployment Checklist

Before deploying, make sure to:

1. **Update JWT Secret**: Change the `JWT_SECRET` in `backend/index.js` to a secure random string
2. **Update API URLs**: Change `API_BASE_URL` in frontend files to your production backend URL
3. **Environment Variables**: Set up environment variables for sensitive data
4. **Test Locally**: Ensure everything works in your local environment

## 🔧 Quick Configuration Changes

### 1. Update Backend JWT Secret

Edit `backend/index.js` and replace:
```javascript
const JWT_SECRET = 'your-secret-key-change-in-production';
```

With:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
```

### 2. Update Frontend API URLs

You need to update the API URL in two files:

**`frontend/script.js`** (line 8):
```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

**`frontend/auth.js`** (line 2):
```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) ⭐ Recommended

This is the easiest option for beginners.

#### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Backend**
   - Railway will auto-detect Node.js
   - Set environment variables:
     - `JWT_SECRET`: Generate a secure random string
     - `PORT`: Railway will set this automatically
   - Update `backend/index.js` to use `process.env.PORT`:
     ```javascript
     const PORT = process.env.PORT || 3000;
     ```

4. **Deploy**
   - Railway will automatically deploy
   - Copy your backend URL (e.g., `https://your-app.railway.app`)

#### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Root Directory: Set to `frontend`

3. **Configure Build Settings**
   - Framework Preset: "Other"
   - Build Command: (leave empty)
   - Output Directory: `.` (current directory)

4. **Update API URLs**
   - Before deploying, update `API_BASE_URL` in `frontend/script.js` and `frontend/auth.js` to your Railway backend URL

5. **Deploy**
   - Click "Deploy"
   - Your site will be live at `https://your-app.vercel.app`

---

### Option 2: Netlify (Frontend) + Render (Backend)

#### Deploy Backend to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ecommerce-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Set Environment Variables**
   - Go to "Environment" tab
   - Add:
     - `JWT_SECRET`: Your secure random string
     - `NODE_ENV`: `production`

4. **Update Backend Code**
   - Update `backend/index.js`:
     ```javascript
     const PORT = process.env.PORT || 3000;
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Copy your backend URL (e.g., `https://ecommerce-backend.onrender.com`)

#### Deploy Frontend to Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy Site**
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: (leave empty)
     - **Publish directory**: `frontend`

3. **Update API URLs**
   - Update `API_BASE_URL` in frontend files to your Render backend URL

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `https://your-app.netlify.app`

---

### Option 3: Full Stack on Vercel

Vercel supports full-stack deployments with serverless functions.

1. **Create `vercel.json`** in project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/index.js",
         "use": "@vercel/node"
       },
       {
         "src": "frontend/**",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/index.js"
       },
       {
         "src": "/(.*)",
         "dest": "frontend/$1"
       }
     ]
   }
   ```

2. **Update Backend for Vercel**
   - Modify `backend/index.js` to export the Express app:
     ```javascript
     module.exports = app;
     ```

3. **Deploy to Vercel**
   - Connect your GitHub repo
   - Vercel will auto-detect and deploy
   - Set `JWT_SECRET` in environment variables

---

### Option 4: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### Prerequisites
- A VPS with Ubuntu/Debian
- Node.js and npm installed
- Nginx (for reverse proxy)
- PM2 (for process management)

#### Steps

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone your repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce.git
   cd ecommerce
   ```

3. **Install dependencies**
   ```bash
   cd backend
   npm install --production
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file
   cd backend
   nano .env
   ```
   Add:
   ```
   JWT_SECRET=your-secure-secret-key
   PORT=3000
   NODE_ENV=production
   ```

5. **Update backend to use .env**
   - Install dotenv: `npm install dotenv`
   - Add to top of `backend/index.js`:
     ```javascript
     require('dotenv').config();
     const JWT_SECRET = process.env.JWT_SECRET;
     const PORT = process.env.PORT || 3000;
     ```

6. **Install PM2**
   ```bash
   npm install -g pm2
   ```

7. **Start backend with PM2**
   ```bash
   cd backend
   pm2 start index.js --name ecommerce-backend
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/ecommerce
   ```
   Add:
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   # Frontend
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       root /path/to/ecommerce/frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

9. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Update frontend API URLs**
    - Update `API_BASE_URL` to `https://api.yourdomain.com`

11. **Set up SSL with Let's Encrypt**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    sudo certbot --nginx -d api.yourdomain.com
    ```

---

### Option 5: Docker Deployment

1. **Create `Dockerfile` in backend directory:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3000
   CMD ["node", "index.js"]
   ```

2. **Create `docker-compose.yml` in project root:**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "3000:3000"
       environment:
         - JWT_SECRET=${JWT_SECRET}
         - NODE_ENV=production
       volumes:
         - ./backend/users.json:/app/users.json
   
     frontend:
       image: nginx:alpine
       ports:
         - "80:80"
       volumes:
         - ./frontend:/usr/share/nginx/html
         - ./nginx.conf:/etc/nginx/conf.d/default.conf
   ```

3. **Create `nginx.conf`:**
   ```nginx
   server {
       listen 80;
       server_name localhost;
       
       location / {
           root /usr/share/nginx/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Deploy:**
   ```bash
   docker-compose up -d
   ```

---

## 🔒 Security Best Practices

1. **Use Environment Variables**
   - Never commit secrets to Git
   - Use `.env` files (add to `.gitignore`)

2. **Enable HTTPS**
   - Always use HTTPS in production
   - Use Let's Encrypt for free SSL certificates

3. **Update CORS Settings**
   - In production, restrict CORS to your frontend domain:
     ```javascript
     app.use(cors({
         origin: 'https://your-frontend-domain.com',
         credentials: true
     }));
     ```

4. **Add Rate Limiting**
   - Install: `npm install express-rate-limit`
   - Add to backend:
     ```javascript
     const rateLimit = require('express-rate-limit');
     const limiter = rateLimit({
         windowMs: 15 * 60 * 1000, // 15 minutes
         max: 100 // limit each IP to 100 requests per windowMs
     });
     app.use('/auth/', limiter);
     ```

5. **Input Validation**
   - Add validation middleware (e.g., `express-validator`)

---

## 📝 Post-Deployment

1. **Test all features:**
   - User registration
   - User login
   - Product browsing
   - Favorites functionality
   - Dashboard access

2. **Monitor your application:**
   - Check server logs
   - Monitor error rates
   - Set up uptime monitoring

3. **Backup:**
   - Regularly backup `backend/users.json` if using file-based storage
   - Consider migrating to a database (MongoDB, PostgreSQL) for production

---

## 🐛 Troubleshooting

### Backend not accessible
- Check firewall settings
- Verify environment variables are set
- Check server logs

### Frontend can't connect to backend
- Verify CORS is configured correctly
- Check API URL is correct
- Ensure backend is running

### 502 Bad Gateway
- Backend might be down
- Check PM2 status: `pm2 status`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Need help?** Check the main README.md for local development setup.

