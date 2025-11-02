import { Box } from "@mui/material";
import { ethers } from "ethers";
import { useFormik } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../../../Shared/Loader";
import { apiConnectorPost } from "../../../utils/APIConnector";
import { endpoint } from "../../../utils/APIRoutes";
import { enCryptData } from "../../../utils/Secret";
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

function NFTFund() {
  const [walletAddress, setWalletAddress] = useState("");
  const [no_of_Tokne, setno_of_Tokne] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const [bnb, setBnb] = useState("");

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
    const chainIdHex = "0xCC"; 

    try {
      const currentChain = await window.ethereum.request({
        method: "eth_chainId",
      });

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

      await new Promise((r) => setTimeout(r, 800));
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0];
      setWalletAddress(userAccount);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const bnbBalance = await provider.getBalance(userAccount);
      setBnb(ethers.utils.formatEther(bnbBalance));
      const tokenContract = new ethers.Contract(
        "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3", 
        tokenABI,
        provider
      );
      const tokenBalance = await tokenContract.balanceOf(userAccount);
      setno_of_Tokne(ethers.utils.formatUnits(tokenBalance, 18));
    } catch (error) {
      console.error(error);
    } finally {
      setLoding(false);
    }
  }

  const navigate = useNavigate();
  async function sendTokenTransaction() {
    if (!window.ethereum) return toast("MetaMask not detected");
    if (!walletAddress) return toast("Please connect your wallet.");

    const usdAmount = Number(fk.values.inr_value || 0);
    if (usdAmount <= 0) {
      Swal.fire({
        title: "Error!",
        text: "Please select a valid package.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      return;
    }

    if (Number(no_of_Tokne || 0) < Number(usdAmount || 0)) {
      Swal.fire({
        title: "Error!",
        text: `Insufficient Wallet Balance! Expected: ${Number(
          usdAmount
        )?.toFixed(3)}, Got: ${Number(no_of_Tokne)?.toFixed(3)}`,
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
      const contractAddress = "0x668e639bdd4b969558148c85ea53a79e18d866a8";
      const usdtContractAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";

      const zero = ethers.constants.AddressZero;
      const pkg_milestone_wallet = dummyData?.pkg_milestone_wallet || zero;
      const pkg_saving_wallet = dummyData?.pkg_saving_wallet || zero;
      const pkg_milestone_amount = Number(dummyData?.pkg_milestone_amount || 0);
      const pkg_saving_amount = Number(dummyData?.pkg_saving_amont || 0);

      let transferParams = {
        user_wallet: zero,
        user_amount: ethers.utils.parseUnits("0", 18),
        owner_wallet: zero,
        owner_amount: ethers.utils.parseUnits("0", 18),
        saving_wallet: pkg_saving_wallet,
        saving_amount: ethers.utils.parseUnits("0", 18),
        submilestone_wallet: pkg_milestone_wallet,
        submilestone_amount: ethers.utils.parseUnits("0", 18),
        nft_purchase_wallet: zero,
        nft_purchase_amount: ethers.utils.parseUnits("0", 18),
        nft_milestone_wallet: zero,
        nft_milestone_amount: ethers.utils.parseUnits("0", 18),
        burning_wallet: zero,
        burning_amount: ethers.utils.parseUnits("0", 18),
      };

      const milestoneAmountBN = ethers.utils.parseUnits(
        pkg_milestone_amount.toString(),
        18
      );
      const savingAmountBN = ethers.utils.parseUnits(
        pkg_saving_amount.toString(),
        18
      );

      const raw_payout = usdAmount - (pkg_milestone_amount + pkg_saving_amount);
      const amount_gose_to_payout_wallet = Math.max(
        0,
        Number(raw_payout.toFixed(8))
      );

      transferParams.submilestone_amount = milestoneAmountBN;
      transferParams.saving_amount = savingAmountBN;

      transferParams.user_wallet = dummyData?.to_wallet || zero;
      transferParams.user_amount = ethers.utils.parseUnits("0", 18);

      transferParams.owner_wallet = dummyData?.payout_wallet_address || zero;
      transferParams.owner_amount = ethers.utils.parseUnits(
        amount_gose_to_payout_wallet.toString(),
        18
      );

      transferParams.nft_milestone_wallet =
        dummyData?.milestone_wallet_address || zero;
      transferParams.nft_milestone_amount = ethers.utils.parseUnits("0", 18);

      transferParams.burning_wallet = dummyData?.burning_wallet_address || zero;
      transferParams.burning_amount = ethers.utils.parseUnits("0", 18);

      const totalApprovalAmount = ethers.utils.parseUnits(
        usdAmount.toString(),
        18
      );

      const usdtAbi = [
        "function approve(address spender, uint256 value) public returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ];

      const contractAbi = [
        "function transferToken((address user_wallet,uint256 user_amount,address owner_wallet,uint256 owner_amount,address saving_wallet,uint256 saving_amount,address submilestone_wallet,uint256 submilestone_amount,address nft_purchase_wallet,uint256 nft_purchase_amount,address nft_milestone_wallet,uint256 nft_milestone_amount,address burning_wallet,uint256 burning_amount) p) external",
      ];

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
      const approveTx = await usdtContract.approve(
        contractAddress,
        totalApprovalAmount
      );
      await approveTx.wait();
      const tx = await contract.transferToken(transferParams);
      const receipt = await tx.wait();
      setTransactionHash(tx.hash);
      setReceiptStatus(receipt.status === 1 ? "Success" : "Failure");
      await PayinZp(tx.hash, receipt.status === 1 ? 2 : 3, last_id);

      if (receipt.status === 1) {
        Swal.fire({
          title: "Success!",
          text: "🎉 Payment successful and your account has been Credited.",
          icon: "success",
          confirmButtonColor: "#75edf2",
        });
        navigate("/dashboard");
      } else {
        toast("Transaction failed!");
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

  async function PayinZp(tr_hash, status, id) {
    setLoding(true);

    const reqbody = {
      req_amount: fk.values.inr_value,
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
        endpoint?.nft_wallet_activation_request,
        {
          payload: enCryptData(reqbody),
        }
      );
      fk.handleReset();
    } catch (e) {
      console.log(e);
    }
    setLoding(false);
  }

  async function PayinZpDummy() {
    const reqbody = {
      req_amount: fk.values.inr_value,
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
        endpoint?.dummy_nft_wallet_activation_request,
        {
          payload: enCryptData(reqbody),
        }
      );
      return res?.data || {};
    } catch (e) {
      console.log(e);
      console.log(e);
    }
  }

  return (
    <>
      <Loader isLoading={loding} />

      <div className="  flex items-center justify-center p-4 ">
        <Box className="w-full max-w-md  p-5 rounded-xl shadow-lg bg-gray-900 ">
          <div className="flex justify-center mb-4">
            <AccountBalance
              className="text-gold-color"
              style={{ fontSize: 60 }}
            />
          </div>
          <button
            className="w-full bg-gold-color text-black font-semibold py-2 rounded mb-4 hover:bg-white transition"
            onClick={requestAccount}
          >
            Connect With DApp
          </button>

          <div className=" p-4 rounded-lg text-sm text-white mb-1">
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
            <div className="flex justify-between ">
              <span className="text-gold-color font-medium">BNB:</span>
              <span>{bnb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gold-color font-medium">USDT (opBNB):</span>
              <span>{Number(no_of_Tokne || 0)?.toFixed(4)}</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-white ">Enter NFT Amount</label>
            <input
              placeholder="Enter NFT Amount"
              id="inr_value"
              name="inr_value"
              value={fk.values.inr_value}
              onChange={fk.handleChange}
              className="w-full mt-2 p-2 text-sm rounded-md bg-gray-700 text-white  focus:ring focus:ring-yellow-300 outline-none"
            />
          </div>

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
export default NFTFund;
