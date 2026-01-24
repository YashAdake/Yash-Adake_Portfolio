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

// Function to send email notification to you
function sendEmailNotification(params) {
  var recipient = "yashadakeofficial@gmail.com"; // Change to your email
  var subject = "New Portfolio Contact: " + (params.Subject || 'No Subject');
  
  var message = `
New contact form submission from your portfolio:

From: ${params.Name}
Email: ${params.Email}
Subject: ${params.Subject || 'No Subject'}
Time: ${new Date().toLocaleString()}

Message:
${params.Message || params.Feedback}

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
  if (!params.Email) return; // Skip if no email provided
  
  var subject = "Thank you for contacting Yash Adake";
  var message = `
Dear ${params.Name || 'there'},

Thank you for reaching out! I've received your message and will get back to you as soon as possible.

Your message:
Subject: ${params.Subject || 'No Subject'}
Message: ${params.Message || params.Feedback}

I typically respond within 1-2 business days.

Best regards,
Yash Adake
Software Engineer
ArthaVedh Consulting Pvt Ltd

---------------------
This is an automated response. Please do not reply to this email.
  `;
  
  try {
    GmailApp.sendEmail(params.Email, subject, message);
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
