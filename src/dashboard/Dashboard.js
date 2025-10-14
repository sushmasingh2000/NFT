import { useQuery, useQueryClient } from "react-query";
import moment from "moment";
import {
  FaChartLine,
  FaDollarSign,
  FaSitemap,
  FaUserFriends,
  FaUsers
} from "react-icons/fa";
import { ethers } from "ethers";
import { useFormik } from "formik";
import { apiConnectorGet, apiConnectorPost } from "../utils/APIConnector";
import { dollar, domain, endpoint, frontend, reciepientaddress } from "../utils/APIRoutes";
import { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { enCryptData } from "../utils/Secret";

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

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [no_of_Tokne, setno_of_Tokne] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const [selectedNftId, setSelectedNftId] = useState(null);
  const [selectedNftAmount, setSelectedNftAmount] = useState(null);
  const [shouldInitiateBuy, setShouldInitiateBuy] = useState(false);
  const [pendingNftId, setPendingNftId] = useState(null);
  const [pendingNftAmount, setPendingNftAmount] = useState(null);
  const [bnb, setBnb] = useState("");
  const client = useQueryClient()
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

        // 🔄 Switch to opBNB
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xCC" }], // Chain ID for opBNB (204 decimal)
        });

        const userAccount = accounts[0];
        setWalletAddress(userAccount);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const nativeBalance = await provider.getBalance(userAccount);
        setBnb(ethers.utils.formatEther(nativeBalance));

        const tokenContract = new ethers.Contract(
          "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3", // opBNB USDT
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

  const handleBuyClick = async (nftId, nftAmount) => {
    if (!window.ethereum) return toast("MetaMask not detected");

    setPendingNftId(nftId);
    setPendingNftAmount(nftAmount);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts?.length > 0) {
        setWalletAddress(accounts[0]); // Will trigger useEffect
        setShouldInitiateBuy(true);    // Tell useEffect to start buy flow
      } else {
        toast.error("Wallet connection failed");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  async function sendTokenTransaction(last_id, nftId, nftAmount) {
    if (!window.ethereum) return toast("MetaMask not detected");
    if (!walletAddress) return toast("Please connect your wallet.");
    console.log("NFT ID:", nftId);
    console.log("NFT Amount:", nftAmount);
    console.log("Last ID from dummy API:", last_id);


    const usdAmount = Number(nftAmount || 0);
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

      const usdtAmount = ethers.utils.parseUnits(usdAmount.toString(), 18);

      const usdtContractAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";
      const recipientAddress = reciepientaddress;

      const usdtAbi = [
        "function transfer(address to, uint256 value) public returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 value) public returns (bool)"
      ];

      const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, signer);

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

      await PayinZp(tx.hash, receipt.status === 1 ? 2 : 3, last_id, nftId, nftAmount);

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


  async function PayinZp(tr_hash, status, id, nftId, nftAmount) {
    const reqbody = {
      req_amount: nftAmount,
      u_user_wallet_address: walletAddress,
      u_transaction_hash: tr_hash,
      u_trans_status: status,
      currentBNB: 0,
      currentZP: no_of_Tokne,
      gas_price: "1",
      pkg_id: nftId,
      last_id: id,
    };
    try {
      await apiConnectorPost(endpoint?.activation_request_nft, {
        payload: enCryptData(reqbody),
      });
    } catch (e) {
      console.log("PayinZp failed", e);
    }
  }


  async function PayinZpDummy(nftId, nftAmount) {
    const reqbody = {
      req_amount: nftAmount,
      u_user_wallet_address: walletAddress,
      u_transaction_hash: "xxxxxxxxxx",
      u_trans_status: 1,
      currentBNB: 0,
      currentZP: no_of_Tokne,
      gas_price: "1",
      pkg_id: nftId,
      deposit_type: "NFT",
    };
    try {
      const res = await apiConnectorPost(endpoint?.dummy_activation_request, {
        payload: enCryptData(reqbody),
      });
      return res?.data || {};
    } catch (e) {
      console.log("Dummy request failed", e);
    }
  }
  const { data: profile } = useQuery(["get_profile_user"], () =>
    apiConnectorGet(endpoint?.member_profile_detail), {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false
  }

  );
  const user_profile = profile?.data?.result?.[0] || {};

  const { data: usernft } = useQuery(["get_nft_by_user"], () =>
    apiConnectorGet(endpoint?.get_nft),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onError: (err) => console.error("Error fetching level data:", err),
    }

  );
  const user_nft = usernft?.data?.result || [];

  useEffect(() => {
  const continueAfterWalletConnect = async () => {
    if (!shouldInitiateBuy || !walletAddress || !pendingNftId || !pendingNftAmount) return;

    const result = await Swal.fire({
      title: "Wallet Found!",
      text: walletAddress,
      icon: "success",
      confirmButtonColor: "#75edf2",
    });

    if (!result.isConfirmed) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xCC" }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const usdtContractAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";
      const usdtAbi = ["function balanceOf(address owner) view returns (uint256)"];
      const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, signer);

      const userBalance = await usdtContract.balanceOf(userAddress);
      const amountToSend = ethers.utils.parseUnits(pendingNftAmount.toString(), 18);

      if (userBalance.lt(amountToSend)) {
        Swal.fire({
          title: "Insufficient Balance!",
          text: "⚠️ You do not have enough USDT to make this purchase.",
          icon: "error",
          confirmButtonColor: "#75edf2",
        });

        resetBuyState();
        return;
      }

      const dummyRes = await PayinZpDummy(pendingNftId, pendingNftAmount);
      if (dummyRes?.success && dummyRes?.last_id) {
        await sendTokenTransaction(dummyRes.last_id, pendingNftId, pendingNftAmount);
      } else {
        Swal.fire("Error", dummyRes?.message || "Something went wrong", "error");
      }

    } catch (err) {
      console.error("Error in wallet flow:", err);
      toast.error("Transaction failed");
    } finally {
      resetBuyState();
    }
  };

  const resetBuyState = () => {
    setShouldInitiateBuy(false);
    setPendingNftId(null);
    setPendingNftAmount(null);
  };

  continueAfterWalletConnect();
}, [shouldInitiateBuy]);



  const tradingfn = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to buy this NFT?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, buy it!",
    });

    if (confirm.isConfirmed) {
      try {
        const reqbody = {
          nft_id: id,
          trad_type: "BUY",
        };

        const res = await apiConnectorPost(endpoint?.trading, reqbody);

        Swal.fire({
          icon: res?.data?.success ? "success" : "error",
          title: res?.data?.success ? "Success" : "Error",
          text: res?.data?.message || "Something went wrong",
        });
        client.refetchQueries("get_nft_by_user");
      } catch (e) {
        console.error("Something went wrong", e);
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  };
  const functionTOCopy = (value) => {
    copy(value);
    toast.success("Copied to clipboard!", { id: 1 });
  };

  const { data: count_dashborad } = useQuery(["get_count_dashborad"], () =>
    apiConnectorGet(endpoint?.get_member_dashboard_api), {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false
  }
  );
  const user_count_dashborad = count_dashborad?.data?.result?.[0] || [];


  return (

    <div className="relative text-white p-6 min-h-screen bg-black">
      <div
        className="absolute top-0 left-0 z-[1] w-full h-[369px] overflow-hidden bg-no-repeat bg-cover"
        style={{ backgroundImage: "url('https://bitnest.me/assets/animation-cPTDWzld_1-K9NTpCSI.gif')" }}
      ></div>

      <div className="relative z-10 top-20">
        <div className="flex flex-col lg:flex-row gap-8 " >
          {/* Left Card */}
          <div className="w-full lg:w-1/ ">
            <h2 className="hidden lg:block text-3xl text-gray-100 font-bold mb-4">Buy NFT</h2>
            <div className="bg-custom-bg bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01] ">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">User Details</h3>
                {/* <button className="px-4 py-1 border border-white/20 rounded-md text-sm hover:bg-white/10">Upgrade</button> */}
              </div>

              <p className="text-center text-lg font-semibold mb-6">User ID: {user_profile?.lgn_cust_id || "N/A"}</p>

              {/* User Info Grid */}
              {/* User Profile Details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-medium mb-4">
                <InfoItem label="Name" value={user_profile?.lgn_name || 'N/A'} />
                <InfoItem label="Email" value={user_profile?.lgn_email || 'N/A'} />
                <InfoItem label="Mobile" value={user_profile?.lgn_mobile || 'N/A'} />
                <InfoItem label="User Type" value={user_profile?.lgn_user_type || 'N/A'} />
                <InfoItem
                  label="Wallet"
                  value={`$ ${parseFloat(user_profile?.tr03_fund_wallet || 0).toFixed(2)}`}
                />
                <InfoItem
                  label="Current Wallet"
                  value={`$ ${parseFloat(user_profile?.tr03_inc_wallet || 0).toFixed(2)}`}
                />
                {user_profile?.m06_name && (
                  <InfoItem
                    label="Rank Name"
                    value={user_profile?.m06_name}
                  />
                )}
                <InfoItem label="Registration Date"
                  value={user_profile?.tr03_reg_date ? new Date(user_profile.tr03_reg_date).toLocaleDateString() : 'N/A'}
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                {/* <button className="bg-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-500 transition">Wallet is Connected (0 USDT)</button> */}
                <button className="border border-white/20 px-4 py-2 rounded-md text-sm hover:bg-white/10"
                  onClick={() => functionTOCopy(frontend + "/register?referral_id=" + user_profile?.lgn_cust_id)}>Refer</button>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-black">Wallet Details</h2>
            <div className=" bg-custom-bg bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01]">
              <div className="text-center mb-6">
                <p className="text-sm">Total Income:</p>
                <p className="text-3xl font-extrabold text-green-400">
                  {Number(user_profile?.tr03_total_income || 0).toFixed(4)} <span className="text-sm text-white">USDT</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <IncomeItem label="SUB Direct Income" value={user_count_dashborad?.DIRECT || 0} />
                <IncomeItem label="SUB Level Income" value={user_count_dashborad?.LEVEL || 0} />
                <IncomeItem label="MILESTONE Income" value={user_count_dashborad?.MILESTONE || 0} />
                <IncomeItem label="NFT Trading Income" value={user_count_dashborad?.NFT_TRAD || 0} />
                {/* <IncomeItem label="NFT Sell" value={user_count_dashborad?.NFT_SELL || 0} />
              <IncomeItem label="NFT Buy" value={user_count_dashborad?.NFT_BUY || 0} /> */}
                <IncomeItem label="NFT Level Income" value={user_count_dashborad?.NFT_LEVEL || 0} />
                <IncomeItem label=" Delay Compensation" value={user_count_dashborad?.NFT_DELAY_COM_ROI || 0} />
                {/* <IncomeItem label="Cashback" value={user_count_dashborad?.CASHBACK || 0} />
              <IncomeItem label="Paying" value={user_count_dashborad?.INCOME_IN || 0} />
              <IncomeItem label="Payout" value={user_count_dashborad?.INCOME_OUT || 0} /> */}
              </div>
            </div>
          </div>
        </div>
        {/* NFT List Section */}
        {user_nft?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold mb-4 text-black"> NFT Market Place</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user_nft?.filter(nft => nft?.m02_is_reserved === 0)
                ?.map((nft) => (
                  <div
                    key={nft.m02_id}
                    className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="rounded-lg overflow-hidden mb-4 border border-green-400">
                      <img
                        src={domain + nft.m01_image}
                        alt={nft.m01_name}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    {/* <p className="text-lg text-gray-300 mb-2">Buy NFT</p> */}
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-300">Current Bid</p>
                        <p className="text-lg font-bold mb-4 text-white">
                          {Number(nft.m02_curr_price).toFixed(4)} USDT
                        </p> </div>

                      <button
                        onClick={() => handleBuyClick(nft?.m02_id, nft?.m02_curr_price)}

                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-fit px-2 p-1 rounded transition w-fit"
                      >
                        Buy
                      </button></div>
                  </div>

                ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Info Component
const InfoItem = ({ label, value }) => (
  <div className="flex flex-col break-words">
    <span className="text-[13px] text-white/80">{label}</span>
    <span className="text-[17px] text-white break-words whitespace-normal">{value}</span>
  </div>
);



// Reusable Income Component
const IncomeItem = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <FaChartLine className="text-green-400 mt-1" />
    <div>
      <p className="text-[10px] ">{label}</p>
      <p className="text-[14px] text-green-400 font-semibold">{Number(value).toFixed(2)} <span className="text-xs text-gray-300">USDT</span></p>
    </div>
  </div>
);

export default Dashboard;
