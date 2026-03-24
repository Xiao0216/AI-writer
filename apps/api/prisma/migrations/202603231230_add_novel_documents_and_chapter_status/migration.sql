-- CreateEnum
CREATE TYPE "ChapterStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NovelDocumentType" AS ENUM (
  'PROJECT_OVERVIEW',
  'THEME_AND_PROPOSITION',
  'WORLDBUILDING',
  'CAST_BIBLE',
  'RELATIONSHIP_MAP',
  'MAIN_PLOTLINES',
  'FORESHADOW_LEDGER',
  'CHAPTER_ROADMAP',
  'DYNAMIC_STATE',
  'STYLE_GUIDE',
  'WRITING_LOG'
);

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN "status" "ChapterStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "NovelDocument" (
    "id" TEXT NOT NULL,
    "novelId" TEXT NOT NULL,
    "type" "NovelDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NovelDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NovelDocument_novelId_type_key" ON "NovelDocument"("novelId", "type");

-- CreateIndex
CREATE INDEX "NovelDocument_novelId_updatedAt_idx" ON "NovelDocument"("novelId", "updatedAt");

-- AddForeignKey
ALTER TABLE "NovelDocument" ADD CONSTRAINT "NovelDocument_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
