import { ethers } from "ethers";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaChartLine } from "react-icons/fa";
import { useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import { getRemainingTime } from "../Shared/CustomeTimer";
import Loader from "../Shared/Loader";
import { apiConnectorGet, apiConnectorPost } from "../utils/APIConnector";
import { domain, endpoint, frontend, token_contract } from "../utils/APIRoutes";
import { enCryptData } from "../utils/Secret";
import copy from "copy-to-clipboard";
import { CopyAll, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];
const rpcUrl = "https://opbnb-mainnet-rpc.bnbchain.org";

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [no_of_Tokne, setno_of_Tokne] = useState("");
  const client = useQueryClient();
  const [loding, setLoding] = useState(false);
  const [page, setPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());
  const isBuyingRef = useRef(false);
  const pageIntervalRef = useRef(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [user_nft, set_nft_data] = useState([])
  const [balances, setBalances] = useState({ bnb: "0", usd: "0" });
  const usdTokenAddress = token_contract;
  const loginwalletAddress =
    useSelector((state) => state?.counter?.walletAddress) ||
    localStorage.getItem("walletAddress");

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
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      const currentChain = await window.ethereum.request({
        method: "eth_chainId",
      });

      // ✅ Only switch if not already on opBNB
      // if (currentChain !== chainIdHex) {
      //   try {
      //     await window.ethereum.request({
      //       method: "wallet_switchEthereumChain",
      //       params: [{ chainId: chainIdHex }],
      //     });
      //   } catch (switchErr) {
      //     // 🧩 If network not added, then add
      //     if (switchErr.code === 4902) {
      //       await window.ethereum.request({
      //         method: "wallet_addEthereumChain",
      //         params: [
      //           {
      //             chainId: chainIdHex,
      //             chainName: "opBNB Mainnet",
      //             rpcUrls: ["https://opbnb-mainnet-rpc.bnbchain.org"],
      //             nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      //             blockExplorerUrls: ["https://mainnet.opbnbscan.com"],
      //           },
      //         ],
      //       });
      //     } else {
      //       throw switchErr;
      //     }
      //   }
      // }

      // ⏳ short delay — allows TokenPocket to settle
      await new Promise((r) => setTimeout(r, 800));

      // ✅ Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0];
      setWalletAddress(userAccount);

      // ✅ Fetch token balance
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

  const startAutoPagination = (currPage, totalPage) => {
    if (pageIntervalRef.current) clearInterval(pageIntervalRef.current);
    pageIntervalRef.current = setInterval(() => {
      setPage((prevPage) => {
        if (prevPage < totalPage) {
          return prevPage + 1;
        } else {
          clearInterval(pageIntervalRef.current);
          return 1;
        }
      });
    }, 10000);
  };

  const handleClick = (nft_id, nft_amount, e) => {
    e?.preventDefault?.();
    isBuyingRef.current = true;
    if (pageIntervalRef.current) clearInterval(pageIntervalRef.current);
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to buy this NFT?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, buy it!",
    }).then((result) => {
      if (result.isConfirmed) {
        sendTokenTransaction(nft_id, nft_amount);
      } else {
        isBuyingRef.current = false;
        if (
          user_nft?.result?.currPage &&
          user_nft?.result?.totalPage
        ) {
          const { currPage, totalPage } = user_nft?.result;
          startAutoPagination(currPage, totalPage);
        }
      }
    });
  };

  // useEffect(() => {
  //   requestAccount();
  // }, []);

  // ✅ Fetch balances
  async function getBalances(wallet) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // 1️⃣ Get BNB balance
      const rawBnb = await provider.getBalance(wallet);
      const bnb = ethers.utils.formatEther(rawBnb);

      // 2️⃣ Get USD token balance
      const token = new ethers.Contract(usdTokenAddress, erc20Abi, provider);
      const [rawUsd, decimals] = await Promise.all([
        token.balanceOf(wallet),
        token.decimals(),
      ]);

      const usd = ethers.utils.formatUnits(rawUsd, decimals);

      // 3️⃣ Save into object
      setBalances({
        bnb: Number(bnb).toFixed(6),
        usd: Number(usd).toFixed(2),
      });
      setno_of_Tokne(Number(usd).toFixed(2));
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      getBalances(walletAddress);
    }
  }, [walletAddress]);

  // async function sendTokenTransaction(nft_id, nft_amount) {
  //   if (!walletAddress) return toast("Please connect your wallet.");

  //   if (Number(no_of_Tokne || 0) < Number(nft_amount || 0)) {
  //     Swal.fire({
  //       title: "Error!",
  //       text: `Insufficient Wallet Balance! Expected: ${Number(
  //         nft_amount
  //       )?.toFixed(3)}, Got: ${Number(no_of_Tokne)?.toFixed(3)}`,
  //       icon: "error",
  //       confirmButtonColor: "#75edf2",
  //     });
  //     return;
  //   }

  //   const usdAmount = Number(nft_amount);
  //   if (usdAmount <= 0) {
  //     Swal.fire({
  //       title: "Error!",
  //       text: "Please select a valid package.",
  //       icon: "error",
  //       confirmButtonColor: "#75edf2",
  //     });
  //     return;
  //   }

  //   try {
  //     setLoding(true);

  //     // ✅ Switch to opBNB chain
  //     await window.ethereum.request({
  //       method: "wallet_switchEthereumChain",
  //       params: [{ chainId: "0xCC" }],
  //     });

  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();

  //     // ✅ Get backend data
  //     const dummyData = await PayinZpDummy(nft_id, nft_amount);
  //     if (!dummyData?.success || !dummyData?.last_id) {
  //       setLoding(false);
  //       Swal.fire({
  //         title: "Error!",
  //         text: dummyData?.message || "Server error",
  //         icon: "error",
  //         confirmButtonColor: "#75edf2",
  //       });
  //       return;
  //     }

  //     const last_id = Number(dummyData.last_id);
  //     const contractAddress = "0x668e639bdd4b969558148c85ea53a79e18d866a8";
  //     const usdtContractAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";

  //     const isFirstNFT = Number(dummyData?.to_id) === 0;
  //     const zero = ethers.constants.AddressZero;

  //     // ✅ Define base wallets
  //     const pkg_milestone_wallet = dummyData?.pkg_milestone_wallet || zero;
  //     const pkg_saving_wallet = dummyData?.pkg_saving_wallet || zero;

  //     // ✅ Default struct values
  //     let transferParams = {
  //       user_wallet: zero,
  //       user_amount: ethers.utils.parseUnits("0", 18),
  //       owner_wallet: zero,
  //       owner_amount: ethers.utils.parseUnits("0", 18),
  //       saving_wallet: pkg_saving_wallet,
  //       saving_amount: ethers.utils.parseUnits("0", 18),
  //       submilestone_wallet: pkg_milestone_wallet,
  //       submilestone_amount: ethers.utils.parseUnits("0", 18),
  //       nft_purchase_wallet: zero,
  //       nft_purchase_amount: ethers.utils.parseUnits("0", 18),
  //       nft_milestone_wallet: zero,
  //       nft_milestone_amount: ethers.utils.parseUnits("0", 18),
  //       burning_wallet: zero,
  //       burning_amount: ethers.utils.parseUnits("0", 18),
  //     };

  //     if (isFirstNFT) {
  //       transferParams.nft_purchase_wallet =
  //         dummyData?.nft_purchase_wallet_address || zero;
  //       transferParams.nft_purchase_amount = ethers.utils.parseUnits(
  //         usdAmount.toString(),
  //         18
  //       );
  //     } else {
  //       const amount_gose_to_user = Number(dummyData?.prenciple_amount || 0);
  //       const amount_gose_to_nft_milestone_wallet = Number(
  //         dummyData?.milestone_wallet_amount || 0
  //       );
  //       const amount_gose_to_burning_wallet = Number(
  //         dummyData?.burning_wallet_amount || 0
  //       );

  //       const raw_payout =
  //         usdAmount -
  //         (amount_gose_to_user +
  //           amount_gose_to_nft_milestone_wallet +
  //           amount_gose_to_burning_wallet);

  //       const amount_gose_to_payout_wallet = Math.max(
  //         0,
  //         Number(raw_payout.toFixed(8))
  //       );

  //       // console.log("💰 Distribution Check:", {
  //       //   usdAmount,
  //       //   amount_gose_to_user,
  //       //   amount_gose_to_nft_milestone_wallet,
  //       //   amount_gose_to_burning_wallet,
  //       //   payout: amount_gose_to_payout_wallet,
  //       // });

  //       transferParams.user_wallet = dummyData?.to_wallet || zero;
  //       transferParams.user_amount = ethers.utils.parseUnits(
  //         amount_gose_to_user.toString(),
  //         18
  //       );

  //       transferParams.owner_wallet = dummyData?.payout_wallet_address || zero;
  //       transferParams.owner_amount = ethers.utils.parseUnits(
  //         amount_gose_to_payout_wallet.toString(),
  //         18
  //       );

  //       transferParams.nft_milestone_wallet =
  //         dummyData?.milestone_wallet_address || zero;
  //       transferParams.nft_milestone_amount = ethers.utils.parseUnits(
  //         amount_gose_to_nft_milestone_wallet.toString(),
  //         18
  //       );

  //       transferParams.burning_wallet =
  //         dummyData?.burning_wallet_address || zero;
  //       transferParams.burning_amount = ethers.utils.parseUnits(
  //         amount_gose_to_burning_wallet.toString(),
  //         18
  //       );
  //     }

  //     const totalApprovalAmount = ethers.utils.parseUnits(
  //       usdAmount.toString(),
  //       18
  //     );

  //     // ✅ Correct ABI (named struct argument)
  //     const usdtAbi = [
  //       "function approve(address spender, uint256 value) public returns (bool)",
  //       "function allowance(address owner, address spender) view returns (uint256)",
  //     ];

  //     const contractAbi = [
  //       "function transferToken((address user_wallet,uint256 user_amount,address owner_wallet,uint256 owner_amount,address saving_wallet,uint256 saving_amount,address submilestone_wallet,uint256 submilestone_amount,address nft_purchase_wallet,uint256 nft_purchase_amount,address nft_milestone_wallet,uint256 nft_milestone_amount,address burning_wallet,uint256 burning_amount) p) external",
  //     ];

  //     const usdtContract = new ethers.Contract(
  //       usdtContractAddress,
  //       usdtAbi,
  //       signer
  //     );
  //     const contract = new ethers.Contract(
  //       contractAddress,
  //       contractAbi,
  //       signer
  //     );

  //     // console.log("🧾 Final transferParams:", transferParams);

  //     // ✅ Approve
  //     const unlimitedAllowence = ethers.constants.MaxUint256;

  //     const approveTx = await usdtContract.approve(
  //       contractAddress,
  //       unlimitedAllowence
  //     );
  //     // const approveTx = await usdtContract.approve(
  //     //   contractAddress,
  //     //   totalApprovalAmount
  //     // );

  //     await approveTx.wait();

  //     // ✅ Execute transfer
  //     const tx = await contract.transferToken(transferParams);
  //     const receipt = await tx.wait();

  //     // ✅ Update backend
  //     await PayinZp(
  //       tx.hash,
  //       receipt.status === 1 ? 2 : 3,
  //       last_id,
  //       nft_id,
  //       nft_amount
  //     );

  //     // ✅ Alerts
  //     if (receipt.status === 1) {
  //       await requestAccount()
  //       Swal.fire({
  //         title: "Success!",
  //         text: "🎉 NFT Bought Successfully",
  //         icon: "success",
  //         confirmButtonColor: "#75edf2",
  //       });
  //       client.refetchQueries("get_nft_by_user");
  //     } else {
  //       Swal.fire({
  //         title: "Error!",
  //         text: "Transaction failed!",
  //         icon: "error",
  //         confirmButtonColor: "#75edf2",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("❌ Error:", error);
  //     if (error?.data?.message) toast(error.data.message);
  //     else if (error?.reason) toast(error.reason);
  //     else toast("Transaction failed.");
  //   } finally {
  //     setLoding(false);
  //   }
  // }

  async function sendTokenTransaction(nft_id, nft_amount) {
    // if (!walletAddress) return toast("Please connect your wallet.");
    const usdAmount = Number(nft_amount);
    if (usdAmount <= 0) {
      Swal.fire({
        title: "Error!",
        text: "Please select a valid nft.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      return;
    }
    try {
      setLoding(true);
      const res = await apiConnectorPost(endpoint?.trading, {
        nft_id,
        trad_type: "BUY"
      });
      if (res?.data?.success) {
        Swal.fire({
          title: "Success!",
          text: "🎉 NFT Bought Successfully",
          icon: "success",
          confirmButtonColor: "#75edf2",
        });
        handleFullRefresh();
      } else {
        Swal.fire({
          title: "Error!",
          text: res?.data?.message,
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
      }
    } catch (error) {
      console.error(" Error:", error);
      if (error?.data?.message) toast(error.data.message);
      else if (error?.reason) toast(error.reason);
      else toast("Transaction failed.");
    } finally {
      setLoding(false);
    }
  }

  const functionTOCopy = (value) => {
    copy(value);
    toast.success("Copied to clipboard!", { id: 1 });
  };

  async function PayinZp(tr_hash, status, id, nft_id, nft_amount) {
    setLoding(true);

    const reqbody = {
      req_amount: nft_amount,
      u_user_wallet_address: walletAddress,
      u_transaction_hash: tr_hash,
      u_trans_status: status,
      currentBNB: 0,
      currentZP: no_of_Tokne,
      gas_price: "1",
      pkg_id: nft_id,
      last_id: id,
    };
    try {
      await apiConnectorPost(
        endpoint?.activation_request_nft,
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

  async function PayinZpDummy(nft_id, nft_amount) {
    const reqbody = {
      req_amount: nft_amount,
      u_user_wallet_address: walletAddress,
      u_transaction_hash: "xxxxxxxxxx",
      u_trans_status: 1,
      currentBNB: 0,
      currentZP: no_of_Tokne,
      gas_price: "1",
      pkg_id: nft_id,
      deposit_type: "NFT",
    };
    try {
      const res = await apiConnectorPost(
        endpoint?.dummy_activation_request_nft,
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

  const { data: profile, refetch } = useQuery(
    ["get_profile_user"],
    () => apiConnectorGet(endpoint?.member_profile_detail),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: true,
    }
  );
  const user_profile = profile?.data?.result?.[0] || {};


  const getNFTData = async () => {
    try {
      const res = await apiConnectorPost(endpoint?.get_nft, {
        page: page,
        count: "12",
        isreserve: "no"
      })
      set_nft_data(res?.data || [])
    } catch (e) {
      alert(e.message)
    }
  }
  useEffect(() => {
    getNFTData();
  }, [page])

  const { data: count_dashborad, refetch: incomerefetch } = useQuery(
    ["get_count_dashborad"],
    () => apiConnectorGet(endpoint?.get_member_dashboard_api),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
  const user_count_dashborad = count_dashborad?.data?.result?.[0] || [];

  const handleFullRefresh = async () => {
    setLoding(true);

    try {
      await Promise.all([
        refetch(), // user profile
        incomerefetch(), // income
        getNFTData(),
        client.refetchQueries(["get_nft_by_user"]), // NFTs
      ]);
      toast.success("Dashboard refreshed!");
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh dashboard.");
    } finally {
      setLoding(false);
    }
  };

  // console.log(user_count_dashborad?.NFT_DELAY_COM_ROI);

  // useEffect(() => {
  //   const now = new Date();
  //   const startDate = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate(),
  //     0,
  //     0,
  //     0,
  //     0
  //   );
  //   const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  //   const interval = setInterval(() => {
  //     const updated = getRemainingTime(endDate);
  //     setTimeLeft(updated);
  //     if (updated.totalSec <= 0) clearInterval(interval);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const setupTimer = () => {
      const now = new Date();

      // Start of today at 3:00 PM
      let startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        15, // 15 = 3:00 PM
        0,
        0,
        0
      );

      // End time = next day's 3:00 PM
      let endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      // Agar abhi 3PM se pehle hai → previous day ka 3PM se cycle start kare
      if (now < startDate) {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
      }

      return endDate;
    };

    let endDate = setupTimer();

    const interval = setInterval(() => {
      const updated = getRemainingTime(endDate);
      setTimeLeft(updated);

      // Jab countdown 0 ho jaye to next 3PM cycle start ho
      if (updated.totalSec <= 0) {
        endDate = setupTimer(); // reset next day ke liye
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (
      !isBuyingRef.current &&
      user_nft?.result?.currPage &&
      user_nft?.result?.totalPage
    ) {
      const { currPage, totalPage } = user_nft.result;
      startAutoPagination(currPage, totalPage);
    }

    return () => clearInterval(pageIntervalRef.current);
  }, [user_nft?.result?.currPage, user_nft?.result?.totalPage]);

  const navigate = useNavigate();

  async function payoutFun() {
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a valid amount.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      return;
    }

    try {
      setLoding(true);
      const res = await apiConnectorPost(endpoint?.member_payout_nft_wallet, {
        req_amount: payoutAmount,
      });

      if (res?.data?.success) {
        Swal.fire({
          title: "Success!",
          text: "🎉 Payout Successful!",
          icon: "success",
          confirmButtonColor: "#75edf2",
        });
        setIsPayoutModalOpen(false);
        setPayoutAmount("");
        handleFullRefresh();
      } else {
        Swal.fire({
          title: "Error!",
          text: res?.data?.message,
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error?.data?.message || "Transaction failed.");
    } finally {
      setLoding(false);
    }
  }

  return (
    <div className="text-white">
      {/* <div
    className="absolute top-0 left-0 z-0 w-full h-[369px] overflow-hidden bg-no-repeat bg-cover"
    style={{
      backgroundImage:
        "url('https://bitnest.me/assets/animation-cPTDWzld_1-K9NTpCSI.gif')",
    }}
  ></div> */}
      <Loader isLoading={loding} />
      <div className="relative z-10 px-6 py-6 !overscroll-auto !bg-black">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={handleFullRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition"
          >

            <Refresh className={`${loding ? "animate-spin" : ""} !text-white`} />
            Refresh
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 ">
          {/* Left Card */}
          <div className="w-full lg:w-1/ ">
            <h2 className="hidden lg:block text-3xl text-gray-100 font-bold mb-4">
              Buy NFT
            </h2>
            <div className="bg-custom-bg bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01] ">
              <div className="flex  justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">User Details</h3>
                <div className="flex lg:flex-row flex-col gap-5 justify-end">
                  <button
                    className="px-4 py-1 border border-white/20 font-extrabold rounded-md text-sm hover:bg-white/10"
                    onClick={() => navigate("/topup_data")}
                  >
                    Upgrade
                  </button>
                  <button
                    className="px-4 py-1 border border-white/20 text-black font-extrabold rounded-md text-sm hover:bg-white/10"
                    onClick={() =>
                      functionTOCopy(
                        frontend +
                        "/register?referral_id=" +
                        user_profile?.lgn_cust_id
                      )
                    }
                  >
                    Refer <CopyAll />
                  </button>
                </div>
              </div>

              <p className="flex  flex-row items-center justify-between gap-3 text-center font-semibold mb-6 text-gray-100">
                <span className="text-white px-4 py-2 rounded-full shadow-md text-lg">
                  User ID:{" "}
                  <span className="font-bold">
                    {user_profile?.lgn_cust_id || "N/A"}
                  </span>
                </span>

                <span className="flex items-center gap-2 text-white px-4 py-2 rounded-full shadow-md border border-green-500 animate-pulse text-base sm:text-lg">
                  🕔
                  <span className="font-mono text-lg sm:text-xl">
                    {timeLeft.hrs}:{timeLeft.mins}:{timeLeft.secs}
                  </span>
                </span>
              </p>

              {/* User Profile Details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-medium mb-4">

                <InfoItem
                  label="Current Package"
                  value={user_profile?.m03_pkg_name || "N/A"}
                />
                <InfoItem
                  label="Total Leverage"
                  value={
                    Number(user_profile?.total_leverage)?.toFixed(2) || "N/A"
                  }
                />
                <InfoItem
                  label="Used Leverage "
                  value={user_profile?.used_leverage || "0"}
                />
                <InfoItem
                  label=" Leverage Remaining "
                  value={
                    Number(
                      Number(user_profile?.total_leverage || 0) -
                      Number(user_profile?.used_leverage || 0)
                    ) || "0"
                  }
                />
                <InfoItem
                  label="My Direct"
                  value={user_profile?.tr03_dir_mem || "N/A"}
                />

                <InfoItem
                  label="My Team"
                  value={user_profile?.tr03_team_mem || "N/A"}
                />
                <div className="flex gap-5  justify-start">
                  <InfoItem
                    label="NFT Wallet"
                    value={user_profile?.tr03_nft_wallet || "N/A"}
                  />
                  <button
                    type="button"
                    onClick={() => navigate('/nft_fund')}
                    className="bg-green-700 hover:bg-green-500 text-white font-semibold h-fit p-2 rounded transition w-fit"
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-semibold h-fit p-2 rounded transition w-fit"
                  >
                    Payout
                  </button>


                </div>
              </div>
              <p className="break-words text-xs">{loginwalletAddress}</p>
            </div>
          </div>

          {/* Right Card */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-black">
              Wallet Details
            </h2>
            <div className=" bg-custom-bg bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01]">
              <div className="text-center mb-6">
                <p className="text-sm">Total Income:</p>
                <p className="text-3xl font-extrabold text-green-400">
                  {Number(user_count_dashborad?.total_income || 0).toFixed(4)}{" "}
                  <span className="text-sm text-white">USDT</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <IncomeItem
                  label="Today Income"
                  value={user_count_dashborad?.today_income || 0}
                />
                <IncomeItem
                  label="SUB Direct Income"
                  value={user_count_dashborad?.DIRECT || 0}
                />
                <IncomeItem
                  label="SUB Level Income"
                  value={user_count_dashborad?.LEVEL || 0}
                />
                <IncomeItem
                  label="MILESTONE Income"
                  value={user_count_dashborad?.MILESTONE || 0}
                />
                <IncomeItem
                  label="NFT Trading Income"
                  value={user_count_dashborad?.NFT_TRAD || 0}
                />
                <IncomeItem
                  label="NFT Level Income"
                  value={user_count_dashborad?.NFT_LEVEL || 0}
                />
                <IncomeItem
                  label=" Delay Compensation"
                  value={user_count_dashborad?.NFT_DELAY_COM_ROI || 0}
                />
              </div>
            </div>
          </div>
        </div>
        {user_nft?.result?.data?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {" "}
              NFT Market Place
            </h2>
            {/* <div className="flex flex-wrap justify-start ">
              <div className="my-4 w-full max-w-sm mx-auto">
                <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black border border-gray-700 rounded-2xl shadow-lg p-5 text-white flex flex-col justify-center items-center transition-transform transform hover:scale-[1.02]">
                  <button
                    className="text-sm text-center text-gray-300 font-semibold py-2 px-5 rounded-md transition duration-200"
                    onClick={requestAccount}
                  >
                    Connect Your Wallet
                  </button>
                  <p className="text-xs"> {walletAddress}</p>
                </div>
              </div>

              {walletAddress && (
                <div className="my-4 w-full max-w-sm mx-auto">
                  <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black border border-gray-700 rounded-2xl shadow-lg p-5 text-white flex flex-col sm:flex-row sm:justify-between items-center transition-transform transform hover:scale-[1.02]">
                    <div className="flex flex-col items-center sm:items-start mb-3 sm:mb-0">
                      <span className="text-sm text-gray-400">BNB Balance</span>
                      <span className="text-lg font-bold text-yellow-400">
                        {balances?.bnb || "0.0000"}
                      </span>
                    </div>
                    <div className="h-[1px] w-full sm:w-[1px] sm:h-10 bg-gray-600 my-2 sm:my-0"></div>
                    <div className="flex flex-col items-center sm:items-end">
                      <span className="text-sm text-gray-400">USD Token</span>
                      <span className="text-lg font-bold text-green-400">
                        {balances?.usd || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user_nft?.result?.data?.map((nft) => (
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
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      {/* <p>NFT: {nft.m02_dist_id}</p> */}
                      <p className="text-sm text-gray-300">Price </p>
                      <p className="text-lg font-bold mb-4 text-white">
                        {Number(nft.m02_curr_price).toFixed(4)} USDT
                      </p>{" "}
                    </div>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleClick(nft?.m02_id, nft?.m02_curr_price, e)
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-fit px-2 p-1 rounded transition w-fit"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">Enter Payout Amount</h2>
            <div className="flex flex-col mb-5">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-white text-sm font-semibold">NFT Wallet Balance:</h3>
                  <p className="text-green-400 font-bold text-lg mt-2 text-center">
                    {user_profile?.tr03_nft_wallet } USDT
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPayoutAmount(Number(user_profile?.tr03_nft_wallet || 0))
                  }
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
                >
                  All
                </button>
              </div>

            </div>

            <input
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="w-full p-3 rounded-lg text-black focus:outline-none"
              placeholder="Enter amount (USDT)"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={payoutFun}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col break-words">
    <span className="text-[13px] text-white/80">{label}</span>
    <span className="text-[17px] text-white break-words whitespace-normal">
      {value}
    </span>
  </div>
);

const IncomeItem = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <FaChartLine className="text-green-400 mt-1" />
    <div>
      <p className="text-[13px] text-white/80">{label}</p>
      <p className="text-[17px] text-green-400 font-semibold">
        {Number(value).toFixed(4)}{" "}
        <span className="text-xs text-gray-300">USDT</span>
      </p>
    </div>
  </div>
);

export default Dashboard;
