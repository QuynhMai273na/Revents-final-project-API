-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_host_id_fkey";

-- DropForeignKey
ALTER TABLE "events_attendees" DROP CONSTRAINT "events_attendees_eventId_fkey";

-- DropForeignKey
ALTER TABLE "events_attendees" DROP CONSTRAINT "events_attendees_userId_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "description" TEXT,
ADD COLUMN     "password" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "follows" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_attendees" ADD CONSTRAINT "events_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_attendees" ADD CONSTRAINT "events_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
