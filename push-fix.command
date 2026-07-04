#!/bin/bash
cd "$(dirname "$0")"
# Add remote if not already set
git remote add origin https://github.com/cmarroquin302-dotcom/mytcteam.git 2>/dev/null || git remote set-url origin https://github.com/cmarroquin302-dotcom/mytcteam.git
git add middleware.ts
git commit -m "fix: check is_admin from DB in middleware sign-in redirect" 2>/dev/null || echo "(already committed)"
git push -u origin main
echo ""
echo "Done! Press any key to close..."
read -n 1
