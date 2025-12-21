# Driver Telemetry - Deployment Guide

## Prerequisites

Before deploying Driver Telemetry, ensure you have:

- **Node.js 18.x or higher** installed
- **Atlassian Forge CLI** installed: `npm install -g @forge/cli`
- **Atlassian Cloud account** with admin access to a Jira instance
- **Developer account** registered at https://developer.atlassian.com

---

## Step 1: Initial Setup

### 1.1 Install Dependencies

```bash
cd driver-telemetry
npm install
```

### 1.2 Login to Forge

```bash
forge login
```

This will open a browser window to authenticate with your Atlassian account.

### 1.3 Verify Login

```bash
forge whoami
```

---

## Step 2: Build the Application

### 2.1 Compile TypeScript

```bash
npm run build
```

This compiles all TypeScript files in `src/` to JavaScript in `dist/`.

### 2.2 Verify Build

```bash
ls -la dist/
```

You should see compiled `.js` files matching your source structure.

---

## Step 3: Register the App

### 3.1 Register with Forge

```bash
forge register
```

When prompted:
- **App name**: `driver-telemetry`
- Confirm the details

This creates a unique app ID and updates your `manifest.yml`.

### 3.2 Verify Registration

```bash
forge settings list
```

---

## Step 4: Deploy to Development

### 4.1 Deploy the App

```bash
forge deploy
```

This uploads your app to Atlassian's servers. The first deployment takes a few minutes.

### 4.2 Install on Jira Instance

```bash
forge install --product jira
```

When prompted:
- Select your Jira site from the list (or enter the URL)
- Confirm the installation

### 4.3 Verify Installation

Navigate to your Jira instance and:
1. Go to **Jira Settings** > **Apps** > **Manage apps**
2. Look for "Driver Telemetry" in the installed apps list
3. Verify it shows as "Enabled"

---

## Step 5: Enable Rovo (Required)

Driver Telemetry uses Rovo agents, which must be enabled in your Jira instance.

### 5.1 Enable Rovo

1. Go to **Jira Settings** > **Apps** > **Atlassian Marketplace**
2. Search for "Rovo"
3. Install/Enable Rovo for your site
4. Wait 5-10 minutes for Rovo to fully activate

### 5.2 Verify Rovo

1. In Jira, look for the Rovo icon (usually in the top right)
2. Click to open Rovo chat
3. Type "help" to verify it's working

---

## Step 6: Test the App

### 6.1 Test Dashboard Panel

1. Navigate to any Jira project
2. Look for "Driver Telemetry" panel in the project sidebar
3. Verify it displays without errors

### 6.2 Test Rovo Agent

1. Open Rovo chat in Jira
2. Type: "When do I do my best work?"
3. Wait for Driver Telemetry agent to respond

**Note:** If you're a new user with few tickets, you may see a message about insufficient data. This is normal - complete 10+ tickets and try again.

### 6.3 Test Issue Panel

1. Open any issue in Jira
2. Scroll down to find "Driver Telemetry" panel
3. Verify it shows your current status

---

## Step 7: Configure (Optional)

### 7.1 Set Environment Variables

```bash
# Cache TTL in hours (default: 24)
forge variables set CACHE_TTL_HOURS 24

# Minimum data points for analysis (default: 10)
forge variables set MIN_DATA_POINTS 10

# Enable team comparison (default: true)
forge variables set TEAM_COMPARISON true
```

### 7.2 Apply Changes

```bash
forge deploy
```

---

## Step 8: Monitor and Debug

### 8.1 View Logs

```bash
forge logs
```

This shows real-time logs from your app. Keep this running in a terminal while testing.

### 8.2 Tunnel for Development

For faster iteration during development:

```bash
forge tunnel
```

This runs your local code without deploying. Changes take effect immediately.

**Note:** Press `Ctrl+C` to stop the tunnel and return to deployed version.

---

## Troubleshooting

### Issue: "App not found in Jira"

**Solution:**
1. Verify installation: `forge install --list`
2. Reinstall if needed: `forge install --product jira --upgrade`

### Issue: "Rovo agent not responding"

**Solution:**
1. Verify Rovo is enabled in Jira Settings
2. Wait 10 minutes after enabling Rovo
3. Check logs: `forge logs`
4. Verify manifest includes `rovo:agent` module

### Issue: "Insufficient data" message

**Solution:**
- This is expected for new users or users with < 10 completed tickets
- Complete more work in Jira and try again in a week
- The app analyzes your historical data over 6+ months

### Issue: "Permission denied" errors

**Solution:**
1. Check manifest.yml has required scopes:
   - `read:jira-work`
   - `read:jira-user`
   - `storage:app`
2. Redeploy: `forge deploy`
3. Reinstall: `forge install --product jira --upgrade`

### Issue: Build errors

**Solution:**
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

---

## Deployment to Production

### 1. Create Production Environment

```bash
forge environments create production
```

### 2. Deploy to Production

```bash
forge deploy --environment production
```

### 3. Install on Production Site

```bash
forge install --product jira --environment production
```

---

## Updating the App

When you make changes to the code:

### 1. Rebuild

```bash
npm run build
```

### 2. Deploy

```bash
forge deploy
```

Changes take effect immediately for all users.

### 3. Force Reinstall (if needed)

```bash
forge install --product jira --upgrade
```

---

## Uninstalling

### Remove from Jira

```bash
forge uninstall --product jira
```

### Delete App

```bash
forge delete
```

**Warning:** This permanently deletes the app and all data.

---

## Data and Privacy

### What Data is Stored

- **Cached analysis results** (stored in Forge Storage)
- **TTL: 24 hours** (automatically expires)
- **User-specific only** (no cross-user data)

### Clearing User Data

To clear a user's cached data:

```bash
# Via Forge CLI
forge storage delete user:{accountId}:timing
forge storage delete user:{accountId}:load
forge storage delete user:{accountId}:strengths
forge storage delete user:{accountId}:status
```

Or wait 24 hours for automatic expiration.

---

## Performance Optimization

### Caching Strategy

- **Timing analysis**: 24 hour cache
- **Load analysis**: 24 hour cache (current load refreshed real-time)
- **Strength analysis**: 24 hour cache
- **Current status**: 15 minute cache

### Rate Limiting

The app respects Jira API rate limits:
- Max 100 results per search request
- Automatic pagination for large datasets
- Retry logic for transient failures

---

## Support

### Get Help

- Check logs: `forge logs`
- Review documentation: https://developer.atlassian.com/platform/forge/
- Open issue: https://github.com/your-org/driver-telemetry/issues

### Forge CLI Help

```bash
forge help
forge help deploy
forge help install
```

---

## Next Steps

1. ✅ Complete 10+ tickets in Jira to enable analysis
2. ✅ Ask Driver Telemetry questions in Rovo chat
3. ✅ Check your dashboard panel daily for insights
4. ✅ Share feedback to improve the app

---

**🏎️ You're all set! Driver Telemetry is now analyzing your work patterns.**
