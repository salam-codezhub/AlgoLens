# packages/storage — Local Storage & Database

Local persistence layer backed by SQLite.

Responsible for: SQLite access, history, settings, reports, cache, recent projects.

**Rule:** Never stores API keys or secrets — those live only in VS Code SecretStorage.
