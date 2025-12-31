# GitHub Contribution Painter 🎨

A zero-dependency Node.js tool to programmatically fill your GitHub contribution graph (the "mosaic").

It generates synthetic git commits with backdated timestamps to populate your profile activity. You can control the density (min/max commits per day) and the target year.

## Features

* **Zero Dependencies:** Uses native Node.js modules (`util.parseArgs`). No `npm install` required.
* **Stochastic Generation:** Generates a random number of commits per day within a specified range (Uniform Distribution).
* **Smart Cutoff:** When filling the current year, it stops at "today" to avoid committing to the future.
* **Historical Backfilling:** Can fill any year back to 2000.

## Prerequisites

* **Node.js**: Version **18.3.0** or higher (required for native argument parsing).
* **Git**: Installed and configured.

## Quick Start

1.  **Initialize a repository** (if you haven't already):
    ```bash
    mkdir my-mosaic
    cd my-mosaic
    git init
    ```

2.  **Ensure the Git User is configured:**

    *Important:* The email below **must** match the email associated with your GitHub account, or the graph will not update.
    ```bash
    git config user.email "your-github-email@example.com"
    git config user.name "Your Name"
    ```

3.  **Run the script:**
    ```bash
    # Generate between 1 and 10 commits for every day of the current year
    npx gh-mosaic --max 10
    ```

4.  **Push to GitHub:**
    Create a new private (or public) repository on GitHub, then:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    git push -u origin main
    ```

## Usage

### CLI Arguments

| Flag | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `--max` | Number | **Yes** | Maximum number of commits to generate per day. |
| `--min` | Number | No | Minimum number of commits per day. Default: `1`. |
| `--year` | Number | No | The specific year to fill (2000–Current). Default: Current Year. |
| `--help` | Boolean | No | Displays usage information. |

### Examples

**1. Light Activity (Current Year)**
Generates 1 to 3 commits per day up to today.
```bash
npx gh-mosaic --max 3