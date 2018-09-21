# sql-data-merge-cli

CLI interface for managing ms sql server test data as source controlled JSON files across branches.

## Concept

This project contains the beginnings of an idea to automatically manage the pre-condition test data within relationional databases (MS SQL Server) as source controlled JSON files, supporting branching and merging.

## Challenges / Ideas

### Key Management

1. Identity columns need a corresponding candidate key (GUID) to facilitate uniqueness across source branches
1. Foreign keys need a corresponding candidate key (GUID) to facilitate uniqueness across source branches

#### Process

1. Foreign key definitions are stored prior to inserting per-condition data and then removed from the DB
1. Identity Columns are disabled
1. Data is inserted and candidate keys (GUID) are used to generate valid PK and FK values across the DB
1. Identity Columns are enabled
1. Foreign key definitions are re-added

#### Issues

1. What if there are no foreign key constraints? :-/
    - Data in these columns would be impossible to map as the source key would remain unknown.
    - Over time collisions would occur and tests data could overlap
    - A positive aspect would be that missing foreign keys could be discovered.
1. How to handle composite keys?

### Data Generation & Merging

#### Process

1. The cli generates new data in existing files.
1. Keys are preserved and the diff only shows the newly added lines or changed property values.

#### Issues

1. How will the candidate GUIDs be preserved at runtime for reference during a merge?
    - In other words, How will I know that the PK `123` === the generated GUID `9c1088b2-94ff-44cb-bc95-005b2c02f888` so the same record is not re-generated.
    - Possible Solution: Store a new table dbo._SQL_CLI that contains the generated keys and their corresponding Real PKs.  
