import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = "drras_super_secret_key_2026"; // In production, use process.env.JWT_SECRET

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input("email", sql.VarChar(100), email)
      .input("pass",  sql.VarChar(255), password)
      .query("SELECT UserID, FullName, Email, Role FROM [User] WHERE Email = @email AND PasswordHash = @pass");

    const user = result.recordset[0];

    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: user.Role, name: user.FullName },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return new Response(JSON.stringify({ success: true, user }), {
      status: 200,
      headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
