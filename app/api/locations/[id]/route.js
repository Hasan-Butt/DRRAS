import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = params;
  const pool = await getConnection();

  // Get location info
  const locResult = await pool.request()
    .input("id", sql.Int, id)
    .query("SELECT * FROM LOCATION WHERE LocationID = @id");

  if (!locResult.recordset.length)
    return Response.json({ error: "Not found" }, { status: 404 });

  // Get linked disasters
  const disasterResult = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT D.DisasterID, D.Title, D.Type, D.SeverityLevel, D.Status, D.StartDate
      FROM DISASTER D
      JOIN DISASTER_LOCATION DL ON D.DisasterID = DL.DisasterID
      WHERE DL.LocationID = @id
      ORDER BY D.SeverityLevel DESC
    `);

  // Get nearby teams (within ~200km using Haversine approximation)
  const loc = locResult.recordset[0];
  const teamsResult = await pool.request()
    .input("lat", sql.Decimal(9,6), loc.Latitude)
    .input("lng", sql.Decimal(9,6), loc.Longitude)
    .query(`
      SELECT TeamID, TeamName, Specialization, ContactInfo, AvailabilityStatus,
             Latitude, Longitude,
             -- Haversine distance in km
             6371 * 2 * ASIN(SQRT(
               POWER(SIN(RADIANS(Latitude - @lat) / 2), 2) +
               COS(RADIANS(@lat)) * COS(RADIANS(Latitude)) *
               POWER(SIN(RADIANS(Longitude - @lng) / 2), 2)
             )) AS DistanceKm
      FROM ResponseTeam
      WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
        AND AvailabilityStatus = 'Available'
      ORDER BY DistanceKm ASC
    `);

  return Response.json({
    location: locResult.recordset[0],
    disasters: disasterResult.recordset,
    nearbyTeams: teamsResult.recordset,
  });
}