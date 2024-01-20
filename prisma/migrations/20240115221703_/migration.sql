/*
  Warnings:

  - You are about to drop the column `hoursDay` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `hoursMonth` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `hoursWeek` on the `Todo` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Timer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "secondsRemaining" INTEGER NOT NULL,
    "todoId" TEXT NOT NULL,
    CONSTRAINT "Timer_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "goal" REAL NOT NULL DEFAULT 1.0,
    "workspaceId" TEXT NOT NULL,
    CONSTRAINT "Todo_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("complete", "createdAt", "goal", "id", "title", "updatedAt", "workspaceId") SELECT "complete", "createdAt", "goal", "id", "title", "updatedAt", "workspaceId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
