import { useState } from "react";
// just take from other components
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [view, setView] = useState("login");
  // toggle between login/signup
  return (
    <div>
      <h1>SIGNUPMACHINE</h1>
      <button onClick={() => setView("login")}>Login</button>
      <button onClick={() => setView("signup")}>Sign Up</button>
      {view === "login" ? <Login /> : <Signup />}
    </div>
  );
}

export default App;
