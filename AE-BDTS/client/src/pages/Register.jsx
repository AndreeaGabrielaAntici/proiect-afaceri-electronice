import { useState } from "react";
import { toast } from "react-toastify";
import { registerUser } from "../routes/user";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    const response = await registerUser(name, email, password);

    if (response.success) {
      navigate("/login");
      toast.success("User registered successfully");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="formWrapper">
      <label htmlFor="name">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Your name.."
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="email">Email</label>
      <input
        type="text"
        id="email"
        name="email"
        placeholder="Your email.."
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <div>
        <button type="submit" onClick={handleRegister}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Register;
