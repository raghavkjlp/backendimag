require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ImageKit = require('@imagekit/nodejs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Serve static files with anti-cache headers to ensure users always see the latest changes
app.use(express.static('./', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.html')) {
      // For HTML pages, force no-cache so the client always fetches the latest version
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (path.endsWith('.css') || path.endsWith('.js')) {
      // For CSS/JS, revalidate with ETag to pick up modifications immediately
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

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

    // ── Anti-cache headers — ensures users always get fresh data ──
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

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
