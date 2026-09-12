# MASTER_02_PHASES.md

Version: 1.0

Purpose:
This document defines the official implementation roadmap for AlgoLens.

Rules:

* Complete only one phase at a time.
* Never merge multiple phases.
* Never skip phases.
* Never modify completed phases unless explicitly requested.
* After completing a phase, stop and wait for the next phase command.

---

# PHASE 01 — Repository Initialization

Objective

Create the base repository for AlgoLens.

Deliverables

* Git repository initialized
* Root folder structure
* .gitignore
* LICENSE
* README (basic)
* docs folder
* scripts folder
* assets folder

Files

README.md

.gitignore

LICENSE

/docs

/assets

/scripts

Acceptance Criteria

✓ Repository is clean

✓ Folder structure exists

✓ No build errors

Claude Command

Start Phase 01

Do Not

Do not create extension code yet.

---

# PHASE 02 — Monorepo Structure

Objective

Create enterprise folder architecture.

Deliverables

apps/

packages/

tests/

.github/

Every package placeholder.

Acceptance Criteria

Every package follows naming convention.

No empty random folders.

Claude Command

Start Phase 02

---

# PHASE 03 — Package Manager Setup

Objective

Configure package manager.

Deliverables

package.json

workspace configuration

npm scripts

lint scripts

build scripts

Acceptance Criteria

npm install works.

Claude Command

Start Phase 03

---

# PHASE 04 — TypeScript Configuration

Objective

Configure TypeScript for entire workspace.

Deliverables

tsconfig

shared types

base configuration

strict mode

path aliases

Acceptance Criteria

Strict compilation passes.

Claude Command

Start Phase 04

---

# PHASE 05 — Linting & Formatting

Objective

Configure

ESLint

Prettier

EditorConfig

Husky

Lint Staged

Acceptance Criteria

Formatting works automatically.

Claude Command

Start Phase 05

---

# PHASE 06 — Build System

Objective

Configure build tools.

Deliverables

Webpack

Vite

Build scripts

Watch mode

Development mode

Production mode

Acceptance Criteria

Successful build.

Claude Command

Start Phase 06

---

# PHASE 07 — VS Code Extension Scaffold

Objective

Create extension foundation.

Deliverables

extension.ts

manifest

commands

activation

deactivation

Acceptance Criteria

Extension loads inside VS Code.

Claude Command

Start Phase 07

---

# PHASE 08 — React Application

Objective

Create React application.

Deliverables

React

TypeScript

Routing

Providers

Base Layout

Acceptance Criteria

React UI renders.

Claude Command

Start Phase 08

---

# PHASE 09 — TailwindCSS

Objective

Configure TailwindCSS.

Deliverables

Tailwind

Dark Theme

Base Styles

Typography

Acceptance Criteria

Theme works.

Claude Command

Start Phase 09

---

# PHASE 10 — shadcn/ui

Objective

Install and configure shadcn/ui.

Deliverables

Cards

Dialogs

Buttons

Inputs

Tabs

Accordions

Acceptance Criteria

Reusable components exist.

Claude Command

Start Phase 10

---

# PHASE 11 — Theme Engine

Objective

Build complete theme system.

Support

Dark

Light

Auto

Accent Colors

Glass Effects

Acceptance Criteria

Theme switching works.

Claude Command

Start Phase 11

---

# PHASE 12 — Activity Bar

Objective

Create VS Code Activity Bar.

Deliverables

Icons

Navigation

Activation

Acceptance Criteria

Activity Bar visible.

Claude Command

Start Phase 12

---

# PHASE 13 — Sidebar

Objective

Build Sidebar.

Deliverables

Collapsible Panels

Search

Navigation

Recent Files

Acceptance Criteria

Sidebar fully responsive.

Claude Command

Start Phase 13

---

# PHASE 14 — Dashboard Layout

Objective

Create dashboard.

Deliverables

Cards

Charts

Project Summary

Analysis Status

Acceptance Criteria

Dashboard responsive.

Claude Command

Start Phase 14

---

# PHASE 15 — State Management

Objective

Create global state.

Deliverables

React Context

Services

Store

Acceptance Criteria

State shared across UI.

Claude Command

Start Phase 15

---

End of Part 1.
