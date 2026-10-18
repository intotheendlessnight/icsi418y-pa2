import { useState } from "react";
// just take from other components
import Login from "./Login";
import Signup from "./Signup";
import CreateProject from "./CreateProject";
import Projects from "./Projects";
import Memberships from "./Memberships";
function App() {
  const [view, setView] = useState("login");
  // toggle between login/signup
  return (
    <div>
      <h1>SIGNUPMACHINE</h1>
      <button onClick={() => setView("login")}>Login</button>
      <button onClick={() => setView("signup")}>Sign Up</button>
      <button onClick={() => setView("create")}>Create Project</button>
      <button onClick={() => setView("projects")}>Projects</button>
      <button onClick={() => setView("memberships")}>Memberships</button>
      {view === "login" && <Login />}
      {view === "signup" && <Signup />}
      {view === "create" && <CreateProject />}
      {view === "projects" && <Projects />}
      {view === "memberships" && <Memberships />}
    </div>
  );
}

export default App;
