import { prisma } from "../lib/prisma";
import { type Prisma } from "../generated/prisma/client"

const notebooks: Prisma.NotebookCreateInput[] = [
    {
        modelo: "Aspire Go 15",
        marca: "Acer",
        processador: "Intel",
        preco: 2800,
        quant: 3
    },
    {
        modelo: "Nitro 5 AN515",
        marca: "Acer",
        processador: "Intel",
        preco: 5200,
        quant: 8
    }
]

async function main() {
    try {
        await prisma.notebook.createMany({ data: notebooks })
        console.log(`${notebooks.length} Notebooks Cadastrados...`)
    } catch (error) {
        console.error("Erro nas Inclusões (Seeds):", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

await main()