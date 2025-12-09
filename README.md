# Minimal Reproduction for TanStack DB Issue

This repository provides a minimal setup to reproduce an issue encountered with the TanStack DB library.

## ❗ Issue Description

When configuring a collection with:

- `sync = "on-demand"`
- `staleTime = 0`

the expected behavior is that queries should always refetch when accessed, since a stale time of 0 means results are immediately considered stale.

However, what actually happens is that previous query results are reused instead of triggering a refetch.

## 🔍 How to Observe the Issue

In this repository, we keep track of the number of times the queryFn is called.
This counter should increment every time the query is resolved.

Instead, when navigating back to a previous query result, the counter does not increase, demonstrating that the query is being reused rather than re-fetched.

https://github.com/user-attachments/assets/1b65c280-d62f-4841-b0b1-a6ab7bb94706

## 🧪 Starting the App

To start the app, clone this repository and run:

```
pnpm install
pnpm run dev
```

(from the root of the repository)




