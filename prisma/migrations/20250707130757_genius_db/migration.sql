-- CreateTable
CREATE TABLE "Register" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT

    CONSTRAINT "Register_pkey" PRIMARY KEY ("id")
);
