# Self-Hosting Groomly

**Complete control. No Vercel dependency.**

---

## Option 1: Quick Deploy (Recommended for Starting)

### DigitalOcean Droplet ($6/month)

1. **Create Droplet:**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create Droplet → Ubuntu 22.04 LTS
   - Size: Basic ($6/mo - 1GB RAM is enough to start)
   - Region: Closest to your customers

2. **SSH into server:**
   ```bash
   ssh root@your-server-ip
   ```

3. **Clone and deploy:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Clone your repo
   git clone https://github.com/YOUR_USERNAME/groomly.git
   cd groomly

   # Edit .env with your keys
   cp .env.example .env
   nano .env  # Add your API keys

   # Deploy
   docker-compose up -d --build
   ```

4. **Point your domain:**
   - Buy domain (Namecheap ~$10/year)
   - DNS A record → your-server-ip
   - App is live at your-domain.com

---

## Option 2: Local Development (Free Testing)

Run locally forever if you want:

```bash
# Just keep running:
npm run dev
```

Share via ngrok for testing:
```bash
npm install -g ngrok
ngrok http 3000
```

You get a temporary URL like `https://abc123.ngrok.io`

---

## Option 3: Alternative Hosting (Vercel Alternatives)

| Provider | Price | Notes |
|----------|-------|-------|
| **Railway** | $5/mo | Easy deploy, includes DB |
| **Render** | $7/mo | Similar to Vercel |
| **Fly.io** | $5/mo | Global edge hosting |
| **Hetzner** | $5/mo | Cheap European VPS |
| **Linode** | $5/mo | Reliable VPS |

---

## SSL/HTTPS Setup (Free)

Once deployed, get SSL:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is automatic
```

Update `nginx.conf` to use HTTPS (uncomment the HTTPS block).

---

## Monitoring & Backups

### View Logs
```bash
docker-compose logs -f
docker-compose logs groomly  # App logs only
```

### Backup Database (Supabase handles this)
- Supabase auto-backs up daily
- Download backups: Dashboard → Settings → Database

### Health Check
```bash
curl http://localhost:3000/health
```

---

## Scaling Path

| Stage | Setup | Cost |
|-------|-------|------|
| 0-50 customers | Single $6 droplet | $6/mo |
| 50-200 customers | $12 droplet + CDN | $20/mo |
| 200-500 customers | Load balancer + 2 app servers | $50/mo |
| 500+ customers | Kubernetes or ECS | $200+/mo |

---

## Troubleshooting

### App won't start
```bash
docker-compose logs groomly
# Check for missing env vars or build errors
```

### Out of memory
```bash
# Increase droplet size or add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Domain not working
```bash
# Check DNS propagated
dig your-domain.com

# Should show your server IP
```

---

## Cost Breakdown (Monthly)

| Service | Cost |
|---------|------|
| VPS (DigitalOcean) | $6 |
| Domain (Namecheap) | $1 |
| Supabase (free tier) | $0 |
| Resend (free tier) | $0 |
| Stripe (per transaction) | 2.9% + 30¢ |
| **Total (fixed)** | **~$7/mo** |

**At $39/mo per customer, you need 1 customer to break even.**

---

## Full Ownership Benefits

✅ You control everything
✅ No platform lock-in
✅ Lower costs at scale
✅ Can customize infrastructure
✅ Data sovereignty
✅ No surprise price changes

**This is a real asset you can sell, not a rental.**
