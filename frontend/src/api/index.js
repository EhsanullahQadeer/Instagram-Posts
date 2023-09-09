import axios from 'axios';
export const loadImagesData = async (slug, value) => {
  try {
      const response = await axios.get('http://localhost:3001/api/getImages', {
        params: {
          slug: slug,
          value: value,
        },
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};
export const rateImage = async (data) => {
  try {
      const response = await axios.post('http://localhost:3001/api/rateImage', {
        username: data.username,
        user_id: data.user_id,
        account_id: data.accountId,
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};