const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { afm } = req.body;

  if (!afm) {
    return res.status(400).json({ error: "AFM is required" });
  }

  try {
    // Προσωρινή απάντηση mock
    const response = `<response><afm>${afm}</afm><valid>true</valid></response>`;
    res.set("Content-Type", "application/xml");
    res.send(response);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Proxy server for AADE is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

