/*
  Warnings:

  - You are about to drop the column `complete` on the `Todo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'current',
    "goal" REAL NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "workspaceId" TEXT NOT NULL,
    CONSTRAINT "Todo_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("category", "createdAt", "goal", "id", "order", "title", "updatedAt", "workspaceId") SELECT "category", "createdAt", "goal", "id", "order", "title", "updatedAt", "workspaceId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
CREATE INDEX "Todo_order_category_idx" ON "Todo"("order", "category");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
