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