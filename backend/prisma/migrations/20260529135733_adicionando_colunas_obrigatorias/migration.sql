/*
  Warnings:

  - You are about to drop the column `dataConsulta` on the `consultas` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `consultas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `atualizadoEm` to the `consultas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFim` to the `consultas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInicio` to the `consultas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `consultas` DROP COLUMN `dataConsulta`,
    ADD COLUMN `atualizadoEm` DATETIME(3) NOT NULL,
    ADD COLUMN `confirmado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `cor` VARCHAR(191) NULL DEFAULT '#10b981',
    ADD COLUMN `dataFim` DATETIME(3) NOT NULL,
    ADD COLUMN `dataInicio` DATETIME(3) NOT NULL,
    ADD COLUMN `descricao` VARCHAR(191) NULL,
    ADD COLUMN `encaixe` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `pago` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `retorno` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sala` VARCHAR(191) NULL,
    ADD COLUMN `titulo` VARCHAR(191) NULL,
    MODIFY `status` ENUM('AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'FALTOU') NOT NULL DEFAULT 'AGENDADA';
