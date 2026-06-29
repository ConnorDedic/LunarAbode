# Next Steps & Polish

The core portfolio + BBS is functional. Here's what remains for v1 completion:

## Immediate (Recommended)

### 1. Content Customization

- **Update your details**: Edit `site/src/pages/index.astro`
  - Name, tagline, bio, certifications, contact links
  - Email address, GitHub/LinkedIn URLs
  - Replace placeholder certifications + languages

- **Add blog posts**: Create `.md` files in `site/src/content/blog/`
  - Use the existing posts as templates
  - Set `draft: false` to publish
  - Drafts with `draft: true` are excluded from build

- **Add a resume PDF**: Place `resume.pdf` in `site/public/`
  - Link is already in the front page

### 2. GitHub Actions Setup

Set these repository secrets (Settings → Secrets):

```
EC2_HOST     = your instance IP or domain
EC2_USER     = ubuntu
EC2_SSH_KEY  = (paste your SSH private key)
```

Once set, push to main and the workflow will:
1. Build the Astro site
2. Build + push Docker image to ghcr.io
3. SSH to your EC2 and deploy

### 3. Deploy to EC2

Follow [DEPLOYMENT.md](./DEPLOYMENT.md):
1. Launch t2.micro instance
2. Install Docker + Compose
3. Point DNS to instance IP
4. `docker compose up -d`
5. Caddy provisions Let's Encrypt certs automatically

## Optional Enhancements (v2)

### BBS Improvements

- **Actual blog rendering**: Wire MESSAGE BOARD to read real posts from content collection
- **Post viewing**: Click [1-N] to display full post inside BBS chrome
- **Tag-based sub-boards**: MESSAGE BOARD → select tag → view threads
- **File area links**: Wire FILE AREA entries to actual downloads/links
- **Guestbook**: Implement writable guestbook (separate small service, not in static build)

### Visual Polish

- **ANSI art masthead**: Blocky colored logo on dial-in screen
- **Animations**: Subtle glitch/flicker on key presses (respect `prefers-reduced-motion`)
- **Custom monospace font**: Download + serve JetBrains Mono or similar
- **Mobile BBS keypad**: Touch-friendly number pad for mobile users (optional)

### Gitea Integration

- **Project listings**: Fetch repos from Gitea API, display in BBS [3] PROJECTS
- **Auto-sync**: Add web hook from Gitea to trigger site rebuild on new projects

### Advanced (Out of Scope v1)

- **Dynamic blog**: Fetch posts via API (breaks static hosting guarantee)
- **Comments**: External service (Disqus, Giscus) embedded in posts
- **Analytics**: Privacy-friendly tracker (Plausible, Fathom)
- **Dark mode toggle**: If you want light mode option (currently fixed dark)

## Validation Checklist

- [ ] Front page loads fast (< 1s on slow 3G)
- [ ] No layout shift when clicking DIAL IN
- [ ] BBS keyboard nav works (1-5, 0, ESC)
- [ ] Dial-in animation skippable
- [ ] Respects `prefers-reduced-motion`
- [ ] Mobile: responsive at 320px, 768px, 1024px
- [ ] Keyboard focus visible on all interactive elements
- [ ] Docker build completes without warnings
- [ ] Container serves on port 80 correctly
- [ ] GitHub Actions workflow succeeds on push
- [ ] EC2 deployment pulls and runs container
- [ ] Site accessible via https with valid cert

## Local Testing

```bash
# Development
npm run dev              # localhost:4321

# Production build
npm run build
docker build -t portfolio .
docker run -p 8080:80 portfolio

# docker-compose stack
docker compose up       # localhost (port 80/443 via caddy)
```

## Troubleshooting Commands

```bash
# Check build output
cd site && npm run build

# Verify Docker image
docker build -t portfolio . && docker run -p 8080:80 portfolio

# Test nginx config
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx:alpine nginx -t

# SSH into EC2 and check containers
docker compose logs -f
docker compose ps

# GitHub Actions logs
gh workflow view deploy.yml --repo username/portfolio
```

## Metrics & Cost

- **Build time**: ~30s (Astro build + Docker build)
- **Image size**: ~15 MB (nginx:alpine base)
- **Container memory**: < 50 MB at rest
- **EC2 cost**: ~$7/month (t2.micro + 20 GB EBS)
- **Bandwidth**: minimal for a static portfolio

## Documentation to Update

- [ ] Resume PDF (current: placeholder)
- [ ] Blog post content (current: sample posts)
- [ ] Email/GitHub/LinkedIn links
- [ ] Caddyfile with your domain
- [ ] EC2 setup documentation for your account

Enjoy your new BBS! 🌐📡
