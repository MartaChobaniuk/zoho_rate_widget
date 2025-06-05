# Exchange Rate Widget for Zoho CRM

This widget displays the current USD exchange rate from the National Bank of Ukraine (NBU), compares it with the deal's custom rate, shows the percentage difference, and allows updating the CRM field if the difference is 5% or more.

## Features

- Fetches NBU USD rate from public API
- Reads the current "Deal Rate" from CRM (`currency_rate` field)
- Calculates and displays percentage difference
- Shows an "Update" button if difference ≥ 5%
- Allows updating the deal rate field directly
- Displays success and error messages in the UI
- Automatically logs user actions in the interface
- Caches the NBU rate in `localStorage` as fallback
- Fully responsive and mobile-friendly


## File Structure

widget/
│
├── widget.html    # Main widget layout
├── style.css      # Custom responsive styles
├── script.js      # Core widget logic
└── manifest.json  # Widget configuration

## How to Run the Widget in Zoho CRM

### 1. Create a Custom Field in CRM

1. Go to **Setup → Modules → Deals**
2. Click **“Add Field”**
3. Choose type: **Decimal**
4. Label it as **Exchange Rate**
5. Make sure the **API name is `currency_rate`**

### 2. Package the Widget

Ensure all 4 widget files are in one folder and not nested in subdirectories. Then:

- Compress them into a `.zip` file:

### 3. Upload the Widget to Zoho CRM

1. Go to https://crm.zoho.eu/crm/org20106659536/settings/personal-settings
2. Open Developer Hub
3. Navigate to the **Widgets** tab
4. Click **“Add Widget”**, then:
 - Upload your `.zip` file

### 4. Use the Widget in CRM

1. Open any **Deal** record in Zoho CRM
2. Scroll to the **Related List** section
3. Locate the **Rate Widget**
4. You’ll see:
 - Current NBU USD rate
 - The current rate from the deal
 - The % difference
 - An "Update" button if the difference ≥ 5%