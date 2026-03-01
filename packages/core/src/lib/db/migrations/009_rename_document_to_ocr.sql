-- Rename 'document' task type to 'ocr' in gates table
UPDATE gates SET task_type = 'ocr' WHERE task_type = 'document';
