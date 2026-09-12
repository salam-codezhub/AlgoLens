
# MASTER_10_CLAUDE_RULES_PART_6.md

# Security, Error Handling & Reliability Rules

## Objective
Build secure, reliable and production-ready software.

## Security
- Validate all inputs.
- Sanitize user data.
- Escape rendered HTML.
- Never hardcode secrets.
- Use least privilege.

## API Keys
Store only in VS Code SecretStorage.
Never store in SQLite, logs or committed files.

## Input Validation
Validate:
- File paths
- URLs
- JSON
- Commands
- Settings
- User prompts

## File System
- Read workspace safely.
- Modify files only with user approval.
- Never delete files automatically.

## Error Handling
Return structured errors:
- code
- message
- cause
- severity
- recovery suggestion

## Retry Policy
Retry:
- Network timeout
- Temporary provider failure
- Rate limiting

Max retries: 3 with exponential backoff.

## Network
- HTTPS only
- Request timeout
- Cancellation support
- Validate responses

## Resource Management
Dispose:
- Listeners
- Timers
- File watchers
- Streams
- Webviews

## Dependency Rules
Check:
- License
- Maintenance
- Security advisories
- Bundle size

## Logging
Allowed:
debug, info, warn, error

Never log secrets or API keys.

## Recovery
Save progress -> Log -> Notify -> Retry -> Continue safely.

## Failure Modes
Handle:
- AI unavailable
- Parser failure
- Invalid code
- Offline mode
- Cache corruption

## Security Checklist
- Inputs validated
- Secrets protected
- Resources disposed
- HTTPS enforced
- Logs sanitized

End of PART 6
