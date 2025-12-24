-- AlterTable
ALTER TABLE "events_attendees" ADD CONSTRAINT "events_attendees_pkey" PRIMARY KEY ("eventId", "userId");

-- DropIndex
DROP INDEX "events_attendees_eventId_userId_key";
