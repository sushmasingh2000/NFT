import React, { useEffect, useState } from "react";

const Test = () => {
  const [instance, setInstance] = useState(null);
  // 930f94b174208840edb1ce74389372dd04328709952c2fa20b732fb4114c8426adc3bb902058f2ff272221b6d00efc91
  useEffect(() => {
    if (window.ZPayments) {
      const config = {
        account_id: "60051739358",
        domain: "IN",
        otherOptions: {
          api_key:
            "1003.e80ef3d3f3c093b71f95211b2eb1b663.c16c8a4586cd079bcf16b570500894cb",
        },
      };
      const zInstance = new window.ZPayments(config);
      setInstance(zInstance);
    }
  }, []);

  const initiatePayment = async () => {
    try {
      // 1️⃣ Call backend to create payment session
      const res = await fetch(
        "http://192.168.248.149:2000/api/create-payment-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 1,
            currency: "INR",
            customer_name: "Canon",
            email: "vermaanand278@gmail.com",
            phone: "8707329034",
          }),
        }
      );
      const hii = await res.json();
      console.log(
        hii?.response?.payments_session?.payments_session_id,
        "session id"
      );
      const body = {
        payments_session_id:
          hii?.response?.payments_session?.payments_session_id,
      };
      const { payments_session_id } = body;

      // 2️⃣ Prepare payment options
      const options = {
        amount: "1",
        currency_code: "INR",
        payments_session_id,
        currency_symbol: "₹",
        business: "Zylker",
        description: "Purchase of Zylker electronics.",
        invoice_number: "INV-12345",
        reference_number: "REF-12345",
        address: {
          name: "Canon",
          email: "vermaanand278@gmail.com",
          phone: "8707329034",
        },
      };

      // 3️⃣ Open Zoho Payments Widget
      const data = await instance.requestPaymentMethod(options);
      console.log("Payment success:", data);
      alert("✅ Payment Successful!");
    } catch (err) {
      if (err.code !== "widget_closed") {
        console.error("Payment error:", err);
        alert("❌ Payment Failed!");
      }
    } finally {
      await instance?.close();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Zoho Payment Integration</h3>
      <button
        onClick={initiatePayment}
        style={{
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Pay ₹100.5
      </button>
    </div>
  );
};

export default Test;
