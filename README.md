# BusyTime

# ⚡ Setup Instructions

## How to start the MongoDB database

You can easily start MongoDB using Docker Compose:

```sh
docker-compose up -d
```

The database will be available at `mongodb://root:example@localhost:27017`.

## Backend
1. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
2. Configure the MongoDB connection in your configuration file (e.g.: `.env`):
   ```
   MONGO_URI=mongodb://root:example@localhost:27017/busytime
   ```
3. Change de API KEY for BestTime in .env file.
    ```
    BESTTIME_API_KEY=your_api_key_here
    ```

4. Start the backend:
   ```sh
   npm start
   ```

## Frontend
1. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2. Start the frontend:
   ```sh
   npm start
   ```

### Open http://localhost:4200 🎉

## How to run all tests

From the project root, run:

```sh
npm run test:all
```

## Full automation

To automate the process of starting the database and the projects, you can use the command below from the project root:

```sh
docker-compose up -d && cd backend && npm install && npm start
```

In another terminal, run the frontend:

```sh
cd frontend && npm install && npm start
```

---
