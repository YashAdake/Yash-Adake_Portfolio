# Enhanced Google Apps Script Setup Guide

This enhanced script adds powerful features to your contact form!

## 🚀 New Features

1. **Email Notifications** - Get instant email alerts for new messages
2. **Auto-Reply** - Automatically respond to message senders
3. **Dashboard** - Visual summary of all responses
4. **Conditional Formatting** - Highlight new entries
5. **Professional Setup** - Organized headers and styling

## 📋 Setup Instructions

### 1. Copy the Code

1. Open your Google Sheet
2. Go to `Extensions` → `Apps Script`
3. Delete the existing code
4. Copy and paste the code from `Code.gs`
5. Save the script (Ctrl+S or Cmd+S)

### 2. Initial Setup

Run these functions once to set everything up:

```javascript
// In Apps Script console, run these functions:
setupSpreadsheet()      // Sets up headers and formatting
addConditionalFormatting() // Highlights new entries
createDashboard()       // Creates summary dashboard
setupTriggers()         // Sets up automatic daily updates
```

### 3. Update Email Address

Change this line in the code to your email:
```javascript
var recipient = "yashadakeofficial@gmail.com"; // Change to your email
```

### 4. Deploy the Script

1. Click `Deploy` → `New Deployment`
2. Choose type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Click `Deploy`
6. Copy the new script URL
7. Update your portfolio HTML with the new URL

## ✨ What Each Function Does

### `doPost()`
- Saves form data to spreadsheet
- Sends email notification to you
- Sends auto-reply to sender
- Returns success/error status

### `sendEmailNotification()`
- Sends you an email when someone submits the form
- Includes all form details
- Professional format

### `sendAutoReply()`
- Automatically replies to the sender
- Confirms message receipt
- Sets response time expectations

### `setupSpreadsheet()`
- Creates proper headers
- Formats columns professionally
- Sets optimal column widths

### `addConditionalFormatting()`
- Highlights entries from last 24 hours
- Makes new responses stand out

### `createDashboard()`
- Creates a visual summary
- Shows total responses
- Displays recent entries
- Updates automatically

### `setupTriggers()`
- Creates automatic daily updates
- Refreshes dashboard every day

## 📊 Understanding Your Data

### Spreadsheet Columns:
1. **Timestamp** - When message was sent
2. **Name** - Sender's name
3. **Email** - Sender's email
4. **Subject** - Message subject
5. **Message** - Full message content

### Dashboard Metrics:
1. **Total Responses** - All-time total
2. **This Week** - Last 7 days
3. **Today** - Today's responses
4. **Recent Responses** - Last 5 entries

## 🔧 Customization Options

### Email Templates

Modify the email templates in:
- `sendEmailNotification()` - Your notification
- `sendAutoReply()` - Sender's reply

### Dashboard Layout

Customize the dashboard in `createDashboard()`:
- Add more metrics
- Change colors
- Modify formulas

### Conditional Formatting

Adjust highlight rules in `addConditionalFormatting()`:
- Change time range
- Modify colors
- Add more conditions

## 📱 Quick Access Tips

1. **Bookmark Your Sheet** - Quick access
2. **Pin Chrome Tab** - Always visible
3. **Use Google Sheets App** - Mobile access
4. **Create Home Screen Shortcut** - One-tap access

## 🔔 Gmail Filters (Optional)

Create a Gmail filter for portfolio messages:
1. Go to Gmail Settings
2. Create filter for "from:portfolio"
3. Add label "Portfolio Messages"
4. Mark as important
5. Never send to spam

## 📈 Advanced Features

### Weekly Email Summary
Add this function for weekly reports:

```javascript
function sendWeeklyReport() {
  // Gets last week's data and emails summary
  // Set up weekly trigger for this
}
```

### CSV Export
Automatically export data:

```javascript
function exportToCSV() {
  // Exports all data to CSV
  // Can be scheduled monthly
}
```

## 🛟 Troubleshooting

### If emails aren't working:
1. Check Gmail permissions
2. Verify email address is correct
3. Check spam folder

### If forms aren't submitting:
1. Verify script URL is correct
2. Check deployment permissions
3. Test with console logs

### If dashboard isn't updating:
1. Run `createDashboard()` manually
2. Check trigger permissions
3. Verify sheet names

Your contact form is now enterprise-level! 🚀
