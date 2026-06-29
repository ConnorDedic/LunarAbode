# Portfolio + Edgerunners BBS

A personal portfolio site for an offensive security researcher. Features a clean, recruiter-friendly front page on the clearnet with a full-screen BBS interface (Cyberpunk: Edgerunners aesthetic) for blog posts, projects, and extras.

## Features

- **Clearnet Front Page**: Professional, fast-loading resume + contact section. No tricks, no nonsense.
- **BBS Modal**: Full-screen keyboard-driven interface for blog, file area, projects, and extras.
- **Static Build**: Entire site is pre-built static HTML/CSS. No server-side execution.
- **Containerized**: Docker image in ghcr.io, deploy with `docker compose pull && up -d`.
- **Automated**: GitHub Actions builds on main branch push, automatically deploys to EC2.
- **TLS**: Caddy handles automatic Let's Encrypt certificate provisioning.

## Quick Start (Local Development)

### Prerequisites

- Node.js 22+
- npm
- Docker & Docker Compose (for full stack testing)

### Development

```bash
cd site
npm install
npm run dev
```

Visit `http://localhost:4321` and click **DIAL IN** to enter the BBS.

### Build for Production

```bash
cd site
npm run build
```

Output is in `site/dist/`.

### Test Full Stack Locally

```bash
docker compose up -d
# Visit http://localhost
docker compose down
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete first-boot setup and CI/CD instructions.

### One-Liner Deployment (After Initial Setup)

```bash
docker compose pull && docker compose up -d
```

## Project Structure

```
portfolio/
├── site/                      # Astro project
│   ├── src/
│   │   └── pages/index.astro  # Front page + BBS
│   ├── public/
│   │   └── resume.txt
│   └── dist/                  # Built output (production)
├── Dockerfile                 # Multi-stage: Node → nginx:alpine
├── docker-compose.yml         # Services: site, caddy
├── Caddyfile                  # Reverse proxy + TLS
├── nginx.conf                 # Nginx config (in container)
├── .github/workflows/deploy.yml
└── DEPLOYMENT.md
```

## Content

### Front Page

- **Resume**: Inline highlights + downloadable PDF
- **Contact**: Email, GitHub, LinkedIn, Gitea link
- **DIAL IN Button**: Triggers BBS takeover

### BBS Menu

```
[1] MESSAGE BOARD  — Blog posts
[2] FILE AREA      — Resume, writeups, project links
[3] PROJECTS       — Bio + Gitea project index
[4] GUESTBOOK      — Static/read-only placeholder
[5] WHO'S ONLINE    — Flavor (static list)
[0] LOG OFF         — Return to clearnet
```

### Blog Posts

Posts are markdown files in `site/src/content/blog/`. Schema:

```yaml
---
title: "Post Title"
description: "Optional description"
pubDate: 2026-06-12
tags: ["tag1", "tag2"]
draft: false  # Drafts don't publish
---
```

## Styling

**Edgerunners Palette**:
- `--bg: #0a0a0f` (near-black)
- `--fg: #e8e6d8` (warm off-white)
- `--accent-yellow: #fcee0a` (primary)
- `--accent-magenta: #ff2e88` (secondary)
- `--accent-cyan: #00e5ff` (secondary)

BBS uses monospace font (system Courier); front page uses system sans-serif for readability.

## Non-Goals / Guardrails

- ✅ No fake login forms, credential phishing, or live exploits
- ✅ No browser storage abuse, auto-downloads, or AV evasion
- ✅ Guestbook is read-only in v1
- ✅ Front page stands alone (no BBS required to find contact info)

## Infrastructure

- **Registry**: ghcr.io (GitHub Container Registry)
- **Host**: AWS t2.micro (1 GB RAM)
- **CI**: GitHub Actions
- **TLS**: Caddy (auto Let's Encrypt)
- **Self-hosted Git**: Gitea (optional, for project repos)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for setup details.

## License

Personal portfolio — customize as needed.
