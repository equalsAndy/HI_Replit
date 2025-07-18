# Deployment Quick Reference

## 🚀 **Deploy Latest Code**
```bash
./deploy-latest-code.sh
```
- Creates image: `staging-v{VERSION}.{BUILD}-{DATE}`
- Deploys to: https://app2.heliotropeimaginal.com
- Time: ~5-10 minutes

## 📊 **Monitor Deployment**
```bash
# Check deployment status
aws lightsail get-container-services --service-name hi-replit-v2 --region us-west-2

# View logs
aws lightsail get-container-log --service-name hi-replit-v2 --container-name allstarteams-app --region us-west-2
```

## 🔧 **Manual Steps (if needed)**
```bash
# Build only
npm run build:staging

# Check version
cat public/version.json

# Test staging site
curl https://app2.heliotropeimaginal.com/health
```

## 📚 **Documentation**
- **Full Guide**: `docs/deployment-best-practices.md`
- **Troubleshooting**: `docs/deployment/aws-lightsail-deployment-guide-UPDATED.md`
- **Production Status**: `docs/production-migration-success-july-2025.md`

---
**Last Updated**: July 18, 2025
