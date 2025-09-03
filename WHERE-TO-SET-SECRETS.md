# 🔐 Quick Reference: Where to Set Secrets

## Required Secrets
```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-random-string
```

## By Environment

### 💻 Local Development
**Create `.env` file in project root:**
```bash
touch .env
# Add secrets to .env file
```

### 🟢 Replit
**Use Secrets tab:**
1. Click 🔒 Secrets in sidebar
2. Add `DATABASE_URL` and `SESSION_SECRET`

### ☁️ AWS Production
**Stored in AWS Secrets Manager:**
- Secret name: `hi-replit-env`
- Auto-retrieved by container

### 🐳 Docker
**Environment variables:**
```bash
docker run -e DATABASE_URL="..." -e SESSION_SECRET="..." your-image
```

## Generate Secure Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Validation
```bash
npm run check:env
```
Look for startup message:
```
✅ Environment variables validated
```

📖 **Full guide:** [SECRET-MANAGEMENT-GUIDE.md](./docs/SECRET-MANAGEMENT-GUIDE.md)  
🔧 **Troubleshooting:** [SECRET-TROUBLESHOOTING.md](./docs/SECRET-TROUBLESHOOTING.md)