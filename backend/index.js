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
const changeIpUrl =
  "http://176.9.113.112:11126/changeip/client/23108983551657110673";

const dbQueryAsync = promisify(db.query.bind(db));
const agent = new HttpsProxyAgent("http://user26:8PFNYUSu@176.9.113.112:11026");

let changeTime;
let isChangeIp = true;
async function triggerChangeIp() {
  isChangeIp = false;
  setTimeout(async () => {
    await axios.get(changeIpUrl);
    isChangeIp = true;
  }, [changeTime]);
}

app.get("/api/getImages", async (req, res) => {
  const { lastId, userId, isUpdateLastId } = req.query;
  try {
    const updateQueryPromise = isUpdateLastId
      ? dbQueryAsync(
          `UPDATE users SET last_id = ${lastId} WHERE id = ${userId}`
        )
      : Promise.resolve();
    const queryPromise = dbQueryAsync(
      `SELECT COUNT(*) AS count FROM output_table WHERE user_id = ?`,
      [userId]
    );
    const getUserNamePromise = dbQueryAsync(
      "SELECT * FROM input_table WHERE id = ? LIMIT 1",
      [lastId]
    );

    const [_, userOutputRecords, results] = await Promise.all([
      updateQueryPromise,
      queryPromise,
      getUserNamePromise,
    ]);

    const { username, user_id: accountId } = { ...results[0] };

    const instagramResponse = await axios({
      method: "get",
      httpsAgent: agent,
      url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      headers: {
        "x-ig-app-id": "1217981644879628",
      },
    });
    const instagramData =
      instagramResponse?.data.data?.user?.edge_owner_to_timeline_media?.edges;
    const imagesUrlArr = instagramData
      ? instagramData.map((item) => item.node.thumbnail_resources[3].src)
      : [];
    const formatData = {
      accountId: accountId,
      totalDone: userOutputRecords[0].count,
      imagesData: imagesUrlArr,
      username: username,
    };

    if (isChangeIp) {
      triggerChangeIp();
    }

    res.status(200).json(formatData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getUserDetails/:slug", async (req, res) => {
  const { slug } = req.params;
  const selectQuery = "SELECT * FROM users WHERE slug = ? LIMIT 1";
  const selectResults = await dbQueryAsync(selectQuery, [slug]);
  if (!selectResults.length > 0) {
    return res.status(404).json({ msg: "User not found" });
  }
  // get total records from input table
  const totalRecordsQuery = ` SELECT COUNT(*) AS count FROM input_table`;
  const totalRecords = await dbQueryAsync(totalRecordsQuery);
  let data = { ...selectResults[0], ...totalRecords[0] };
  changeTime = parseInt(data.delay_time + "000");
  res.status(200).json(data);
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
