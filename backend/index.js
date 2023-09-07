const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const { HttpsProxyAgent } = require("https-proxy-agent");

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

const updateUserQuery = (slug) => {
  const selectQuery = "SELECT * FROM users";
  db.query(selectQuery, (selectErr, selectResults) => {
    if (selectErr) {
      console.error("Internal Server Error:", selectErr);
    } else {
      const userToUpdate = selectResults.find((item) => item.slug === slug);
      if (userToUpdate) {
        const newLastId = userToUpdate.last_id + 1;
        const updateQuery = `UPDATE users SET last_id = ${newLastId} WHERE id = ${userToUpdate.id};`;

        db.query(updateQuery, (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating last_id in the database:", updateErr);
          } else {
            console.log(updateQuery);
          }
        });
      } else {
        return newLastId;
      }
    }
  });
};


// api getting images from instagram
app.get("/api/getNextImages", async (req, res) => {
  const { user, slug } = req.query;
  let changeIpUrl =
    "http://176.9.113.112:11126/changeip/client/23108983551657110673";
  try {
    const instagramResponse = await axios({
      method: "get",
      httpsAgent: agent,
      url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${user}`,
      headers: {
        "x-ig-app-id": "1217981644879628",
      },
    });
    // change ip to prevent from blocking by th instagram
    await axios.get(changeIpUrl);
    const instagramData =
      instagramResponse.data.data.user.edge_owner_to_timeline_media.edges;
    let imagesUrlArr = instagramData.map((item) => {
      return item.node.thumbnail_resources[3].src;
    });
    const dbId = updateUserQuery(slug);
    const formatData = {
      imagesData: imagesUrlArr,
      accountId: instagramResponse.data.data.user.id,
    };
    res.status(200).json(formatData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("api/getPreviousImages", async (req, res) => {
  const { user } = req.query;
  let changeIpUrl =
    "http://176.9.113.112:11126/changeip/client/23108983551657110673";
  try {
    const instagramResponse = await axios({
      method: "get",
      httpsAgent: agent,
      url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${user}`,
      headers: {
        "x-ig-app-id": "1217981644879628",
      },
    });
    // change ip to prevent from blocking by th instagram
    await axios.get(changeIpUrl);
    const instagramData =
      instagramResponse.data.data.user.edge_owner_to_timeline_media.edges;
    let imagesUrlArr = instagramData.map((item) => {
      return item.node.thumbnail_resources[3].src;
    });
    const formatData = {
      imagesData: imagesUrlArr,
      accountId: instagramResponse.data.data.user.id,
    };
    res.status(200).json(formatData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/api/rateImage", async (req, res) => {
  console.log(req);
  // const {username, account_id, user_id} = req.body;
  // if (username && account_id && user_id) {
  //   res.status(201).json({"status": "success"})
  // } else {
  //   res.status(400).json({"message": "All field required"})
  // }
});

// fetch table data
app.get("/api/input-table", (req, res) => {
  const sqlQuery = "SELECT * FROM sort.input_table";
  db.query(sqlQuery, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

// fetch user data
app.get("/api/userdata", (req, res) => {
  const { slug } = req.query;
  const sqlQuery = "SELECT * FROM users";
  db.query(sqlQuery, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const findUserFromDB = results.find((item) => item.slug === slug);
      res.json(findUserFromDB);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
