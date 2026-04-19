import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";

export const dynamic = "force-dynamic";

/* GET /api/locations — all locations with linked disaster counts */
export async function GET() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT
      L.LocationID, L.City, L.Region, L.Latitude, L.Longitude,
      COUNT(DL.DisasterID) AS ActiveIncidents
    FROM LOCATION L
    LEFT JOIN DISASTER_LOCATION DL ON L.LocationID = DL.LocationID
    LEFT JOIN DISASTER D ON DL.DisasterID = D.DisasterID AND D.Status = 'Active'
    GROUP BY L.LocationID, L.City, L.Region, L.Latitude, L.Longitude
    ORDER BY ActiveIncidents DESC
  `);
  return Response.json(result.recordset);
}

/* POST /api/locations */
export async function POST(req) {
  const { City, Region, Latitude, Longitude } = await req.json();
  if (!City || !Region || Latitude == null || Longitude == null) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pool = await getConnection();
  const result = await pool.request()
    .input("city", sql.VarChar(100), City)
    .input("reg",  sql.VarChar(100), Region)
    .input("lat",  sql.Decimal(9,6), Latitude)
    .input("lng",  sql.Decimal(9,6), Longitude)
    .query(`INSERT INTO LOCATION (City, Region, Latitude, Longitude)
            OUTPUT INSERTED.* VALUES (@city, @reg, @lat, @lng)`);
  return Response.json(result.recordset[0], { status: 201 });
}
