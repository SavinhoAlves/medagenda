/*
  Warnings:

  - Added the required column `n_conselho` to the `especialidades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `consultas` ALTER COLUMN `atualizadoEm` DROP DEFAULT;

-- AlterTable
ALTER TABLE `especialidades` ADD COLUMN `n_conselho` VARCHAR(191) NOT NULL;
