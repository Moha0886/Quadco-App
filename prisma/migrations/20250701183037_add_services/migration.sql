/*
  Warnings:

  - Added the required column `item_type` to the `line_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_price" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'hour',
    "category_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_line_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "total" REAL NOT NULL,
    "description" TEXT,
    "item_type" TEXT NOT NULL,
    "product_id" TEXT,
    "service_id" TEXT,
    "quotation_id" TEXT,
    "invoice_id" TEXT,
    "delivery_note_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "line_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "line_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "line_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "line_items_delivery_note_id_fkey" FOREIGN KEY ("delivery_note_id") REFERENCES "delivery_notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_line_items" ("created_at", "delivery_note_id", "description", "id", "invoice_id", "product_id", "quantity", "quotation_id", "total", "unit_price", "updated_at") SELECT "created_at", "delivery_note_id", "description", "id", "invoice_id", "product_id", "quantity", "quotation_id", "total", "unit_price", "updated_at" FROM "line_items";
DROP TABLE "line_items";
ALTER TABLE "new_line_items" RENAME TO "line_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
