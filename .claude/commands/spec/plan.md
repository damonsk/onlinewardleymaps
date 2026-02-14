---
description: Interactively breaks down a project description into a plan with multiple features.
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), TodoWrite
---

# Project Planning and Feature Breakdown

You are initiating a new project by breaking down a high-level goal into a structured plan of individual, manageable features.

## Your Task
Facilitate a conversation to define a list of features for the project: **$ARGUMENTS**

## Interactive Process
1.  **Initiate Dialogue**: Start by acknowledging the project goal (`$ARGUMENTS`). Ask open-ended questions to understand the scope.
    *   *Example Questions*: "Could you describe the overall objective of this project?", "What are the key outcomes you're looking for?", "Who will be using this?"

2.  **Propose Feature Breakdown**: Based on the user's input, suggest a list of discrete, sequential features.
    *   *Example Interaction*: "Based on your goal of a 'CRUD app for tasks', I suggest the following features: 
1. **Project Setup**: Configure the basic application structure, dependencies, and a test framework. 
2. **Task CRUD API**: Implement the API endpoints for creating, reading, updating, and deleting tasks. 

Does this breakdown look like a good starting point?"

3.  **Iterate and Refine**: Adjust the feature list based on user feedback. The user can add, remove, rename, or reorder features until they are satisfied with the plan.

4.  **Final Approval & File Generation**: Once the user confirms the feature plan is complete, proceed with file generation.
    *   For each feature in the approved plan:
        *   Create a numbered feature directory: `features/[feature-number]-[feature-name-slug]/` (e.g., `features/01-project-setup/`).
        *   Generate a basic `requirements.md` file inside each directory with the feature's title and a brief description.
        *   Create empty placeholder `design.md` and `tasks.md` files.

## Final Approval Gate
After creating the directories and files, conclude with a summary and next steps:
"Project plan complete for [$ARGUMENTS]. I have created [N] feature directories in `features/`. Each contains a basic `requirements.md`.

You can now proceed to detail the requirements for the first feature by running `/spec:requirements 01-project-setup`. Shall we begin detailing the requirements for the first feature now?"

## Key Guidelines
- Be conversational and strategic.
- Guide the user towards a logical, sequential plan.
- Break down complexity into smaller, manageable parts.
- Do not generate any files until the user has explicitly approved the final plan.

Now, start the interactive process to define the project plan for: **$ARGUMENTS**
