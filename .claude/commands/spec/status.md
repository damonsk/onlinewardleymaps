---
description: Show the implementation status of all features.
allowed-tools: Read(*), Glob(*)
---

# Feature Implementation Status

You are providing a status overview of all features, showing the progress of task completion.

## Your Task
For each feature, calculate and display the number of completed and pending tasks based on its `tasks.md` file.

## Process
1.  **Find all features**: Use the `Glob` tool to get a list of all directories under `features/`.
2.  **Iterate through features**: For each feature directory:
    a. **Read `tasks.md`**: Read the content of the `features/[feature-name]/tasks.md` file.
    b. **Count tasks**:
        i.  Count the total number of tasks by using `Grep` with pattern `## Task \d+:` and `output_mode: "count"`.
        ii. Count the number of completed tasks by using `Grep` with pattern `## Task.*\[IMPLEMENTED\]` and `output_mode: "count"`.
    c. **Calculate pending**: Subtract completed tasks from the total to find the number of pending tasks.
3.  **Display status**: Present the information in a clear, summary format (e.g., a table).

## Example Output
```
Feature Status:

| Feature                       | Completed | Pending | Total |
|-------------------------------|-----------|---------|-------|
| 01-project-setup-api-spec     | 5         | 1       | 6     |
| 02-basic-todo-crud            | 10        | 0       | 10    |
| 03-tags-system                | 2         | 8       | 10    |
```