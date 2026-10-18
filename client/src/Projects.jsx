import { useState, useEffect } from "react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);
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
  return (
    <div>
      <h2>Projects</h2>
      {message && <p>{message}</p>}
      {projects.map((project) => (
        <div key={project._id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <p>Status: {project.status}</p>
          <p>Project Lead: {project.lead}</p>
        </div>
      ))}
    </div>
  );
}

export default Projects;
