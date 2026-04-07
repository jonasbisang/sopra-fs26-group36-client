# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - [25.03.2026] to [31.03.2026]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@jonasbisang]** | [31.03.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/91b3ab03b8ac8f31ea3bcfc89f3ff02a0ab02b37] | [Implemented backend to change password and username] | [Enables user backend to change their password and username which they had to configure upon registering] |
|                    | [31.03.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/pull/141/commits/c59955d7bcdf33529d5f5bb2798edb008b7d636a] | [Backend to delete a user] | [A registered user may want to delete his account due not wanting to use the application anymore] |
| **[@ananis299]**   | [31.03.2026]   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/ac7ce1607a16b444dd8d5de99786ced64f790827 | [Frontend implementation of the login page] | [Designed the login page and created the corresponding needed inputs for the user to login] |
|                    | [31.03.2026]   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/38a791278ccb0a719e0acddcb1cdefa285935b1f | [Frontend creation of the register page] | [Created the register page ased on M1 and designed it simliarly to the login page] |
| **[@vonhollym-art]** | 29.03.2026 | https://github.com/jonasbisang/sopra-fs26-group36-server/commit/bdae5a0b738f94af2180ba715090ae86d18cea7e | Backend task to hash password and enable user persistence | Having a way to hash and verify a users password and properly saving them to the database with a hashed password is crucial to enable login. |
|                    | 29.03.2026  | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/b78815aa91a3ef08438aafb8a8615894aa2fc6a1] | [Backend implementation of login endpoint and logout flow] | Necessary to enable login/logout |
| **[@CiaranHendriks]** | [26.03.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/6a045c57d5e54211cfd023ab964059b856b9d903] | [Backend implementation of the registration endpoints] | [Handle the request from the front end if a user tries to create an account] |
|                    | [28.03.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/f798b5b41ba61fb5d0c570afd47a741f15bec97d] | [DB schema for User objects] | [Neccessary to store User objects in the Database] |
| **[@elisabettade]** | 31.03.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/pull/54 | Added user settings page and navigation from user profile page | Allows user to navigate to user settings page to take further actions |
|                    | 31.03.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/pull/55 | Frontend implementation smart data handling, automatic logout and redirect | Security concerns, like e.g. rediraction back to login after changing password |
|                    | 31.03.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/c592744c8ddfa6691e4dffc3271f4f22037be261 | Frontend implementation for account deletion | Allows user to delete account |
---

## Contributions Week 2 - 01.04.2026 to 07.04.2026 

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@vonhollym-art]** | 06.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-server/commit/e59fa26f0cc974ea59ac107e964a0511a3d4fd7c https://github.com/jonasbisang/sopra-fs26-group36-server/commit/f54e746b69a366b3bd66aa521e430553b550abcb https://github.com/jonasbisang/sopra-fs26-group36-server/commit/02a71f46cf97045d804b0f388e4d173ddfad936c https://github.com/jonasbisang/sopra-fs26-group36-server/commit/cb52aea3fcf16db9a8e83c94b69ce8a183d46527 | Created a Group and groupMember entity and repository, the group post and get dtos and their translation to the entity in the mapper | Having a group and groupmember entity in db is necessary to create groups, join groups and for all further implementation such as creating activitie |
|                    | 07.04.2026 | https://github.com/jonasbisang/sopra-fs26-group36-server/commit/b14b047d08a671507c7e4d12058ff6c87be8d301 | Implemented group creation logic that automatically generates a unique ID and assigns creator as admin creating. Needed to create group controller and group service for this task. | Being able to create a group is neccessary to then be able to join a group and post activities |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
