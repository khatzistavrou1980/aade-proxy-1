const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("✅ Proxy server for AADE is running!");
});

app.post("/check-afm", async (req, res) => {
  try {
    const { afm } = req.body;
    if (!afm) return res.status(400).json({ error: "Missing AFM" });

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:urn="urn:ec.europa.eu:taxud:tin:services:checkTin">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:checkTin>
            <urn:countryCode>EL</urn:countryCode>
            <urn:tin>${afm}</urn:tin>
          </urn:checkTin>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const { data } = await axios.post(
      "https://ec.europa.eu/taxation_customs/tin/checkTinService",
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: "",
        },
      }
    );

    res.status(200).send(data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
