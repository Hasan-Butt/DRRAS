import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const pool = await getConnection();
  let query = `
    SELECT
      A.AllocationID, A.AllocatedQuantity, A.AllocationDate, A.Status,
      D.DisasterID, D.Title AS DisasterTitle,
      R.ResourceID, R.ResourceName,
      T.TeamID, T.TeamName
    FROM Allocation A
    JOIN Disaster D ON A.DisasterID = D.DisasterID
    JOIN Resource R ON A.ResourceID = R.ResourceID
    JOIN ResponseTeam T ON A.TeamID = T.TeamID
  `;
  if (status && status !== "All") query += ` WHERE A.Status = '${status}'`;
  query += " ORDER BY A.AllocationDate DESC";

  const result = await pool.request().query(query);
  return Response.json(result.recordset);
}

export async function POST(req) {
  const { DisasterID, ResourceID, RequestID, TeamID, AllocatedQuantity, Status } = await req.json();
  if (!DisasterID || !ResourceID || !RequestID || !TeamID || !AllocatedQuantity || !Status) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pool = await getConnection();
  const result = await pool.request()
    .input("did",  sql.Int, DisasterID)
    .input("rid",  sql.Int, ResourceID)
    .input("reqid",sql.Int, RequestID)
    .input("tid",  sql.Int, TeamID)
    .input("qty",  sql.Int, AllocatedQuantity)
    .input("st",   sql.VarChar(20), Status)
    .query(`INSERT INTO Allocation
              (DisasterID, ResourceID, RequestID, TeamID, AllocatedQuantity, Status)
            OUTPUT INSERTED.*
            VALUES (@did, @rid, @reqid, @tid, @qty, @st)`);
  return Response.json(result.recordset[0], { status: 201 });
}

export async function PATCH(req) {
  const { AllocationID, Status } = await req.json();
  if (!AllocationID || !Status) return Response.json({ error: "AllocationID and Status required" }, { status: 400 });
  const pool = await getConnection();
  await pool.request()
    .input("id", sql.Int, AllocationID)
    .input("st", sql.VarChar(20), Status)
    .query("UPDATE Allocation SET Status=@st WHERE AllocationID=@id");
  return Response.json({ success: true });
}

export const dynamic = "force-dynamic";
