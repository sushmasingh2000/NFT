import { Box } from "@mui/material";
import { ethers } from "ethers";
import { useFormik } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../../../Shared/Loader";
import { apiConnectorGet, apiConnectorPost } from "../../../utils/APIConnector";
import { endpoint } from "../../../utils/APIRoutes";
import { enCryptData } from "../../../utils/Secret";
import { useQuery } from "react-query";
import { AccountBalance } from "@mui/icons-material";
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
    setLoding(true);

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
        setWalletAddress(userAccount);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const nativeBalance = await provider.getBalance(userAccount);
        setBnb(ethers.utils.formatEther(nativeBalance));
        const tokenContract = new ethers.Contract(
          "0x55d398326f99059fF775485246999027B3197955",
          tokenABI,
          provider
        );
        const tokenBalance = await tokenContract.balanceOf(userAccount);
        setno_of_Tokne(ethers.utils.formatUnits(tokenBalance, 18));
      } catch (error) {
        console.log(error);
        toast("Error connecting...", error);
      }
    } else {
      toast("Wallet not detected.");
    }
    setLoding(false);
  }

 async function sendTokenTransaction() {
  if (!window.ethereum) return toast("MetaMask not detected");
  if (!walletAddress) return toast("Please connect your wallet.");

  const usdAmount = Number(selectedPackageAmount || 0);
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

    // ✅ Switch to BSC Mainnet
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }],
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    // 📡 Call your backend for dummy data
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

    const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955";
    const recipientAddress = "0x2583fdfd4319Bb44F0afC6a706440858174593F8";

    const usdtAbi = [
      "function transfer(address to, uint256 value) public returns (bool)",
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 value) public returns (bool)"
    ];

    const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, signer);

    // 🧾 Check USDT balance
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

    // 🚀 Send USDT transfer
    const tx = await usdtContract.transfer(recipientAddress, usdtAmount);
    const receipt = await tx.wait();

    setTransactionHash(tx.hash);
    setReceiptStatus(receipt.status === 1 ? "Success" : "Failure");

    await PayinZp(tx.hash, receipt.status === 1 ? 2 : 3, last_id);
    // await PayinZp("xxxx",  2, last_id , fk);

    if (receipt.status === 1) {
      Swal.fire({
        title: "Success!",
        text: "🎉 Payment successful and your account has been topped up.",
        icon: "success",
        confirmButtonColor: "#75edf2",
      });
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



  async function PayinZp( tr_hash, status, id) {
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
      console.log(reqbody)
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
   console.log(reqbody)
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
    ['get_package'],
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
            <AccountBalance className="text-gold-color" style={{ fontSize: 60 }} />
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
              <span className="text-gold-color font-medium">USDT (BEP20):</span>
              <span>{Number(no_of_Tokne || 0)?.toFixed(4)}</span>
            </div>
          </div>
          <div className="mb-4">
            <select
              name="pkg_id"
              value={fk.values.pkg_id}
              onChange={(e) => {
                const pkg_id = e.target.value;
                fk.setFieldValue("pkg_id", pkg_id);

                const selectedPkg = fetchedData.find(
                  (pkg) => String(pkg.m03_pkg_id) === String(pkg_id)
                );
                if (selectedPkg) {
                  setSelectedPackageAmount(Number(selectedPkg.m03_pkg_amount));
                } else {
                  setSelectedPackageAmount(0);
                }
              }}
              className="w-full p-2 text-sm rounded-md bg-gray-700 text-white focus:ring focus:ring-yellow-300 outline-none"
            >
              <option value="">-- Select Package --</option>
              {fetchedData.map((pkg) => (
                <option key={pkg.m03_pkg_id} value={pkg.m03_pkg_id}>
                  ${parseFloat(pkg.m03_pkg_amount)}
                </option>
              ))}
            </select>

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
