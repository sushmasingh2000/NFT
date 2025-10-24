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
import { domain, endpoint, frontend } from "../utils/APIRoutes";
import { enCryptData } from "../utils/Secret";
import copy from "copy-to-clipboard";
import { CopyAll } from "@mui/icons-material";
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

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [no_of_Tokne, setno_of_Tokne] = useState("");
  const client = useQueryClient();
  const [loding, setLoding] = useState(false);
  const [page, setPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());
  const isBuyingRef = useRef(false);
  const pageIntervalRef = useRef(null);
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
      // 🧠 1️⃣ Check current network
      const currentChain = await window.ethereum.request({
        method: "eth_chainId",
      });

      // 🧱 2️⃣ If not opBNB, try switch first
      if (currentChain !== chainIdHex) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
          });
        } catch (switchErr) {
          // if not added, then add it
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

      // 💡 small pause to let TokenPocket close the popup cleanly
      await new Promise((r) => setTimeout(r, 800));

      // ✅ 3️⃣ Now safely request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0];
      setWalletAddress(userAccount);

      // ✅ 4️⃣ Fetch token balance
      const tokenContract = new ethers.Contract(
        "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3", // opBNB USDT
        tokenABI,
        provider
      );
      const tokenBalance = await tokenContract.balanceOf(userAccount);
      console.log(ethers.utils.formatUnits(tokenBalance, 18));
      setno_of_Tokne(ethers.utils.formatUnits(tokenBalance, 18));
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Connection failed: " + (error?.message || JSON.stringify(error)),
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
    } finally {
      setLoding(false);
    }
  }

  const startAutoPagination = (currPage, totalPage) => {
    // if (pageIntervalRef.current) clearInterval(pageIntervalRef.current);
    // pageIntervalRef.current = setInterval(() => {
    //   setPage((prevPage) => {
    //     if (prevPage < totalPage) {
    //       return prevPage + 1;
    //     } else {
    //       clearInterval(pageIntervalRef.current);
    //       return 1;
    //     }
    //   });
    // }, 30000);
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
          usernft?.data?.result?.currPage &&
          usernft?.data?.result?.totalPage
        ) {
          const { currPage, totalPage } = usernft.data.result;
          startAutoPagination(currPage, totalPage);
        }
      }
    });
  };

  useEffect(() => {
    requestAccount();
  }, []);
  async function sendTokenTransaction(nft_id, nft_amount) {
    if (!walletAddress) return toast("Please connect your wallet.");
     console.log(no_of_Tokne,nft_amount)
    if (no_of_Tokne < nft_amount) {
      Swal.fire({
        title: "Error!",
        text: "Insufficient Wallet Balance!",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      return;
    }

    const usdAmount = Number(nft_amount);
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

      // ✅ Switch to opBNB chain (chainId 204)
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xCC" }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      // ✅ Call your backend for transaction info
      const dummyData = await PayinZpDummy(nft_id, nft_amount);
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

      // ✅ Contract deployed on opBNB
      const contractAddress = "0x0b10a17574144ead9f361430c128cb846bb82c13";

      const userWallet =
        dummyData?.to_wallet || dummyData?.user_wallet || dummyData?.userWallet;
      const ownerWallet =
        dummyData?.own_wallet ||
        dummyData?.owner_wallet ||
        dummyData?.ownerWallet;

      const userAmount = ethers.utils.parseUnits(
        (dummyData?.prenciple_amount || 0).toString(),
        18
      );
      const ownerAmount = ethers.utils.parseUnits(
        (usdAmount - (dummyData?.prenciple_amount || 0)).toString(),
        18
      );

      // ✅ ABI definitions
      const usdtAbi = [
        "function approve(address spender, uint256 value) public returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ];

      const contractAbi = [
        "function transferToken(address user_wallet,uint256 user_amount,address owner_wallet,uint256 owner_amount) external",
      ];

      const usdtContractAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";

      const usdtContract = new ethers.Contract(
        usdtContractAddress,
        usdtAbi,
        signer
      );

      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      // ✅ Step 1: Approve contract to spend user's tokens
      const approveTx = await usdtContract.approve(
        contractAddress,
        userAmount.add(ownerAmount)
      );
      await approveTx.wait();

      // ✅ Step 2: Execute transfer through your contract
      const tx = await contract.transferToken(
        userWallet,
        userAmount,
        ownerWallet,
        ownerAmount
      );
      const receipt = await tx.wait();

      // ✅ Step 3: Update backend after transaction
      await PayinZp(
        tx.hash,
        receipt.status === 1 ? 2 : 3,
        last_id,
        nft_id,
        nft_amount
      );

      // ✅ Alerts (unchanged)
      if (receipt.status === 1) {
        Swal.fire({
          title: "Success!",
          text: "🎉 NFT Bought Successfully",
          icon: "success",
          confirmButtonColor: "#75edf2",
        });
        client.refetchQueries("get_nft_by_user");
      } else {
        Swal.fire({
          title: "Error!",
          text: "Transaction failed!",
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
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

  const functionTOCopy = (value) => {
    copy(value);
    toast.success("Copied to clipboard!");
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
      console.log(reqbody);
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

  const { data: profile } = useQuery(
    ["get_profile_user"],
    () => apiConnectorGet(endpoint?.member_profile_detail),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: true,
      retry: true,
    }
  );
  const user_profile = profile?.data?.result?.[0] || {};

  const { data: usernft } = useQuery(
    ["get_nft_by_user", page],
    () =>
      apiConnectorPost(endpoint?.get_nft, {
        page: page,
        count: "10",
      }),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onError: (err) => console.error("Error fetching level data:", err),
    }
  );
  const user_nft = usernft?.data?.result || [];

  const { data: count_dashborad } = useQuery(
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

  useEffect(() => {
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    const interval = setInterval(() => {
      const updated = getRemainingTime(endDate);
      setTimeLeft(updated);
      if (updated.totalSec <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      !isBuyingRef.current &&
      usernft?.data?.result?.currPage &&
      usernft?.data?.result?.totalPage
    ) {
      const { currPage, totalPage } = usernft.data.result;
      startAutoPagination(currPage, totalPage);
    }

    return () => clearInterval(pageIntervalRef.current);
  }, [usernft?.data?.result?.currPage, usernft?.data?.result?.totalPage]);

  const navigate = useNavigate();
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
        <div className="flex flex-col lg:flex-row gap-8 ">
          {/* Left Card */}
          <div className="w-full lg:w-1/ ">
            <h2 className="hidden lg:block text-3xl text-gray-100 font-bold mb-4">
              Buy NFT
            </h2>
            <div className="bg-custom-bg bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01] ">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">User Details</h3>
                <div className="flex gap-5 justify-end">
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

              <p className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center font-semibold mb-6 text-gray-100">
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

              {/* User Info Grid */}
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
                  value={user_profile?.used_levelrage || "0"}
                />
                <InfoItem
                  label=" Leverage Remaining "
                  value={
                    Number(
                      Number(user_profile?.total_leverage || 0) -
                        Number(user_profile?.used_levelrage || 0)
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
        {user_nft?.data?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {" "}
              NFT Market Place
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user_nft?.data
                ?.filter((nft) => nft?.m02_is_reserved === 0)
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
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <p>NFT: {nft.m02_dist_id}</p>
                        <p className="text-sm text-gray-300">Price</p>
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
        {Number(value).toFixed(2)}{" "}
        <span className="text-xs text-gray-300">USDT</span>
      </p>
    </div>
  </div>
);

export default Dashboard;
