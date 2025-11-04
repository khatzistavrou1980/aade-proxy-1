const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Credentials από AADE
const AADE_USERNAME = "user123597070";
const AADE_PASSWORD = "123597070A";

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { afm } = req.body;

  if (!afm) {
    return res.status(400).json({ error: "AFM is required" });
  }

  const soapBody = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://rgwspublic2.ws.public2.rgws.gsis.gr/">
    <soapenv:Header/>
    <soapenv:Body>
      <ws:rgWsPublicAfmMethod>
        <ws:INPUT_REC>
          <ws:afm>${afm}</ws:afm>
        </ws:INPUT_REC>
        <ws:USERNAME>${AADE_USERNAME}</ws:USERNAME>
        <ws:PASSWORD>${AADE_PASSWORD}</ws:PASSWORD>
      </ws:rgWsPublicAfmMethod>
    </soapenv:Body>
  </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2",
      soapBody,
      {
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: ""
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
