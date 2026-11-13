import { useState, useEffect } from "react";
import StoryForm from "./StoryForm";

const emptyStory = {
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  assigned_user_id: null
};

function Backlog() {

  // project dropdown
  const [projects, setProjects] = useState([]);

  // project id, then members of project of memberdropdown, then stories
  const [projectId, setProjectId] = useState("");
  const [members, setMembers] = useState([]);

  // set stories set to true once the stories are loaded, fix no stories yet showing
  const [stories, setStories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // id of story in edit form and null means none edited
  const [editingId, setEditingId] = useState(null);

  // debug 
  const [reload, setReload] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);
  useEffect(() => {
    // run again after projectId / reload changes, and nothing ("") will load until project picked
    if (projectId === "") {
      return;
    }

    let ignore = false;
    async function loadBacklog() {
      try {
        const memberResponse = await fetch("http://localhost:9000/projects/" + projectId + "/members");
        const storyResponse = await fetch("http://localhost:9000/projects/" + projectId + "/stories");
        const memberData = await memberResponse.json();
        const storyData = await storyResponse.json();
        // if we get response for diff project (unselected), ignore it (dont display)
        if (ignore) {
          return;
        }

        if (memberResponse.ok && storyResponse.ok) {
          setMembers(memberData.members);
          setStories(storyData);
          setLoaded(true);
        } else {
          setMessage(memberData.message || storyData.message);
        }
      } catch (error) {
        if (!ignore) {
          setMessage("Could not connect to the server");
        }
      }
    }

    loadBacklog();

    return () => {
      ignore = true;
    };
  }, [projectId, reload]);

  async function loadProjects() {
    try {
      const response = await fetch("http://localhost:9000/projects");
      const data = await response.json();

      if (response.ok) {
        setProjects(data);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Could not connect to the server");
    }
  }

  function handleProjectChange(event) {
    // clear all from old project immediately
    setProjectId(event.target.value);
    setStories([]);
    setMembers([]);
    setLoaded(false);
    setEditingId(null);
    setMessage("");
  }
  async function sendRequest(url, options) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setMessage(data.message);
      return response.ok;
    } catch (error) {
      setMessage("Could not connect to the server");
      return false;
    }
  }
  async function createStory(data) {
    const ok = await sendRequest("http://localhost:9000/projects/" + projectId + "/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    // all of these do the same thing, if it works, close form, reload story
    if (ok) {
      setReload((n) => n + 1);
    }

    return ok;
  }
  async function saveStory(storyId, data) {
    const ok = await sendRequest(
      "http://localhost:9000/projects/" + projectId + "/stories/" + storyId,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    if (ok) {
      setEditingId(null);
      setReload((n) => n + 1);
    }

    return ok;
  }
  async function removeStory(storyId) {
    if (!window.confirm("Delete this story?")) {
      return;
    }
    const ok = await sendRequest(
      "http://localhost:9000/projects/" + projectId + "/stories/" + storyId,
      { method: "DELETE" }
    );
    if (ok) {
      if (editingId === storyId) {
        setEditingId(null);
      }
      setReload((n) => n + 1);
    }
  }

  // state 1 where project isnt selected, then below projectId !== project has no stories (state 2)
  // wait for load, then being edited shows edit form, then assigned_To is readable name server would add
  // then open story, clear any old message
  return (
    <div>
      <h2>Project BACKLOG.</h2>
      <div>
        <label>Project:</label>
        <select value={projectId} onChange={handleProjectChange}>
          <option value="">Select project ^_^</option>
          {/* value is from projectId then it runs handleprojchange on pick */}
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {message && <p>{message}</p>}
      {projectId === "" && <p>Select a project to see its backlog</p>}
      {projectId !== "" && (
        <div>
          <h3>Stories</h3>
          {loaded && stories.length === 0 && <p>This project has no stories yet D:</p>}
          {stories.map((story) => (
            <div key={story._id}>
              {editingId === story._id ? (
                <StoryForm
                  story={story}
                  members={members}
                  isEdit={true}
                  onSave={(data) => saveStory(story._id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div>
                  <h4>{story.title}</h4>
                  <p>{story.description}</p>
                  <p>
                    Priority: {story.priority} | Status: {story.status} | Assigned: {story.assigned_to}
                  </p>
                  <button
                    onClick={() => {
                      setEditingId(story._id);
                      setMessage("");
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => removeStory(story._id)}>Delete</button>
                </div>
              )}
              <hr />
            </div>
          ))}
          <h3>Add Story</h3>
          <StoryForm
            key={projectId}
            story={emptyStory}
            members={members}
            isEdit={false}
            onSave={createStory}
          />
        </div>
      )}
    </div>
  );
}
export default Backlog;
