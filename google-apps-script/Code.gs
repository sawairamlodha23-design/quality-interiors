/**
 * =============================================================================
 * QUALITY INTERIORS — GOOGLE APPS SCRIPT LEAD CAPTURE BACKEND
 * =============================================================================
 * Receives consultation enquiries from https://qualityinteriors.vercel.app/
 * Appends lead to Google Sheet ("Leads" tab) with Status = "New"
 * Sends instant email notification to qualityinteriors93@gmail.com
 * Returns JSON response for website success modal & GA conversion event
 * =============================================================================
 */

// CONFIGURATION
const CONFIG = {
  // Replace with your Google Sheet ID (from the sheet URL between /d/ and /edit)
  SPREADSHEET_ID: "PASTE_GOOGLE_SHEET_ID_HERE",
  
  // Sheet tab name for storing leads
  SHEET_NAME: "Leads",
  
  // Business email address for incoming consultation lead alerts
  NOTIFICATION_EMAIL: "qualityinteriors93@gmail.com"
};

// Exact Google Sheet Column Headers (14 columns)
const HEADERS = [
  "Timestamp",
  "Full Name",
  "Phone Number",
  "Email Address",
  "City / Location",
  "Project Type",
  "Approximate Budget",
  "Preferred Consultation Date",
  "Project Details",
  "Page URL",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "Lead Status"
];

/**
 * HTTP GET Handler (Health Check / Deployment Verification)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "Quality Interiors Lead API",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * HTTP POST Handler (Processes Lead Submissions from Website)
 */
function doPost(e) {
  try {
    // 1. Validate payload presence
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse(false, "No form data received");
    }

    // 2. Parse JSON payload
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse(false, "Invalid JSON payload");
    }

    // 3. Honeypot Anti-Spam Check
    if (data.honeypot || data.website_hp) {
      // Reject spam submission silently
      return createJsonResponse(true, "Submission received");
    }

    // 4. Server-Side Field Validation
    const fullName = (data.fullName || "").trim();
    const phone = (data.phone || "").trim();
    const email = (data.email || "").trim();
    const city = (data.city || "").trim();
    const projectType = (data.projectType || "").trim();
    const budget = (data.budget || "Flexible").trim();
    const preferredDate = (data.preferredDate || "Not Specified").trim();
    const projectDetails = (data.projectDetails || "").trim();
    const pageUrl = (data.pageUrl || "").trim();
    const utmSource = (data.utmSource || "").trim();
    const utmMedium = (data.utmMedium || "").trim();
    const utmCampaign = (data.utmCampaign || "").trim();

    if (!fullName || fullName.length < 2) {
      return createJsonResponse(false, "Full Name is required (minimum 2 characters)");
    }
    if (!phone || phone.length < 8) {
      return createJsonResponse(false, "A valid Phone Number is required");
    }
    if (!email || !isValidEmail(email)) {
      return createJsonResponse(false, "A valid Email Address is required");
    }
    if (!city) {
      return createJsonResponse(false, "City / Location is required");
    }
    if (!projectType) {
      return createJsonResponse(false, "Project Type is required");
    }

    // 5. Open Target Spreadsheet & Sheet Tab
    const sheet = getOrCreateLeadsSheet();
    if (!sheet) {
      return createJsonResponse(false, "Unable to access lead database sheet");
    }

    // 6. Format Submission Timestamp (IST / Local Time)
    const formattedTimestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || "Asia/Kolkata",
      "yyyy-MM-dd HH:mm:ss"
    );

    // Initial Lead Status is always "New"
    const leadStatus = "New";

    // 7. Append Lead Row to Google Sheet
    const newRow = [
      formattedTimestamp,
      fullName,
      phone,
      email,
      city,
      projectType,
      budget,
      preferredDate,
      projectDetails,
      pageUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      leadStatus
    ];

    sheet.appendRow(newRow);

    // 8. Send Instant Email Notification
    sendLeadEmailNotification({
      fullName,
      phone,
      email,
      city,
      projectType,
      budget,
      preferredDate,
      projectDetails,
      pageUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      timestamp: formattedTimestamp,
      leadStatus
    });

    // 9. Return Success Response
    return createJsonResponse(true, "Lead submitted successfully");

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return createJsonResponse(false, error.message || "Unable to submit your request");
  }
}

/**
 * Access or create the "Leads" sheet tab with headers
 */
