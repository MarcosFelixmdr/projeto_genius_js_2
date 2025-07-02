-- CreateTable
CREATE TABLE "Registers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "Registers_pkey" PRIMARY KEY ("id")
);
