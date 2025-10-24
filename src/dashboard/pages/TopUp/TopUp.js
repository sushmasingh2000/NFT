import { Box } from "@mui/material";
import { ethers } from "ethers";
import { useFormik } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../../../Shared/Loader";
import { apiConnectorGet, apiConnectorPost } from "../../../utils/APIConnector";
import { endpoint, reciepientaddress } from "../../../utils/APIRoutes";
import { enCryptData } from "../../../utils/Secret";
import { useQuery } from "react-query";
import { AccountBalance } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const tokenABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function deposit(uint256 usdtAmount, uint256 fstAmount) external",
  "function burnToken(address token, address user, uint256 amount) external",
  "function checkAllowance(address token, address user) external view returns (uint256)",
  "event Deposited(address indexed user, uint256 usdtAmount, uint256 fstAmount)",
  "event TokenBurned(address indexed user, uint256 amount)",
];

function TopupWithContWithoutPull() {
  const [walletAddress, setWalletAddress] = useState("");
  const [no_of_Tokne, setno_of_Tokne] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const [bnb, setBnb] = useState("");
  const [selectedPackageAmount, setSelectedPackageAmount] = useState(0);

  const [loding, setLoding] = useState(false);
  const fk = useFormik({
    initialValues: {
      inr_value: "",
    },
  });
  async function requestAccount() {
    if (!window.ethereum) {
      Swal.fire({
        title: "Error!",
        text: "Wallet not detected.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      return;
    }

    setLoding(true);
    const chainIdHex = "0xCC"; // 204 opBNB

    try {
      // 🧠 1️⃣ Check current network
      const currentChain = await window.ethereum.request({
        method: "eth_chainId",
      });

      // 🧱 2️⃣ If not opBNB, switch or add
      if (currentChain !== chainIdHex) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
          });
        } catch (switchErr) {
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainIdHex,
                  chainName: "opBNB Mainnet",
                  rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
                  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                  blockExplorerUrls: ["https://mainnet.opbnbscan.com"],
                },
              ],
            });
          } else throw switchErr;
        }
      }

      // ⏳ short delay — allow wallet to switch fully
      await new Promise((r) => setTimeout(r, 800));

      // ✅ 3️⃣ Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0];
      setWalletAddress(userAccount);

      // ✅ 4️⃣ Recreate provider after switch
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // ✅ 5️⃣ Fetch native BNB balance
      const bnbBalance = await provider.getBalance(userAccount);
      setBnb(ethers.utils.formatEther(bnbBalance));

      // ✅ 6️⃣ Fetch USDT token balance
      const tokenContract = new ethers.Contract(
        "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3", // opBNB USDT
        tokenABI,
        provider
      );
      const tokenBalance = await tokenContract.balanceOf(userAccount);
      setno_of_Tokne(ethers.utils.formatUnits(tokenBalance, 18));
    } catch (error) {
      console.error(error);
      // Swal.fire({
      //   title: "Error!",
      //   text: "Connection failed: " + (error?.message || JSON.stringify(error)),
      //   icon: "error",
      //   confirmButtonColor: "#75edf2",
      // });
    } finally {
      setLoding(false);
    }
  }

  const navigate = useNavigate();
  async function sendTokenTransaction() {
    if (!window.ethereum) return toast("MetaMask not detected");
    if (!walletAddress) return toast("Please connect your wallet.");

    const usdAmount = Number(selectedPackageAmount || 0);
    alert(usdAmount);
    if (usdAmount <= 0) {
      Swal.fire({
        title: "Error!",
        text: "Please select a valid package.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      return;
    }

    try {
      setLoding(true);

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xCC" }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const dummyData = await PayinZpDummy();
      if (!dummyData?.success || !dummyData?.last_id) {
        setLoding(false);
        Swal.fire({
          title: "Error!",
          text: dummyData?.message || "Server error",
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
        return;
      }

      const last_id = Number(dummyData.last_id);
      const usdtAmount = ethers.utils.parseUnits(usdAmount.toString(), 18);

      const usdtContractAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";
      const recipientAddress = reciepientaddress;

      const usdtAbi = [
        "function transfer(address to, uint256 value) public returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 value) public returns (bool)",
      ];

      const usdtContract = new ethers.Contract(
        usdtContractAddress,
        usdtAbi,
        signer
      );

      const userBalance = await usdtContract.balanceOf(userAddress);
      if (userBalance.lt(usdtAmount)) {
        setLoding(false);
        Swal.fire({
          title: "Error!",
          text: "⚠️ Insufficient USDT balance to make this payment.",
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
        return;
      }

      const tx = await usdtContract.transfer(recipientAddress, usdtAmount);
      const receipt = await tx.wait();

      setTransactionHash(tx.hash);
      setReceiptStatus(receipt.status === 1 ? "Success" : "Failure");

      await PayinZp(tx.hash, receipt.status === 1 ? 2 : 3, last_id);

      if (receipt.status === 1) {
        Swal.fire({
          title: "Success!",
          text: "🎉 Payment successful and your account has been topped up.",
          icon: "success",
          confirmButtonColor: "#75edf2",
        });
        navigate("/dashboard");
      } else {
        toast("Transaction failed!");
      }
    } catch (error) {
      console.error(error);
      if (error?.data?.message) toast(error.data.message);
      else if (error?.reason) toast(error.reason);
      else toast("Transaction failed.");
    } finally {
      setLoding(false);
    }
  }

  async function PayinZp(tr_hash, status, id) {
    setLoding(true);

    const reqbody = {
      req_amount: selectedPackageAmount,
      u_user_wallet_address: walletAddress,
      u_transaction_hash: tr_hash,
      u_trans_status: status,
      currentBNB: 0,
      currentZP: no_of_Tokne,
      gas_price: "1",
      pkg_id: fk.values.pkg_id,
      last_id: id,
    };
    try {
      console.log(reqbody);
      await apiConnectorPost(
        endpoint?.activation_request,
        {
          payload: enCryptData(reqbody),
        }
        // base64String
      );
      // toast(res?.data?.message);
      fk.handleReset();
    } catch (e) {
      console.log(e);
    }
    setLoding(false);
  }

  async function PayinZpDummy() {
    const reqbody = {
      req_amount: selectedPackageAmount,
      u_user_wallet_address: walletAddress,
      u_transaction_hash: "xxxxxxxxxx",
      u_trans_status: 1,
      currentBNB: 0,
      currentZP: no_of_Tokne,
      gas_price: "1",
      pkg_id: fk.values.pkg_id,
      deposit_type: "Mlm",
    };
    try {
      const res = await apiConnectorPost(
        endpoint?.dummy_activation_request,
        {
          payload: enCryptData(reqbody),
        }
        // base64String
      );
      return res?.data || {};
    } catch (e) {
      console.log(e);
      console.log(e);
    }
  }

  const { data, isLoading } = useQuery(
    ["get_package"],
    () => apiConnectorGet(endpoint.get_package),
    {
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  const fetchedData = data?.data?.result || [];

  return (
    <>
      <Loader isLoading={loding} />

      <div className="  flex items-center justify-center p-4 ">
        <Box className="w-full max-w-md  p-5 rounded-xl shadow-lg bg-gray-900 ">
          {/* Wallet Icon */}
          <div className="flex justify-center mb-4">
            <AccountBalance
              className="text-gold-color"
              style={{ fontSize: 60 }}
            />
          </div>

          {/* Connect Wallet Button */}
          <button
            className="w-full bg-gold-color text-black font-semibold py-2 rounded mb-4 hover:bg-white transition"
            onClick={requestAccount}
          >
            Connect With DApp
          </button>

          {/* Wallet Info */}
          <div className=" p-4 rounded-lg text-sm text-white mb-4">
            <div className="mb-2">
              <p className="font-semibold text-gold-color text-center pb-1">
                Associated Wallet
              </p>

              <p className="break-all text-center">
                {walletAddress?.substring(0, 10)}...
                {walletAddress?.substring(walletAddress?.length - 10)}
              </p>
            </div>

            <p className="font-semibold text-gold-color mt-2 mb-1">
              Wallet Balance:
            </p>
            <div className="flex justify-between mb-1">
              <span className="text-gold-color font-medium">BNB:</span>
              <span>{bnb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gold-color font-medium">USDT (opBNB):</span>
              <span>{Number(no_of_Tokne || 0)?.toFixed(4)}</span>
            </div>
          </div>
          <div className="relative w-full mb-2">
            <div className="grid grid-cols-3 gap-2 justify-center bg-gray-800 p-2 rounded-md">
              {fetchedData.map((pkg) => {
                const isSelected =
                  String(fk.values.pkg_id) === String(pkg.m03_pkg_id);
                return (
                  <button
                    key={pkg.m03_pkg_id}
                    type="button"
                    onClick={() => {
                      fk.setFieldValue("pkg_id", pkg.m03_pkg_id);
                      setSelectedPackageAmount(Number(pkg.m03_pkg_amount));
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${
              isSelected
                ? "bg-yellow-400 text-black shadow-md scale-105"
                : "bg-gray-700 text-white hover:bg-yellow-300 hover:text-black"
            }`}
                  >
                    ${parseFloat(pkg.m03_pkg_amount)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          {/* <div className="mb-4">
            <input
              placeholder="Enter TopUp Amount"
              id="inr_value"
              name="inr_value"
              value={fk.values.inr_value}
              onChange={fk.handleChange}
              className="w-full p-2 text-sm rounded-md bg-gray-700 text-white  focus:ring focus:ring-yellow-300 outline-none"
            />
          </div> */}

          {/* Confirm Button */}
          <button
            className="w-full bg-gold-color text-black font-semibold py-2 rounded-full hover:bg-white transition"
            onClick={sendTokenTransaction}
          >
            Pay Now
          </button>

          {/* Transaction Info */}
          {transactionHash && (
            <div className="bg-gray-700 p-4 mt-4 rounded-lg text-xs text-white ">
              <div className="mb-2">
                <p className="font-semibold text-gold-color">
                  Transaction Hash:
                </p>
                <p className="break-words">{transactionHash}</p>
              </div>
              {/* <div className="mb-2 flex justify-between">
              <p className="text-gold-color">Gas Price:</p>
              <p className="font-semibold">{gasprice}</p>
            </div> */}
              <div className="flex justify-between">
                <p className="text-gold-color">Transaction Status:</p>
                <p className="font-semibold">{receiptStatus}</p>
              </div>
            </div>
          )}
        </Box>
      </div>
    </>
  );
}
export default TopupWithContWithoutPull;
