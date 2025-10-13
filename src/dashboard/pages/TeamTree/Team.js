import React, { useState, useRef, useEffect, useMemo } from "react";
import Tree from "react-d3-tree";
import { FaUser } from "react-icons/fa";
import { Menu, MenuItem } from "@mui/material";
import { useQuery } from "react-query";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { endpoint } from "../../../utils/APIRoutes";
import { apiConnectorGet } from "../../../utils/APIConnector";
import moment from "moment/moment";
import Loader from "../../../Shared/Loader";

const Team = () => {
  const [verticaa, setVertica] = useState("vertical");
  const [pathfn, setPathFn] = useState("diagonal");
  const [showSidebar, setShowSidebar] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const open = Boolean(anchorEl);
  const treeContainerRef = useRef(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { data, isLoading } = useQuery(
    ["tree-downline"],
    () => apiConnectorGet(endpoint.network_downline_api),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const flatData = data?.data?.result || [];

  const buildTreeFromFlatData = (flatData) => {
  const map = {};
  let root = null;

  flatData.forEach((item) => {
    map[item.lgn_cust_id] = {
      ...item,
      name: item.lgn_name,
      joining_date: item.tr03_reg_date,
      topup_date: item.tr03_topup_date,
      children: [],
    };
  });

  flatData.forEach((item) => {
    const node = map[item.lgn_cust_id];
    const parent = map[item.from_cust]; 

    if (parent) {
      parent.children.push(node);
    } else {
      root = node;
    }
  });

  return root;
};


  // const buildTreeFromFlatData = (flatData) => {
  //   const map = {};
  //   let root = null;

  //   flatData.forEach((item) => {
  //     const formattedNode = {
  //       ...item,
  //       name: item.jnr_name,
  //       joining_date: item.td_created_at,
  //       topup_date: item.td_verification_date,
  //       children: [],
  //     };

  //     map[item.lgn_jnr_id] = formattedNode;
  //   });

  //   flatData.forEach((item) => {
  //     const node = map[item.lgn_jnr_id];
  //     const parent = map[item.lgn_spon_id];

  //     if (parent) {
  //       parent.children.push(node);
  //     } else {
  //       root = node;
  //     }
  //   });

  //   return root;
  // };

  const orgChart = useMemo(() => {
    return buildTreeFromFlatData(flatData);
  }, [flatData]);

  useEffect(() => {
    if (treeContainerRef.current && orgChart) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 6,
      });
    }
  }, [orgChart, verticaa]);

  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    const nodeColor = "#FFFFFF";
    const IconComponent = !nodeDatum.topup_date ? (
      <FaUser className="!text-red-600 !text-3xl" />
    ) : (
      <FaUser className="!text-green-600 !text-3xl" />
    );

    return (
      <g onClick={toggleNode} style={{ cursor: "pointer" }}>
        <circle r={30} fill={nodeColor} />
        <foreignObject x={-20} y={-20} width={40} height={40}>
          <div className="w-full h-full flex justify-center items-center">
            {IconComponent}
          </div>
        </foreignObject>
        <text
          x={0}
          y={50}
          textAnchor="middle"
          fontWeight="bold"
          fontSize="12"
          fill="black"
          stroke="none"
          id="basic-text"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={(e) => {
            setSelectedNode(nodeDatum);
            setAnchorEl(e.currentTarget);
          }}
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <div className="flex min-h-screen justify-center items-center ">
        {/* Sidebar Toggle for Mobile */}
        {/* <div className="md:hidden fixed top-4 right-3 z-50">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 bg-white rounded-full shadow-lg"
          >
            <WidgetsIcon className="text-black !text-3xl" />
          </button>
        </div> */}
        {/* Sidebar only developer change  
        <div
          className={`fixed md:static top-0 right-0 z-40 md:h-screen bg-white shadow-md ease-in-out transition-all transition-duration-300 text-black ${
            showSidebar ? 'w-[250px] p-6 space-y-4 ' : 'w-0 p-0 overflow-hidden'
          } md:w-[250px] md:p-6 md:space-y-4 md:pt-[5rem]`}
        >
          <h2 className="text-lg font-bold">Orientation</h2>
          <div className="flex flex-col gap-1">
            <button
              className="px-3 py-1 bg-gray-900 text-white rounded"
              onClick={() => setVertica('horizontal')}
            >
              Horizontal
            </button>
            <button
              className="px-3 py-1 bg-gray-900 text-white rounded"
              onClick={() => setVertica('vertical')}
            >
              Vertical
            </button>
          </div>
          <h2 className="text-lg font-bold">Path Function</h2>
          <div className="flex flex-col gap-1">
            {['diagonal', 'elbow', 'straight', 'step'].map((type) => (
              <button
                key={type}
                className="px-3 py-1 bg-gray-900 text-white rounded"
                onClick={() => setPathFn(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        */}
        {/* Tree Chart */}
        <div
          className={`flex-1  h-screen flex  flex-col justify-center items-center ${
            showSidebar ? "pl-[250px]" : "pl-0"
          }`}
        >
          <div
            ref={treeContainerRef}
            id="treeWrapper"
            className="w-full h-full "
            style={{ maxHeight: "100vh" }}
          >
            {orgChart && translate.x !== 0 && (
              <Tree
                data={orgChart}
                orientation={verticaa}
                pathFunc={pathfn}
                renderCustomNodeElement={renderCustomNode}
                zoomable={false}
                translate={translate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Node Details Menu */}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-text",
        }}
      >
        <MenuItem onClick={handleClose} className="!bg-white">
          <div className="grid grid-cols-2">
            <p className="p-1 text-center text-xs border border-gray-700 font-semibold">
              Cust ID
            </p>
            <p className="p-1 text-xs text-center border border-gray-700">
              {selectedNode?.lgn_cust_id || "--"}
            </p>
            <p className="p-1 text-center text-xs font-semibold border border-gray-700">
              Joining Date
            </p>
            <p className="p-1 text-xs text-center border border-gray-700">
              {selectedNode?.td_created_at
                ? moment(selectedNode?.td_created_at)?.format("DD-MM-YYYY")
                : "--"}
            </p>
            <p className="p-1 text-center text-xs font-semibold border border-gray-700">
              Topup Date
            </p>
            <p className="p-1 text-xs font-semibold text-center border border-gray-700">
              {selectedNode?.td_verification_date
                ? moment(selectedNode?.td_verification_date)?.format(
                    "DD-MM-YYYY"
                  )
                : "--"}
            </p>
            <p className="px-4 py-2 text-xs text-center font-semibold border border-gray-700">
              Direct Team
            </p>
            <p className="px-4 py-2 text-xs  text-center border border-gray-700">
              {selectedNode?.jnr_direct_team || "--"}
            </p>
            <p className="px-4 py-2 text-center text-xs font-semibold border border-gray-700">
              Direct TopUp Mem.
            </p>
            <p className="px-4 py-2 text-xs  text-center border border-gray-700">
              {selectedNode?.jnr_direct_topup_mem || "--"}
            </p>
            <p className="px-4 py-2 text-center text-xs font-semibold border border-gray-700">
              Direct Buss.
            </p>
            <p className="px-4 py-2 text-xs  text-center border border-gray-700">
              {Number(selectedNode?.jnr_direct_business || 0)?.toFixed(2)}
            </p>
            <p className="p-1 text-center text-xs font-semibold border border-gray-700">
              Team Buss.
            </p>
            <p className="p-1 text-xs text-center border border-gray-700">
              {Number(selectedNode?.jnr_total_team_buss || 0)?.toFixed(2)}
            </p>
          </div>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Team;
