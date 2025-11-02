
import Banner from "../Adminpages/Pages/Banner";
import Dashboard from "../Adminpages/Pages/dashboard/Dashboard";
import AddAddress from "../Adminpages/Pages/fund/AddAddress";
import { default as BoosterBonus, default as MatchingBonus } from "../Adminpages/Pages/genealogy/BoosterBonus";
import Cashback from "../Adminpages/Pages/genealogy/Cashback";
import DirectBonus from "../Adminpages/Pages/genealogy/DirectBonus";
import LevelBonus from "../Adminpages/Pages/genealogy/LevelBonus";
import NFT_DELAY_COM_ROI from "../Adminpages/Pages/genealogy/MatchingBonus";
import ROIBonus from "../Adminpages/Pages/genealogy/ROIBonus";
import WeeklyBonus from "../Adminpages/Pages/genealogy/WeeklyBonus";
import INRPaying from "../Adminpages/Pages/INRPayment/INRPaying";
import INRPayout from "../Adminpages/Pages/INRPayment/INRPayout";
import WalletReport from "../Adminpages/Pages/INRPayment/WalletReport";
import Master from "../Adminpages/Pages/Master";
import NFTAssign from "../Adminpages/Pages/NFTAssign";
import NFTManager from "../Adminpages/Pages/NFTCreate";
import NFTTopUp from "../Adminpages/Pages/NFTTopUp";
import ContactDetail from "../Adminpages/Pages/Team/Contactlist";
import TraderRejct from "../Adminpages/Pages/Team/subinvestor/InvestorReject";
import TraderSucess from "../Adminpages/Pages/Team/subinvestor/InvestorSuccess";
import TraderList from "../Adminpages/Pages/Team/TraderList";
import UserDetail from "../Adminpages/Pages/Team/User";
import UserTreeAdmin from "../Adminpages/Pages/Team/UserTree";
import TopUp from "../Adminpages/Pages/Topup";
// import TopUpDetail from "../Adminpages/Pages/TopUP/TopUpDetail";
import AdminTicketList from "../Adminpages/Ticket/List";


export const adminroutes = [ 

  {
    id: 2,
    path: "/admindashboard",
    component: <Dashboard />,
    navItem: "Dashboard",
  },
   {
    id: 2,
    path: "/master",
    component: <Master />,
    navItem: "Master",
  },
  {
    id: 2,
    path: "/banner",
    component: <Banner />,
    navItem: "NFT Image",
  },
   {
    id: 2,
    path: "/user_tree/:id",
    component: <UserTreeAdmin />,
    navItem: "User Tree Data",
  },
  {
    id: 2,
    path: "/nft_create",
    component: <NFTManager />,
    navItem: "NFT ",
  },
  {
    id: 2,
    path: "/nft_assign",
    component: <NFTAssign />,
    navItem: "NFT Assign ",
  },
    {
    id: 44,
    path: "/topup",
    component: <TopUp/>,
    navItem: "Manual TopUp ",
  },
  {
    id: 17,
    path: "/giftBonus",
    component: <DirectBonus/>,
    navItem: "Direct Bonus",
  },
  {
    id: 41,
    path: "/salarybonus",
    component: <NFT_DELAY_COM_ROI/>,
    navItem: "NFT Delay ROI Bonus",
  },
  {
    id: 42,
    path: "/weeklybonus",
    component: <WeeklyBonus/>,
    navItem: "MileStone Bonus ",
  },
  {
    id: 42,
    path: "/vipbonus",
    component: <ROIBonus/>,
    navItem: "NFT Trading Bonus",
  },
  {
    id: 42,
    path: "/cashback_admin",
    component: <Cashback/>,
    navItem: "Cashback",
  },
  {
    id: 19,
    path: "/levelBonus",
    component: <LevelBonus/>,
    navItem: "Level Bonus",
  },
  {
    id: 19,
    path: "/matching",
    component: <MatchingBonus/>,
    navItem: "NFT Level Bonus",
  },
  {
    id: 42,
    path: "/inr_Paying",
    component: <INRPaying/>,
    navItem: "TopUp Report ",
  },
  {
    id: 43,
    path: "/inr_Payout",
    component: <INRPayout/>,
    navItem: "INR Payout",
  },
  // {
  //   id: 43,
  //   path: "/top_up",
  //   component: <TopUpDetail/>,
  //   navItem: "TopUp Detail",
  // },
  {
    id: 43,
    path: "/user_detail",
    component: <UserDetail/>,
    navItem: "Member ",
  },

   {
    id: 43,
    path: "/trader_detail",
    component: <TraderList/>,
    navItem: "Invester ",
  },
   {
    id: 43,
    path: "/wallet_admin_report",
    component: <WalletReport/>,
    navItem: "NFT Wallet Report ",
  },
  
  {
    id: 43,
    path: "/nft_topup_admin",
    component: <NFTTopUp/>,
    navItem: "NFT TopUp ",
  },
    {
    id: 43,
    path: "/contact",
    component: <ContactDetail/>,
    navItem: "Contact ",
  },
  {
    id: 43,
    path: "/ticket_list",
    component: <AdminTicketList/>,
    navItem: "Ticket ",
  },

    {
    id: 45,
    path: "/admin_fund",
    component: <AddAddress/>,
    navItem: "Fund",
  },
  {
    id: 45,
    path: "/trader_sucess",
    component: <TraderSucess/>,
    navItem: "Verified Investor",
  },
  {
    id: 45,
    path: "/trader_reject",
    component: <TraderRejct/>,
    navItem: "Reject Investor ",
  },
  {
    id: 45,
    path: "/admin_fund",
    component: <AddAddress/>,
    navItem: "Fund",
  },
];