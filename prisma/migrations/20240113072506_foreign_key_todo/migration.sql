/*
  Warnings:

  - Added the required column `userId` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "goal" REAL NOT NULL DEFAULT 1.0,
    "hoursWeek" REAL NOT NULL DEFAULT 0,
    "hoursDay" REAL NOT NULL DEFAULT 0,
    "hoursMonth" REAL NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("complete", "createdAt", "goal", "hoursDay", "hoursMonth", "hoursWeek", "id", "title") SELECT "complete", "createdAt", "goal", "hoursDay", "hoursMonth", "hoursWeek", "id", "title" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
