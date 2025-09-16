#!/bin/bash
cd /Users/bradtopliff/Desktop/HI_Replit

echo "Current branch:"
git branch --show-current

echo ""
echo "Git status:"
git status --short

echo ""
echo "Recent commits:"
git log --oneline -5

echo ""
echo "Uncommitted changes summary:"
git diff --stat

echo ""
echo "Staged files:"
git diff --cached --name-only
