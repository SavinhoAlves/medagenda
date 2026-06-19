/*
  Warnings:

  - You are about to drop the column `atualizadoEm` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the column `criadoEm` on the `consultas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `consultas` DROP COLUMN `atualizadoEm`,
    DROP COLUMN `criadoEm`,
    ALTER COLUMN `cor` DROP DEFAULT;

-- AlterTable
ALTER TABLE `pacientes` ADD COLUMN `bairro` VARCHAR(191) NULL,
    ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `cidade` VARCHAR(191) NULL,
    ADD COLUMN `complemento` VARCHAR(191) NULL,
    ADD COLUMN `estado` VARCHAR(191) NULL,
    ADD COLUMN `numero` VARCHAR(191) NULL,
    ADD COLUMN `pais` VARCHAR(191) NULL,
    ADD COLUMN `rg` VARCHAR(191) NULL,
    ADD COLUMN `sexo` ENUM('MASCULINO', 'FEMININO', 'OUTRO') NULL,
    ADD COLUMN `telefoneResidencial` VARCHAR(191) NULL,
    ADD COLUMN `telefoneTrabalho` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `convenios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pacientes_convenios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pacienteId` INTEGER NOT NULL,
    `convenioId` INTEGER NOT NULL,
    `numeroCarteira` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pacientes_convenios` ADD CONSTRAINT `pacientes_convenios_pacienteId_fkey` FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pacientes_convenios` ADD CONSTRAINT `pacientes_convenios_convenioId_fkey` FOREIGN KEY (`convenioId`) REFERENCES `convenios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
