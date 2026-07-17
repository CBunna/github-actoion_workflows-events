export const levels = [
  {
    id: 1,
    title: "1. The Dispatcher (Hello World)",
    difficulty: "Easy",
    points: 100,
    description: "Welcome to GitHub Actions! Your first assignment is to build a manual trigger workflow. Manual workflows are perfect for testing scripts, running migrations, or triggering deployments on-demand.",
    instructions: [
      "Create a workflow named 'First workflow'.",
      "Configure it to run on 'workflow_dispatch' (manual trigger).",
      "Create a single job named 'hello-job' that runs on 'ubuntu-latest'.",
      "Add a step named 'Greet User' that runs the command: echo 'Hello World'."
    ],
    defaultCode: `name: First workflow
on: # TODO: Set the manual trigger here

jobs:
  hello-job:
    # TODO: Configure runs-on to use the latest Ubuntu runner
    steps:
      - name: Greet User
        # TODO: Run the greeting echo command here
`,
    expectedJobs: [
      { id: "hello-job", label: "hello-job", needs: [], status: "pending" }
    ],
    validate: (code) => {
      const clean = code.replace(/\s+/g, ' ');
      
      if (!/name:\s*['"]?First workflow['"]?/.test(code)) {
        return { success: false, error: "Workflow name must be 'First workflow'." };
      }
      if (!/on:\s*workflow_dispatch/.test(code)) {
        return { success: false, error: "The workflow must trigger 'on: workflow_dispatch'." };
      }
      if (!/hello-job:/.test(code)) {
        return { success: false, error: "You must declare a job named 'hello-job'." };
      }
      if (!/runs-on:\s*ubuntu-latest/.test(clean)) {
        return { success: false, error: "Job 'hello-job' must configure 'runs-on: ubuntu-latest'." };
      }
      if (!/run:\s*echo\s+['"]?Hello World['"]?/.test(code)) {
        return { success: false, error: "You must run the shell command: echo 'Hello World'." };
      }
      return { success: true };
    },
    simulatedLogs: [
      "🚀 Starting workflow: First workflow",
      "⚙️ Setting up virtual runner environment (ubuntu-latest)...",
      "🐳 Downloading runner image...",
      "🔑 Resolving job permissions (Contents: Read, Actions: Read)...",
      "▶️ Running Job: hello-job",
      "  ↳ Step: Greet User",
      "    [Command] echo 'Hello World'",
      "    Hello World",
      "✔️ Step: Greet User completed with status: 0",
      "🎉 Job hello-job finished successfully!",
      "✅ Workflow run completed."
    ]
  },
  {
    id: 2,
    title: "2. Parallel Gates (Lint & Test)",
    difficulty: "Medium",
    points: 200,
    description: "Continuous Integration checks code formatting and program correctness simultaneously. In this challenge, you will implement two parallel jobs: linting and testing.",
    instructions: [
      "Set the triggers to push and pull_request on the 'main' branch.",
      "Create a job named 'lint' running on 'ubuntu-latest' that runs: npm run lint.",
      "Create a job named 'test' running on 'ubuntu-latest' that runs: npm test.",
      "Ensure both jobs run in parallel (i.e., neither job should depend on or wait for the other)."
    ],
    defaultCode: `name: Continuous Integration
on:
  push:
    branches: [ main ]
  pull_request:
    # TODO: Add the pull_request branch trigger

jobs:
  # TODO: Define the 'lint' job here
  
  # TODO: Define the 'test' job here
`,
    expectedJobs: [
      { id: "lint", label: "lint", needs: [], status: "pending" },
      { id: "test", label: "test", needs: [], status: "pending" }
    ],
    validate: (code) => {
      const clean = code.replace(/\s+/g, ' ');
      
      if (!/pull_request:\s*(branches:\s*\[\s*main\s*\])?/.test(clean)) {
        return { success: false, error: "The trigger must configure a pull_request on branch 'main'." };
      }
      if (!/lint:/.test(code)) {
        return { success: false, error: "You must declare a job named 'lint'." };
      }
      if (!/test:/.test(code)) {
        return { success: false, error: "You must declare a job named 'test'." };
      }
      if (!/runs-on:\s*ubuntu-latest/.test(clean)) {
        return { success: false, error: "Both jobs must run on 'ubuntu-latest'." };
      }
      if (!/run:\s*npm\s+run\s+lint/.test(code)) {
        return { success: false, error: "The lint job must execute: npm run lint." };
      }
      if (!/run:\s*npm\s+test/.test(code)) {
        return { success: false, error: "The test job must execute: npm test." };
      }
      if (/needs:/.test(code)) {
        return { success: false, error: "Do not use 'needs' here! The lint and test jobs must run in parallel." };
      }
      return { success: true };
    },
    simulatedLogs: [
      "🚀 Starting workflow: Continuous Integration",
      "⚙️ Setting up parallel runners...",
      "▶️ Running Job: lint (Runner A)",
      "▶️ Running Job: test (Runner B)",
      "  ↳ [Runner A] Step: Setup Node.js",
      "  ↳ [Runner B] Step: Setup Node.js",
      "  ↳ [Runner A] Running: npm run lint",
      "    ✔ No lint issues found!",
      "  ↳ [Runner B] Running: npm test",
      "    ✔ 12 unit tests passed successfully!",
      "✔️ Job lint completed successfully.",
      "✔️ Job test completed successfully.",
      "🎉 Parallel gate validation passed!",
      "✅ Workflow run completed."
    ]
  },
  {
    id: 3,
    title: "3. Optimized Chain (Dependencies)",
    difficulty: "Medium",
    points: 250,
    description: "In complex environments, you shouldn't compile or bundle code if the lint check or unit tests are failing. Here, you will chain your jobs so the build process only runs after both linting and testing pass successfully.",
    instructions: [
      "Define three jobs: 'lint', 'test', and 'build'.",
      "Lint runs: npm run lint. Test runs: npm test. Build runs: npm run build.",
      "Ensure all jobs use 'ubuntu-latest'.",
      "Configure the 'build' job to depend on 'lint' and 'test' using the 'needs' keyword."
    ],
    defaultCode: `name: Chained Build Pipeline
on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    runs-on: ubuntu-latest
    # TODO: Add the dependency config here so build waits for lint and test
    steps:
      - run: npm run build
`,
    expectedJobs: [
      { id: "lint", label: "lint", needs: [], status: "pending" },
      { id: "test", label: "test", needs: [], status: "pending" },
      { id: "build", label: "build", needs: ["lint", "test"], status: "pending" }
    ],
    validate: (code) => {
      const clean = code.replace(/\s+/g, ' ');
      
      if (!/lint:/.test(code) || !/test:/.test(code) || !/build:/.test(code)) {
        return { success: false, error: "You must define all three jobs: 'lint', 'test', and 'build'." };
      }
      // Check if needs is defined under build and references lint and test
      const buildSection = code.split('build:')[1] || '';
      if (!/needs:\s*\[?\s*(lint\s*,\s*test|test\s*,\s*lint)\s*\]?/.test(buildSection)) {
        return { success: false, error: "The 'build' job must declare 'needs: [lint, test]' so it depends on both." };
      }
      if (!/run:\s*npm\s+run\s+build/.test(buildSection)) {
        return { success: false, error: "The 'build' job must run: npm run build." };
      }
      return { success: true };
    },
    simulatedLogs: [
      "🚀 Starting workflow: Chained Build Pipeline",
      "⚙️ Initiating stage 1: Parallel Checks...",
      "▶️ Running Job: lint",
      "▶️ Running Job: test",
      "  ↳ [lint] running npm run lint... Success!",
      "  ↳ [test] running npm test... Success!",
      "✔️ Stage 1 checks passed. Resolving job dependency tree...",
      "⚙️ Initiating stage 2: Build compilation...",
      "▶️ Running Job: build (Triggered because lint & test are completed)",
      "  ↳ [build] Step: checkout workspace",
      "  ↳ [build] Running: npm run build",
      "    Creating an optimized production build...",
      "    Compiled successfully! dist/ folder generated (142KB).",
      "🎉 Job build completed successfully!",
      "✅ Workflow run completed."
    ]
  },
  {
    id: 4,
    title: "4. Secured Scanner (Cron & Security)",
    difficulty: "Hard",
    points: 300,
    description: "Security scanning (DevSecOps) is often run on a scheduled cron trigger. In this challenge, you will implement a weekly dependency vulnerability check using the Trivy scanner.",
    instructions: [
      "Configure a cron schedule trigger to run every Sunday at midnight UTC ('0 0 * * 0').",
      "Create a single job named 'security' running on 'ubuntu-latest'.",
      "Add a step using the official Trivy action: uses: aquasecurity/trivy-action@master.",
      "Configure Trivy parameters using 'with' to scan filesystem: scan-type: 'fs'."
    ],
    defaultCode: `name: Weekly Security Audit
on:
  schedule:
    # TODO: Add the midnight Sunday cron string here
  workflow_dispatch:

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      # TODO: Configure the Trivy security scanner step
`,
    expectedJobs: [
      { id: "security", label: "security", needs: [], status: "pending" }
    ],
    validate: (code) => {
      const clean = code.replace(/\s+/g, ' ');
      
      if (!/cron:\s*['"]?0\s+0\s+\*\s+\*\s+0['"]?/.test(code)) {
        return { success: false, error: "The cron trigger must run every Sunday at midnight: '0 0 * * 0'." };
      }
      if (!/security:/.test(code)) {
        return { success: false, error: "You must define a job named 'security'." };
      }
      if (!/uses:\s*aquasecurity\/trivy-action@master/.test(code)) {
        return { success: false, error: "You must include the step: uses: aquasecurity/trivy-action@master." };
      }
      if (!/scan-type:\s*['"]?fs['"]?/.test(code)) {
        return { success: false, error: "Trivy parameters must configure: scan-type: 'fs'." };
      }
      return { success: true };
    },
    simulatedLogs: [
      "🚀 Starting scheduled cron run: Weekly Security Audit",
      "⚙️ Setting up secure virtual workspace...",
      "▶️ Running Job: security",
      "  ↳ Step: Checkout Code",
      "  ↳ Step: Run Trivy Vulnerability Scanner",
      "    [Trivy] Initializing DB...",
      "    [Trivy] Scanning local filesystem filesystem...",
      "    [Trivy] Scan results for package.json:",
      "      - Total issues: 0 Critical, 0 High, 0 Medium",
      "      - Status: Clean! Code safe from vulnerabilities.",
      "🎉 Job security completed successfully!",
      "✅ Scheduled workflow completed."
    ]
  },
  {
    id: 5,
    title: "5. Semantic CD (Tokens & Permissions)",
    difficulty: "Hard",
    points: 400,
    description: "Continuous Delivery jobs require writing actions back to the repository (like creating a tag or release). By default, GitHub tokens are read-only. Your task is to grant write permissions and perform a deep clone checkout to create a release.",
    instructions: [
      "Set the trigger to run on pushes to branch 'main'.",
      "Configure job-level write permissions for the repository content: contents: write.",
      "Create a job named 'release' running on 'ubuntu-latest'.",
      "Call actions/checkout@v4 and configure the deep checkout parameter using with: fetch-depth: 0.",
      "Add a shell step that runs: git tag v1.0.0."
    ],
    defaultCode: `name: Release Automation
on:
  push:
    # TODO: Trigger on branch main

jobs:
  release:
    runs-on: ubuntu-latest
    # TODO: Grant explicit write permissions for contents
    
    steps:
      - name: Deep Checkout
        uses: actions/checkout@v4
        # TODO: Add fetch-depth parameter to get entire history
        
      - name: Generate Tag
        # TODO: Run the tag creation script
`,
    expectedJobs: [
      { id: "release", label: "release", needs: [], status: "pending" }
    ],
    validate: (code) => {
      const clean = code.replace(/\s+/g, ' ');
      
      if (!/push:\s*branches:\s*\[\s*main\s*\]/.test(clean)) {
        return { success: false, error: "The trigger must configure push on branch 'main'." };
      }
      if (!/release:/.test(code)) {
        return { success: false, error: "You must define a job named 'release'." };
      }
      // Check for permissions contents: write
      if (!/permissions:\s*contents:\s*write/.test(clean)) {
        return { success: false, error: "You must declare 'permissions: contents: write' to enable tag pushes." };
      }
      // Check for fetch-depth: 0 under checkout
      const releaseSection = code.split('release:')[1] || '';
      if (!/fetch-depth:\s*0/.test(releaseSection)) {
        return { success: false, error: "Checkout step must configure 'fetch-depth: 0' to pull full git history." };
      }
      if (!/run:\s*git\s+tag\s+v1\.0\.0/.test(releaseSection)) {
        return { success: false, error: "The tag creation step must execute: git tag v1.0.0." };
      }
      return { success: true };
    },
    simulatedLogs: [
      "🚀 Starting workflow: Release Automation",
      "⚙️ Initiating release environment...",
      "🔐 Elevating workflow GITHUB_TOKEN scope...",
      "    Scope granted: contents=write",
      "▶️ Running Job: release",
      "  ↳ Step: Deep Checkout",
      "    [Git] Cloning with depth=0 (Full history fetch)...",
      "    [Git] Resolved 24 commits and 4 existing tags.",
      "  ↳ Step: Generate Tag",
      "    [Command] git tag v1.0.0",
      "    [Command] git push origin v1.0.0",
      "    [Git] Created tag v1.0.0 successfully!",
      "🎉 Job release completed successfully! Release v1.0.0 is live.",
      "✅ Workflow run completed."
    ]
  }
];
