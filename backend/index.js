const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { promisify } = require("util");


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
const dbQueryAsync = promisify(db.query.bind(db));
const agent = new HttpsProxyAgent("http://user26:8PFNYUSu@176.9.113.112:11026");

const updateUserQuery = async (slug, value) => {
  try {
    const selectQuery = "SELECT * FROM users";
    const selectResults = await dbQueryAsync(selectQuery);
    const userToUpdate = selectResults.find((item) => item.slug === slug);
    if (!userToUpdate) {
      throw new Error("User not found");
    }
    if (Number(value) === 0 || Number(value) - 1 === userToUpdate.last_id) {
      const newLastId = userToUpdate.last_id + 1;
      const updateQuery = `UPDATE users SET last_id = ${newLastId} WHERE id = ${userToUpdate.id}`;
      await dbQueryAsync(updateQuery);
      return { last_id: newLastId, value: newLastId };
    } else {
      return { last_id: userToUpdate.last_id, value: value };
    }
  } catch (error) {
    throw new Error("Internal Server Error");
  }
};

const userQuery = "SELECT * FROM users";
const tableQuery = "SELECT * FROM sort.input_table";

app.get("/api/getImages", async (req, res) => {
  const { slug, value } = req.query;
  const changeIpUrl =
    "http://176.9.113.112:11126/changeip/client/23108983551657110673";

  try {
    const data = await updateUserQuery(slug, value);
    console.log(data)
    const response = await dbQueryAsync(userQuery);
    const findUserFromDB = response.find((item) => item.slug === slug);
    if (!findUserFromDB) {
      return res.status(400).json({ error: "User not found" });
    }
    const results = await dbQueryAsync(tableQuery);
    const username = results[data.value].username;
    const user_id = results[data.value].user_id;
    const instagramResponse = await axios({
      method: "get",
      httpsAgent: agent,
      url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      headers: {
        "x-ig-app-id": "1217981644879628",
      },
    });
    await axios.get(changeIpUrl);
    const instagramData =
      instagramResponse.data.data.user.edge_owner_to_timeline_media.edges;
    const imagesUrlArr = instagramData.map(
      (item) => item.node.thumbnail_resources[3].src
    );
    const formatData = {
      imagesData: imagesUrlArr,
      accountId: findUserFromDB.id,
      last_id: data.last_id,
      change_time: findUserFromDB?.change_time,
      total_records: results.length,
      username: username,
      user_id: user_id,
      // total_done: userOutputRecords.length,
    };
    res.status(200).json(formatData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/rateImage", async (req, res) => {
  const { username, account_id, user_id } = req.body;
  if (!username || !account_id || !user_id) {
    return res.status(400).json({ message: "All fields required" });
  }
  const insertQuery = `
    INSERT INTO sort.output_table (username, account_id, user_id)
    VALUES (?, ?, ?);
  `;
  try {
    await dbQueryAsync(insertQuery, [username, account_id, user_id]);
    res.status(201).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
