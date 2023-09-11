import axios from "axios";
let backendUrl = "http://localhost:3001";

export const loadImagesData = async (lastId, userId, isUpdateLastId) => {
  try {
    const response = await axios.get(backendUrl + "/api/getImages", {
      params: {
        lastId: lastId,
        userId: userId,
        isUpdateLastId: isUpdateLastId,
      },
    });
    return response.data;
  } catch (error) {}
};
export const rateImage = async (username, accountId, user_id) => {
  try {
    const response = await axios.post(backendUrl + "/api/rateImage", {
      username: username,
      account_id: accountId,
      user_id: user_id,
    });
    return response.data;
  } catch (error) {}
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
