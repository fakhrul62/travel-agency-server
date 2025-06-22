import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

// Place CORS middleware at the very top and fix allowed origins (no trailing slashes)
app.use(cors({
  origin: [
    "http://localhost:5173",
  "https://travel-agency-eight-kappa.vercel.app",
  "https://travel-agency-nwn846xfo-fakhrul-alams-projects.vercel.app",
  "https://travel-agency-git-main-fakhrul-alams-projects.vercel.app",
  "https://travel-agency-server-delta.vercel.app",
  "https://travel-agency-bu3n0al34-fakhrul-alams-projects.vercel.app",
  "https://travel-agency-server-3n1wr27f2-fakhrul-alams-projects.vercel.app",
  
  ],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support and serverless
}));

app.use(express.json());
app.use(cookieParser());

//========================= MONGODB CONNECTION

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwkoz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    //==============================================================
    //Get the database and collection on which to run the operation
    const userCollection = client.db("travelAgency").collection("users");
    const tripsCollection = client.db("travelAgency").collection("trips");

    //jwt api
    // app.post("/jwt", async (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
    //     expiresIn: "1h",
    //   });
    //   res.send({ token });
    // });
    // app.post("/jwt/logout", async (req, res) => {
    //   const user = req.body;
    //   console.log("logging out: ", user);
    //   res
    //     .clearCookie("token", {
    //       httpOnly: true,
    //       secure: process.env.NODE_ENV === "production",
    //       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //     })
    //     .send({ success: true });
    // });

    //verify token middleware
    // const verifyToken = (req, res, next) => {
    //   // console.log("inside verifyToken", req.headers.authorization);
    //   if (!req.headers.authorization) {
    //     return res.status(401).send({ message: "Unauthorized Access Brother" });
    //   }
    //   const token = req.headers.authorization.split(" ")[1];
    //   jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    //     if (err) {
    //       return res
    //         .status(401)
    //         .send({ message: "Unauthorized Access Brother" });
    //     }
    //     req.decoded = decoded;
    //     next();
    //   });
    // };

    //verify admin after verifying token
    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   const isAdmin = user?.role === "admin";
    //   if (!isAdmin) {
    //     return res.status(403).send({
    //       message: "Forbidden Request Brother. You're not the Admin.",
    //     });
    //   }
    //   next();
    // };
    //verify admin after verifying token
    // const verifyHr = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   const isHr = user?.role === "hr";
    //   if (!isHr) {
    //     return res.status(403).send({
    //       message: "Forbidden Request Brother. You're not the HR.",
    //     });
    //   }
    //   next();
    // };
    //verify admin after verifying token
    // const verifyEmployee = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   const isEmployee = user?.role === "employee";
    //   if (!isEmployee) {
    //     return res.status(403).send({
    //       message: "Forbidden Request Brother. You're not the Employee.",
    //     });
    //   }
    //   next();
    // };


    //users api

// ================ALL USER ENDPOINTS
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "User already exists!", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users",  async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
app.get("/users/profile/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    
    // Send the full user object, including password
    res.send(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send({ error: error.message });
  }
});
app.get("/users/admin/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    
    if (!user) {
      return res.status(404).send({ admin: false, message: "User not found" });
    }
    
    const isAdmin = user.role === "admin";
    res.send({ admin: isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).send({ admin: false, error: error.message });
  }
});

