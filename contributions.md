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
| **[@ananis299]**   | [31.03.2026]   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/ac7ce1607a16b444dd8d5de99786ced64f790827  | [Frontend implementation of the login page] | [Designed the login page and created the corresponding needed inputs for the user to login] |
|                    | [31.03.2026]   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/38a791278ccb0a719e0acddcb1cdefa285935b1f | [Frontend creation of the register page] | [Created the register page ased on M1 and designed it simliarly to the login page] |
| **[@vonhollym-art]** | 29.03.2026 | https://github.com/jonasbisang/sopra-fs26-group36-server/commit/bdae5a0b738f94af2180ba715090ae86d18cea7e | Backend task to hash password and enable user persistence | Having a way to hash and verify a users password and properly saving them to the database with a hashed password is crucial to enable login. |
|                    | 29.03.2026  | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/b78815aa91a3ef08438aafb8a8615894aa2fc6a1] | [Backend implementation of login endpoint and logout flow] | Necessary to enable login/logout |
| **[@CiaranHendriks]** | [26.03.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/6a045c57d5e54211cfd023ab964059b856b9d903] | [Backend implementation of the registration endpoints] | [Handle the request from the front end if a user tries to create an account] |
|                    | [28.03.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/f798b5b41ba61fb5d0c570afd47a741f15bec97d] | [DB schema for User objects] | [Neccessary to store User objects in the Database] |
| **[@elisabettade]** | 31.03.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/pull/54 | Added user settings page and navigation from user profile page | Allows user to navigate to user settings page to take further actions |
|                    | 31.03.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/pull/55 | Frontend implementation smart data handling, automatic logout and redirect | Security concerns, like e.g. rediraction back to login after changing password |
|                    | 31.03.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/c592744c8ddfa6691e4dffc3271f4f22037be261 | Frontend implementation for account deletion | Allows user to delete account |
---

## Contributions Week 2 - 01.04.2026 to 15.04.2026 

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@vonhollym-art]** | 06.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-server/commit/e59fa26f0cc974ea59ac107e964a0511a3d4fd7c https://github.com/jonasbisang/sopra-fs26-group36-server/commit/f54e746b69a366b3bd66aa521e430553b550abcb https://github.com/jonasbisang/sopra-fs26-group36-server/commit/02a71f46cf97045d804b0f388e4d173ddfad936c https://github.com/jonasbisang/sopra-fs26-group36-server/commit/cb52aea3fcf16db9a8e83c94b69ce8a183d46527 | Created a Group and groupMember entity and repository, the group post and get dtos and their translation to the entity in the mapper | Having a group and groupmember entity in db is necessary to create groups, join groups and for all further implementation such as creating activitie |
|                    | 07.04.2026 | https://github.com/jonasbisang/sopra-fs26-group36-server/commit/b14b047d08a671507c7e4d12058ff6c87be8d301 | Implemented group creation logic that automatically generates a unique ID and assigns creator as admin creating. Needed to create group controller and group service for this task. | Being able to create a group is neccessary to then be able to join a group and post activities |
|                    | 10.04.2026 | https://github.com/jonasbisang/sopra-fs26-group36-server/commit/6807b316151eba93ca6fdb0bd4692c0a368ae3e6 https://github.com/jonasbisang/sopra-fs26-group36-server/commit/5345c80e9259ef5297f3e9462a6e9e2e859c9ff5 | Implemented functionality to join and leave groups. | Joining groups is vital to post activities and leaving them gives the user options. |
| **[@elisabettade]** | 08.04.2026 | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/37dbf11d033db8f9d458820f38b061020f2c54b8 | add join group forum to dashboard and redirect from login | Users have to be able to join an existing group |
|                    | 08.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/f1ec76ecb21ef9fbc41a75b9938b32dec5512f57 | add leave group button to group id page with redirect | Users need to have the option to leave a group they are a part of |
|                    | 08.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/5f6909e1d65cc9c55b5d250909aa025e389cb6c1 | Created a group home page which displays a list of all users in the group, a group calendar and all the activities (planned and scheduled), with auth check | users of a group need a home page for the group to see all the relevant things |
| **[@ananis299]** | 07.04.2026  | https://github.com/jonasbisang/sopra-fs26-group36-client/pull/70/changes/5ff31b52d71b1067dec0fe47aae5a1b8849a49d8 | Created dahsboard with relevant groups for users as well as possbility to enter in groups | Relevant because thats how users access groups and are able to start the whole process; The groups overview is important to decide in which group they want to partake in that moment |
|                    | 13.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/pull/70/changes/8d1a1c82f9724fb9854e8c02b7df8e11107cfc56 | Creation of My Profile Dashboard | Contains the users information and allows the user to change his password |
| **[@jonasbisang]** | [14.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-client/pull/71/commits/fb14d8e2a29f4c3e3d24a6c63a54b93daf203f2e] | [Added landing page for the website] | [Gives user an overview of the application and a brief overview of its functionality] |
|                    | [14.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-client/pull/72/commits/8696cb9c5cf71255b244403488c667d89a708fbf] | [Information page which can be accessed via the landing page.] | [An information page where the user can read about what he/she can do] |
| **[@CiaranHendriks]** | [09.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/2bf030c0ea738b4d886924ff4723c4f92288ec23] | [Backend implementation of manual calendar entrys/unavailabilities] | [Store unavailabilites from users, which they add to their calendar] |
|                    | [14.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/323e53f89535cd8cea6d58a32a1893599128381d] | [Connect to Google Calendar] | [Backend implementation to sign in to ones google calendar, to sync calendar events] |

