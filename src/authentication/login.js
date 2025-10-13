import { Refresh } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import Loader from "../Shared/Loader";
import { saveToken, saveUid, saveUserCP, saveUsername } from "../Shared/redux/slices/counterSlice";
import { endpoint } from "../utils/APIRoutes";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletAddressArray, setwalletAddressArray] = useState([]);
  const [searchParams] = useSearchParams();
  const referral_id = searchParams.get("startapp") || null;

  // const params = window?.Telegram?.WebApp?.initDataUnsafe?.start_param;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logindataen, uid } = useSelector((state) => state.aviator);
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
        title: "Error!",
        text: "Wallet not detected.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      // alert("Wallet not detected.");
    }
    setLoading(false);
  }

  const loginFn = async (reqBody) => {
    setLoading(true);
    const reqBodyy = {

      mobile: String("N/A"),
      email: String("N/A"),
      wallet_address: String(walletAddress)?.toLocaleLowerCase(),
      type: "user",
      password: String("N/A"),
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
      const response = await axios.post(endpoint?.login_api, reqBodyy, {
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
      if (response?.data?.success) {
        dispatch(saveUid(reqBodyy?.mobile));
        dispatch(saveToken(response?.data?.result?.token));
        dispatch(saveUsername(reqBodyy?.username));
        dispatch(saveUserCP(response?.data?.result?.isCP));
        localStorage.setItem("logindataen", response?.data?.result?.token);
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
            navigate("/dashboard");
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
  return (
    <>
      <Loader isLoading={loading} />
      <div className="flex justify-center items-center min-h-screen login-section">
        <div className="bg-glassy bg-black border border-gold-color p-6 rounded-2xl shadow-lg w-full max-w-md">
          <div className="flex justify-center  cursor-pointer  mb-5">
            <img src={logo} alt="" className="w-[180px]" />
          </div>

          <div className="space-y-4">
            {/* Wallet Address */}
            <div>
              <label className="block text-text-color mb-1">
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

            {/* Referral ID */}
            {/* <div>
              <label className="block text-text-color mb-1">Referral ID</label>
              <input
                value={datatele.id}
                type="text"
                placeholder="Enter Referral ID"
                className="w-full p-2 rounded-lg border border-gold-color bg-transparent text-white placeholder:text-text-color focus:outline-none focus:ring-2 focus:ring-gold-color"
              />
            </div> */}

            {/* Submit Button */}
            <button
              onClick={loginFn}
              type="submit"
              className="w-full bg-dark-color text-text-color font-medium py-2 rounded-lg hover:opacity-90 transition"
            >
              Submit{" "}
            </button>
          </div>
          <p className="text-white text-xs text-right my-2 " onClick={() => navigate('/register')}>You don't have an Account <span className="underline cursor-pointer">SignUp</span></p>
        </div>
      </div>
    </>
  );
};

export default Login;
