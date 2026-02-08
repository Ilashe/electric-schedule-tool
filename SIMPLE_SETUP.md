# ✅ SUPER SIMPLE SETUP - Public Google Sheet (No Service Account!)

---

## 📋 Setup Steps (15 Minutes Total)

### STEP 1: Create Google Sheet (10 minutes)

#### A. Create New Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "+" to create blank spreadsheet
3. Name it: "Electrical Schedule Master Data"

#### B. Create 3 Tabs

**Tab 1: MASTER_LIST**
1. Rename "Sheet1" → "MASTER_LIST"
2. Open your `ElectricalSchedule-Template.xlsm` file
3. Go to "MASTER LIST" tab
4. Select ALL data (Ctrl+A)
5. Copy (Ctrl+C)
6. Paste into Google Sheet (Ctrl+V)
7. ✓ You should see ~1,621 rows

**Tab 2: EXCLUSIONS**
1. Click "+" at bottom to add new sheet
2. Rename → "EXCLUSIONS"
3. Copy-paste this data:

```
PART_NUMBER
RC3DG-UHMW
FGPIT-MOLD-K
FGPIT-MOLD-K-4X12
FGPIT-CLM-K
WA2F-0318
WA1M-72-510-5220-CORE
WA1M-00-510-5220-SS-CL-BL
RB1AMC-23-13
RB1AMA-23-13
TR1HB-82
TR1-BUN-RED
CB1AMA-50-13-S-CL
CB1AMC-50-13
CB1AMA-23-13-S-CL
CB1AMC-23-13
MC1E-12W79L-S-CL-AVW-BL
MCC-460
MCC-5-460-VFD
DISPENSEIT-10-INJ-KIT
COMP-FLTR-REG-3-4IN
COMP-PRESS-GAUGE
```

**Tab 3: VOLTAGE_MAP**
1. Click "+" to add another sheet
2. Rename → "VOLTAGE_MAP"
3. Copy-paste this data:

```
COUNTRY	3PHASE	1PHASE
USA	460	120
Canada	575	120
Australia	415	240
UK	400	230
Mexico	440	127
```

#### C. Make Sheet Public
1. Click "Share" button (top right)
2. Click "Change to anyone with the link"
3. Set to "Viewer"
4. Click "Done"

⚠️ **Important:** Anyone with the link can VIEW the sheet (but not edit). This is fine - your master list isn't super secret.

#### D. Get Sheet ID
1. Look at the URL in your browser
2. It looks like: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
3. Copy the `SHEET_ID` part (between `/d/` and `/edit`)
4. Save it - you'll need it in Step 2!

Example:
- URL: `https://docs.google.com/spreadsheets/d/1abc123XYZ456def789/edit`
- Sheet ID: `1abc123XYZ456def789`

---

### STEP 2: Deploy to Vercel (5 minutes)

#### A. Push to GitHub
```bash
cd electrical-schedule-tool-v2
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### B. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import your GitHub repo
4. Add Environment Variable:
   - Name: `NEXT_PUBLIC_GOOGLE_SHEET_ID`
   - Value: [Paste your Sheet ID from Step 1D]
5. Click "Deploy"

Done! 🎉

---

## 🎯 That's It!

**No service account needed!**
**No JSON credentials!**
**No complicated setup!**

Just:
1. ✅ Created Google Sheet with 3 tabs
2. ✅ Made it public (anyone can view)
3. ✅ Got Sheet ID
4. ✅ Added to Vercel

---

## 🔄 How It Works

When someone uploads a quote:
1. Tool reads the **public** Google Sheet (like downloading a CSV)
2. No authentication needed (sheet is public)
3. Gets latest master list, exclusions, voltages
4. Generates schedule
5. Downloads Excel

**To update master list:**
1. Open Google Sheet
2. Edit MASTER_LIST tab
3. Save
4. Next generation automatically uses new data!

---

## ✅ Advantages of Public Sheet

**Pros:**
- ✅ Super simple setup (15 min total)
- ✅ No service account needed
- ✅ No credentials to manage
- ✅ Just works!
- ✅ Edit anytime, updates instant

**Cons:**
- ⚠️ Anyone with link can view (but can't edit)
- ⚠️ Not super secure (but master list isn't secret anyway)

---

## 🎨 Next: Create UI

Now that setup is simpler, should I create the UI files?

I need to create:
1. Main page (upload interface)
2. API route (handles PDF processing)
3. File upload component
4. Progress indicator
5. Results display
6. Layout & styling

**Say "YES" and I'll create all 7 files now!** 🚀

---

## 📝 Quick Reference

**Environment Variable:**
```
NEXT_PUBLIC_GOOGLE_SHEET_ID=your_sheet_id_here
```

**Google Sheet Requirements:**
- 3 tabs: MASTER_LIST, EXCLUSIONS, VOLTAGE_MAP
- Set to "Anyone with link can view"
- That's it!

**No credentials, no authentication, no complexity!** ✨
