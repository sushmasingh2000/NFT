


import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import Loader from "../Shared/Loader";
import { saveToken, saveUid, saveUserCP, saveUsername } from "../Shared/redux/slices/counterSlice";
import { endpoint } from "../utils/APIRoutes";
import { Refresh } from "@mui/icons-material";
import { apiConnectorGet, apiConnectorPost } from "../utils/APIConnector";
import { useQuery } from "react-query";
import moment from "moment";
import { getRemainingTime } from "../Shared/CustomeTimer";

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletAddressArray, setwalletAddressArray] = useState([]);
  const [searchParams] = useSearchParams();
  const referral_id = searchParams.get("referral_id") || null;
  const [referralId, setReferralId] = useState(searchParams.get("referral_id") || "");
  const [username, setUsername] = useState("");
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());


  // const params = window?.Telegram?.WebApp?.initDataUnsafe?.start_param;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uid } = useSelector((state) => state.aviator);
  const datatele = {
    id: referral_id,
  };
  useEffect(() => {
    requestAccount();
  }, []);
  async function requestAccount() {
    setLoading(true);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }], // Chain ID for Binance Smart Chain Mainnet
        });
        const userAccount = accounts[0];
        // console.log(accounts)
        setWalletAddress(userAccount);
        setwalletAddressArray(accounts);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Error connecting..." + error,
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
        // alert("Error connecting...", error);
      }
    } else {
      Swal.fire({
        title: "Warning!",
        text: "Wallet not detected.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      // alert("Wallet not detected.");
    }
    setLoading(false);
  }
  const Customerfunction = async () => {
    const reqbody = {
      customer_id: referralId,
    };
    try {
      const res = await apiConnectorPost(endpoint?.customer_api, reqbody);
      setData(res?.data?.result?.[0]);
    } catch (e) {
      console.log("something went wrong");
    }
  };

  useEffect(() => {
    Customerfunction();
  }, [referralId]);


  const loginFn = async () => {
    setLoading(true);
    const reqBodyy = {
      mobile: "9875874889",
      email: "nft@gmail.com",
      username: username,
      full_name: username,
      referral_id: String(referralId) || String(datatele?.id),
      wallet_address: String(walletAddress)?.toLocaleLowerCase()
    };
    // const reqBodyy = {
    //   mobile: String("9876543210"),
    //   email: String("9876543210"),
    //   full_name: String(datatele?.username||"N/A"),
    //   referral_id: String("9876543210"),
    //   username: String("9876543210"),
    //   password: String("9876543210"),
    // };

    try {
      const response = await axios.post(endpoint?.registration_api, reqBodyy, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      // console.log(response?.data);
      // toast(response?.data?.message);
      setLoading(false);
      if (response?.data?.message === "Credential not found in our record") {
        // setOpenDialogBox(true);
        return;
      }
      console.log(response?.data?.result)
      const resultData = response?.data?.result?.[0];
      const istopup = resultData?.is_topup;
      const is_real_launching = resultData?.is_real_launching;
      if (response?.data?.success) {
        dispatch(saveUid(reqBodyy?.mobile));
        dispatch(saveToken(response?.data?.result?.[0]?.token));
        dispatch(saveUsername(reqBodyy?.username));
        dispatch(saveUserCP(response?.data?.result?.isCP));
        localStorage.setItem("logindataen", response?.data?.result?.[0]?.token);
        localStorage.setItem("uid", reqBodyy?.mobile);
        localStorage.setItem("username", reqBodyy?.username);
        localStorage.setItem("isCP", response?.data?.result?.isCP);

        Swal.fire({
          title: "🎉 Congratulations!",
          html: `
            <p style="font-size:14px; margin-bottom:8px;">${response?.data?.message}</p>
            <p style="font-weight:bold; color:#f39c12; margin:0;">Subscriber Wallet Address</p>
            <p style="font-size:13px; word-break:break-all; color:#16a085; margin-top:4px;">
              ${walletAddress}
            </p>
          `,
          icon: "success",
          confirmButtonColor: "#75edf2",
        }).then((result) => {
          if (result.isConfirmed) {
            if (is_real_launching === 0) {//
              if (!istopup) {
                navigate("/topup_without");
              } else {
                navigate("/dashboard");
              }
            }
            else {
              navigate("/dashboard");
            }
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: "Warning!",
          text: response?.data?.message,
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
        // toast(response?.data?.message);
      }
    } catch (error) {
      // toast.error("Error during login.");
      Swal.fire({
        title: "Warning!",
        text: "Error during login.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      setLoading(false);
    }
  };
  useEffect(() => {
    if (walletAddress) {
      // alert("ID: " + walletAddress);
      Swal.fire({
        title: "Wallet Found!",
        text: walletAddress,
        icon: "success",
        confirmButtonColor: "#75edf2",
      });
      if (
        String(uid)?.toLocaleLowerCase() ==
        String(walletAddress || "")?.toLocaleLowerCase()
      ) {
        // navigate("/home");
      }
    }
  }, [walletAddress]);

  const { data: master_data_9, isLoading } = useQuery(
    ['master_data'],
    () => axios.get(endpoint.master_data),
    {
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  const fetchedData = master_data_9?.data?.result || [];

  useEffect(() => {
    if (!fetchedData?.[0]?.m00_updated_at) return;
    const startMoment = moment.utc(fetchedData[0].m00_updated_at);
    const targetMoment = startMoment.clone().add(48, "hours");
    let interval;
    const updateTimer = () => {
      const now = new Date();
      const totalSec = Math.max(
        Math.floor((targetMoment.toDate() - now) / 1000),
        0
      );
      const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
      const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
      const secs = String(totalSec % 60).padStart(2, "0");
      setTimeLeft({ hrs, mins, secs, totalSec });
      if (totalSec <= 0 && interval) {
        clearInterval(interval);
      }
    };
    updateTimer();
    interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [fetchedData?.[0]?.m00_updated_at]);


  return (
    <>
      <Loader isLoading={loading} />
      <div className="flex justify-center items-center min-h-screen login-section">
        <div className="bg-glassy bg-custom-bg border border-black p-6 rounded-2xl shadow-lg w-full max-w-md">

          <div className="flex justify-center  cursor-pointer  mb-5">
            <img src={logo} alt="" className="w-[180px] filter brightness-200" />
          </div>
          {/* Wallet Address */}
          {fetchedData?.[0]?.m00_status === 1 && (
            <div className='flex justify-end mb-5' >
              <span className="flex items-center gap-2 text-white px-4 py-2 rounded-full shadow-md border border-green-500 animate-pulse text-base sm:text-lg">
                🕔
                <span className="font-mono text-lg sm:text-xl">
                  {timeLeft.hrs}:{timeLeft.mins}:{timeLeft.secs}
                </span>
              </span>
            </div>
          )}
          <div className="mb-2">
            <label className="block text-black mb-1">
              Wallet Address
              <Refresh
                onClick={requestAccount}
                className="inline cursor-pointer ml-2"
              />
            </label>

            <select
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full p-2 rounded-lg border border-gold-color bg-transparent 
               text-white text-[12px] focus:outline-none focus:ring-2 
               focus:ring-gold-color"
            >
              <option value="" disabled>
                Select Wallet Address
              </option>
              {walletAddressArray?.map((addr, i) => (
                <option key={i} value={addr} className="bg-black text-white">
                  {addr.substring(0, 6)}...{addr.substring(addr.length - 4)}
                </option>
              ))}
            </select>
          </div>
          <div className=" grid lg:grid-cols-2 grid-cols-1 gap-5">

            {/* Username */}
            <div>
              {/* <label className="block text-black mb-1">Username</label> */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
                className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gold-color"
              />
            </div>

            {/* Email */}
            {/* <div>
              <label className="block text-black mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gold-color"
              />
            </div> */}

            {/* Mobile */}
            {/* <div>
              <label className="block text-black mb-1">Mobile</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter Mobile Number"
                className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gold-color"
              />
            </div> */}

            {/* Referral ID */}
            <div>
              {/* <label className="block text-black mb-1">Referral ID</label> */}
              <input
                value={referralId}
                onChange={(e) => setReferralId(e.target.value)}
                type="text"
                placeholder="Enter Referral ID"
                className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gold-color"
              />
              {
                referralId && (
                  <span className="text-white !px-2"><span className="text-white !px-2">
                    {data
                      ? (data.lgn_name)
                      : "Invalid Referral Id"}
                  </span> </span>
                )
              }
            </div>

          </div>
          <button
            onClick={loginFn}
            type="submit"
            className="w-full bg-black my-5 text-white font-medium py-2 rounded-lg hover:opacity-90 transition"
          >
            Join Now
          </button>
          <p className="text-white text-xs text-right my-2 " onClick={() => navigate('/')}>You  have an Account <span className="underline cursor-default">Login</span></p>

        </div>
      </div>
    </>
  );
};

export default Registration;
