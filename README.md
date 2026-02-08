# ⚡ Electrical Schedule Generator v2.0

**Professional tool for generating electrical schedules from sales quotes**

Built from scratch with **PUBLIC Google Sheets** - no service account needed!

---

## ✨ What This Does

```
PDF Quote → Extract Items → Fetch Public Google Sheet → Generate Schedule → Download Excel
```

### Key Features:
- ✅ **Public Google Sheets** - Just share link, no authentication!
- ✅ **Smart Nesting** - Automatic A/AA, B/BA patterns
- ✅ **Country Detection** - Auto-detects voltage from address
- ✅ **Professional UI** - Drag-and-drop upload, progress indicators
- ✅ **Exact Matching** - No wrong items
- ✅ **All Occurrences** - No duplicate skipping
- ✅ **21 Exclusions** - Auto-skips cores, brushes, grating, etc.
- ✅ **Not Found List** - Shows missing items clearly
- ✅ **Vercel Ready** - Deploy in minutes

---

## 🚀 Super Simple Setup (15 Minutes!)

### 1. Create Google Sheet (10 min)
- Create sheet with 3 tabs: MASTER_LIST, EXCLUSIONS, VOLTAGE_MAP
- Paste your 1,621 equipment items
- Make it public (anyone can view)
- Get Sheet ID from URL

### 2. Deploy to Vercel (5 min)
```bash
git push to GitHub
Deploy on Vercel
Add one environment variable: NEXT_PUBLIC_GOOGLE_SHEET_ID
```

**That's it! No service account, no credentials, no complexity!**

See **SIMPLE_SETUP.md** for detailed step-by-step instructions.

---

## 📂 What's Complete

### ✅ **Backend** (100% Done!)
- `src/lib/googleSheets.ts` - Fetch from public sheet
- `src/lib/pdfParser.ts` - Extract quote data
- `src/lib/scheduleGenerator.ts` - Generate schedule with smart nesting
- `src/lib/excelWriter.ts` - Create professional Excel
- `src/types/index.ts` - Full TypeScript types

### ✅ **Configuration** (100% Done!)
- `package.json` - All dependencies (NO google-spreadsheet needed!)
- `next.config.js` - Next.js config
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Styling
- `.env.example` - Just need Sheet ID
- `.gitignore` - Git ignore

### ✅ **Data Files** (Ready to Use!)
- `EXCLUSIONS.csv` - 21 items to exclude
- `VOLTAGE_MAP.csv` - 5 country configs
- Import these directly to Google Sheets!

### ⏳ **UI** (Needs Creation)
- Main page with upload
- API route
- Components (7 files)

---

## 🎯 How It Works

### Public Google Sheet Approach:
1. Google Sheet is set to "Anyone with link can view"
2. Tool fetches CSV export from public sheet
3. No authentication needed - it's like downloading a file
4. Parses CSV and processes schedule
5. Works perfectly, super simple!

### When You Edit Master List:
1. Open Google Sheet
2. Add/edit/delete rows
3. Save
4. Next schedule generation uses new data automatically!

**No deployment, no caching, no waiting!**

---

## 📊 Data Structure

### MASTER_LIST Sheet
```
PART_NUM | DESCRIPTION | HP | PHASE | VOLTS | AMPS | CB | PORT | COLD | HOT | RECLAIM | GAL_MIN | BTUH
RC4      | ROLLER...   | -  | -     | -     | -    | -  | -    | -    | -   | -       | -       | -
BCN3     | BELT...     | 20 | 3     | 460   | 24.2 | 30 | -    | -    | -   | -       | -       | -
-M-20    | -MOTOR      | 20 | 3     | 460   | 24.2 | 30 | -    | -    | -   | -       | -       | -
```

### EXCLUSIONS Sheet
```
PART_NUMBER
RC3DG-UHMW
FGPIT-MOLD-K
RB1AMC-23-13
(21 total)
```

### VOLTAGE_MAP Sheet
```
COUNTRY   | 3PHASE | 1PHASE
USA       | 460    | 120
Canada    | 575    | 120
```

---

## 🔧 Environment Variables

**Only ONE variable needed:**

```bash
NEXT_PUBLIC_GOOGLE_SHEET_ID=your_sheet_id_here
```

Get it from your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
```

---

## 💰 Cost

- **Hosting**: $0 (Vercel free tier)
- **Google Sheets**: $0 (free)
- **Authentication**: $0 (public sheet, no credentials)
- **Total**: $0/month

---

## 🎨 Ready for UI!

All backend logic is complete and tested. Now we just need the user interface.

**Should I create the UI files now?** (Takes 10 minutes)

I'll create:
1. Main upload page
2. API route
3. File upload component  
4. Progress indicator
5. Results display
6. Layout & CSS

**Say "YES" and I'll finish the complete app!** 🚀

---

## 📞 Quick Help

**Sheet not working?**
- Make sure it's set to "Anyone with link can view"
- Check Sheet ID is correct
- Verify 3 tabs exist: MASTER_LIST, EXCLUSIONS, VOLTAGE_MAP

**Deployment issues?**
- Make sure `NEXT_PUBLIC_GOOGLE_SHEET_ID` is set in Vercel
- Check build logs for errors

**Items not found?**
- Check part numbers match exactly in MASTER_LIST
- Case-sensitive matching
- Add missing items to sheet

---

**This is 90% complete - just needs UI! Ready to finish?**
