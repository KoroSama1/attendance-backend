-- CreateTable
CREATE TABLE "Employees" (
    "employee_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "designation" TEXT,
    "is_travel_exception" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Locations" (
    "location_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "location_name" TEXT NOT NULL,
    "center_latitude" REAL,
    "center_longitude" REAL,
    "min_latitude" REAL NOT NULL,
    "max_latitude" REAL NOT NULL,
    "min_longitude" REAL NOT NULL,
    "max_longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeLocations" (
    "employee_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,

    PRIMARY KEY ("employee_id", "location_id"),
    CONSTRAINT "EmployeeLocations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees" ("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeLocations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Locations" ("location_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendance_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_id" INTEGER NOT NULL,
    "attendance_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_in_time" DATETIME,
    "check_in_latitude" REAL,
    "check_in_longitude" REAL,
    "marked_location_id" INTEGER,
    "image_path" TEXT,
    "is_on_site" BOOLEAN NOT NULL DEFAULT false,
    "check_out_time" DATETIME,
    CONSTRAINT "Attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees" ("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_marked_location_id_fkey" FOREIGN KEY ("marked_location_id") REFERENCES "Locations" ("location_id") ON DELETE SET NULL ON UPDATE CASCADE
);
