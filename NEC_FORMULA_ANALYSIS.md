# NEC Minimum Trade Size - Excel Formula Analysis

## Excel Formula Breakdown

### Main Display Formula (Power Cable Pull Sheet)
```excel
=IF(ISBLANK(G7),"",
   IF(ISERROR(Lists!R29),"Select Alternate Trade Size or Raceway",
      "NEC Minimum Trade Size - "&Lists!R29&"'' "&I7))
```

**Logic:**
1. If G7 (raceway selection) is blank → show nothing
2. If Lists!R29 has an error → show "Select Alternate Trade Size or Raceway"
3. Otherwise → show "NEC Minimum Trade Size - " + R29 value + "'' " + I7 (conduit type)

**Where:**
- `Lists!R29` = Calculated minimum trade size (the actual value)
- `I7` = Conduit type (IPS, PVC Sch 40, etc.)

---

### Calculation Formula (Lists Sheet, Cell R29)
```excel
=@IF(R28="IPS",
    IF(R17=1,INDEX(IPSMINPC,MATCH(R25,Tables!$BK$6:$BK$18,1)+1),
       IF(R17=2,INDEX(IPSMINPC,MATCH(R25,Tables!$BL$6:$BL$18,1)+1),
                INDEX(IPSMINPC,MATCH(R25,Tables!$BM$6:$BM$18,1)+1))),
    IF(R17=1,INDEX(IDMIN,MATCH(R25,Tables!$BQ$6:$BQ$15,1)+1),
       IF(R17=2,INDEX(IDMIN,MATCH(R25,Tables!$BR$6:$BR$15,1)+1),
                INDEX(IDMIN,MATCH(R25,Tables!$BS$6:$BS$15,1)+1))))
```

---

## Formula Logic Explanation

### Step 1: Check Conduit Type
```excel
IF(R28="IPS", [IPS logic], [ID logic])
```
- `R28` = Conduit type code ("IPS" or other)

### Step 2A: IPS Conduit Logic
If conduit is IPS, use `IPSMINPC` array with these lookups:

| Cable Count (R17) | Lookup Column | Description |
|-------------------|---------------|-------------|
| 1 | Tables!$BK$6:$BK$18 | 1 cable @ 53% fill |
| 2 | Tables!$BL$6:$BL$18 | 2 cables @ 31% fill |
| 3+ | Tables!$BM$6:$BM$18 | 3+ cables @ 40% fill |

**Formula Pattern:**
```excel
INDEX(IPSMINPC, MATCH(R25, Tables!$BK$6:$BK$18, 1) + 1)
```

**What it does:**
1. `MATCH(R25, Tables!$BK$6:$BK$18, 1)`
   - Finds the position where R25 (total cable area) fits
   - `1` means find largest value ≤ R25 (descending order lookup)
2. `+ 1`
   - Adds 1 to the match position
3. `INDEX(IPSMINPC, position)`
   - Returns the trade size from IPSMINPC array at that position

### Step 2B: ID Conduit Logic
If conduit is NOT IPS, use `IDMIN` array with these lookups:

| Cable Count (R17) | Lookup Column | Description |
|-------------------|---------------|-------------|
| 1 | Tables!$BQ$6:$BQ$15 | 1 cable @ 53% fill |
| 2 | Tables!$BR$6:$BR$15 | 2 cables @ 31% fill |
| 3+ | Tables!$BS$6:$BS$15 | 3+ cables @ 40% fill |

---

## Named Ranges

### IPSMINPC
Array of IPS trade sizes in order:
```
["0", "3/4", "1", "1-1/4", "1-1/2", "2", "2-1/2", "3", "3-1/2", "4", "5", "6", "8"]
```

### IDMIN
Array of ID trade sizes in order:
```
["0", "3/4", "1", "1-1/4", "1-1/2", "2", "2-1/2", "3", "3-1/2", "4"]
```

---

## Tables Sheet Columns

### IPS Fill Calculations (Tables!BK:BM)
Columns contain calculated conduit areas at different fill percentages:

| Column | Fill % | Formula |
|--------|--------|---------|
| BK | 53% | π × (ID/2)² × 0.53 |
| BL | 31% | π × (ID/2)² × 0.31 |
| BM | 40% | π × (ID/2)² × 0.40 |