---

## Contributions Week 3 - [16.04.2026] to [22.04.2026]
| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@elisabettade]** | 14.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/3549b83b84c26b8dbbbf5633a6137c1bcedbaaf6| Added tinder style voting for pending activities, frontend | users need to be able to vote on proposed activities |
|                    | 21.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/pull/82/changes/b19c3d7db9ea8d9668538df54e08de59d515ca3f https://github.com/jonasbisang/sopra-fs26-group36-client/commit/1da498e4511a53a2eff544fc44d1301b73956a55 | Made the voting card show progress, give feedback and remove a card once the user has voted | it supports actually going through the stack of cards and voting, not just voting on one thing |
|                    | 21.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/0109b48ea20745195afdc77e4089d9c0ea154242 | The user which triggers the time slot search is informed visually that the search began | users have to be notified when the date-search process begins |
|                    | 21.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/755ef39f168ca87190955d0870eb0efa87dafe37 | Once a possible slot is found each participating user is informed visually with a new event popup | Every partaking user has to know when they have been scheduled for something (new event has been confirmed) |
| **[@jonasbisang]** | [20.04.2025]   | [https://github.com/jonasbisang/sopra-fs26-group36-client/pull/76/changes/c20db0ceb4f0f3ffd6f8269b907c9b645fc225a0] | [Added to option fot the user to add manual calendar entries or connect to google (frontend)] | [Needed for one of the core features of the website, finding a suiting time slot without the user having to interfer.] |
|                    | [21.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/pull/163/commits/fde757638cb87bb5d25b0e9ea002ddefe522cd91 https://github.com/jonasbisang/sopra-fs26-group36-client/commit/4532a5f8fe22954ccdc16c01411c8d13b26b177c] | [Added the option to create a group and that groups are which a user is part of are loaded on his/hers dashboard | [Creating a group is a crusial functionality needed for our USP] |
| **@vonhollym-art** | 18.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-server/issues/114?issue=jonasbisang%7Csopra-fs26-group36-server%7C114 | added promoting to admin and kickinf functionality for groups | The admin can only leave the group if there is min 1 other admin. Thus there needs to be a way to promote members to admins. Kicking people from a group is practical if e.g. a member doesn't participate or posts inappropiate activities. |
|                    | 19.04.2026  | https://github.com/jonasbisang/sopra-fs26-group36-server/issues/115?issue=jonasbisang%7Csopra-fs26-group36-server%7C115 | added group password change and delete logic | These are useful functionalities of any group based application and gives the admin special rights over other members. |
|                    | 21.04.2026  | https://github.com/jonasbisang/sopra-fs26-group36-server/pull/165 | added fetching list of all groups that a specific user is currently a member of | necessary for your groups dashboard |
<<<<<<< HEAD
| **[@ananis299]** | [20.04.2026]   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/f4bf90877ff1b6071fd8131ee5ac02a8a5e5796c | Group Admin settings page | Enabled the Admin to edit the group (has the property to kick out people or promote them to Admins inside the group); Also the possibility of changing the group access password |
|                    | [21.04.2026]   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/156278f3b5425ec0c425ba7d7d768a0be0ad1372 | Settings Button for group Admin | Added the Settings Button inside the group Admin Page (meaning only accessible for an admin user) |
|                    | [21.04.2026]   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/8147d2b9ad42d2c926f2f0b4f883f0e984067f3a | created the New Activity creation function inside the group id page| The creation of an activity is now possible; The user can now input information and add the events they want to propose to their group of friends |
=======
| **[@CiaranHendriks]** | [17.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/pull/155] | [data cleanup, when a User deletes their profile, all data associated with them (like groupmembership etc.) are also deleted] [needed for a clean database]|
|                    | [20.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/pull/159] | [Database for activities in the server repository / saving activity proposals] [needed to store activities]|
|                    | [21.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/pull/161] | [Implement activity creation endpoint (POST) with validation logic for inputs] | [Connection from client side to database] |
|                    | [21.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/pull/164] | [time-slot parser for activitys] | [needed for scheduling, to unify time blocks and custom time slots] |
|                    | [21.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/pull/166] | [unified calendar API that fetches data from the DB as well as from the google calendar
] | [needed for scheduling, to take into account both manually added unavailabilities and the ones in google calendar] |

---

## Contributions Week 4 - [23.04.2026] to [29.04.2026]
| **[@jonasbisang]**    | [23.04.2026]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/111b25d1a0c4bb8669b28ca0963c98efbef2f0d9] | [Create voting record endpoint to keep track of voting for each activity, ensure a user can only vote once per activity]| [Keeping track of who voted (and who has not yet) and how they voted is essential in order to provide the functionality of scheduling the right people.] |
|                        [23.04.2025]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/07a63281f23c35839c072aefb56366315831c9a4] | [Compares the different calendars of the users to find a fitting slot based on the time conditions entered. (only manual calendar yet)] | [Core functionality] |
|                        [24.04.2025]   | [https://github.com/jonasbisang/sopra-fs26-group36-server/commit/7d521515a432ab0c05aeb6bfa8ef2dce163b28db] | [Add unit tests for voting functionality] | [Voting functionality is a key function and has to work correctly.Therefore, tests to make sure everything works. ] |
| **[@elisabettade]**   | 28.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/9f021e6bedd77d023adfb1b1aa7f31cd87cf9320 | added message that shows if join activity was successful or not | needed for usability/user experience, user needs to know whether joining was successful |
|                       | 28.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/ecce8ca40d3e746896c2fa2697b5111076a7c121 | ensures the user always sees the current state of the activity and doesn't get stuck with stale data, which is especially important when multiple users try to join simultaneously |
| **[@ananis21]**   | 24.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/c576a878c977d5b574188f980e5e4688e639b12a | [Added creating activity concept] | now the user can create an activity that can be pusshed inside the system, to then later vote |
|                       | 28.04.2026   | https://github.com/jonasbisang/sopra-fs26-group36-client/commit/82d18f1e844c5f2463273298ce860e839f1ffe66 | [Time calculation] | managed the connection between the backend and frontened regarding recording the time information of the activity creation |



---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