// TRIPS API ENDPOINTS
    
    // POST a new trip
    app.post("/trips", async (req, res) => {
      try {
        const tripData = req.body;
        
        // Add server timestamp if not provided
        if (!tripData.createdAt) {
          tripData.createdAt = new Date().toISOString();
        }
        
        const result = await tripsCollection.insertOne(tripData);
        res.status(201).send({
          success: true,
          message: "Trip created successfully",
          insertedId: result.insertedId,
          tripData
        });
      } catch (error) {
        console.error("Error creating trip:", error);
        res.status(500).send({
          success: false,
          message: "Failed to create trip",
          error: error.message
        });
      }
    });
    
    // GET all trips
    app.get("/trips", async (req, res) => {
      try {
        const { userId } = req.query;
        let query = {};
        
        // If userId is provided, filter by userId
        if (userId) {
          query.userId = userId;
        }
        
        const trips = await tripsCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.status(200).send({
          success: true,
          trips
        });
      } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch trips",
          error: error.message
        });
      }
    });
    
    // GET a specific trip by ID
    app.get("/trips/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const trip = await tripsCollection.findOne(query);
        
        if (!trip) {
          return res.status(404).send({
            success: false,
            message: "Trip not found"
          });
        }
        
        res.status(200).send({
          success: true,
          trip
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch trip",
          error: error.message
        });
      }
    });

    // DELETE a trip
    app.delete("/trips/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await tripsCollection.deleteOne(query);
        
        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Trip not found or already deleted"
          });
        }
        
        res.status(200).send({
          success: true,
          message: "Trip deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting trip:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete trip",
          error: error.message
        });
      }
    });

    // app.patch("/fire-user/:id", verifyToken, async (req, res) => {
    //   const id = req.params.id;
    //   const updateDoc = {
    //     $set: { workStatus: "inactive" },
    //   };
    
    //   const result = await userCollection.updateOne({ _id: new ObjectId(id) }, updateDoc);
    //   res.send(result);
    // });
    // app.get("/users/:email",  async (req, res) => {
    //   const { email } = req.params;
    //   const user = await userCollection.findOne({ email });
    //   res.send(user);
    // });
    // app.patch("/update-role/:id",verifyToken, async (req, res) => {
    //   const id = req.params.id;
    //   const { role } = req.body; // New role from client
    //   const updateDoc = {
    //     $set: { role },
    //   };
    
    //   const result = await userCollection.updateOne({ _id: new ObjectId(id) }, updateDoc);
    //   res.send(result);
    // });
    
    
    // app.get("/users/role/:email", verifyToken, async (req, res) => {
    //   const email = req.params.email;
    //   if (email !== req.decoded.email) {
    //     return res.status(403).send({ message: "Forbidden Request Brother" });
    //   }

    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);

    //   let role = {
    //     admin: false,
    //     hr: false,
    //     employee: false,
    //   };

    //   if (user) {
    //     if (user?.role === "admin") {
    //       role.admin = true;
    //     } else if (user?.role === "hr") {
    //       role.hr = true;
    //     } else if (user?.role === "employee") {
    //       role.employee = true;
    //     }
    //   }

    //   res.send({ role });
    // });
    // app.get("/employees",verifyToken, async (req, res) => {
    //   const query = { role: "employee" };
    //   const result = await userCollection.find(query).toArray();
    //   res.send(result);
    // });
    // app.get("/employees/:id",verifyToken, async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await userCollection.findOne(query);
    //   res.send(result);
    // });
    // app.get("/all-users",verifyToken, async (req, res) => {
    //   const query = { role: { $in: ["employee", "hr"] } };
    //   const result = await userCollection.find(query).toArray();
    //   res.send(result);
    // });
    // app.patch("/users/:id", verifyToken, async (req, res) => {
    //   const user = req.body; // Destructure the values from the request body
    //   const id = req.params.id; // Get the task ID from the URL parameter
    //   if (!ObjectId.isValid(id)) {
    //     return res.status(400).send({ error: "Invalid ID format" });
    //   }
    //   const updatedDoc = {
    //     $set: {
    //       isVerified: user.isVerified,
    //     },
    //   };
    //   const result = await userCollection.updateOne(
    //     { _id: new ObjectId(id) },
    //     updatedDoc
    //   );
    //   res.send(result);
    // });
    //payroll api
    // app.get("/payrolls/check",verifyToken, async (req, res) => {
    //   const { employee_email, month, year } = req.query;

    //   if (!employee_email || !month || !year) {
    //     return res
    //       .status(400)
    //       .json({ message: "Missing required query parameters" });
    //   }

    //   const existingPayroll = await payrollCollection.findOne({
    //     employee_email,
    //     month,
    //     year,
    //   });

    //   res.json({ exists: !!existingPayroll });
    // });
    // app.post("/payrolls",verifyToken, async (req, res) => {
    //   const payrolls = req.body;

    //   // Check if payroll already exists
    //   const existingPayroll = await payrollCollection.findOne({
    //     employee: payrolls.employee,
    //     month: payrolls.month,
    //     year: payrolls.year,
    //   });

    //   if (existingPayroll) {
    //     return res
    //       .status(400)
    //       .json({ message: "Payroll for this month already exists" });
    //   }

    //   const payrollsResult = await payrollCollection.insertOne(payrolls);
    //   res.json(payrollsResult);
    // });
    // app.get("/payrolls",verifyToken, async (req, res) => {
    //   const result = await payrollCollection.find().toArray();
    //   res.send(result);
    // });
    // app.patch("/payrolls/:id",verifyToken, async (req, res) => {
    //   const { id } = req.params; // Get the payroll ID from the URL
    //   const { payment_date, payment_status } = req.body; // Get the updated data from the request body

    //   try {
    //     const updatedPayroll = await payrollCollection.updateOne(
    //       { _id: new ObjectId(id) }, // Match the payroll by its ID
    //       {
    //         $set: { payment_date, payment_status }, // Update the payment_date and payment_status
    //       }
    //     );

    //     if (updatedPayroll.matchedCount === 0) {
    //       return res.status(404).json({ message: "Payroll not found" });
    //     }

    //     res.status(200).json({ message: "Payroll updated successfully" });
    //   } catch (error) {
    //     console.error("Error updating payroll:", error);
    //     res.status(500).json({ message: "Internal server error" });
    //   }
    // });
    // app.get("/payrolls/:email",verifyToken, async (req, res) => {
    //   const email = req.params.email;
    //   const { status } = req.query; // Get the payment status from query params

    //   let query = { "employee.email": email }; // Default query

    //   if (status === "paid") {
    //     query.payment_status = "paid"; // Add condition only if status is "paid"
    //   }
    //   if (email !== req.decoded.email) {
    //     return res.status(403).send({
    //       message: "Forbidden Request Brother. Check your own payment history.",
    //     });
    //   }
    //   const result = await payrollCollection.find(query).toArray();
    //   res.send(result);
    // });

    //tasks api
    // app.post("/tasks",verifyToken, async (req, res) => {
    //   const tasks = req.body;
    //   const tasksResult = await tripsCollection.insertOne(tasks);
    //   res.send(tasksResult);
    // });
    // app.get("/tasks",verifyToken, async (req, res) => {
    //   const result = await tripsCollection.find().toArray();
    //   res.send(result);
    // });
    // app.get("/tasks/:email",verifyToken, async (req, res) => {
    //   const email = req.params.email;
    //   const query = { user_email: email };
    //   if (email !== req.decoded.email) {
    //     return res.status(403).send({
    //       message: "Forbidden Request Brother. Check your own payment history.",
    //     });
    //   }
    //   const result = await tripsCollection.find(query).toArray();
    //   res.send(result);
    // });

    // app.patch("/tasks/:id", verifyToken, async (req, res) => {
    //   const { task, hour, date } = req.body; // Destructure the values from the request body
    //   const taskId = req.params.id; // Get the task ID from the URL parameter
    //   const updatedDoc = {
    //     $set: {
    //       task: task,
    //       hour: hour,
    //       date: date,
    //     },
    //   };
    //   const result = await tripsCollection.updateOne(
    //     { _id: new ObjectId(taskId) },
    //     updatedDoc
    //   );
    //   res.send(result);
    // });

    // app.delete("/tasks/:id", verifyToken, async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await tripsCollection.deleteOne(query);
    //   res.send(result);
    // });

    //==================================================================
  } finally {
  }
}
run().catch(console.dir);

//================================================

app.get("/", (req, res) => {
  res.send("Travel Agency IS RUNNING...");
});
app.listen(port, () => {
  console.log("Travel Agency is running on port: ", port);
});


