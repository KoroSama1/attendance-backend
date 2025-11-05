// prisma/seed.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1) Create (or reuse) the office location
  const officeName = 'Chetas Control Pvt Ltd, Pune'
  let office = await prisma.locations.findFirst({ where: { location_name: officeName } })
  if (!office) {
    office = await prisma.locations.create({
      data: {
        location_name: officeName,
        center_latitude: 18.53748868,
        center_longitude: 73.78172259,
        min_latitude: 18.53568688,
        max_latitude: 18.53929048,
        min_longitude: 73.77981859,
        max_longitude: 73.78362659,
      },
    })
    console.log('✅ Created office location:', office.location_id)
  } else {
    console.log('ℹ️ Office location exists:', office.location_id)
  }

  // 2) Create (or reuse) a test employee
  const firstName = 'Test'
  const lastName = 'User'
  let employee = await prisma.employees.findFirst({
    where: { first_name: firstName, last_name: lastName },
  })

  if (!employee) {
    employee = await prisma.employees.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        designation: 'Engineer',
        is_travel_exception: false,
      },
    })
    console.log('✅ Created employee:', employee.employee_id)
  } else {
    console.log('ℹ️ Employee exists:', employee.employee_id)
  }

  // 3) Create the join EmployeeLocations if it doesn't exist
  // Prisma should expose a compound unique name like employee_id_location_id for the composite key.
  // We'll try findUnique, and if not supported, fallback to findFirst.
  const linkWhere = { employee_id: employee.employee_id, location_id: office.location_id }
  let existingLink = null
  try {
    existingLink = await prisma.employeeLocations.findUnique({
      where: { employee_id_location_id: linkWhere },
    })
  } catch (e) {
    // If findUnique with compound name isn't available, fallback to findFirst
    existingLink = await prisma.employeeLocations.findFirst({ where: linkWhere })
  }

  if (!existingLink) {
    await prisma.employeeLocations.create({
      data: {
        employee_id: employee.employee_id,
        location_id: office.location_id,
      },
    })
    console.log('✅ Linked employee -> location')
  } else {
    console.log('ℹ️ EmployeeLocation link exists')
  }

  console.log('🎉 Seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
