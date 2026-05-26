# GitHub Actions "Deploy to Production" workflow is broken (missing AWS secrets)

**Labels:** ci/cd, deployment, infrastructure
**Priority:** Medium (workaround exists)

## Summary

The `.github/workflows/deploy.yml` workflow ("Deploy to Production") fails
immediately and cannot deploy. Production is currently deployed **manually**
from a local machine via `./deploy-to-production.sh -y` instead.

## Symptom

Dispatching the workflow (`gh workflow run deploy.yml --ref main`, or via the
Actions UI) fails after ~13s at the **Configure AWS credentials** step:

```
##[error]Credentials could not be loaded, please check your action inputs:
Could not load credentials from any providers
```

## Cause

The workflow's `aws-actions/configure-aws-credentials@v2` step references repo
secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (and a dozen others used
by `deploy-to-production.sh`: `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_KEY_IA`,
the `AUTH0_*`/`MGMT_*` set, etc.), but those secrets are **not configured** in
the GitHub repository. With no credentials available the AWS action aborts
before any build/deploy work runs.

## Remediation (pick one)

1. **Make Actions work** — add the required repository secrets under
   *Settings → Secrets and variables → Actions*. The deploy IAM user is
   `HeliotropeAppDeployment` (account `962000089613`); it needs ECR + Lightsail +
   SSM permissions. Better: migrate to GitHub OIDC + an assumed IAM role so no
   long-lived AWS keys are stored in GitHub. Note `deploy-to-production.sh`
   already pulls most app secrets from SSM at runtime, so Actions really only
   needs the AWS credentials to authenticate, not every app secret.
2. **Remove the workflow** — if the team intends to keep deploying locally,
   delete `deploy.yml` so it stops appearing as a usable (but failing) deploy
   path and misleading future contributors.

## Current canonical deploy path (works today)

```bash
./deploy-to-production.sh -y    # local Docker + AWS profile "heliotrope" -> ECR -> Lightsail hi-replit-v2
```

## Notes

- CLAUDE.md previously stated main is "deployed automatically"; corrected in the
  same change that filed this issue.
- Discovered 2026-05-26 while deploying the IA-4-3 `gpt-image-1` image-generation
  hotfix (deployed successfully via the local script).
