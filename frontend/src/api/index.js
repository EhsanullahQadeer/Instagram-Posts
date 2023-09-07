import axios from 'axios';

export const fetchUserData = async () => {
  try {
      const response = await axios.get('http://localhost:3001/api/userdata');
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};
export const fetchInstagramData = async (user) => {
  try {
      const response = await axios.get('http://localhost:3001/api/instagram', {
        params: {
          user: `${user}`,
        },
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};
export const rateImage = async (data, accountId) => {
  try {
      const response = await axios.post('http://localhost:3001/api/rateImage', {
        username: data.username,
        user_id: data.user_id,
        account_id: accountId,
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};