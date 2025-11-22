/*
  Warnings:

  - You are about to drop the column `treatment_type` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `treatment_type` on the `medical_record_entries` table. All the data in the column will be lost.
  - Added the required column `treatment_type_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treatment_type_id` to the `medical_record_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "treatment_type",
ADD COLUMN     "treatment_type_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "medical_record_entries" DROP COLUMN "treatment_type",
ADD COLUMN     "treatment_type_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_treatment_type_id_fkey" FOREIGN KEY ("treatment_type_id") REFERENCES "treatment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_entries" ADD CONSTRAINT "medical_record_entries_treatment_type_id_fkey" FOREIGN KEY ("treatment_type_id") REFERENCES "treatment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
