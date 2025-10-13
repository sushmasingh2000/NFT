// src/routes/routes.jsx
import Dashboard from "../dashboard/Dashboard";
import Activation from "../dashboard/pages/Activation";
import AssociateRegistration from "../dashboard/pages/AssociateRegistration";
import CashbackReport from "../dashboard/pages/Cashback";
import Fund from "../dashboard/pages/Fund/Fund";
import FundTransfer from "../dashboard/pages/Fund/Transfer";
import Level from "../dashboard/pages/income/Level";
import NFTDelay from "../dashboard/pages/income/NFTDELAY";
import NFTLevel from "../dashboard/pages/income/NFTLEVEL";
import NFTTRAD from "../dashboard/pages/income/NftTrad";
import REWARD from "../dashboard/pages/income/REWARD";
import Salryfn from "../dashboard/pages/income/Salary";
import InvestorProfile from "../dashboard/pages/InvestorProfile";
import MainLayout from "../dashboard/pages/Layout/MainLayout";
import Downline from "../dashboard/pages/network/Downline";
import JoinMember from "../dashboard/pages/network/JoinMember";
import NFTPurchase from "../dashboard/pages/NftPurchase";
import PayoutDetails from "../dashboard/pages/Payoutdetails";
import Profile from "../dashboard/pages/Profile";
import Team from "../dashboard/pages/TeamTree/Team";
import TicketRaise from "../dashboard/pages/Ticket/AddTicket";
import UserSupportChat from "../dashboard/pages/Ticket/ChatTicket";
import TopupWithContWithoutPull from "../dashboard/pages/TopUp/TopUp";
import TradingRegistration from "../dashboard/pages/TradingRegistration";
import Wallet from "../dashboard/pages/Wallet";
import Withdrawal from "../dashboard/pages/Withdrawal";

export const routes = [
  {
    path: "/dashboard",
    element: (
      <MainLayout>
        <Dashboard />{" "}
      </MainLayout>
    ),
  },
  
  {
    path: "/topup_data",
    element: (
      <MainLayout>
        <TopupWithContWithoutPull />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/nft_purchase",
    element: (
      <MainLayout>
        <NFTPurchase />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/associate_registration",
    element: (
      <MainLayout>
        <AssociateRegistration />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/trading_registration",
    element: (
      <MainLayout>
        <TradingRegistration />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/investor",
    element: (
      <MainLayout>
        <InvestorProfile />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/payout_details",
    element: (
      <MainLayout>
        <PayoutDetails />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/fund",
    element: (
      <MainLayout>
        <Fund />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/income/level",
    element: (
      <MainLayout>
        <Level />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/income/roi",
    element: (
      <MainLayout>
        <REWARD />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/income/direct",
    element: (
      <MainLayout>
        <Salryfn />{" "}
      </MainLayout>
    ),
  },
   {
    path: "/income/nft_trad",
    element: (
      <MainLayout>
        <NFTTRAD />{" "}
      </MainLayout>
    ),
  },
   {
    path: "/income/nft_level",
    element: (
      <MainLayout>
        <NFTLevel />{" "}
      </MainLayout>
    ),
  },
   {
    path: "/income/nft_delay",
    element: (
      <MainLayout>
        <NFTDelay />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/activation",
    element: (
      <MainLayout>
        <Activation />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/wallet",
    element: (
      <MainLayout>
        <Wallet />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/profile",
    element: (
      <MainLayout>
        <Profile />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/withdrawal",
    element: (
      <MainLayout>
        <Withdrawal />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/fund-tranfer",
    element: (
      <MainLayout>
        <FundTransfer />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/referral",
    element: (
      <MainLayout>
        <JoinMember />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/team",
    element: (
      <MainLayout>
        <Team />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/downline",
    element: (
      <MainLayout>
        <Downline />{" "}
      </MainLayout>
    ),
  },
   {
    path: "/cashback",
    element: (
      <MainLayout>
        <CashbackReport />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/add_ticket",
    element: (
      <MainLayout>
        <TicketRaise />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/chat_ticket",
    element: (
      <MainLayout>
        <UserSupportChat />{" "}
      </MainLayout>
    ),
  },
];