function getOrCreateLeadsSheet() {
  let spreadsheet;
  
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "PASTE_GOOGLE_SHEET_ID_HERE") {
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } catch (e) {
      Logger.log("Error opening spreadsheet by ID: " + e.toString());
    }
  }

  // Fallback to active spreadsheet if script is container-bound
  if (!spreadsheet) {
    try {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {}
  }

  if (!spreadsheet) {
    throw new Error("Spreadsheet not found. Please set SPREADSHEET_ID in CONFIG.");
  }

  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  // Add header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#171717");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
    
    // Auto-adjust column widths
    for (let i = 1; i <= HEADERS.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  return sheet;
}

/**
 * One-Click Setup Function (Run from Script Editor to initialize sheet)
 */
function setupSheet() {
  const sheet = getOrCreateLeadsSheet();
  Logger.log("Leads sheet successfully initialized: " + sheet.getName());
}

/**
 * Sends a structured, professional email alert to Quality Interiors
 */
function sendLeadEmailNotification(lead) {
  try {
    const subject = "New Website Consultation Lead — Quality Interiors (" + lead.fullName + ")";

    const plainBody = 
      "New Consultation Request\n\n" +
      "Name: " + lead.fullName + "\n" +
      "Phone: " + lead.phone + "\n" +
      "Email: " + lead.email + "\n" +
      "City / Location: " + lead.city + "\n" +
      "Project Type: " + lead.projectType + "\n" +
      "Budget: " + lead.budget + "\n" +
      "Preferred Consultation Date: " + lead.preferredDate + "\n" +
      "Project Details: " + (lead.projectDetails || "None provided") + "\n\n" +
      "Source: " + (lead.utmSource || "Direct / Website") + "\n" +
      "Medium: " + (lead.utmMedium || "N/A") + "\n" +
      "Campaign: " + (lead.utmCampaign || "N/A") + "\n\n" +
      "Page URL: " + lead.pageUrl + "\n" +
      "Submitted At: " + lead.timestamp + "\n\n" +
      "Lead Status: " + lead.leadStatus;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E0D8; border-radius: 8px; background-color: #FFFFFF;">
        <div style="background-color: #171717; color: #FFFFFF; padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.05em;">QUALITY INTERIORS</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #D4AF37;">New Website Consultation Lead</p>
        </div>
        
        <div style="padding: 24px; color: #2C2C2C; line-height: 1.6;">
          <h3 style="margin-top: 0; color: #171717; border-bottom: 2px solid #E5E0D8; padding-bottom: 8px;">Client Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 140px; font-weight: 600;">Name:</td>
              <td style="padding: 8px 0; color: #171717; font-weight: 600;">${escapeHtml(lead.fullName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 600;">Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${escapeHtml(lead.phone)}" style="color: #171717; text-decoration: none; font-weight: 600;">${escapeHtml(lead.phone)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(lead.email)}" style="color: #6C5B4C; text-decoration: none;">${escapeHtml(lead.email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 600;">City / Location:</td>
              <td style="padding: 8px 0;">${escapeHtml(lead.city)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 600;">Project Type:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #6C5B4C;">${escapeHtml(lead.projectType)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 600;">Approximate Budget:</td>
              <td style="padding: 8px 0;">${escapeHtml(lead.budget)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 600;">Preferred Date:</td>
              <td style="padding: 8px 0;">${escapeHtml(lead.preferredDate)}</td>
            </tr>
          </table>

          <h3 style="margin-top: 20px; color: #171717; border-bottom: 2px solid #E5E0D8; padding-bottom: 8px;">Project Details</h3>
          <p style="background-color: #FAF8F5; padding: 12px; border-radius: 4px; border-left: 3px solid #6C5B4C; font-size: 14px; margin: 8px 0;">
            ${escapeHtml(lead.projectDetails || "No additional details provided.")}
          </p>

          <h3 style="margin-top: 20px; color: #171717; border-bottom: 2px solid #E5E0D8; padding-bottom: 8px;">Marketing & Attribution</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #555;">
            <tr>
              <td style="padding: 4px 0; width: 140px;">Source:</td>
              <td style="padding: 4px 0;">${escapeHtml(lead.utmSource || "Direct / Website")}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Medium:</td>
              <td style="padding: 4px 0;">${escapeHtml(lead.utmMedium || "N/A")}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Campaign:</td>
              <td style="padding: 4px 0;">${escapeHtml(lead.utmCampaign || "N/A")}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Submitted At:</td>
              <td style="padding: 4px 0;">${escapeHtml(lead.timestamp)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Lead Status:</td>
              <td style="padding: 4px 0;"><span style="background-color: #E6F4EA; color: #137333; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${escapeHtml(lead.leadStatus)}</span></td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #E5E0D8; font-size: 12px; color: #888;">
          Quality Interiors Lead Capture System &bull; <a href="mailto:${CONFIG.NOTIFICATION_EMAIL}" style="color: #666;">${CONFIG.NOTIFICATION_EMAIL}</a>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: CONFIG.NOTIFICATION_EMAIL,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });

  } catch (emailError) {
    Logger.log("Email notification error: " + emailError.toString());
  }
}

/**
 * Creates standardized JSON output with proper MIME type
 */
function createJsonResponse(success, message) {
  const output = {
    success: success,
    message: message
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Basic Email validation helper
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * HTML Escaping helper to prevent injection in email body
 */
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
