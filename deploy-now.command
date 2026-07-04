#!/bin/bash
cd "$(dirname "$0")"
git remote set-url origin https://github.com/cmarroquin302-dotcom/mytcteam.git 2>/dev/null || git remote add origin https://github.com/cmarroquin302-dotcom/mytcteam.git
git push -u origin main --force
echo ""
echo "✅ Pushed! Vercel will deploy automatically."
echo "Press any key to close..."
read -n 1
