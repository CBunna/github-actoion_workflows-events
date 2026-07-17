# GitHub Actions: Workflows & Events — A Beginner's Deep Dive

This guide explains, in plain language, how GitHub Actions **workflows** and **events** work.
It's written for someone who is just starting out, just like me.

---

## 1. The Big Picture

GitHub Actions lets you automate things in your repository — like running tests,
building your app, or deploying code — whenever something happens on GitHub
(someone pushes code, opens a pull request, creates a tag, etc.).

Three words you'll see everywhere:

| Term | What it means |
|---|---|
| **Workflow** | The automation recipe. A YAML file living in `.github/workflows/`. |
| **Event** | The trigger. The "something happened" that starts the workflow. |
| **Job / Step** | The actual work the workflow does once it starts. |

Think of it like this:

```
EVENT happens  →  WORKFLOW wakes up  →  JOBS run  →  each JOB runs its STEPS
(e.g. push)       (demo1.yaml)          (build)      (checkout, install, test...)
```

---

## 2. Anatomy of a Workflow File

Every workflow is a `.yaml` (or `.yml`) file inside `.github/workflows/`.
In this project, that's [`.github/workflows/demo1.yaml`](.github/workflows/demo1.yaml).

A minimal workflow looks like this:

```yaml
name: Demo Workflow          # Just a friendly label shown in the "Actions" tab

on: push                     # 👈 THE EVENT — when should this workflow run?

jobs:                        # 👈 THE WORK — what should happen?
  build:
    runs-on: ubuntu-latest   # the machine ("runner") that executes the job
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Say hello
        run: echo "Hello, GitHub Actions!"
```

Breaking it down:

- **`name:`** — optional, just a display name.
- **`on:`** — this is the **event** section, and it's the focus of this guide.
- **`jobs:`** — one or more jobs. Each job runs on a fresh virtual machine ("runner").
- **`steps:`** — a job is made of steps, run in order, top to bottom.
  - `uses:` runs a pre-built action (reusable code someone else wrote).
  - `run:` runs a shell command directly.

---

## 3. What Is an "Event", Really?

An **event** is simply something that happens in your GitHub repository that GitHub
is willing to tell your workflow about. The `on:` key tells GitHub:

> "Hey, please run this workflow whenever *this* happens."

Without an event, a workflow never runs by itself — it just sits in the repo, inactive.

---

## 4. Common Events (the ones you'll use 90% of the time)

### `push`
Runs when someone pushes commits to the repository.

```yaml
on: push
```

### `pull_request`
Runs when a pull request is opened, updated, or otherwise changed.

```yaml
on: pull_request
```

### `workflow_dispatch`
Lets you **manually** run the workflow by clicking a button in the GitHub UI
(Actions tab → select workflow → "Run workflow"). Great for testing.

```yaml
on: workflow_dispatch
```

### `schedule`
Runs on a timer, using cron syntax (like a scheduled alarm).

```yaml
on:
  schedule:
    - cron: '0 9 * * *'   # every day at 09:00 UTC
```

### `issues` / `issue_comment`
Runs when issues are opened/edited, or when someone comments.

### `release`
Runs when a release is published/created/edited.

> 💡 Full list of all possible events lives in GitHub's docs, but the ones above
> cover almost everything a beginner project needs.

---

## 5. Listening to Multiple Events

You're not limited to one event. Use a list:

```yaml
on: [push, pull_request]
```

Or the more readable map form (recommended once things get more detailed):

```yaml
on:
  push:
  pull_request:
  workflow_dispatch:
```

---

## 6. Filtering Events (the "deep dive" part)

This is where GitHub Actions gets powerful — you can narrow down *exactly*
when a workflow fires, instead of "any push, anywhere."

### 6.1 Filter by branch

```yaml
on:
  push:
    branches:
      - main
      - "release/**"   # wildcard: matches release/1.0, release/2.0, etc.
```

Only pushes to `main` or any `release/*` branch will trigger this.

You can also exclude branches with `branches-ignore`:

```yaml
on:
  push:
    branches-ignore:
      - "draft/**"
```

> ⚠️ Use either `branches` OR `branches-ignore` for the same event — not both.

### 6.2 Filter by tag

```yaml
on:
  push:
    tags:
      - "v*.*.*"   # e.g. v1.0.0, v2.3.1
```

Common pattern for "only deploy when we cut a release tag."

### 6.3 Filter by file path

Only run if certain files changed — useful in bigger projects so you don't
rebuild everything for a tiny doc change.

```yaml
on:
  push:
    paths:
      - "src/**"
      - "package.json"
```

### 6.4 Filter by "activity type" (very important for `pull_request`)

Many events have **sub-types** describing exactly what happened. For example,
a pull request event isn't just "a PR exists" — it could be opened, updated,
closed, reopened, etc. You choose which of these you care about:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

Common `pull_request` types:

| Type | Meaning |
|---|---|
| `opened` | A new PR was created |
| `synchronize` | New commits were pushed to the PR branch |
| `reopened` | A closed PR was reopened |
| `closed` | The PR was closed (check `github.event.pull_request.merged` to know if it was merged) |
| `labeled` / `unlabeled` | A label was added/removed |

If you don't specify `types`, GitHub uses a sensible default set (usually
`opened`, `synchronize`, `reopened`).

---

## 7. Combining Filters — a Realistic Example

```yaml
name: CI

on:
  push:
    branches: [main]
    paths: ["src/**"]
  pull_request:
    branches: [main]
    types: [opened, synchronize]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build
```

Plain-English translation:

> "Run this CI job when someone pushes source code changes to `main`,
> OR opens/updates a pull request targeting `main`,
> OR someone manually clicks 'Run workflow'."

---

## 8. Reading Event Data (the `github.event` context)

When a workflow runs, GitHub hands it a JSON payload describing exactly what
happened — who did it, what branch, what PR number, etc. You can access this
inside your workflow via the `github` context:

```yaml
steps:
  - name: Show who triggered this
    run: echo "Triggered by ${{ github.actor }} via ${{ github.event_name }}"

  - name: Show PR title (only meaningful for pull_request events)
    run: echo "PR title: ${{ github.event.pull_request.title }}"
```

Useful built-in variables:

| Expression | What it gives you |
|---|---|
| `github.event_name` | The event that triggered the run (e.g. `push`) |
| `github.actor` | Username who triggered it |
| `github.ref` | The branch/tag ref, e.g. `refs/heads/main` |
| `github.sha` | The commit SHA |
| `github.event.pull_request.number` | PR number (pull_request events only) |

---

## 9. Mental Model Cheat-Sheet

```
on:                     ← WHICH event(s) wake the workflow up
  push:                 ← the event
    branches: [main]    ← narrow it: only this branch
    paths: [src/**]     ← narrow it: only these files changed
  pull_request:
    types: [opened]     ← narrow it: only this activity type
```

Rule of thumb for beginners:

1. Start simple: `on: push`.
2. Once it works, add filters (`branches`, `paths`) so it doesn't run too often.
3. Add `workflow_dispatch` too — it's free and lets you re-run manually while testing.
4. Use `github.event_name` / `github.event.*` inside steps if your job needs to
   know *why* it was triggered.

---

## 10. Where to Practice in This Repo

The workflow file for this exercise lives at:

```
.github/workflows/demo1.yaml
```

Try editing its `on:` section with the patterns above, commit, and watch the
**Actions** tab in your GitHub repository to see which events actually trigger
a run and which don't. That hands-on feedback loop is the fastest way to
internalize how events work.
