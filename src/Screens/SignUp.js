import React, { useState } from "react";
import { registerUser } from '../httpRequests';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const userDetails = localStorage.getItem("userDetails") ? JSON.parse(localStorage.getItem("userDetails")) : null;
  if (userDetails && userDetails.userId && userDetails.token) {
    navigate('/home');
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!email || !password || !userName) {
        setError("Both fields are required!");
        return;
      }

      let response = await registerUser({
        "userId": userName,
        "password": password,
        "email": email
      })

      navigate("/");
      setSuccess("Successfully registered user");
    } catch (error) {
      setError(error.message);

      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card p-4 shadow">
            <h2 className="text-center mb-3">Register To Messaging App</h2>
            {error && <p className="alert alert-danger">{error}</p>}
            {success && <p className="alert alert-success">{success}</p>}
            <form>
              <div className="mb-3">
                <label className="form-label">User Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your user name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-success w-100" onClick={async (e) => await handleSubmit(e)}>
                Register
              </button>

              <button className="mt-2 btn btn-primary w-100" onClick={() => navigate("/")}>
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
