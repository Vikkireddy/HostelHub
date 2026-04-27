import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureMultiHostelSchema } from "@/lib/ensureMultiHostelSchema";
import { getAdminEmailFromRequest, listAccessibleHostelsForAdmin, loadAdminByEmail } from "@/lib/adminAccess.server";
export { dynamic } from "@/lib/forceDynamicRoute";

type UpdateHostelBody = {
  name?: string;
  buildingName?: string;
  hostelType?: string;
  address?: string;
  areaLocality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactPhone?: string;
  isActive?: boolean;
};

async function getAuthorizedAdmin(request: NextRequest) {
  await ensureMultiHostelSchema();
  const email = getAdminEmailFromRequest(request);
  if (!email) return { error: "Admin identity required", status: 401 } as const;
  const admin = await loadAdminByEmail(email);
  if (!admin) return { error: "Unauthorized", status: 401 } as const;
  const isOwner = admin.is_owner === true || admin.is_owner === 1;
  const mode = String(admin.management_mode ?? "single").toLowerCase();
  if (!isOwner || mode !== "multi") return { error: "Forbidden", status: 403 } as const;
  return { admin } as const;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthorizedAdmin(request);
    if ("error" in auth) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const { admin } = auth;
    const params = await context.params;
    const hostelId = Number(params.id);
    if (!Number.isFinite(hostelId) || hostelId <= 0) {
      return NextResponse.json({ success: false, error: "Invalid hostel id" }, { status: 400 });
    }
    const accessible = await listAccessibleHostelsForAdmin(admin.id);
    if (!accessible.some((h) => h.id === hostelId)) {
      return NextResponse.json({ success: false, error: "Hostel not accessible" }, { status: 403 });
    }

    const body = (await request.json()) as UpdateHostelBody;
    const isActive = body.isActive !== false ? 1 : 0;
    await pool.execute(
      `UPDATE hostels
       SET name = COALESCE(NULLIF(?, ''), name),
           building_name = ?,
           hostel_type = ?,
           address = ?,
           area_locality = ?,
           city = ?,
           state = ?,
           pincode = ?,
           contact_phone = ?,
           is_active_hostel = ?
       WHERE id = ?`,
      [
        body.name?.trim() ?? "",
        body.buildingName?.trim() || null,
        body.hostelType?.trim() || null,
        body.address?.trim() || null,
        body.areaLocality?.trim() || null,
        body.city?.trim() || null,
        body.state?.trim() || null,
        body.pincode?.trim() || null,
        body.contactPhone?.trim() || null,
        isActive,
        hostelId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to update hostel" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthorizedAdmin(request);
    if ("error" in auth) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const { admin } = auth;
    const params = await context.params;
    const hostelId = Number(params.id);
    if (!Number.isFinite(hostelId) || hostelId <= 0) {
      return NextResponse.json({ success: false, error: "Invalid hostel id" }, { status: 400 });
    }
    const accessible = await listAccessibleHostelsForAdmin(admin.id);
    if (!accessible.some((h) => h.id === hostelId)) {
      return NextResponse.json({ success: false, error: "Hostel not accessible" }, { status: 403 });
    }

    await pool.execute(`DELETE FROM admin_hostels WHERE hostel_id = ?`, [hostelId]);
    await pool.execute(`DELETE FROM hostels WHERE id = ?`, [hostelId]);

    const [rows] = await pool.execute(`SELECT hostel_id FROM admin_hostels WHERE admin_id = ? ORDER BY created_at ASC LIMIT 1`, [
      admin.id,
    ]);
    const fallbackHostelId =
      Number((rows as { hostel_id?: number }[])[0]?.hostel_id ?? 0) || null;
    if (admin.hostel_id === hostelId) {
      await pool.execute(`UPDATE admins SET hostel_id = ? WHERE id = ?`, [fallbackHostelId, admin.id]);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to delete hostel" }, { status: 500 });
  }
}
