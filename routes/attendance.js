import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/checkin", async (req, res) => {
  try {
    const { employee_id, lat, lon, image_path } = req.body;

    // 1️⃣ Find office location
    const office = await prisma.locations.findFirst({
      where: { location_name: "Chetas Control Pvt Ltd, Pune" },
    });

    if (!office) {
      return res.status(404).json({ error: "Office location not found" });
    }

    // 2️⃣ Check if inside geo-fence
    const isWithinFence =
      lat >= office.min_latitude &&
      lat <= office.max_latitude &&
      lon >= office.min_longitude &&
      lon <= office.max_longitude;

    // 3️⃣ Save attendance
    const attendance = await prisma.attendance.create({
      data: {
        employee_id,
        check_in_time: new Date(),
        check_in_latitude: lat,
        check_in_longitude: lon,
        image_path,
        marked_location_id: office.location_id,
        is_on_site: isWithinFence,
      },
    });

    res.json({ success: true, data: attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
