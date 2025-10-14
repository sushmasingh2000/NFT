
import { Refresh } from '@mui/icons-material';
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { saveToken, saveUid, saveUserCP, saveUsername } from "../../../Shared/redux/slices/counterSlice";
import { endpoint } from '../../../utils/APIRoutes';
import toast from 'react-hot-toast';


const LogIn = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const loginFn = async () => {
    setLoading(true);
    const reqBodyy = {
      email: email,
      password: password,
      otp: otp
    };
  try {
      const response = await axios.post(endpoint?.admin_login_api, reqBodyy, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      setLoading(false);
      if (response?.data?.success) {
        localStorage.setItem("logindataen", response?.data?.result?.token);
        localStorage.setItem("uid", reqBodyy?.mobile);
        localStorage.setItem("username", reqBodyy?.role);
        localStorage.setItem("isCP", response?.data?.result?.isCP);

        Swal.fire({
          title: "🎉 Congratulations!",
          html: `
             <p style="font-size:14px; margin-bottom:8px;">${response?.data?.message}</p>
           
           `,
          icon: "success",
          confirmButtonColor: "#75edf2",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/admindashboard");
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response?.data?.message,
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
        // toast(response?.data?.message);
      }
    } catch (error) {
      // toast.error("Error during login.");
      Swal.fire({
        title: "Error!",
        text: "Error during login.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#397EF3] via-[#060C95] to-[#00008B]">
      <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 py-10 w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-wide">
          Welcome Back
        </h2>
        <div className="mb-4">
          <label className="block text-text-color mb-1">Email </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email or mobile"
            className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white text-[12px]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-color mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white text-[12px]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-color mb-1">OTP (6-digit)</label>
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP "
            className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white text-[12px]"
          />
        </div>


        <button
          onClick={loginFn}
          type="submit"
          className="mt-5 w-full bg-gradient-to-t from-[#1E3C94] to-[#7D85FE] hover:bg-[#1E3C94] text-white py-2 rounded-full font-semibold shadow-md transition-all duration-200"
        >
          Login Now
        </button>
      </div>
    </div>
  );
};

export default LogIn;
