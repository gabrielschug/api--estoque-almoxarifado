-- CreateTable
CREATE TABLE `fornecedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `razao_social` VARCHAR(40) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secretarias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(40) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `quant` SMALLINT NOT NULL,
    `preco` DECIMAL(9, 2) NOT NULL,
    `categoria` VARCHAR(40) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entradas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `numDocumento` INTEGER NULL,
    `fornecedorId` INTEGER NOT NULL,
    `produtoId` INTEGER NOT NULL,
    `quant` INTEGER NOT NULL,
    `observacoes` VARCHAR(60) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saidas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `secretariaId` INTEGER NOT NULL,
    `produtoId` INTEGER NOT NULL,
    `quant` INTEGER NOT NULL,
    `observacoes` VARCHAR(60) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entradas` ADD CONSTRAINT `entradas_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entradas` ADD CONSTRAINT `entradas_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saidas` ADD CONSTRAINT `saidas_secretariaId_fkey` FOREIGN KEY (`secretariaId`) REFERENCES `secretarias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saidas` ADD CONSTRAINT `saidas_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
