const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const bodyParser = require("body-parser");
const { HttpsProxyAgent } = require("https-proxy-agent");

const app = express();
const port = 3001;
const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(bodyParser.json());
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

const updateUserQuery = (slug, action, callback) => {
  const selectQuery = "SELECT * FROM users";
  db.query(selectQuery, (selectErr, selectResults) => {
    if (selectErr) {
      callback(null, "Internal Server Error");
    } else {
      const userToUpdate = selectResults.find((item) => item.slug === slug);
      if (userToUpdate && action === "next") {
        const newLastId = userToUpdate.last_id + 1;
        const updateQuery = `UPDATE users SET last_id = ${newLastId} WHERE id = ${userToUpdate.id};`;
        db.query(updateQuery, (updateErr, updateResult) => {
          if (updateErr) {
            callback(null, "Error updating database");
          } else {
            callback(newLastId, null);
          }
        });
      } else if (userToUpdate && action === "previous") {
        callback(userToUpdate.last_id, null);
      } else {
        callback(null, "User not found");
      }
    }
  });
};

// api getting images from instagram
app.get("/api/getImages", async (req, res) => {
  const { user, slug, action } = req.query;
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
    updateUserQuery(slug, action, (last_id, error) => {
      const formatData = {
        imagesData: imagesUrlArr,
        accountId: instagramResponse.data.data.user.id,
        last_id: last_id,
      };
      res.status(200).json(formatData);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/rateImage", async (req, res) => {
  const { username, account_id, user_id } = req.body;

  if (username && account_id && user_id) {
    const insertQuery = `
      INSERT INTO sort.output_table (username, account_id, user_id)
      VALUES (?, ?, ?);
    `;
    db.query(insertQuery, [username, account_id, user_id], (err, response) => {
      if (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Database error" });
      } else {
        res.status(201).json({ status: "success" });
      }
    });
  } else {
    res.status(400).json({ message: "All fields required" });
  }
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
