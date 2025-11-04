const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

// Δέχεται raw XML ως string
app.use(express.text({ type: "text/xml" }));

app.post("/", async (req, res) => {
  const xml = req.body;

  // Πρόχειρο parsing AFM
  const match = xml.match(/<ws:afm>(\d+)<\/ws:afm>/);
  const afm = match ? match[1] : null;

  if (!afm) {
    return res.status(400).json({ error: "AFM is required" });
  }

  try {
    // Εδώ απαντά mock XML
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

