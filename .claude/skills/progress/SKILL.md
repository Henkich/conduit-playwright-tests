---
name: progress
description: Show where the learning project stopped and what's next, or update the local learning journal PROGRESS.md. Use only when the user runs /progress.
argument-hint: '[update]'
disable-model-invocation: true
---

# Learning progress (PROGRESS.md)

PROGRESS.md is the user's local learning journal. It is in .gitignore — never commit it.

## `/progress` (no arguments) — start of a session

1. Read PROGRESS.md.
2. Report briefly (max ~10 lines):
   - where we stopped (section "На чому зупинились");
   - the current checklist: done / left, ⭐ items first;
   - ONE next step: the first unfinished ⭐ item, in natural order;
   - what to read in the manual before it (table "Порядок читання мануалу"), if it applies.
3. Check the git state: current branch, uncommitted changes. Point out any mismatch
   with the journal (e.g. the journal says "on main", but you're on a feature branch).
4. Don't start the next step — wait for the user.

## `/progress update` — end of a session

1. Gather what happened: this conversation, `git log` since the last update, `git status`.
2. Propose edits to PROGRESS.md as a diff:
   - "На чому зупинились": the current state + the next step;
   - checklist: tick finished items; add new ones only if the user agreed to them;
   - "Зроблено": merged PRs, finished items;
   - "Відкладено": postponed decisions, found bugs, flaky tests.
3. Only facts from this session — no plans the user didn't agree to.
4. Apply after the user approves. Don't commit.
