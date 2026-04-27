import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getAdminEmailFromRequest, loadAdminByEmail, listAccessibleHostelsForAdmin } from "@/lib/adminAccess.server";
import { ensureMultiHostelSchema } from "@/lib/ensureMultiHostelSchema";
export { dynamic } from "@/lib/forceDynamicRoute";

export async function GET(request: NextRequest) {
  try {
    await ensureMultiHostelSchema();
    const email = getAdminEmailFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: "Admin identity required" }, { status: 401 });
    }
    const admin = await loadAdminByEmail(email);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const hostels = await listAccessibleHostelsForAdmin(admin.id);
    return NextResponse.json({ success: true, hostels });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to load hostels" }, { status: 500 });
  }
}

type CreateHostelBody = {
  name: string;
  buildingName?: string;
  hostelType?: string;
  address?: string;
  areaLocality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactPhone?: string;
  totalFloors?: number | null;
  totalRooms?: number | null;
  roomNumbers?: string;
  amenities?: string;
  description?: string;
  isActive?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    await ensureMultiHostelSchema();
    const email = getAdminEmailFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: "Admin identity required" }, { status: 401 });
    }
    const admin = await loadAdminByEmail(email);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const isOwner = admin.is_owner === true || admin.is_owner === 1;
    if (!isOwner) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const mode = String(admin.management_mode ?? "single").toLowerCase();
    if (mode !== "multi") {
      return NextResponse.json(
        { success: false, error: "Additional hostels are only available for multi-hostel accounts." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateHostelBody;
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Hostel name is required" }, { status: 400 });
    }

    const isActive = body.isActive !== false ? 1 : 0;

    await pool.execute(
      `INSERT INTO hostels (
        name, address, city, state, pincode,
        building_name, hostel_type, area_locality, contact_phone,
        total_floors, total_rooms, room_numbers, amenities, description_extended, is_active_hostel
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name.trim(),
        body.address?.trim() || null,
        body.city?.trim() || null,
        body.state?.trim() || null,
        body.pincode?.trim() || null,
        body.buildingName?.trim() || null,
        body.hostelType?.trim() || null,
        body.areaLocality?.trim() || null,
        body.contactPhone?.trim() || null,
        body.totalFloors ?? null,
        body.totalRooms ?? null,
        body.roomNumbers?.trim() || null,
        body.amenities?.trim() || null,
        body.description?.trim() || null,
        isActive,
      ]
    );

    const [idRows] = await pool.execute("SELECT LAST_INSERT_ID() AS id");
    const newId = Number((idRows as { id: number }[])[0]?.id);
    if (!newId) {
      return NextResponse.json({ success: false, error: "Failed to create hostel" }, { status: 500 });
    }

    await pool.execute(
      `INSERT IGNORE INTO admin_hostels (admin_id, hostel_id) VALUES (?, ?)`,
      [admin.id, newId]
    );

    if (admin.hostel_id == null) {
      await pool.execute(`UPDATE admins SET hostel_id = ? WHERE id = ?`, [newId, admin.id]);
    }

    const hostels = await listAccessibleHostelsForAdmin(admin.id);

    return NextResponse.json({
      success: true,
      hostelId: newId,
      hostels,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to create hostel" }, { status: 500 });
  }
}
