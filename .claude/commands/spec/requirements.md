---
description: Interactively detail the EARS requirements for a specific feature.
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), TodoWrite
---

# Feature Requirements Detailing (Interactive)

You are detailing the requirements for a specific feature, which was likely outlined in the planning phase.

## Your Task
Facilitate a conversation to define the complete requirements for the feature: **$ARGUMENTS**

## Feature Selection Logic
*   **IF a feature name is provided in `$ARGUMENTS`**: Use that feature's context.
*   **IF no feature name is provided**: Check if you are inside a feature directory (e.g., `features/01-project-setup/`). If so, use that context.
*   **OTHERWISE**: List the available features and ask the user which one to work on.

## Interactive Process
1.  **Initiate Dialogue**: Start by confirming the feature. Read the existing (likely basic) `requirements.md` file. Ask open-ended questions to understand the core goal.
    *   *Example Questions*: "Let's detail the requirements for **'Project Setup'**. What is the main goal here?", "What does 'done' look like for this feature?"

2.  **Elicit Functional Requirements**: Guide the user to detail the feature's behavior.
    *   Probe for user stories, actions, and expected outcomes.
    *   *Example Questions*: "What should happen when the server starts?", "What are the different states this feature can be in?"

3.  **Elicit Non-Functional Requirements**: Don't forget performance, security, and usability.
    *   *Example Questions*: "How fast does this need to be?", "Are there any specific security concerns?"

4.  **Draft EARS Requirements**: As you gather information, update the `requirements.md` file with formal EARS requirements. Present these changes to the user for feedback.
    *   *Example Interaction*: "Okay, I've updated the requirements file. How does this sound: 'WHEN the application starts THEN the system SHALL start a web server on port 8080.'. Does that capture it correctly?"

5.  **Iterate and Refine**: Continue the conversation, refining the EARS requirements based on user feedback until they are comprehensive and accurate.

6.  **Final Approval**: Once the user confirms the requirements are complete, conclude the process.

## EARS Requirements Format
Use these structured templates:
- **Ubiquitous**: "The system SHALL [requirement]"
- **Event-Driven**: "WHEN [trigger] THEN the system SHALL [response]"
- **State-Driven**: "WHILE [state] the system SHALL [requirement]"
- **Conditional**: "IF [condition] THEN the system SHALL [requirement]"
- **Optional**: "WHERE [feature included] the system SHALL [requirement]"

## Final Approval Gate
After updating the file, conclude with the standard approval gate:
"Requirements for **[$ARGUMENTS]** are now detailed in `features/[feature-name]/requirements.md`. Ready to proceed to the design phase with `/spec:design`?"

## Key Guidelines
- Be conversational and inquisitive.
- Guide the user towards providing specific, testable details.
- Translate the user's needs into formal EARS requirements collaboratively.
- Persist changes to the `requirements.md` file as they are approved.

Now, start the interactive process to detail the specification for: **$ARGUMENTS**