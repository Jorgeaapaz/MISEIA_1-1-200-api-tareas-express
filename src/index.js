require('dotenv').config();
const app = require('./server');
const { connect } = require('./config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');

  await connect();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger UI at   http://localhost:${PORT}/api-docs`);
  });
};

start().catch(err => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
