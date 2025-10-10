#!/bin/bash

echo "=== GIT STATUS CHECK ==="
cd /Users/bradtopliff/Desktop/HI_Replit

echo "Current branch:"
git branch --show-current

echo -e "\nGit status:"
git status --porcelain

echo -e "\nUntracked files:"
git ls-files --others --exclude-standard

echo -e "\nModified files:"
git diff --name-only

echo -e "\nStaged files:"
git diff --cached --name-only

echo -e "\nRemote tracking:"
git remote -v

echo -e "\nBranch tracking:"
git branch -vv
