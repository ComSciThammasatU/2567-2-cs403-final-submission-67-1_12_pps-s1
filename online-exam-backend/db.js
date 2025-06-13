const { Pool } = require('pg');

const pool = new Pool({
  host: 'etesting-etesting-68.h.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_C8gIlyw4g0lZoZpK7oK',
  database: 'defaultdb',
  port: 22645,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
