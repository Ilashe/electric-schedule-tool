# GOOGLE SHEETS SETUP - COPY & PASTE DATA

## Sheet 1: MASTER_LIST

**Instructions:**
1. Copy your entire MASTER LIST from ElectricalSchedule-Template.xlsm
2. Paste into Google Sheet starting at cell A1
3. Make sure column headers are EXACTLY:
   - A: (empty or row number)
   - B: (empty)
   - C: (empty)
   - D: PART_NUM
   - E: (empty)
   - F: DESCRIPTION
   - G: HP
   - H: PHASE
   - I: VOLTS
   - J: AMPS
   - K: CB
   - L: PORT
   - M: COLD
   - N: HOT
   - O: RECLAIM
   - P: GAL_MIN
   - Q: BTUH

**Format:**
- Row 1: Headers (PART_NUM, DESCRIPTION, HP, PHASE, VOLTS, AMPS, CB, PORT, COLD, HOT, RECLAIM, GAL_MIN, BTUH)
- Row 2+: Data (1,621 items from your Excel file)
- Sub-components have `-` prefix in DESCRIPTION column

---

## Sheet 2: EXCLUSIONS

**Copy this data exactly:**

```
PART_NUMBER
CB1AMA-23-13-S-CL
CB1AMA-50-13-S-CL
CB1AMC-23-13
CB1AMC-50-13
COMP-FLTR-REG-3-4IN
COMP-PRESS-GAUGE
DISPENSEIT-10-INJ-KIT
FGPIT-CLM-K
FGPIT-MOLD-K
FGPIT-MOLD-K-4X12
MC1E-12W79L-S-CL-AVW-BL
MCC-460
MCC-5-460-VFD
RC3DG-UHMW
RB1AMC-23-13
RB1AMA-23-13
TR1HB-82
TR1-BUN-RED
WA1M-00-510-5220-SS-CL-BL
WA1M-72-510-5220-CORE
WA2F-0318
```

**Total: 21 items to exclude (cores, brushes, grating, guides, etc.)**

---

## Sheet 3: VOLTAGE_MAP

**Copy this data exactly:**

```
COUNTRY	3PHASE	1PHASE
USA	460	120
Canada	575	120
Australia	415	240
UK	400	230
Mexico	440	127
```

**Instructions:**
- Column A: COUNTRY
- Column B: 3PHASE (3-phase voltage)
- Column C: 1PHASE (1-phase voltage)

---

## Summary

Your Google Sheet should have 3 tabs:
1. **MASTER_LIST** - 1,621 equipment items (copy from Excel)
2. **EXCLUSIONS** - 21 non-electrical items (copy from above)
3. **VOLTAGE_MAP** - 5 country voltage configurations (copy from above)

Once created:
1. Share with "Anyone with link can view"
2. Share with your Google Service Account email (Editor access)
3. Copy the Sheet ID from the URL
4. Add to Vercel environment variables

---

## Notes

- The MASTER_LIST is your source of truth - edit anytime!
- Add new equipment by adding rows
- Remove equipment by deleting rows
- No code changes needed - tool fetches live data
- Changes take effect immediately

---

## Column Mapping

From Excel MASTER LIST to Google Sheet:
- Column D → PART_NUM (exact match for lookups)
- Column F → DESCRIPTION (sub-components have `-` prefix)
- Column G → HP
- Column H → PHASE (1 or 3)
- Column I → VOLTS (base voltage)
- Column J → AMPS
- Column K → CB (circuit breaker)
- Columns L-Q → PORT, COLD, HOT, RECLAIM, GAL_MIN, BTUH

The tool will:
1. Look up part numbers EXACTLY (case-sensitive)
2. Read sub-components (items with `-` in description)
3. Skip exclusions automatically
4. Convert voltage based on country
5. Count motors sequentially
6. Apply smart nesting (A/AA, B/BA, etc.)
