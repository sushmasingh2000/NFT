
import Banner from "../Adminpages/Pages/Banner";
import Dashboard from "../Adminpages/Pages/dashboard/Dashboard";
import AddAddress from "../Adminpages/Pages/fund/AddAddress";
import { default as BoosterBonus, default as MatchingBonus } from "../Adminpages/Pages/genealogy/BoosterBonus";
import DirectBonus from "../Adminpages/Pages/genealogy/DirectBonus";
import LevelBonus from "../Adminpages/Pages/genealogy/LevelBonus";
import ROIBonus from "../Adminpages/Pages/genealogy/ROIBonus";
import WeeklyBonus from "../Adminpages/Pages/genealogy/WeeklyBonus";
import INRPaying from "../Adminpages/Pages/INRPayment/INRPaying";
import INRPayout from "../Adminpages/Pages/INRPayment/INRPayout";
import Master from "../Adminpages/Pages/Master";
import NFTManager from "../Adminpages/Pages/NFTCreate";
import ContactDetail from "../Adminpages/Pages/Team/Contactlist";
import TraderRejct from "../Adminpages/Pages/Team/subinvestor/InvestorReject";
import TraderSucess from "../Adminpages/Pages/Team/subinvestor/InvestorSuccess";
import TraderList from "../Adminpages/Pages/Team/TraderList";
import UserDetail from "../Adminpages/Pages/Team/User";
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
    path: "/nft_create",
    component: <NFTManager />,
    navItem: "Animal ",
  },
  {
    id: 17,
    path: "/giftBonus",
    component: <DirectBonus/>,
    navItem: "Salary Bonus",
  },
  {
    id: 41,
    path: "/salarybonus",
    component: <BoosterBonus/>,
    navItem: "Booster Bonus",
  },
  {
    id: 42,
    path: "/weeklybonus",
    component: <WeeklyBonus/>,
    navItem: "Weekly Recovery",
  },
  {
    id: 42,
    path: "/vipbonus",
    component: <ROIBonus/>,
    navItem: "Reward Bonus",
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
    navItem: "Matching Bonus",
  },
  {
    id: 42,
    path: "/inr_Paying",
    component: <INRPaying/>,
    navItem: "INR Paying",
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
    id: 44,
    path: "/topup",
    component: <TopUp/>,
    navItem: "Manual Reward ",
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