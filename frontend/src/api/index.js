import axios from 'axios';

export const fetchTableData = async () => {
  try {
      const response = await axios.get('http://localhost:3001/api/input-table');
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};
export const fetchUserData = async (slug) => {
  try {
      const response = await axios.get('http://localhost:3001/api/userdata', {
        params: {
          slug: slug,
        }
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};
export const loadNextImagesData = async (user, slug) => {
  try {
      const response = await axios.get('http://localhost:3001/api/getNextImages', {
        params: {
          user: user,
          slug: slug,
        },
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};
export const loadPerviousImagesData = async (user) => {
  try {
      const response = await axios.get('http://localhost:3001/api/getNextImages', {
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