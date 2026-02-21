-- Add missing columns to Booking table
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'pending';

-- Add unique constraint on reference (only if column was just added and has no duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Booking_reference_key'
  ) THEN
    -- Set unique cuid-like references for existing rows first
    UPDATE "Booking" SET "reference" = 'ref-' || id::text || '-' || EXTRACT(EPOCH FROM NOW())::bigint::text WHERE "reference" IS NULL;
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_reference_key" UNIQUE ("reference");
  END IF;
END $$;
