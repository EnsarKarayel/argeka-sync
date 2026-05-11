# ARGEKA Sync User Guide

This guide is for first use. We keep the language simple.

## Open the program

1. Double-click `ARGEKA Sync.exe` on the desktop.
2. Your browser opens.
3. If it does not open, type `http://localhost:8080` in the browser.

## First open

You do not need to type a username or password. ARGEKA Sync starts the local session automatically.

If the service is not ready yet, the screen shows a retry message. If Docker Desktop is open, wait 1-2 minutes and click `Retry`.

## What does ARGEKA Sync do?

ARGEKA Sync reads data from a source and writes it to a target.

Example:

- Source: PostgreSQL database with customer balances
- Query: `get recently updated customers`
- Target: reporting database
- Schedule: every day at 02:00

## Main screens

### Dashboard

Shows the overall status, recent runs and recent errors.

### Connections

Source and target databases are defined here.

### Queries

The SQL query that reads data from the source database is defined here. Parameterized SQL is supported.

### Sync Jobs

This is where you choose which query writes to which target table.

### Run History

Each run is listed here. You can see how many rows were read, written, skipped or failed.

## Run the first demo job

1. Open `Sync Jobs`.
2. Find the demo PostgreSQL job.
3. Click `Run`.
4. Open `Run History`.
5. Check that the result is successful.

## Decisions for a new sync job

1. What is the source database?
2. What is the target database?
3. Which SQL query will run?
4. What is the target table?
5. Which source columns match which target columns?
6. What should happen if columns do not match?
   - Stop with error
   - Ignore extra columns
   - Skip the problematic row
   - Log the problematic row
7. When should it run?
   - Manual
   - Hourly
   - Daily
   - Weekly

## Safe use recommendations

- Test with the demo job first.
- Start with a small query on real databases.
- Use an empty or test target table at first.
- Do not share passwords.
- Take regular backups.

## Before asking for help

Please prepare these details:

- Which computer is it installed on?
- Which database are you using?
- Which screen shows the error?
- What does `Run History` say?
- What was the last action you took?
