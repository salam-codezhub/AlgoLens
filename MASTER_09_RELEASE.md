
# MASTER_09_RELEASE.md

Version: 1.0

# Release & Deployment Guide

## Goals
Ship AlgoLens as a production-ready VS Code extension.

## Versioning
Use Semantic Versioning:
- MAJOR.MINOR.PATCH

## Release Checklist
- All phases complete
- Build passes
- Lint passes
- Tests pass
- Documentation updated
- CHANGELOG updated

## Build Pipeline
1. Install dependencies
2. Type check
3. Lint
4. Test
5. Bundle extension
6. Package VSIX

## Packaging
Artifacts:
- algolens-x.y.z.vsix
- Release Notes
- Checksums

## Git Strategy
- main
- develop
- feature/*
- hotfix/*
- release/*

## CI/CD
Run on every push:
- TypeScript
- ESLint
- Unit Tests
- Integration Tests
- Build

## Marketplace Readiness
- Extension icon
- Screenshots
- README
- LICENSE
- CHANGELOG

## Performance Gate
- Fast activation
- Low memory usage
- Optimized bundle

## Security Gate
- No secrets committed
- Dependency audit
- API keys via SecretStorage

## Rollback Plan
- Keep previous VSIX
- Tag every release
- Maintain migration compatibility

## Future Releases
v1.0 Core Analysis
v1.5 AI Improvements
v2.0 Plugin SDK
v3.0 Team Collaboration

## Definition of Done
- VSIX generated
- Installation verified
- Documentation complete
- GitHub release ready

End of MASTER_09_RELEASE.md
