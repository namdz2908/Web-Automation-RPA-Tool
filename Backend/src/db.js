// ─── PostgreSQL Connection Pool ───────────────────────────────────────────────
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Kiểm tra kết nối DB khi server khởi động
 */
async function connectDB() {
  try {
    const client = await pool.connect();
    console.log(' PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    console.error(' PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, connectDB };
