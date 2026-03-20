import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, currentEmail } = body;

    if (!currentEmail || !name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, message: "Current email and name are required" },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();
    if (!trimmedName) {
      return NextResponse.json(
        { success: false, message: "Name cannot be empty" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      "UPDATE admins SET name = ? WHERE LOWER(email) = ?",
      [trimmedName, String(currentEmail).toLowerCase()]
    );

    const affected = (result as { affectedRows: number }).affectedRows;
    if (affected === 0) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { name: trimmedName, email: currentEmail },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
