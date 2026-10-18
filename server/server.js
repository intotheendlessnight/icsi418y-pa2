require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// users collection /step 8
const db = client.db("pa2");
const users = db.collection("users");

// membership + project + status

const projects = db.collection("projects");
const memberships = db.collection("projectMemberships");
const statuses = ["Planning", "Active", "Completed"];

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

// new routes go to here
app.get("/users", async (req, res) => {
  try {
    // exclude the passwords from returned users
    const list = await users.find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/projects", async (req, res) => {
  const { name, description, status, project_lead_id } = req.body;
  if (!name || !description || !status || !project_lead_id) {
    // check all req provided fields are there before moving on
    return res.status(400).json({ message: "You're missing some required information..." });
  }
  if (!statuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  if (!ObjectId.isValid(project_lead_id)) {
    return res.status(400).json({ message: "That is not a valid project lead!!" });
  }
  try {
    const leadId = new ObjectId(project_lead_id);
    const lead = await users.findOne({ _id: leadId });
    if (!lead) {
      return res.status(404).json({ message: "There is no project lead :(" });
    }
    const result = await projects.insertOne({
      name: name,
      description: description,
      status: status,
      project_lead_id: leadId
    });
    // membership given to project lead automatucally
    await memberships.insertOne({
      project_id: result.insertedId,
      user_id: leadId
    });
    res.status(201).json({ message: "Project successfully created!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error!!" });
  }
});
app.get("/projects", async (req, res) => {
  try {
    const projectList = await projects.find().toArray();
    const userList = await users.find().toArray();
    const result = projectList.map((project) => {
      const lead = userList.find((user) => user._id.equals(project.project_lead_id));
      return {
        ...project, // copy all properties from project object -> add lead property
        // will then include project lead name in each project 
        lead: lead ? lead.f_name + " " + lead.l_name + " (" + lead.username + ")" : "Unknown"
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error!!" });
  }
});
app.get("/projects/:id/members", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Thats clearly not a valid project id.." });
  }
  try {
    const project = await projects.findOne({ _id: new ObjectId(req.params.id) });
    if (!project) {
      return res.status(404).json({ message: "Project is nowhere to be found.." });
    }
    const list = await memberships.find({ project_id: project._id }).toArray();
    const ids = list.map((membership) => membership.user_id);
    const members = await users
      .find({ _id: { $in: ids } }, { projection: { password: 0 } })
      .toArray();
    res.status(200).json({ project_lead_id: project.project_lead_id, members: members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error!!" });
  }
});
app.post("/projects/:id/members", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ message: "You're missing some required information.. check again" });
  }
  if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(user_id)) {
    return res.status(400).json({ message: "Invalid project or user id" });
  }
  try {
    const projectId = new ObjectId(req.params.id);
    const userId = new ObjectId(user_id);
    const project = await projects.findOne({ _id: projectId });
    if (!project) {
      return res.status(404).json({ message: "Project is nowhere to be found.." });
    }
    const user = await users.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const existing = await memberships.findOne({ project_id: projectId, user_id: userId });
    if (existing) {
      return res.status(409).json({ message: "User is already a member of this project" });
    }
    await memberships.insertOne({ project_id: projectId, user_id: userId });
    res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error!!" });
  }
});
app.delete("/projects/:id/members/:userId", async (req, res) => {
  // validate both the ids before we query mongo
  if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ message: "Invalid project or user id" });
  }
  try {
    const projectId = new ObjectId(req.params.id);
    const userId = new ObjectId(req.params.userId);
    const project = await projects.findOne({ _id: projectId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const user = await users.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // make sure no one can remove project lead
    if (project.project_lead_id.equals(userId)) {
      return res.status(400).json({ message: "The project lead cannot be removed" });
    }
    const result = await memberships.deleteOne({ project_id: projectId, user_id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User is not a member of this project" });
    }
    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error!!" });
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