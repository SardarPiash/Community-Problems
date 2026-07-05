require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cprs';

connectDB(MONGO_URI);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
