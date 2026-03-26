---
description: How to push code changes to GitHub
---

# Git Push Workflow

When pushing code to GitHub, **always use the GitHub MCP tools** instead of the git CLI.

## Steps

1. Stage and commit locally using `git add -A && git commit -m "message"`
// turbo

2. Use `mcp_github_push_files` to push file changes to the remote repo (owner: `silverlion2`, repo: `pharma-hunter-web`, branch: `main`)

> **Why**: The git CLI sometimes has SSL/TLS handshake failures on this machine. MCP is more reliable.
