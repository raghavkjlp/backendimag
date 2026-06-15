require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ImageKit = require('@imagekit/nodejs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('./')); // Serve static files from the current directory
app.use(express.json());

// ImageKit Configuration
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Endpoint to fetch images from ImageKit
app.get('/api/images', async (req, res) => {
  try {
    const { folder } = req.query;

    // Set up search parameters
    const searchParams = {
      limit: 500
    };

    if (folder && folder !== 'all') {
      searchParams.path = `/${folder}`; // Assuming your images are in folders like /awarness4
    }

    // Fetch images from ImageKit
    const result = await imagekit.assets.list(searchParams);

    // In @imagekit/nodejs, result might be directly the array, or maybe wrapped.
    // Assuming result directly contains the list, or result.data
    res.json(result);

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
