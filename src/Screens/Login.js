import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../httpRequests'
import socket from '../socketOperations.js';

const Login = () => {
  const [userId, setUserId] = useState("");
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
      if (!userId || !password) {
        setError("Both fields are required!");
        return;
      }

      var token = await loginUser({
        "userId": userId,
        "password": password
      })

      let userData = {
        "userId": userId,
        "token": token
      }

      localStorage.setItem("userDetails", JSON.stringify(userData));
      socket.auth = userData;
      socket.connect();

      navigate("/home");
    } catch (error) {
      setError(error.response.data.message);

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
            <h2 className="text-center mb-3">Messaging App Login</h2>
            {error && <p className="alert alert-danger">{error}</p>}
            {success && <p className="alert alert-success">{success}</p>}
            <form>
              <div className="mb-3">
                <label className="form-label">User ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
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
              <button className="btn btn-primary w-100" onClick={async (e) => await handleSubmit(e)}>
                Login
              </button>

              <button className="mt-2 btn btn-success w-100" onClick={() => navigate("/sign/up")}>
                Sign up
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
