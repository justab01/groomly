#!/bin/bash

# Groomly Self-Hosted Deployment Script
# Run this on your VPS (DigitalOcean, Linode, Hetzner, etc.)

set -e

echo "🐕 Groomly Self-Hosted Deployment"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and back in."
    exit 1
fi

echo "✅ Docker is installed"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys"
    echo ""
    echo "Required variables:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    echo "  - RESEND_API_KEY"
    echo "  - NEXT_PUBLIC_APP_URL (your domain)"
    echo ""
    read -p "Press Enter after you've updated .env..."
fi

# Build and start services
echo ""
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your app is running at: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f     # View logs"
echo "  docker-compose stop        # Stop services"
echo "  docker-compose restart     # Restart services"
echo "  docker-compose ps          # Check status"
echo ""
echo "To set up SSL with Let's Encrypt:"
echo "  sudo apt install certbot"
echo "  sudo certbot certonly --standalone -d your-domain.com"
echo ""
