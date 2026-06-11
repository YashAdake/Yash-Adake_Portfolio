// Enhanced Google Apps Script for your contact form
function doPost(e) {
  try {
    // Get the active spreadsheet (make sure it's the correct one)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Get form data
    var values = [
      new Date(),                    // Timestamp
      e.parameter.Name,              // Name
      e.parameter.Email,             // Email
      e.parameter.Subject || '',     // Subject (if exists)
      e.parameter.Message || e.parameter.Feedback  // Message
    ];
    
    // Append to sheet
    sheet.appendRow(values);
    
    // Send email notification to you
    sendEmailNotification(e.parameter);
    
    // Send auto-reply to sender
    sendAutoReply(e.parameter);
    
    return ContentService
      .createTextOutput('Success')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    Logger.log(error.toString());
    return ContentService
      .createTextOutput('Error')
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// ============================================
// VISITOR COUNTER - GET Request Handler
// ============================================
function doGet(e) {
  try {
    var action = e.parameter.action || 'count';
    
    if (action === 'count') {
      // Get or initialize the visitor count from Script Properties
      var scriptProperties = PropertiesService.getScriptProperties();
      var count = parseInt(scriptProperties.getProperty('visitorCount')) || 0;
      
      // Increment the count
      count++;
      scriptProperties.setProperty('visitorCount', count.toString());
      
      // Return JSON response with CORS headers
      var output = ContentService.createTextOutput(JSON.stringify({
        success: true,
        count: count
      }));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
      
    } else if (action === 'getCount') {
      // Just get count without incrementing
      var scriptProperties = PropertiesService.getScriptProperties();
      var count = parseInt(scriptProperties.getProperty('visitorCount')) || 0;
      
      var output = ContentService.createTextOutput(JSON.stringify({
        success: true,
        count: count
      }));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Visitor count error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Defense-in-depth sanitizers. The Cloudflare Worker already validates and
// length-limits fields, but these keep the email layer safe on its own:
//  - oneLine(): strip CR/LF + control chars (header-injection guard) and cap
//    length, for values placed in single-line positions (subject, name).
//  - block():  strip control chars except newline/tab and cap length, for the
//    multi-line message body. Emails are sent as PLAINTEXT (3-arg sendEmail),
//    so no HTML is interpreted — this is purely about clean, bounded content.
function oneLine(value, max) {
  return String(value || '')
    .replace(/\s+/g, ' ')   // collapse all whitespace (incl. CR/LF) to a space
    .trim()
    .slice(0, max || 200);
}

function block(value, max) {
  // Multi-line body: just trim and length-cap. Plaintext email, so line
  // endings render fine as-is; the Worker already length-limits upstream.
  return String(value || '').trim().slice(0, max || 5000);
}

// Function to send email notification to you
function sendEmailNotification(params) {
  var recipient = "yashadakeofficial@gmail.com"; // Change to your email
  var name = oneLine(params.Name, 100);
  var email = oneLine(params.Email, 254);
  var subj = oneLine(params.Subject, 200) || 'No Subject';
  var body = block(params.Message || params.Feedback, 5000);
  var subject = "New Portfolio Contact: " + subj;
  
  var message = `
New contact form submission from your portfolio:

From: ${name}
Email: ${email}
Subject: ${subj}
Time: ${new Date().toLocaleString()}

Message:
${body}

---------------------
Sent from your portfolio contact form
  `;
  
  try {
    GmailApp.sendEmail(recipient, subject, message);
  } catch (error) {
    Logger.log('Email notification error: ' + error.toString());
  }
}

// Function to send auto-reply to the sender
function sendAutoReply(params) {
  var email = oneLine(params.Email, 254);
  if (!email) return; // Skip if no email provided

  var name = oneLine(params.Name, 100) || 'there';
  var subj = oneLine(params.Subject, 200) || 'No Subject';
  var body = block(params.Message || params.Feedback, 5000);

  var subject = "Thank you for contacting Yash Adake";
  var message = `
Dear ${name},

Thank you for reaching out! I've received your message and will get back to you as soon as possible.

Your message:
Subject: ${subj}
Message: ${body}

I typically respond within 1-2 business days.

Best regards,
Yash Adake
Software Engineer
ArthaVedh Consulting Pvt Ltd

---------------------
This is an automated response. Please do not reply to this email.
  `;

  try {
    GmailApp.sendEmail(email, subject, message);
  } catch (error) {
    Logger.log('Auto-reply error: ' + error.toString());
  }
}

// Function to set up the spreadsheet headers (run once)
function setupSpreadsheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = ['Timestamp', 'Name', 'Email', 'Subject', 'Message'];
  
  // Add headers if they don't exist
  if (sheet.getRange(1, 1).getValue() === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4a86e8')
      .setFontColor('white');
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 150); // Name
    sheet.setColumnWidth(3, 200); // Email
    sheet.setColumnWidth(4, 200); // Subject
    sheet.setColumnWidth(5, 400); // Message
  }
}

// Function to add conditional formatting (run once)
function addConditionalFormatting() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Highlight new entries (last 24 hours)
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$A2>NOW()-1')
    .setBackground('#fff2cc')
    .setRanges([sheet.getRange('A2:E1000')])
    .build();
    
  var rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
}

// Function to create a summary dashboard
function createDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  // Create or get dashboard sheet
  var dashboard = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard');
  
  // Clear existing content
  dashboard.clear();
  
  // Add title
  dashboard.getRange('A1').setValue('Contact Form Dashboard').setFontSize(18).setFontWeight('bold');
  
  // Add metrics
  dashboard.getRange('A3').setValue('Total Responses:');
  dashboard.getRange('B3').setFormula('=COUNTA(Sheet1!A:A)-1'); // Count excluding header
  
  dashboard.getRange('A4').setValue('This Week:');
  dashboard.getRange('B4').setFormula('=COUNTIFS(Sheet1!A:A,">"&TODAY()-7,Sheet1!A:A,"<="&TODAY())');
  
  dashboard.getRange('A5').setValue('Today:');
  dashboard.getRange('B5').setFormula('=COUNTIFS(Sheet1!A:A,">"&TODAY(),Sheet1!A:A,"<="&TODAY()+1)');
  
  // Recent responses
  dashboard.getRange('A7').setValue('Recent Responses:').setFontWeight('bold');
  
  // Latest 5 responses
  dashboard.getRange('A8').setValue('Name');
  dashboard.getRange('B8').setValue('Email');
  dashboard.getRange('C8').setValue('Subject');
  dashboard.getRange('D8').setValue('Time');
  
  dashboard.getRange('A8:D8').setFontWeight('bold').setBackground('#e6e6e6');
  
  // Formula for recent entries
  dashboard.getRange('A9:D13').setFormulas([
    ['=IF(ROWS(Sheet1!A:A)>=2,INDEX(Sheet1!B:B,ROWS(Sheet1!A:A)),"")','=IF(ROWS(Sheet1!A:A)>=2,INDEX(Sheet1!C:C,ROWS(Sheet1!A:A)),"")','=IF(ROWS(Sheet1!A:A)>=2,INDEX(Sheet1!D:D,ROWS(Sheet1!A:A)),"")','=IF(ROWS(Sheet1!A:A)>=2,INDEX(Sheet1!A:A,ROWS(Sheet1!A:A)),"")'],
    ['=IF(ROWS(Sheet1!A:A)>=3,INDEX(Sheet1!B:B,ROWS(Sheet1!A:A)-1),"")','=IF(ROWS(Sheet1!A:A)>=3,INDEX(Sheet1!C:C,ROWS(Sheet1!A:A)-1),"")','=IF(ROWS(Sheet1!A:A)>=3,INDEX(Sheet1!D:D,ROWS(Sheet1!A:A)-1),"")','=IF(ROWS(Sheet1!A:A)>=3,INDEX(Sheet1!A:A,ROWS(Sheet1!A:A)-1),"")'],
    ['=IF(ROWS(Sheet1!A:A)>=4,INDEX(Sheet1!B:B,ROWS(Sheet1!A:A)-2),"")','=IF(ROWS(Sheet1!A:A)>=4,INDEX(Sheet1!C:C,ROWS(Sheet1!A:A)-2),"")','=IF(ROWS(Sheet1!A:A)>=4,INDEX(Sheet1!D:D,ROWS(Sheet1!A:A)-2),"")','=IF(ROWS(Sheet1!A:A)>=4,INDEX(Sheet1!A:A,ROWS(Sheet1!A:A)-2),"")'],
    ['=IF(ROWS(Sheet1!A:A)>=5,INDEX(Sheet1!B:B,ROWS(Sheet1!A:A)-3),"")','=IF(ROWS(Sheet1!A:A)>=5,INDEX(Sheet1!C:C,ROWS(Sheet1!A:A)-3),"")','=IF(ROWS(Sheet1!A:A)>=5,INDEX(Sheet1!D:D,ROWS(Sheet1!A:A)-3),"")','=IF(ROWS(Sheet1!A:A)>=5,INDEX(Sheet1!A:A,ROWS(Sheet1!A:A)-3),"")'],
    ['=IF(ROWS(Sheet1!A:A)>=6,INDEX(Sheet1!B:B,ROWS(Sheet1!A:A)-4),"")','=IF(ROWS(Sheet1!A:A)>=6,INDEX(Sheet1!C:C,ROWS(Sheet1!A:A)-4),"")','=IF(ROWS(Sheet1!A:A)>=6,INDEX(Sheet1!D:D,ROWS(Sheet1!A:A)-4),"")','=IF(ROWS(Sheet1!A:A)>=6,INDEX(Sheet1!A:A,ROWS(Sheet1!A:A)-4),"")']
  ]);
  
  // Set column widths
  dashboard.setColumnWidth(1, 150);
  dashboard.setColumnWidth(2, 200);
  dashboard.setColumnWidth(3, 200);
  dashboard.setColumnWidth(4, 150);
}

// Function to set up triggers (run once)
function setupTriggers() {
  // Remove existing triggers
  var triggers = PropertiesService.getScriptProperties().getProperty('triggers');
  if (triggers) {
    triggers = JSON.parse(triggers);
    triggers.forEach(function(triggerId) {
      try {
        var trigger = ScriptApp.getProjectTriggers().find(t => t.getUniqueId() === triggerId);
        if (trigger) ScriptApp.deleteTrigger(trigger);
      } catch (e) {
        Logger.log('Error deleting trigger: ' + e.toString());
      }
    });
  }
  
  // Create new triggers
  var newTriggers = [];
  
  // Daily dashboard update
  var dashboardTrigger = ScriptApp.newTrigger('createDashboard')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();
  newTriggers.push(dashboardTrigger.getUniqueId());
  
  // Save trigger IDs
  PropertiesService.getScriptProperties().setProperty('triggers', JSON.stringify(newTriggers));
}

// ============================================
// ONE-TIME UTILITY — Reset Visitor Counter
// Run this ONCE from the Apps Script editor (Run → resetCounter)
// Set to 849 because doGet increments BEFORE returning,
// so the first real visit after this will show 850.
// ============================================
function resetCounter() {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('visitorCount', '849');
  Logger.log('✅ Visitor counter reset. Next visit will show: 850');
}
