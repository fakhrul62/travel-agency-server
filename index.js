import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://travel-agency-eight-kappa.vercel.app",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

// ===================== MongoDB Connection
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

    // 🟩 POST /trips (Create trip)
    app.post("/trips", async (req, res) => {
      const trip = req.body;
      trip.createdAt = trip.createdAt || new Date().toISOString();
      const result = await tripsCollection.insertOne(trip);
      res.status(201).send({ success: true, tripId: result.insertedId });
    });

    // 🟩 GET /trips (Fetch all)
    app.get("/trips", async (req, res) => {
      const trips = await tripsCollection.find().sort({ createdAt: -1 }).toArray();
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
