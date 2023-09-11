import axios from "axios";
let backendUrl = "http://localhost:3001";

export const loadImagesData = async (lastId, userId, isUpdateLastId) => {
  try {
    const response = await axios.get("http://localhost:3001/api/getImages", {
      params: {
        lastId: lastId,
        userId: userId,
        isUpdateLastId: isUpdateLastId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
export const rateImage = async (username, accountId, user_id) => {
  debugger
  try {
    const response = await axios.post("http://localhost:3001/api/rateImage", {
      username: username,
      account_id: accountId,
      user_id: user_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
// check user availble

export const checkUserAvailble = async (slug) => {
  try {
    const response = await axios.get(backendUrl + `/getUserDetails/${slug}`);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};
