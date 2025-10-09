import { useFormik } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "react-query";
import Loader from "../../Shared/Loader";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { endpoint } from "../../utils/APIRoutes";


const TradingRegistration = () => {
  const [loding, setLoading] = useState(false);
  const client = useQueryClient();

  const { data, isLoading: trade_loading } = useQuery(
    ["trading_data"],
    () => apiConnectorGet(endpoint?.trader_profile_api),
    {
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false
    }
  );
  const trader_data = data?.data?.result?.[0] || [];

  const generateRandomEmail = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
    let string = "";
    for (let i = 0; i < 10; i++) {
      string += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${string}@example.com`;
  };

  const initialValue = {
    trad_name: trader_data?.td_trad_name || "",
    trad_email: trader_data?.td_trad_email || "",
    account_id: trader_data?.td_account_id || "",
    account_number: trader_data?.td_account_number || "",
    u_password: trader_data?.td_password || "",
    wallet_amount: trader_data?.td_wallet_amount || "",
    broker_id: trader_data?.td_broker_id || "",
    broker_name: trader_data?.td_broker_name || "",
    regulatory_region: "",
    server_name: trader_data?.td_server_name || "",
    account_type: "",
    base_currency:
      trader_data?.td_base_currency === "USD"
        ? "1"
        : trader_data?.td_base_currency === "USC"
          ? "2"
          : "2",
    group_type:
      trader_data?.td_group_type === "Cent Group"
        ? "1"
        : trader_data?.td_group_type === "USD Group"
          ? "2"
          : trader_data?.td_group_type === "PAMM Group"
            ? "3" : "1",
  };

  const fk = useFormik({
    initialValues: initialValue,
    enableReinitialize: true,

    onSubmit: () => {
      const reqbody = {
        trad_name: fk.values.trad_name,
        trad_email: generateRandomEmail(),
        account_id: fk.values.account_id,
        account_number: "1",
        account_type: "1",
        u_password: fk.values.u_password,
        wallet_amount: fk.values.wallet_amount,
        base_currency: fk.values.base_currency,
        broker_id: "1",
        broker_name: fk.values.broker_name,
        server_name: fk.values.server_name,
        regulatory_region: "",
        group_type: fk.values.group_type,
      };
      RegistrationFn(reqbody);
    },
  });
  const RegistrationFn = async (reqbody) => {
    setLoading(true);
    try {
      const response = await apiConnectorPost(endpoint?.trader_registration_api, reqbody);
      toast(response?.data?.message);
      setLoading(false);
      if (response?.data?.success) {
        fk.handleReset();
        client.refetchQueries("trading_data")
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <>
      <Loader isLoading={loding || trade_loading} />
      <div className=" flex items-center justify-center px-4 py-5">
        <div className="w-full  bg-gray-900  shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-10 text-center text-white">Trade Account Details </h2>

          <form className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { id: "trad_name", label: "Invester Name" },
              { id: "account_id", label: "Account ID (MT5)" },
              { id: "wallet_amount", label: "USD Amount", type: "number" },
            ].map(({ id, label, type = "text" }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  id={id}
                  name={id}
                  placeholder={label}
                  value={fk.values[id]}
                  onChange={(e) => {
                    !["trad_name", "broker_name", "server_name"].includes(id)
                      && fk.handleChange(e)
                  }}
                  className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
            ))}

            <div>
              <label htmlFor="broker_name" className="block text-sm font-medium text-white mb-1">
                Broker Name
              </label>
              <select
                id="broker_name"
                name="broker_name"
                value={fk.values.broker_name}
                onChange={fk.handleChange}
                className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">Select Broker Name</option>
                <option value="Star Trader">Star Trader</option>
                <option value="Vantage Markets">Vantage Markets </option>
              </select>
            </div>

            <div>
              <label htmlFor="broker_name" className="block text-sm font-medium text-white mb-1">
                Server Name
              </label>
              <select
                id="server_name"
                name="server_name"
                value={fk.values.server_name}
                onChange={fk.handleChange}
                className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                {fk.values.broker_name === "Star Trader" ?
                  <>  <option value="">Select Server Name</option>
                    <option value="Startraderfinancial-live">Startraderfinancial-live</option>
                    <option value="Startraderfinancial-live2">Startraderfinancial-live2</option> </>
                  : ""}
                {fk.values.broker_name === "Vantage Markets" ?
                  <><option value="">Select Server Name</option>
                    <option value="VantageInternational-Live">VantageInternational-Live</option>
                    <option value="VantageInternational-Live 3">VantageInternational-Live 3</option>
                    <option value="VantageInternational-Live 5">VantageInternational-Live 5</option></>
                  : ""
                }
              </select>
            </div>

            {/* Group Type Select */}
            <div>
              <label htmlFor="group_type" className="block text-sm font-medium text-white mb-1">
                Group Type
              </label>
              <select
                id="group_type"
                name="group_type"
                value={fk.values.group_type}
                onChange={(e) => {
                  fk.handleChange(e);
                  const selectedGroupType = e.target.value;
                  if (selectedGroupType === "1") {
                    fk.setFieldValue("base_currency", "2"); 
                  } else {
                    fk.setFieldValue("base_currency", "1"); 
                  }
                }}
                className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">Select Group Type</option>
                <option value="1">CENT</option>
                <option value="2">USD</option>
                {/* <option value="3">PAMM</option> */}
              </select>
            </div>

            {/* Currency Select */}
            <div>
              <label htmlFor="base_currency" className="block text-sm font-medium text-white mb-1">
                Currency
              </label>
              <select
                id="base_currency"
                name="base_currency"
                value={fk.values.base_currency}
                onChange={fk.handleChange}
                className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                {fk.values.group_type === "1" ? (
                  <option value="2">USC</option>
                ) : (
                  <option value="1">USD</option>
                )}
              </select>
            </div>

            {/* Password Field - Keep it Last */}
            <div>
              <label htmlFor="u_password" className="block text-sm font-medium text-white mb-1">
                Trading Password
              </label>
              <input
                type="password"
                id="u_password"
                name="u_password"
                placeholder="Trading Password"
                value={fk.values.u_password}
                onChange={fk.handleChange}
                className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
          </form>

          <div className="flex justify-end">
            <button
              type="submit"
              className=" p-2 px-10 lg:mt-10 mt-5 bg-gold-color text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
              onClick={fk.handleSubmit} >
              {loding ? "Processing..." : trader_data?.td_trad_name ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>

    </>
  );
};

export default TradingRegistration;
