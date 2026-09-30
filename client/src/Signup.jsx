import { useState } from "react";
function Signup() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:9000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          f_name: fname,
          l_name: lname,
          username: username,
          password: password
        })
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setFname("");
        setLname("");
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      setMessage("Could not connect to the server");
    }
  }

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          value={fname}
          onChange={(event) => setFname(event.target.value)}
        />

        <label>Last Name:</label>
        <input
          type="text"
          value={lname}
          onChange={(event) => setLname(event.target.value)}
        />

        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
