## Installation

Install dependencies separately for the server and the client.

```bash
cd server
npm install
```

```bash
cd client
npm install
```

## Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_access_key
AWS_S3_BUCKET=your_bucket
```

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Default local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```
