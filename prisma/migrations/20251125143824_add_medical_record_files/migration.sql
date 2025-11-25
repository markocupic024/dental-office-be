/*
  Warnings:

  - You are about to drop the column `attached_file` on the `medical_record_entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medical_record_entries" DROP COLUMN "attached_file";

-- CreateTable
CREATE TABLE "medical_record_files" (
    "id" TEXT NOT NULL,
    "medical_record_entry_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_record_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medical_record_files" ADD CONSTRAINT "medical_record_files_medical_record_entry_id_fkey" FOREIGN KEY ("medical_record_entry_id") REFERENCES "medical_record_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
