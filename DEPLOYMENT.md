# Deployment Guide

This portfolio site is designed for portability across AWS accounts. The entire deployment is containerized and automated via GitHub Actions.

## Architecture

- **Build**: GitHub Actions builds the Astro site and creates a Docker image (pushed to ghcr.io).
- **Deploy Target**: AWS t2.micro instance (1 GB RAM).
- **Runtime**: Docker Compose running two containers:
  - `site` — nginx serving static Astro build
  - `caddy` — TLS termination + reverse proxy (auto Let's Encrypt)

## First-Boot Setup (Fresh EC2 Instance)

### 1. Launch Instance

- **AMI**: Ubuntu 24.04 LTS (latest)
- **Instance Type**: t2.micro
- **Storage**: 20 GB gp3
- **Security Group**: Allow inbound 22 (SSH, restrict to your IP), 80, 443

### 2. Initial Server Setup

```bash
# SSH into the instance
ssh -i your-key.pem ubuntu@<instance-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo bash

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Add user to docker group (optional, for non-root docker commands)
sudo usermod -aG docker ubuntu
```

### 3. Clone Repo & Configure

```bash
# Create working directory
cd ~
mkdir -p portfolio && cd portfolio

# Copy docker-compose.yml, Caddyfile, and nginx.conf to the instance
# You can use scp or store these separately

# Create .env file (optional, for sensitive data)
cat > .env << 'EOF'
GITHUB_TOKEN=<your-ghcr-token>
EOF
```

### 4. Configure Caddy & DNS

Edit `Caddyfile` with your domain:

```
yourdomain.com {
    reverse_proxy site:80
}
```

Point DNS A record:
- `yourdomain.com` → instance IP

### 5. Start Containers

```bash
# Log in to ghcr.io (use a PAT with read:packages scope)
docker login ghcr.io

# Pull and start
docker compose pull
docker compose up -d

# Verify
docker compose ps
```

Caddy will automatically provision Let's Encrypt certificates for your domains.

## CI/CD Pipeline

### GitHub Secrets Required

Set these in your GitHub repository settings:

- `EC2_HOST` — instance IP or domain
- `EC2_USER` — SSH user (usually `ubuntu`)
- `EC2_SSH_KEY` — SSH private key (PEM format)

### Deployment Flow

1. **Push to main** → GitHub Actions triggered
2. **Build** — `npm run build` (Astro)
3. **Docker Build & Push** — image tagged with branch + commit SHA
4. **Deploy** — SSH to EC2, `docker compose pull && docker compose up -d`

### Monitoring Deployments

```bash
# Check workflow status
gh workflow view deploy.yml --repo yourusername/portfolio

# SSH to instance and check containers
docker compose logs -f site
docker compose logs -f caddy
docker compose logs -f gitea
```

## Troubleshooting

### Container won't start

```bash
docker compose logs <service-name>
docker compose up <service-name>
```

### Caddy can't get certificate

- Check DNS propagation: `nslookup yourdomain.com`
- Check Caddy logs: `docker compose logs caddy`
- Ensure port 80/443 are open in security group

## Updates & Maintenance

### Updating the site

Push changes to main branch. CI/CD pipeline will build and deploy automatically.

## Costs

On AWS:
- **t2.micro**: ~$5/month (free tier eligible for 12 months)
- **EBS (20 GB gp3)**: ~$1.50/month
- **Data transfer**: minimal for a portfolio site
- **Total**: ~$7/month after free tier

## Security Notes

- All traffic is TLS-encrypted via Caddy
- Gitea registration disabled by default
- SSH key required for EC2 access
- Nothing executes user input (static site + read-only BBS)
- Consider WAF or security group restrictions if needed
