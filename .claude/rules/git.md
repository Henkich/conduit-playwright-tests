# Git workflow

## Flow (GitHub Flow)

- Never commit directly to `main`: branch → PR → merge.
- Before committing, propose how to split the changes into logical commits
  and wait for approval.
- Before every commit run `npm run check`; run `npm test` when test code changed.

## Commits

- Conventional Commits: feat / fix / test / chore / ci / refactor / docs.
- Docker infrastructure in conduit-app: `chore(docker)`.

## Pull requests

- PR title follows Conventional Commits.
- Merge: regular merge when commits are logical; squash when the branch
  contains "noise" commits.
- After merge: `git switch main`, `git pull --prune`, delete the local branch
  (GitHub deletes the remote one).

## Claude attribution

(`Co-Authored-By: Claude …` in commits, "Generated with Claude Code" in PRs)

- Code written entirely by the user, Claude only committed / pushed → no attribution.
- Code written entirely by Claude → attribution as usual.
- Mixed → attribution, plus list what exactly Claude wrote in the commit body /
  PR description (e.g. "Claude: DELETE tests for other user / no token / 404, README").
