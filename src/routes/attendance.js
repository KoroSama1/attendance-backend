import express from 'express'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import fs from 'fs'

const prisma = new PrismaClient()
const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// Helper: check if coords within bounding box
function inBounds(lat, lon, loc) {
  if (!loc) return false
  return lat >= loc.min_latitude && lat <= loc.max_latitude && lon >= loc.min_longitude && lon <= loc.max_longitude
}

// POST /api/attendance
router.post('/', async (req, res) => {
  try {
    const { employee_id, image_base64, check_in_latitude, check_in_longitude } = req.body
    if (!employee_id || !image_base64) return res.status(400).json({ error: 'employee_id and image required' })

    // save image
    const matches = image_base64.match(/^data:(image\/\w+);base64,(.+)$/)
    let imagePath = null
    if (matches) {
      const ext = matches[1].split('/')[1]
      const data = Buffer.from(matches[2], 'base64')
      const filename = Date.now() + '-' + Math.round(Math.random()*1e9) + '.' + ext
      const fullpath = path.join(uploadDir, filename)
      fs.writeFileSync(fullpath, data)
      imagePath = '/uploads/' + filename
    }

    // find employee's assigned locations
    const assigned = await prisma.employeeLocations.findMany({
      where: { employee_id },
      include: { Locations: true }
    })

    // check if any assigned location contains coords
    let matchedLocationId = null
    let isOnSite = false
    if (check_in_latitude !== undefined && check_in_longitude !== undefined) {
      for (const el of assigned) {
        const loc = el.Locations
        if (inBounds(check_in_latitude, check_in_longitude, loc)) {
          matchedLocationId = loc.location_id
          isOnSite = true
          break
        }
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        employee_id,
        check_in_time: new Date(),
        check_in_latitude: check_in_latitude || null,
        check_in_longitude: check_in_longitude || null,
        marked_location_id: matchedLocationId,
        image_path: imagePath,
        is_on_site: isOnSite
      }
    })

    res.json({ message: 'Attendance recorded', attendance })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      orderBy: { attendance_date: 'desc' },
      include: { Employees: true, Locations: true }
    })
    res.json(records.map(r => ({
      attendance_id: r.attendance_id,
      employee_id: r.employee_id,
      employee_name: r.Employees ? r.Employees.first_name + (r.Employees.last_name ? (' ' + r.Employees.last_name) : '') : null,
      attendance_date: r.attendance_date,
      check_in_time: r.check_in_time,
      check_in_latitude: r.check_in_latitude,
      check_in_longitude: r.check_in_longitude,
      marked_location_id: r.marked_location_id,
      location_name: r.Locations ? r.Locations.location_name : null,
      image_path: r.image_path,
      is_on_site: r.is_on_site,
      check_out_time: r.check_out_time
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
