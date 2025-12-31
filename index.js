import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { appendFileSync, existsSync, unlinkSync } from 'node:fs';

const options = {
    max: { type: 'string' },
    min: { type: 'string' },
    year: { type: 'string' },
    help: { type: 'boolean' },
};

let args;
try {
    const parsed = parseArgs({ options });
    args = parsed.values;
} catch (e) {
    console.error(`❌ Error parsing arguments: ${e.message}`);
    console.error(`Run with --help for usage.`);
    process.exit(1);
}

// --- 2. Help & Usage ---
if (args.help) {
    console.log(`
📖 GITHUB MOSAIC FILLER - USAGE
===============================
Generates random git commits to fill your contribution graph.

OPTIONS:
  --max <number>   (Required) Maximum commits per day.
  --min <number>   (Optional) Minimum commits per day. Defaults to 1.
  --year <number>  (Optional) The year to fill (2000 - Current). Defaults to current year.
  --help           Show this help message.

EXAMPLE:
  node fill-random.js --max 10 --min 3 --year 2024

HOW TO USE (FROM SCRATCH):
  1. Create a folder:   mkdir my-mosaic && cd my-mosaic
  2. Init git:          git init
  3. Configure email:   git config user.email "your_github_email@example.com"
  4. Run this script:   node fill-random.js --max 8
  5. Create repo:       Go to GitHub -> New Repository (Private is fine)
  6. Push:              git remote add origin <your-repo-url>
                        git push -u origin main
`);
    process.exit(0);
}

// --- 2.5 Safety Check ---
try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (remoteUrl.includes('gh-mosaic')) {
        console.error('❌ Error: It looks like you are running this in the gh-mosaic source repository.');
        console.error('   This script is designed to fill a *separate* repository.');
        console.error('   Please run it inside the repository you want to populate.');
        process.exit(1);
    }
} catch (e) {
    // Ignore (not a git repo or no remote configured)
}

// --- 3. Validation ---

// Validate Max
if (!args.max) {
    console.error('❌ Error: The --max argument is mandatory.');
    process.exit(1);
}
const maxCommits = parseInt(args.max, 10);
if (isNaN(maxCommits) || maxCommits < 1) {
    console.error('❌ Error: --max must be a number greater than 0.');
    process.exit(1);
}

// Validate Min
const minCommits = args.min ? parseInt(args.min, 10) : 1;
if (isNaN(minCommits) || minCommits < 0) {
    console.error('❌ Error: --min must be a valid positive number.');
    process.exit(1);
}
if (minCommits > maxCommits) {
    console.error('❌ Error: --min cannot be greater than --max.');
    process.exit(1);
}

// Validate Year
const currentYear = new Date().getFullYear();
const targetYear = args.year ? parseInt(args.year, 10) : currentYear;

if (isNaN(targetYear) || targetYear < 2000 || targetYear > currentYear) {
    console.error(`❌ Error: --year must be between 2000 and ${currentYear}.`);
    process.exit(1);
}

// --- 4. Main Logic ---

console.log(`🎨 Generating random noise for ${targetYear} (Min: ${minCommits}, Max: ${maxCommits})...`);

// Clean up previous artifacts to prevent massive file growth
if (existsSync('mosaic.txt')) {
    unlinkSync('mosaic.txt');
}

const startDate = new Date(Date.UTC(targetYear, 0, 1, 12, 0, 0)); // Jan 1st 12:00 UTC
const now = new Date(); // Current moment

// We iterate day by day
let currentDate = new Date(startDate);
let counter = 0

while (currentDate.getUTCFullYear() === targetYear) {
    
    // Stop if we reach "tomorrow" relative to the real world
    // (Prevents committing to future dates if targetYear == currentYear)
    if (currentDate > now) {
        console.log(`🛑 Reached current date (${now.toDateString()}). Stopping.`);
        break;
    }

    // Determine number of commits for today (Random Integer between Min and Max)
    // Math.random() excludes 1, so we use floor and add 1 to range
    const count = Math.floor(Math.random() * (maxCommits - minCommits + 1)) + minCommits;

    // Loop to create 'count' commits
    for (let i = 0; i < count; i++) {
        counter++;
        
        // Randomize time (09:00 - 23:00 UTC) to avoid spam detection and duplicate timestamps
        const commitDate = new Date(currentDate);
        commitDate.setUTCHours(9 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        const timestamp = Math.floor(commitDate.getTime() / 1000);
        const gitDate = `${timestamp} +0000`;

        // Create a real file change to ensure GitHub counts the commit
        appendFileSync('mosaic.txt', `Commit ${counter}\n`);
        execSync('git add mosaic.txt');

        // Pass environment variables via 'env' option to ensure they are picked up
        try {
            console.log(counter, commitDate.toISOString())
            execSync(`git commit -m "mosaic commit ${counter}"`, { 
                stdio: 'ignore',
                env: { ...process.env, GIT_AUTHOR_DATE: gitDate, GIT_COMMITTER_DATE: gitDate }
            });
        } catch (e) {
            console.error(`Failed to commit on ${commitDate.toISOString()}: ${e.message}`);
        }
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
}

console.log(`\n✅ Done! Generated contributions for ${targetYear}.`);
console.log(`🚀 Run 'git push' to update your profile.`);