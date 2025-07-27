-- Migration: Add deleted_at field to workshop_step_data table for soft deletion
-- This enables hybrid reset approach: hard delete for test users, soft delete for production users

ALTER TABLE workshop_step_data 
ADD COLUMN deleted_at TIMESTAMP;