Each row corresponds to a different trade size (3/4", 1", 1-1/4", etc.)

### ID Fill Calculations (Tables!BQ:BS)
Same structure but for ID conduit types.

---

## Current PHP Implementation Issues

### What the PHP Currently Does:
```php
// Lines 503-570 in power-cable-calculator.php

1. Builds IPSMIN array with calculated fill areas
2. Iterates through array to find where cable area fits
3. Returns the NEXT trade size up
```

### Problems Identified:

#### Issue #1: Different Lookup Logic
**Excel:** Uses `MATCH(..., 1)` which finds largest value ≤ target
**PHP:** Uses iteration with `<=` comparison

**Result:** Might select different trade size in edge cases.

#### Issue #2: Index Offset
**Excel:** `MATCH(...) + 1` adds 1 to position
**PHP:** Uses `$nextKey` which might not align

```php
// Current PHP (lines 542-556):
if ($_POST["cables"] == 1 && ($v["1"] >= $finalIPSMIN && $v[">2"] <= (float) $_POST["total_cable"])) {
    $finalIPSMIN = $v["1"];
    $IPSMIndex = $IPSMIN[$nextKey]["code"];
    $type = 1;
}
```

**Problem:** The condition checks `$v[">2"] <= total_cable` which doesn't make sense for 1-cable scenario.

#### Issue #3: Wrong Comparison Column
The condition uses column ">2" (40% fill) for comparison but should use the appropriate column:
- 1 cable: Use column "1" (53% fill)
- 2 cables: Use column "2" (31% fill)
- 3+ cables: Use column ">2" (40% fill)

---

## Corrected PHP Logic

### What It Should Do:

```php
// Pseudo-code for correct logic:

1. Calculate total cable area (R25 in Excel)
2. Determine cable count (R17 in Excel)
3. Determine conduit type (R28 in Excel: IPS vs ID)

4. Based on cable count, select the appropriate fill column:
   - 1 cable: 53% fill column
   - 2 cables: 31% fill column
   - 3+ cables: 40% fill column

5. Find the SMALLEST conduit size where:
   (Conduit Area × Fill %) >= Total Cable Area

6. Return that trade size
```

### Correct Algorithm:

```php
// For each trade size in ascending order:
foreach ($tradeSizes as $size) {
    // Get conduit ID for this trade size
    $conduitID = getConduitID($size, $conduitType);

    // Calculate allowed cable area based on fill %
    $allowedArea = π × ($conduitID/2)² × $fillPercentage;

    // If cable area fits:
    if ($totalCableArea <= $allowedArea) {
        return $size; // This is the minimum trade size
    }
}
```

---

## Required Fixes

### Fix #1: Use Correct Fill Column for Comparison

**Change from:**
```php
if ($_POST["cables"] == 1 && ($v["1"] >= $finalIPSMIN && $v[">2"] <= (float) $_POST["total_cable"])) {
```

**Change to:**
```php
if ($_POST["cables"] == 1 && (float)$_POST["total_cable"] <= $v["1"]) {
```

### Fix #2: Find FIRST Matching Size (Not Last)

**Current:** Loops through all sizes, keeps updating (returns largest)
**Should:** Return immediately when first match found (returns smallest)

```php
foreach ($IPSMIN as $k => $v) {
    if ($_POST["cables"] == 1 && (float)$_POST["total_cable"] <= $v["1"]) {
        return $v["code"]; // Return immediately
    }
    if ($_POST["cables"] == 2 && (float)$_POST["total_cable"] <= $v["2"]) {
        return $v["code"];
    }
    if ($_POST["cables"] >= 2 && (float)$_POST["total_cable"] <= $v[">2"]) {
        return $v["code"];
    }
}
```

### Fix #3: Return Current Index, Not Next

**Excel:** Returns the matching index + 1 from the TRADE SIZE array
**PHP:** Should return the trade size at the matching position

```php
// Instead of:
$IPSMIndex = $IPSMIN[$nextKey]["code"];

// Use:
$IPSMIndex = $v["code"]; // or $v["original"] for fraction format
```

---

## Testing Examples

### Example 1: 3 Cables @ 1.0" OD Each

**Input:**
- Cable count: 3
- Cable OD: 1.0"
- Total area: 3 × π × (1.0/2)² = 3 × 0.785 = 2.356 in²

**Lookup:** 3+ cables → 40% fill column

**For IPS trade sizes:**
- 3/4" (ID=0.91): Area @ 40% = π×(0.91/2)²×0.40 = 0.260 in² ❌ Too small
- 1" (ID=1.18): Area @ 40% = π×(1.18/2)²×0.40 = 0.437 in² ❌ Too small
- 1-1/4" (ID=1.50): Area @ 40% = π×(1.50/2)²×0.40 = 0.707 in² ❌ Too small
- 1-1/2" (ID=1.77): Area @ 40% = π×(1.77/2)²×0.40 = 0.983 in² ❌ Too small
- 2" (ID=2.25): Area @ 40% = π×(2.25/2)²×0.40 = 1.590 in² ❌ Too small
- 2-1/2" (ID=2.72): Area @ 40% = π×(2.72/2)²×0.40 = 2.324 in² ❌ Too small
- 3" (ID=3.20): Area @ 40% = π×(3.20/2)²×0.40 = 3.217 in² ✅ **FITS!**

**Expected Result:** "NEC Minimum Trade Size - 3'' IPS"

---

## Summary of Required Changes

1. ✅ Fix comparison logic to check `totalCableArea <= allowedArea`
2. ✅ Use correct fill column based on cable count
3. ✅ Return FIRST matching size (smallest that fits)
4. ✅ Return current index, not next index
5. ✅ Fix >= 2 condition to be >= 3 for 40% fill

These changes will make the PHP match the Excel MATCH/INDEX logic exactly.
