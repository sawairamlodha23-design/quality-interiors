# Quality Interiors — Google Apps Script Backend Setup

This directory contains the production-ready Google Apps Script backend for the Quality Interiors consultation form.

---

## Google Sheet & Apps Script Deployment Steps

### STEP 1: Create the Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name the spreadsheet: **`Quality Interiors Leads`**.
3. Name the first sheet tab: **`Leads`**.

---

### STEP 2: Open Google Apps Script
1. In the Google Sheet top menu, click **Extensions** → **Apps Script**.
2. Rename the project to: **`Quality Interiors Lead Engine`**.

---

### STEP 3: Add the Backend Code
1. Delete any existing code in the script editor.
2. Copy the entire contents of [`Code.gs`](./Code.gs) and paste it into the editor.
3. In `Code.gs`, find the `CONFIG` block at the top:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: "PASTE_GOOGLE_SHEET_ID_HERE",
     SHEET_NAME: "Leads",
     NOTIFICATION_EMAIL: "qualityinteriors93@gmail.com"
   };
   ```
4. Copy your Google Sheet ID from your browser's address bar (the string between `/d/` and `/edit`):
   `https://docs.google.com/spreadsheets/d/`**`YOUR_SPREADSHEET_ID`**`/edit`
5. Replace `"PASTE_GOOGLE_SHEET_ID_HERE"` with your actual Spreadsheet ID.
6. Click **Save** (💾 or `Ctrl+S` / `Cmd+S`).

---

### STEP 4: Run Initial Setup (Optional but Recommended)
1. In the function dropdown at the top of Apps Script, select **`setupSheet`**.
2. Click **Run**.
3. Authorize the permissions when prompted.
4. Check your Google Sheet — the **`Leads`** tab will now have formatted headers:
   - `Timestamp`
   - `Full Name`
   - `Phone Number`
   - `Email Address`
   - `City / Location`
   - `Project Type`
   - `Approximate Budget`
   - `Preferred Consultation Date`
   - `Project Details`
   - `Page URL`
   - `UTM Source`
   - `UTM Medium`
   - `UTM Campaign`
   - `Lead Status`

---

### STEP 5: Deploy as a Web App
1. At the top right of Apps Script, click **Deploy** → **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Quality Interiors Lead API v1`
   - **Execute as**: **`Me (your Google account)`**
   - **Who has access**: **`Anyone`** *(CRITICAL: This allows website visitors to submit the form without needing to log in)*
4. Click **Deploy**.
5. Copy the **Web app URL** provided (it looks like `https://script.google.com/macros/s/.../exec`).

---

### STEP 6: Connect to Website Frontend
1. Open [`assets/js/form.js`](../assets/js/form.js).
2. Locate line 11:
   ```javascript
   const GOOGLE_SCRIPT_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace `"PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"` with your copied Web App URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
   ```
4. Save and deploy to Vercel!

---

## Verification & Testing
Once deployed:
1. Open the website: `https://qualityinteriors.vercel.app/`
2. Scroll to the Consultation Form and submit a test lead.
3. Verify:
   - ✅ Google Sheet creates a new row with Status = "New".
   - ✅ An email alert is received at `qualityinteriors93@gmail.com`.
   - ✅ The website shows the Booking Success Modal with client details.
   - ✅ Google Analytics triggers `consultation_request` conversion event.
