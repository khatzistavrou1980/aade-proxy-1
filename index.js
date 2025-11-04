const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Βάλε εδώ τα credentials σου από την ΑΑΔΕ
const AADE_USERNAME = "user123597070";
const AADE_PASSWORD = "123597070A";

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { afm } = req.body;

  if (!afm) {
    return res.status(400).json({ error: "AFM is required" });
  }

  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.gsis.gr/">
      <soapenv:Header/>
      <soapenv:Body>
        <ws:rgWsPublicAfmMethod>
          <ws:RgWsPublicInputRt_in>
            <ws:afm>${afm}</ws:afm>
          </ws:RgWsPublicInputRt_in>
          <ws:username>${AADE_USERNAME}</ws:username>
          <ws:password>${AADE_PASSWORD}</ws:password>
        </ws:rgWsPublicAfmMethod>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(
      "https://www1.gsis.gr/wsgsis/RgWsPublic2/RgWsPublic2.wsdl",
      soapBody,
      {
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "rgWsPublicAfmMethod"
        },
        timeout: 10000
      }
    );

    res.set("Content-Type", "text/xml");
    res.send(response.data);
  } catch (error) {
    console.error("SOAP Error:", error.message);
    res.status(500).json({ error: "AADE service error" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Proxy AADE is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
