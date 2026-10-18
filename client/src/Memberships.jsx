import { useState, useEffect } from "react";

function Memberships() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [userId, setUserId] = useState("");
  const [members, setMembers] = useState([]);
  const [leadId, setLeadId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLists();
  }, []);
  async function loadLists() {
    try {
      const projectResponse = await fetch("http://localhost:9000/projects");
      const userResponse = await fetch("http://localhost:9000/users");

      if (projectResponse.ok && userResponse.ok) {
        setProjects(await projectResponse.json());
        setUsers(await userResponse.json());
      } else {
        setMessage("Could not load projects and users");
      }
    } catch (error) {
      setMessage("Could not connect to the server");
    }
  }
  async function loadMembers(id) {
    if (id === "") {
      setMembers([]);
      setLeadId("");
      return;
    }
    try {
      const response = await fetch("http://localhost:9000/projects/" + id + "/members");
      const data = await response.json();

      if (response.ok) {
        setMembers(data.members);
        setLeadId(data.project_lead_id);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Could not connect to the server");
    }
  }
  function handleProjectChange(event) {
    setProjectId(event.target.value);
    setMessage("");
    loadMembers(event.target.value);
  }
  async function addMember() {
    if (userId === "") {
      setMessage("Select a user to add");
      return;
    }
    try {
      const response = await fetch("http://localhost:9000/projects/" + projectId + "/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId
        })
      });
      const data = await response.json();
      setMessage(data.message);
      loadMembers(projectId);
    } catch (error) {
      setMessage("Could not connect to the server");
    }
  }
  async function removeMember(id) {
    try {
      const response = await fetch(
        "http://localhost:9000/projects/" + projectId + "/members/" + id,
        { method: "DELETE" }
      );
      const data = await response.json();
      setMessage(data.message);
      loadMembers(projectId);
    } catch (error) {
      setMessage("Could not connect to the server");
    }
  }
  return (
    <div>
      <h2>Project Memberships</h2>
      <div>
        <label>Project:</label>
        <select value={projectId} onChange={handleProjectChange}>
          <option value="">Select a project</option>
          {projects.map((project) => ( <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      {projectId !== "" && (
        <div>
          <h3>Members</h3>
          <ul>
            {members.map((member) => (
              <li key={member._id}>
                {member.f_name} {member.l_name} ({member.username})
                {member._id === leadId ? (
                  " - Project Lead"
                ) : (
                  <button onClick={() => removeMember(member._id)}>Remove</button>
                )}
              </li>
            ))}
          </ul>
          <div>
            <label>Add user:</label>
            <select value={userId} onChange={(event) => setUserId(event.target.value)}>
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.f_name} {user.l_name} ({user.username})
                </option>
              ))}
            </select>
            <button onClick={addMember}>Add</button>
          </div>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
export default Memberships;
