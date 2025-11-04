# ============================================
# QUICK START (All-in-one script)
# ============================================
#!/bin/bash
# FILE: setup.sh

echo "🐋 BlueWhale Terminal - Quick Setup"

# Start services
docker-compose up -d
sleep 5

# Backend
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev &

# Frontend
cd ../client
npm install
npm run dev &

echo "✅ Setup complete!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:5000"