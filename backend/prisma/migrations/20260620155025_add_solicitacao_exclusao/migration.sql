-- AlterTable
ALTER TABLE `usuarios` MODIFY `cargo` VARCHAR(191) NOT NULL DEFAULT 'operador';

-- CreateTable
CREATE TABLE `solicitacoes_exclusao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultaId` INTEGER NOT NULL,
    `solicitanteId` INTEGER NOT NULL,
    `motivo` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDENTE',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `solicitacoes_exclusao` ADD CONSTRAINT `solicitacoes_exclusao_consultaId_fkey` FOREIGN KEY (`consultaId`) REFERENCES `consultas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitacoes_exclusao` ADD CONSTRAINT `solicitacoes_exclusao_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
