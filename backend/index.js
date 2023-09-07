const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const cors = require("cors");
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const port = 3001;
const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "185.253.219.150",
  port: 1001,
  user: "root",
  password: "8sC6hG2JUZJc",
  database: "sort",
});


db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to the database");
  }
});
// 
const agent = new HttpsProxyAgent("http://user26:8PFNYUSu@176.9.113.112:11026");
// api getting images from instagram
app.get("/api/instagram", async (req, res) => {
  let user = "ehsanullahqadeer"
  let changeIpUrl = 'http://176.9.113.112:11126/changeip/client/23108983551657110673';
  try {
    const instagramResponse = await axios({
      method: 'get',
      httpsAgent: agent,
      url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${user}`,
      headers: {
        "x-ig-app-id": "1217981644879628",
      },
    })
    // change ip to prevent from blocking by th instagram
    await axios.get(changeIpUrl);
    const instagramData = instagramResponse.data.data.user.edge_owner_to_timeline_media.edges;
    let imagesUrlArr = instagramData.map(item => {
      return item.node.thumbnail_resources[3].src
    });
    res.status(200).json(imagesUrlArr);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// fetch user data
app.get("/api/userdata", (req, res) => {
  const sqlQuery = "SELECT * FROM users";
  db.query(sqlQuery, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

// fetch table data
app.get("/api/inputdata", (req, res) => {
  const sqlQuery = "SELECT * FROM output_table";
  db.query(sqlQuery, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
