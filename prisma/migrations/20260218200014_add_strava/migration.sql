-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastStravaSync" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "mapPolyline" TEXT,
ADD COLUMN     "movingTime" INTEGER,
ADD COLUMN     "stravaData" JSONB;
