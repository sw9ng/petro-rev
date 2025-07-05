
-- Update existing V1 shifts to use end_time date instead of start_time date
-- This will move V1 shifts to be recorded on their end date
UPDATE shifts 
SET start_time = CASE 
  WHEN shift_number = 'V1' THEN 
    -- Keep the same time but use the end date
    (DATE(end_time) + TIME(start_time))::timestamp with time zone
  ELSE start_time
END
WHERE shift_number = 'V1' AND end_time IS NOT NULL;

-- Also update shifts where shift_number is NULL but the shift pattern suggests it's a V1 shift
-- (shifts that start late at night and end early next day)
UPDATE shifts 
SET start_time = CASE 
  WHEN EXTRACT(HOUR FROM start_time) >= 22 AND end_time IS NOT NULL AND DATE(end_time) > DATE(start_time) THEN 
    -- This looks like a V1 shift, move it to end date
    (DATE(end_time) + TIME(start_time))::timestamp with time zone
  ELSE start_time
END
WHERE shift_number IS NULL AND end_time IS NOT NULL 
  AND EXTRACT(HOUR FROM start_time) >= 22 
  AND DATE(end_time) > DATE(start_time);
