/*
  Warnings:

  - You are about to drop the column `descrição` on the `logs` table. All the data in the column will be lost.
  - Added the required column `descricao` to the `logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `logs` DROP COLUMN `descrição`,
    ADD COLUMN `descricao` VARCHAR(255) NOT NULL;
