# Excel Multi-Tab Calculation Flow - Complete Analysis

## Problem Statement
The plugin doesn't work because Excel uses MULTIPLE sheets working together:
1. **Power Cable Pull** - Main input/output sheet
2. **Lists** - Intermediate calculations
3. **Tables** - Lookup data tables

The plugin only implements SOME calculations but doesn't replicate the FULL chain.

---

## Excel Calculation Chain for NEC Minimum Trade Size

### Sheet 1: Power Cable Pull (User Input)
**Cell G7**: User selects Raceway (dropdown)
**Cell I7**: User selects Conduit Type (IPS, PVC Sch 40, etc.)

**Display Formula (Shows result to user):**
```excel
=IF(ISBLANK(G7),"",
   IF(ISERROR(Lists!R29),"Select Alternate Trade Size or Raceway",
      "NEC Minimum Trade Size - "&Lists!R29&"'' "&I7))
```

**What it does:**
- If no raceway selected → show nothing
- If Lists!R29 has error → show error message
- Otherwise → show "NEC Minimum Trade Size - [value]'' [conduit type]"

### Sheet 2: Lists (Calculation Sheet)

This sheet does the ACTUAL calculation. We need to know what these cells contain:

**Cell R28**: Conduit Type Code (e.g., "IPS")
**Cell R17**: Number of cables (1, 2, or 3+)
**Cell R25**: Total cable cross-sectional area (calculated)

**Cell R29 Formula (THE KEY CALCULATION):**
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

## Critical Issue: MATCH Function with Parameter `1`

### MATCH(lookup_value, lookup_array, 1)

**Parameter `1` means:**
- Find the **largest value LESS THAN OR EQUAL TO** the lookup value
- **REQUIRES** the lookup array to be in **ASCENDING order**
- Returns the **POSITION** in the array (1-based index)

**Example:**
```
Array: [0.5, 1.0, 1.5, 2.0, 2.5]
MATCH(1.8, array, 1) = 3  (finds 1.5, which is largest value ≤ 1.8)
```

### Then: INDEX(result_array, position + 1)

The `+1` means: Take the NEXT item in the result array

**Example:**
```
IPSMINPC: ["0", "3/4", "1", "1-1/4", "1-1/2", "2", "2-1/2", "3"]
Tables!BK6:BK18: [0, 0.26, 0.44, 0.70, 0.98, 1.59, 2.32, 3.22, 3.94, 4.87, 7.61, 10.96, 19.09]
  (These are conduit areas at 53% fill in ASCENDING order)

If R25 (cable area) = 2.0:
  MATCH(2.0, [0, 0.26, 0.44, 0.70, 0.98, 1.59, 2.32...], 1)
  = 6  (finds 1.59, position 6, which is largest ≤ 2.0)

  INDEX(IPSMINPC, 6+1) = INDEX(IPSMINPC, 7)
  = "2-1/2"  (the 7th item)
```

**This means:** Give me the NEXT SIZE UP from where the cable area fits!

---

## What the Plugin Is Missing

### Missing 1: Data Order
The Tables data must be in **ASCENDING order** for MATCH with parameter `1` to work.

Current plugin builds IPSMIN in order of ORIGINALIPSMIN which is ascending ✓

### Missing 2: The +1 Offset Logic
Excel: `INDEX(array, MATCH(...) + 1)` → Returns NEXT item
Plugin: Should return the item at matched position + 1

### Missing 3: Understanding MATCH(value, array, 1)
This finds position where value FITS, not where value EQUALS.

---

## Correct Algorithm

### Step-by-Step:

1. **Calculate total cable area** (R25)
   ```
   area = sum of (π × (OD/2)²) for all cables
   ```

2. **Determine cable count** (R17)
   ```
   count = phase_cables + neutral_cables + ground_cables
   ```

3. **Determine conduit type** (R28)
   ```
   type = "IPS" or other
   ```

4. **Select appropriate lookup column** based on cable count:
   - 1 cable → Tables!BK (53% fill)
   - 2 cables → Tables!BL (31% fill)
   - 3+ cables → Tables!BM (40% fill)

5. **MATCH: Find where cable area fits**
   ```
   position = MATCH(cable_area, fill_column_values, 1)
   ```
   This returns the INDEX of the largest conduit area ≤ cable area

6. **INDEX: Get NEXT trade size**
   ```
   trade_size = IPSMINPC[position + 1]
   ```

---

## Example Walkthrough

### Input:
- 3 cables @ 0.75" OD each
- Conduit type: IPS

### Step 1: Calculate cable area
```
area = 3 × π × (0.75/2)² = 3 × 0.4418 = 1.325 in²
```

