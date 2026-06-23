-- CreateTable
CREATE TABLE `prontuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultaId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `prontuarios_consultaId_key`(`consultaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sinais_vitais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `pressaoSistolica` INTEGER NULL,
    `pressaoDiastolica` INTEGER NULL,
    `frequenciaCardiaca` INTEGER NULL,
    `frequenciaRespiratoria` INTEGER NULL,
    `saturacaoO2` DOUBLE NULL,
    `temperatura` DOUBLE NULL,
    `peso` DOUBLE NULL,
    `altura` DOUBLE NULL,
    `imc` DOUBLE NULL,
    `circunferenciaAbdominal` DOUBLE NULL,
    `glicemia` DOUBLE NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sinais_vitais_prontuarioId_key`(`prontuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamneses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `queixaPrincipal` TEXT NULL,
    `historiaDoencaAtual` TEXT NULL,
    `antecedentesPessoais` TEXT NULL,
    `antecedentesFamiliares` TEXT NULL,
    `habitosVida` TEXT NULL,
    `medicamentosUso` TEXT NULL,
    `alergias` TEXT NULL,
    `vacinacao` TEXT NULL,
    `revisaoSistemas` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `anamneses_prontuarioId_key`(`prontuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exames_fisicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `estadoGeral` TEXT NULL,
    `pele` TEXT NULL,
    `cabecaPescoco` TEXT NULL,
    `toracoRespiratorio` TEXT NULL,
    `toracoCardiaco` TEXT NULL,
    `abdome` TEXT NULL,
    `membrosPelve` TEXT NULL,
    `neurologico` TEXT NULL,
    `outrosAchados` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exames_fisicos_prontuarioId_key`(`prontuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cid10` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NULL,
    `capitulo` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `cid10_codigo_key`(`codigo`),
    INDEX `cid10_codigo_idx`(`codigo`),
    INDEX `cid10_descricao_idx`(`descricao`(80)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hipoteses_diagnosticas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `cid10Id` INTEGER NULL,
    `cidManual` VARCHAR(191) NULL,
    `descricao` TEXT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'PRINCIPAL',
    `confirmado` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `condutas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `planoTerapeutico` TEXT NULL,
    `orientacoes` TEXT NULL,
    `restricoes` TEXT NULL,
    `encaminhamento` TEXT NULL,
    `observacoes` TEXT NULL,
    `retornoDescricao` VARCHAR(191) NULL,
    `dataRetorno` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `condutas_prontuarioId_key`(`prontuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exames_solicitados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'LABORATORIAL',
    `nome` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NULL,
    `indicacao` TEXT NULL,
    `urgente` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SOLICITADO',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resultados_exames` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'LABORATORIAL',
    `origem` VARCHAR(191) NOT NULL DEFAULT 'EXTERNO',
    `dataColeta` DATETIME(3) NULL,
    `dataResultado` DATETIME(3) NULL,
    `conteudo` LONGTEXT NULL,
    `interpretacao` TEXT NULL,
    `arquivo` VARCHAR(191) NULL,
    `arquivoNome` VARCHAR(191) NULL,
    `arquivoTipo` VARCHAR(191) NULL,
    `arquivoTamanho` INTEGER NULL,
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `principioAtivo` VARCHAR(191) NOT NULL,
    `apresentacao` VARCHAR(191) NULL,
    `classe` VARCHAR(191) NULL,
    `controlado` BOOLEAN NOT NULL DEFAULT false,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `medicamentos_nome_idx`(`nome`(80)),
    INDEX `medicamentos_principioAtivo_idx`(`principioAtivo`(80)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescricoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'SIMPLES',
    `observacoes` TEXT NULL,
    `validade` DATETIME(3) NULL,
    `emitidaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_prescricao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prescricaoId` INTEGER NOT NULL,
    `medicamentoId` INTEGER NULL,
    `medicamentoManual` VARCHAR(191) NULL,
    `apresentacao` VARCHAR(191) NULL,
    `dose` VARCHAR(191) NULL,
    `via` VARCHAR(191) NULL,
    `frequencia` VARCHAR(191) NULL,
    `duracao` VARCHAR(191) NULL,
    `quantidade` VARCHAR(191) NULL,
    `instrucoes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos_atestados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `conteudo` LONGTEXT NULL,
    `arquivo` VARCHAR(191) NULL,
    `arquivoNome` VARCHAR(191) NULL,
    `diasAfastamento` INTEGER NULL,
    `dataInicio` DATETIME(3) NULL,
    `dataFim` DATETIME(3) NULL,
    `emitidoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anexos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `arquivo` VARCHAR(191) NOT NULL,
    `arquivoNome` VARCHAR(191) NOT NULL,
    `arquivoTipo` VARCHAR(191) NOT NULL,
    `arquivoTamanho` INTEGER NULL,
    `categoria` VARCHAR(191) NOT NULL DEFAULT 'GERAL',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `acompanhamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuarioId` INTEGER NOT NULL,
    `medicoId` INTEGER NOT NULL,
    `evolucao` TEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'EVOLUTIVA',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `prontuarios` ADD CONSTRAINT `prontuarios_consultaId_fkey` FOREIGN KEY (`consultaId`) REFERENCES `consultas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sinais_vitais` ADD CONSTRAINT `sinais_vitais_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamneses` ADD CONSTRAINT `anamneses_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exames_fisicos` ADD CONSTRAINT `exames_fisicos_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hipoteses_diagnosticas` ADD CONSTRAINT `hipoteses_diagnosticas_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hipoteses_diagnosticas` ADD CONSTRAINT `hipoteses_diagnosticas_cid10Id_fkey` FOREIGN KEY (`cid10Id`) REFERENCES `cid10`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `condutas` ADD CONSTRAINT `condutas_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exames_solicitados` ADD CONSTRAINT `exames_solicitados_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_exames` ADD CONSTRAINT `resultados_exames_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescricoes` ADD CONSTRAINT `prescricoes_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_prescricao` ADD CONSTRAINT `itens_prescricao_prescricaoId_fkey` FOREIGN KEY (`prescricaoId`) REFERENCES `prescricoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_prescricao` ADD CONSTRAINT `itens_prescricao_medicamentoId_fkey` FOREIGN KEY (`medicamentoId`) REFERENCES `medicamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos_atestados` ADD CONSTRAINT `documentos_atestados_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anexos` ADD CONSTRAINT `anexos_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acompanhamentos` ADD CONSTRAINT `acompanhamentos_prontuarioId_fkey` FOREIGN KEY (`prontuarioId`) REFERENCES `prontuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `acompanhamentos` ADD CONSTRAINT `acompanhamentos_medicoId_fkey` FOREIGN KEY (`medicoId`) REFERENCES `profissionais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
