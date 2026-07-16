
# MASTER_07_DATABASE.md

Version: 1.0

# Database Design

## Database
SQLite (future adapters: PostgreSQL, MySQL)

## Principles
- Normalized schema
- Indexed search fields
- Immutable history records
- Soft delete where appropriate

## Tables

### projects
id, name, path, language, created_at, updated_at

### files
id, project_id, path, hash, last_scanned_at

### analyses
id, file_id, score, complexity, runtime_estimate, memory_estimate, security_score, created_at

### issues
id, analysis_id, type, severity, message, line_number

### optimizations
id, analysis_id, title, before_complexity, after_complexity, confidence, risk

### patches
id, optimization_id, unified_diff, applied, applied_at

### benchmarks
id, file_id, input_size, runtime_ms, memory_bytes

### reports
id, analysis_id, format, location, generated_at

### ai_conversations
id, project_id, title, created_at

### ai_messages
id, conversation_id, role, content, token_count

### settings
key, value

### history
id, event_type, payload, timestamp

## Relationships

projects
 └── files
      ├── analyses
      │     ├── issues
      │     ├── optimizations
      │     │      └── patches
      │     └── reports
      └── benchmarks

projects
 └── ai_conversations
        └── ai_messages

## Indexes
- files(path)
- analyses(file_id)
- issues(analysis_id)
- benchmarks(file_id,input_size)
- history(timestamp)

## Migration Strategy
- Sequential SQL migrations
- Never edit old migrations
- Seed defaults separately

## Cache
Store:
- Recent analyses
- Prompt cache
- AST cache
- Settings cache

## Backup
- Export SQLite
- JSON export
- Markdown reports remain portable

## Security
- Parameterized queries
- No secrets in DB
- Encrypt API keys using VS Code SecretStorage (not SQLite)

## Definition of Done
- Referential integrity
- Indexed queries
- Migration ready
- Backup strategy documented

End of MASTER_07_DATABASE.md
