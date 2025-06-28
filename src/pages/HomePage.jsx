import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { TypeAnimation } from "react-type-animation";
import { loginSuccess } from "../redux/authSlice";
import homeimg from "../assets/homeimg2.jpg";
import logo from "../assets/logo.jpg";
import google from "../assets/google.png";
import "../styles/HomePage.css";

const adminEmails = [
  "bharathnarayanan.pa2022cse@sece.ac.in",
  "trustwheels22@gmail.com",
]; 

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.isAdmin;

  const handleLogin = async () => {
    if (user) {
      navigate(isAdmin ? "/admin" : "/user");
    } else {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log(result);
        const userData = {
          name: result.user.displayName,
          email: result.user.email,
          profilePic: result.user.photoURL,
          isAdmin: adminEmails.includes(result.user.email),
        };
        dispatch(loginSuccess(userData));

        navigate(userData.isAdmin ? "/admin" : "/user");
      } catch (error) {
        console.error("Login Error:", error);
      }
    }
  };

  return (
    <div className="home-container">
      <div className="logo">
        <img src={logo} alt="App Logo" />
      </div>
      <div className="left-section">
        <h1>
          <TypeAnimation
            sequence={[
              "Drive Your Dream, For Less!",
              1000,
              "Find the Best Deals on Second-Hand Cars!",
              2000,
              "Your Dream Car is Just a Click Away!",
              1500,
            ]}
            speed={50}
            repeat={Infinity}
            className="type-animation"
          />
        </h1>
        <p>
          Find the best second-hand cars at unbeatable prices. Whether you're
          buying or selling, we've got you covered!
        </p>
        <button onClick={handleLogin}>
          {!user && (
            <img src={google} alt="Google Icon" className="google-icon" />
          )}
          {user ? "Go to Dashboard" : "Login with Google"}
        </button>
      </div>
      <div className="right-section">
        <img src={homeimg} alt="Car Showcase" />
      </div>
    </div>
  );
};

export default HomePage;