### Step 2: Cable count
```
R17 = 3
```

### Step 3: Conduit type
```
R28 = "IPS"
```

### Step 4: Select lookup column
```
3 cables → Use Tables!BM (40% fill)
```

### Step 5: Tables!BM values (conduit areas @ 40% fill)
```
BK6:  0.00   (0" - dummy)
BK7:  0.26   (3/4")
BK8:  0.44   (1")
BK9:  0.70   (1-1/4")
BK10: 0.98   (1-1/2")
BK11: 1.59   (2")     ← MATCH will find this!
BK12: 2.32   (2-1/2")
BK13: 3.22   (3")
...
```

### Step 6: MATCH(1.325, [...], 1)
```
Finds largest value ≤ 1.325
→ 0.98 at position 5 (BK10)
Returns: 5
```

### Step 7: INDEX(IPSMINPC, 5+1)
```
IPSMINPC = ["0", "3/4", "1", "1-1/4", "1-1/2", "2", "2-1/2", ...]
           [  0     1      2       3        4       5      6    ...]

INDEX(IPSMINPC, 6) = "2"
```

**Result: "NEC Minimum Trade Size - 2'' IPS"**

---

## What the Current PHP Code Does Wrong

### Current Code:
```php
foreach ($IPSMIN as $k => $v) {
    if ((float)$_POST["total_cable"] <= $v[">2"]) {
        $IPSMIndex = $v["original"];
        break;
    }
}
```

**Issue:** This finds the FIRST size where cable fits, which is CORRECT!

But wait... let me re-examine the Excel formula more carefully.

### Actually...

Looking at the Excel formula again:
```excel
INDEX(IPSMINPC, MATCH(R25, Tables!$BK$6:$BK$18, 1) + 1)
```

The `+1` shifts to the NEXT size. So if cable area = 1.325 fits in 0.98 (1-1/2"), Excel returns the NEXT size (2").

**But our current code returns the size where it FIRST FITS (which would be 1-1/2").**

So we need to return the NEXT size, not the current size!

---

## The Real Fix

### Change from:
```php
if ((float)$_POST["total_cable"] <= $v[">2"]) {
    $IPSMIndex = $v["original"];  // Current size
    break;
}
```

### Change to:
```php
if ((float)$_POST["total_cable"] <= $v[">2"]) {
    // Return NEXT size (like Excel's +1)
    $nextIndex = $k + 1;
    if (isset($IPSMIN[$nextIndex])) {
        $IPSMIndex = $IPSMIN[$nextIndex]["original"];
    } else {
        // If no next size, use current (at max size)
        $IPSMIndex = $v["original"];
    }
    break;
}
```

---

## OR: Match Excel Logic More Directly

Actually, re-reading the MATCH logic:

**MATCH(1.325, [0, 0.26, 0.44, 0.70, 0.98, 1.59, ...], 1)**

This finds the **largest value ≤ 1.325**, which is **0.98** at position 5.

Then **INDEX(IPSMINPC, 5+1)** = position 6 = **"2"**

So the logic is:
1. Find largest conduit area where **conduit_area ≤ cable_area**
2. Return the **NEXT** trade size

This means: Find the conduit that's TOO SMALL, then return the next size up!

---

## Correct PHP Algorithm

```php
$IPSMIndex = "0";
$matchedPosition = -1;

// MATCH: Find largest conduit area that is LESS THAN OR EQUAL to cable area
foreach ($IPSMIN as $k => $v) {
    if (empty($v["ID"])) continue;

    // For 3+ cables, use 40% fill column
    $conduitArea = $v[">2"];

    // MATCH logic: Find largest conduit area ≤ cable area
    if ($conduitArea <= (float)$_POST["total_cable"]) {
        $matchedPosition = $k;
        // Don't break - keep going to find the LARGEST that fits
    } else {
        // Once we hit a conduit that's too small, stop
        break;
    }
}

// INDEX: Get NEXT trade size (position + 1)
if ($matchedPosition >= 0) {
    $nextPosition = $matchedPosition + 1;
    if (isset($IPSMIN[$nextPosition])) {
        $IPSMIndex = $IPSMIN[$nextPosition]["original"];
    } else {
        $IPSMIndex = "Select Larger Raceway";
    }
}
```

---

## Summary

The Excel formula uses:
1. **MATCH with parameter 1**: Find largest conduit area ≤ cable area
2. **+1 offset**: Return the NEXT trade size

Our code was returning the FIRST size where cable FITS.
We need to return the NEXT size AFTER where the cable area STOPS fitting.

This is a subtle but critical difference!
