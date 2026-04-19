import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";

/* GET /api/requests  — with JOINs to show disaster & resource names */
export async function getRequests(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const pool = await getConnection();
  let query = `
    SELECT
      RR.RequestID, RR.RequestedQuantity, RR.RequestDate, RR.PriorityLevel,
      RR.Status, RR.Remarks,
      D.DisasterID, D.Title AS DisasterTitle,
      R.ResourceID, R.ResourceName,
      U.UserID, U.FullName AS RequestedBy
    FROM ResourceRequest RR
    JOIN DISASTER D       ON RR.DisasterID       = D.DisasterID
    JOIN Resource  R      ON RR.ResourceID        = R.ResourceID
    JOIN [User]    U      ON RR.RequestByUserID   = U.UserID
  `;
  if (status && status !== "All") query += ` WHERE RR.Status = '${status}'`;
  query += " ORDER BY RR.RequestDate DESC";

  const result = await pool.request().query(query);
  return Response.json(result.recordset);
}

/* POST /api/requests */
export async function createRequest(req) {
  const { DisasterID, ResourceID, RequestByUserID, RequestedQuantity, PriorityLevel, Status, Remarks } =
    await req.json();
  if (!DisasterID || !ResourceID || !RequestByUserID || !RequestedQuantity || !PriorityLevel || !Status) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pool = await getConnection();
  const result = await pool.request()
    .input("did",  sql.Int,         DisasterID)
    .input("rid",  sql.Int,         ResourceID)
    .input("uid",  sql.Int,         RequestByUserID)
    .input("qty",  sql.Int,         RequestedQuantity)
    .input("pri",  sql.VarChar(20), PriorityLevel)
    .input("st",   sql.VarChar(20), Status)
    .input("rem",  sql.VarChar(500),Remarks || null)
    .query(`INSERT INTO ResourceRequest
              (DisasterID, ResourceID, RequestByUserID, RequestedQuantity, PriorityLevel, Status, Remarks)
            OUTPUT INSERTED.*
            VALUES (@did, @rid, @uid, @qty, @pri, @st, @rem)`);
  return Response.json(result.recordset[0], { status: 201 });
}

/* PATCH /api/requests  — update status */
export async function updateRequest(req) {
  const { RequestID, Status, Remarks } = await req.json();
  if (!RequestID || !Status) return Response.json({ error: "RequestID and Status required" }, { status: 400 });
  const pool = await getConnection();
  await pool.request()
    .input("id",  sql.Int,          RequestID)
    .input("st",  sql.VarChar(20),  Status)
    .input("rem", sql.VarChar(500), Remarks || null)
    .query("UPDATE ResourceRequest SET Status=@st, Remarks=@rem WHERE RequestID=@id");
  return Response.json({ success: true });
}
