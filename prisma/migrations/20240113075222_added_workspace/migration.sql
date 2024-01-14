/*
  Warnings:

  - You are about to drop the column `userId` on the `Todo` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "goal" REAL NOT NULL DEFAULT 1.0,
    "hoursWeek" REAL NOT NULL DEFAULT 0,
    "hoursDay" REAL NOT NULL DEFAULT 0,
    "hoursMonth" REAL NOT NULL DEFAULT 0,
    "workspaceId" TEXT NOT NULL,
    CONSTRAINT "Todo_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("complete", "createdAt", "goal", "hoursDay", "hoursMonth", "hoursWeek", "id", "title", "updatedAt", "workspaceId") SELECT "complete", "createdAt", "goal", "hoursDay", "hoursMonth", "hoursWeek", "id", "title", "updatedAt", "workspaceId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
CREATE TABLE "new_Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Workspace" ("id", "title") SELECT "id", "title" FROM "Workspace";
DROP TABLE "Workspace";
ALTER TABLE "new_Workspace" RENAME TO "Workspace";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
