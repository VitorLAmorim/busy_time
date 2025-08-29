# ⚡ Setup Instructions

## Backend
```
cd backend
npm install
cp .env.example .env   # add MONGO_URI and BESTTIME_KEY
npm run dev
```

### .env
```
MONGO_URI=mongodb://127.0.0.1:27017/besttime
BESTTIME_KEY=your_private_api_key_here
```

## Frontend
```
cd frontend
npm install
ng serve --open
```

### Open http://localhost:4200 🎉