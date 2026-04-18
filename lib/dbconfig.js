import sql from "mssql";

const config = {
  user: "sa",
  password: "h220055",
  server: "localhost",
  database: "DRAAS",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;

export async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}
