import {
  Games,
  Image,
  LeaderboardSharp,
  SelfImprovement,
  WheelchairPickupOutlined
} from "@mui/icons-material";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
export const all_Data = [
 

  {
    id: 2,
    navLink: "/admindashboard",
    navItem: "Dashboard",
    navIcon: (
      <span>
        <DashboardCustomizeIcon color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
   {
    id: 1,
    navLink: "/master",
    navItem: "Master",
    navIcon: (
      <span>
        <LeaderboardSharp color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  {
    id: 2,
    navLink: "/banner",
    navItem: "NFT Image",
    navIcon: (
      <span>
        <Image color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  {
    id: 14,
    navLink: "/nft_create",
    navItem: "NFT Add ",
    navIcon: (
      <span>
        <AddToPhotosIcon color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
   {
    id: 14,
    navLink: "/nft_assign",
    navItem: "NFT Assign ",
    navIcon: (
      <span>
        <AddToPhotosIcon color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
 
  {
    id: 14,
    navLink: "/user_detail",
    navItem: "Member ",
    navIcon: (
      <span>
        <AddToPhotosIcon color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  {
    id: 6.3,
    navLink: "/trader_detail",
    navItem: "NFT Details",
    navIcon: (
      <span>
        <SelfImprovement color="#15317E" fontSize="medium" />
      </span>
    ),
  },
  //   {
  //     id: 14,
  //     navLink: "/trader_detail",
  //     navItem: "Invester ",
  //     navIcon: (
  //       <span>
  //         <AddToPhotosIcon color="#15317E" fontSize="medium" />
  //       </span>
  //     ),
  //     subcomponent: [
  //      
  //        {
  //         id: 6.3,
  //         navLink: "/trader_sucess",
  //         navItem: "Verified Investor",
  //         navIcon: (
  //           <span>
  //             <SelfImprovement color="#15317E" fontSize="medium" />
  //           </span>
  //         ),
  //       },

  //       {
  //         id: 6.3,
  //         navLink: "/trader_reject",
  //         navItem: "Reject Investor",
  //         navIcon: (
  //           <span>
  //             <SelfImprovement color="#15317E" fontSize="medium" />
  //           </span>
  //         ),
  //       },
  //     ],
  //   },
   {
    id: 14,
    navLink: "/topup",
    navItem: "TopUp ",
    navIcon: (
      <span>
        <SelfImprovement color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  {
    id: 14,
    navLink: "/nft_topup_admin",
    navItem: "NFT TopUp ",
    navIcon: (
      <span>
        <SelfImprovement color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  
  {
    id: 11,
    navLink: "/wallet_admin_report",
    navItem: "NFT Wallet Report",
    navIcon: (
      <span>
        <Games color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  {
    id: 11,
    navLink: "/inr_Paying",
    navItem: "TopUp Report",
    navIcon: (
      <span>
        <Games color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  {
    id: 11,
    navLink: "/inr_Payout",
    navItem: "Payout Report",
    navIcon: (
      <span>
        <Games color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [],
  },
  {
    id: 6,
    navLink: "/levelBonus",
    navItem: "Income",
    navIcon: (
      <span>
        <CardGiftcardIcon color="#15317E" fontSize="medium" />
      </span>
    ),
    subcomponent: [

      {
        id: 6.3,
        navLink: "/levelBonus",
        navItem: "Level Bonus",
        navIcon: (
          <span>
            <SelfImprovement color="#15317E" fontSize="medium" />
          </span>
        ),
      },
      {
        id: 8.5,
        navLink: "/giftBonus",
        navItem: "Direct Bonus",
        navIcon: (
          <span>
            <WheelchairPickupOutlined color="#15317E" fontSize="medium" />
          </span>
        ),
      },

      {
        id: 8.6,
        navLink: "/vipbonus",
        navItem: "NFT Trading Bonus",
        navIcon: (
          <span>
            <WheelchairPickupOutlined color="#15317E" fontSize="medium" />
          </span>
        ),
      },
      {
        id: 8.6,
        navLink: "/matching",
        navItem: "NFT Level Bonus",
        navIcon: (
          <span>
            <WheelchairPickupOutlined color="#15317E" fontSize="medium" />
          </span>
        ),
      },
      {
        id: 8.6,
        navLink: "/weeklybonus",
        navItem: "MileStone Bonus",
        navIcon: (
          <span>
            <WheelchairPickupOutlined color="#15317E" fontSize="medium" />
          </span>
        ),
      },
      {
        id: 8.6,
        navLink: "/salarybonus",
        navItem: "NFT Delay ROI Bonus",
        navIcon: (
          <span>
            <WheelchairPickupOutlined color="#15317E" fontSize="medium" />
          </span>
        ),
      },

    ],
  },
     {
      id: 1,
      navLink: "/cashback_admin",
      navItem: "Cashback",
      navIcon: (
        <span>
          <LeaderboardSharp color="#15317E" fontSize="medium" />
        </span>
      ),
      subcomponent: [],
    },

  //   {


  //  {
  //     id: 1,
  //     navLink: "/contact",
  //     navItem: "Contact",
  //     navIcon: (
  //       <span>
  //         <LeaderboardSharp color="#15317E" fontSize="medium" />
  //       </span>
  //     ),
  //     subcomponent: [],
  //   },
  //   {
  //     id: 1,
  //     navLink: "/ticket_list",
  //     navItem: "Ticket List",
  //     navIcon: (
  //       <span>
  //         <LeaderboardSharp color="#15317E" fontSize="medium" />
  //       </span>
  //     ),
  //     subcomponent: [],
  //   },
];
