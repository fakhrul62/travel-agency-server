import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'https://travel-agency-eight-kappa.vercel.app',
    'http://localhost:3000', // for local development
    'http://localhost:5173'  // for Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Global error handler for debugging
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS error', details: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// ✅ MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwkoz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("travelAgency");
    const userCollection = db.collection("users");
    const tripsCollection = db.collection("trips");

    // ✅ Users Endpoints
    app.post("/users", async (req, res) => {
      const user = req.body;
      const exists = await userCollection.findOne({ email: user.email });
      if (exists) return res.send({ message: "User already exists", insertedId: null });
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (_req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.get("/users/profile/:email", async (req, res) => {
      const user = await userCollection.findOne({ email: req.params.email });
      if (!user) return res.status(404).send({ message: "User not found" });
      res.send(user);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const user = await userCollection.findOne({ email: req.params.email });
      res.send({ admin: user?.role === "admin" });
    });

    // ✅ Trips Endpoints
    app.post("/trips", async (req, res) => {
      const trip = req.body;
      trip.createdAt = trip.createdAt || new Date().toISOString();
      const result = await tripsCollection.insertOne(trip);
      // res.status(201).send({ success: true, tripId: result.insertedId });
      res.status(201).send({ success: true, insertedId: result.insertedId });
    });

    app.get("/trips", async (_req, res) => {
      const trips = await tripsCollection.find().sort({ createdAt: -1 }).toArray();
      res.send({ success: true, trips });
    });

    app.get("/trips/:id", async (req, res) => {
      try {
        const trip = await tripsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!trip) return res.status(404).send({ success: false, message: "Trip not found" });
        res.send({ success: true, trip });
      } catch (err) {
        res.status(500).send({ success: false, error: err.message });
      }
    });

    app.delete("/trips/:id", async (req, res) => {
      try {
        const result = await tripsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).send({ success: false, message: "Trip not found" });
        res.send({ success: true, message: "Trip deleted" });
      } catch (err) {
        res.status(500).send({ success: false, error: err.message });
      }
    });
  } catch (err) {
    console.error("MongoDB error:", err);
  }
}

run().catch(console.error);

// ✅ Health check
app.get("/", (_req, res) => {
  res.send("✅ Travel Agency Server is RUNNING");
});

app.listen(port, () => {
  console.log(`✅ Server running on port: ${port}`);
});

// ✅ Export app for Vercel (optional)
export default app;
