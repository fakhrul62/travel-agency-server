import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

// ✅ Simplified, production-safe CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://travel-agency-eight-kappa.web.app", // Firebase Hosting
    "https://travel-agency-eight-kappa.vercel.app",
    "https://travel-agency-server-3n1wr27f2-fakhrul-alams-projects.vercel.app"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// 🔌 MongoDB
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
    const userCollection = client.db("travelAgency").collection("users");
    const tripsCollection = client.db("travelAgency").collection("trips");

    // ✅ USERS ENDPOINTS
    app.post("/users", async (req, res) => {
      const user = req.body;
      const existing = await userCollection.findOne({ email: user.email });
      if (existing) return res.send({ message: "User already exists", insertedId: null });
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

    // ✅ TRIPS ENDPOINTS
    app.post("/trips", async (req, res) => {
      try {
        const data = req.body;
        if (!data.createdAt) data.createdAt = new Date().toISOString();
        const result = await tripsCollection.insertOne(data);
        res.status(201).send({ success: true, insertedId: result.insertedId, tripData: data });
      } catch (err) {
        res.status(500).send({ success: false, message: "Failed to create trip", error: err.message });
      }
    });

    app.get("/trips", async (req, res) => {
      const query = req.query.userId ? { userId: req.query.userId } : {};
      const trips = await tripsCollection.find(query).sort({ createdAt: -1 }).toArray();
      res.send({ success: true, trips });
    });

    app.get("/trips/:id", async (req, res) => {
      try {
        const trip = await tripsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!trip) return res.status(404).send({ success: false, message: "Trip not found" });
        res.send({ success: true, trip });
      } catch (err) {
        res.status(500).send({ success: false, message: "Error fetching trip", error: err.message });
      }
    });

    app.delete("/trips/:id", async (req, res) => {
      try {
        const result = await tripsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).send({ success: false, message: "Trip not found" });
        res.send({ success: true, message: "Trip deleted successfully" });
      } catch (err) {
        res.status(500).send({ success: false, error: err.message });
      }
    });
  } finally {
    // leave it empty for Vercel (no need to close)
  }
}

run().catch(console.error);

app.get("/", (_req, res) => {
  res.send("Travel Agency Server is RUNNING ✅");
});

app.listen(port, () => {
  console.log("✅ Travel Agency Server running on port:", port);
});
