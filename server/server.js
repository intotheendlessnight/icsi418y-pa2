require("dotenv").config();
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// users collection /step 8
const db = client.db("pa2");
const users = db.collection("users");
// main logic for signup
app.post("/signup", async (req, res) => {
  const { f_name, l_name, username, password } = req.body;

  // should handle 400, 401, 409, 500, 201
  // 201 success, 400 error blah blah (step 15/16)
  if (!f_name || !l_name || !username || !password) {
    return res.status(400).json({ message: "Req information not found!" });
  }

  try {
    const existing = await users.findOne({ username: username });
    if (existing) {
      return res.status(409).json({ message: "Username taken, try different" });
    }
    await users.insertOne({
      f_name: f_name,
      l_name: l_name,
      username: username,
      password: password
    });
    res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal error" });
  }
});
app.get("/", (req, res) => {
	    res.json({
		            message: "Server is running"
		        });
});




// login logic
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Required information is missing" });
  }
  try {
    const user = await users.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
app.listen(9000, () => {
	    console.log("Server running on port 9000");
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}
connectDatabase();