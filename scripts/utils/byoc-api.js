import axios from 'axios';

// Fetch layers for a specific configuration
export const fetchLayersFromConfiguration = async (collectionId, token, configurationsEndpoint) => {
  try {
    const layersEndpoint = `${configurationsEndpoint}/${collectionId}/layers`;
    return await fetchData(layersEndpoint, token);
  } catch (error) {
    console.error(`Error fetching layers for instance ${collectionId}:`, error.message);
    return [];
  }
};

const fetchAllData = async (endpoint, token) => {
  try {
    let allData = [];
    let nextPageUrl = `${endpoint}?count=100`; // Start with the first page, fetching 100 items per page

    while (nextPageUrl) {
      const response = await axios.get(nextPageUrl, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const { data, links } = response.data;

      // Append the current page's data to the allData array
      allData = allData.concat(data);

      // Determine the next page URL
      nextPageUrl = links && links.next ? links.next : null; // If there's a "next" link, continue; otherwise, stop
    }

    return allData;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
    throw error;
  }
};

// Utility: Fetch data from a single API endpoint
export const fetchData = async (endpoint, token) => {
  try {
    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
    throw error;
  }
};

export const fetchCollections = async (apiEndpoint, token) => {
  try {
    const byocs = await fetchAllData(apiEndpoint, token);

    if (Array.isArray(byocs)) {
      return byocs;
    } else {
      throw new Error('Invalid response structure: Expected a "data" object with an array.');
    }
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    throw error;
  }
};

export async function fetchCollectionData(collectionId, token) {
  const url = `https://sh.dataspace.copernicus.eu/api/v1/byoc/collections/${collectionId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    ///
    return response.data;
  } catch (error) {
    console.error(`Error fetching collection data for ${collectionId}:`, error.message);
    return null;
  }
}
