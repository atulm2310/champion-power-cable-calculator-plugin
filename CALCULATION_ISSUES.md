# Calculation Issues Found - Comparison with Excel

## 🔴 Critical Issues Identified

### Issue #1: Inconsistent CoF Usage in Pull Tension Calculations

**Location:** `assets/js/power_cable_calc.js` lines 1701-1743

**Problem:**
The code uses DIFFERENT coefficient variables for Upward vs Downward vs Horizontal:

```javascript
// UPWARD Pull (line 1703):
SS_PT = incomingTension + _length * pullCalculator.totalWeight * (
    Math.sin((_slope_deg * Math.PI) / 180) + pull_BCoF * Math.cos((_slope_deg * Math.PI) / 180)
);

// DOWNWARD Pull (line 1716):
SS_PT = incomingTension - _length * pullCalculator.totalWeight * (
    Math.sin((_slope_deg * Math.PI) / 180) - pullCalculator.ECoF * Math.cos((_slope_deg * Math.PI) / 180)
);

// HORIZONTAL Pull (line 1738):
SS_PT = incomingTension + _length * pullCalculator.totalWeight * pullCalculator.ECoF;
```

**Issue:**
- Upward uses: `pull_BCoF`
- Downward uses: `pullCalculator.ECoF`
- Horizontal uses: `pullCalculator.ECoF`

While these SHOULD be the same value (both = BCoF × Weight Correction), using different variable names is inconsistent and could lead to bugs.

**Expected:** Should consistently use the SAME variable (preferably `pullCalculator.ECoF`) across all three cases.

---

### Issue #2: Potential Missing "Begin New Pull" Logic

**Location:** `assets/js/power_cable_calc.js` lines 1596-1621

**Problem:**
The "Begin new pull in this segment" logic checks for:
```javascript
if (_i > 1) {
    var begin_segment = parseFloat($(
        ".segments-item .seg_" + _i + " [name='segment-build-list-begin-segment']"
    ).val());
    if (isNaN(begin_segment)) {
        incomingTension = parseFloat(outgoingTensionNoFixed);
    } else {
        incomingTension = begin_segment;
    }
}
```

**Issue:** This checks if the value exists, but the UI sends "Yes" as a string, not a number. The `parseFloat("Yes")` will return `NaN`, which means it always uses the previous segment's tension instead of resetting.

**Expected:** Should check for the actual checkbox state or "Yes" string value.

---

### Issue #3: Wrong Formula for "Complex" SWBP

**Location:** `assets/js/power_cable_calc.js` lines 1788-1798

**Current Code:**
```javascript
if (pullCalculator.pullConfiguration == "Single") {
    SWBP = outgoingTension / Ri_ft;
} else if (pullCalculator.pullConfiguration == "Triangular") {
    SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
} else if (pullCalculator.pullConfiguration == "Cradled") {
    SWBP = (3 * pullCalculator.weightCorrection - 2) * (outgoingTension / (3 * Ri_ft));
} else {
    SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
}
```

**Issue:** The `else` clause (for "Complex" configuration) uses the Triangular formula.

**Expected Based on Excel:**
- **Complex** configuration should potentially use a different formula or at minimum should be explicitly handled, not fall through to the Triangular formula.

---

### Issue #4: Segment Direction Detection Logic

**Location:** `assets/js/power_cable_calc.js` lines 1390-1427

**Problem:**
The code builds the `indexDirection` string by iterating segments BACKWARDS:

```javascript
for (let i = segments.length - 1; i >= 0; i--) {
    var v = segments[i];
    var dir = v["segment-build-list-slope-direction"];
    // ...
    var dir1 = indexArray[dir] || 1;
    var dir2 = 0;
    if (segments[i - 1] && segments[i - 1]["segment-build-list-slope-direction"] !== "") {
        dir2 = indexArray[segments[i - 1]["segment-build-list-slope-direction"]] || 0;
    }
    indexDirection += dir1 + "" + dir2 + "&";
    pullCalculator.directions[segments.length - 1 - i] = ...
}
```

**Issue:**
1. Iterating backwards but building string forward creates confusing logic
2. The `dir1 + "" + dir2` concatenation creates pairs like "11", "12", "13", "21", "22", "23", "31", "32", "33"
3. These are sent to PHP for database lookup, but the meaning is unclear

**Expected:** Should clearly document what these index pairs mean and ensure they match Excel's expected values.

---

### Issue #5: Data Type Inconsistencies

**Location:** Multiple places in calculation flow

**Problem:**
```javascript
// Line 1761: Converted to string
outgoingTensionNoFixed = outgoingTension = result.toFixed(2);

// Line 1816: Converted to number
outgoingTension = Math.round(outgoingTension);

// Line 1825-1826: Converted to string with comma
outgoingTension = outgoingTension.toString().replace(".", ",");
```

**Issue:**
Values are converted between string/number multiple times which can cause precision loss and comparison issues.

**Expected:**
Keep values as numbers throughout calculations, only convert to formatted strings at final display.

---

### Issue #6: Missing Validation for Empty/Zero Radius

**Location:** `assets/js/power_cable_calc.js` line 1786

**Current:**
```javascript
var Ri_ft = (elbow_radius / 12).toFixed(3);
var SWBP = 0;
if (pullCalculator.pullConfiguration == "Single") {
    SWBP = outgoingTension / Ri_ft;  // Division by zero if radius = 0!
}
```

**Issue:**
If `elbow_radius` is 0, then `Ri_ft` is "0.000" (string), and division by this creates `Infinity`.

**Expected:**
Should check if radius > 0 before calculating SWBP, or handle the infinity case.

---

### Issue #7: Coefficient Column Logic

**Location:** `assets/js/power_cable_calc.js` lines 1470-1476

**Current:**
```javascript
data: {
    // ...
    coefficient_column: pullCalculator.coefficient_of_friction_column,
    cableSum: pullCalculator.cablesSum,
    pullConfiguration: pullCalculator.pullConfiguration,
    // ...
}
```

**Issue:**
The `coefficient_of_friction_column` is sent as data but it's not clear how this is determined. Looking back, I don't see where this value is set based on the cable configuration.

**Expected:**
Should set `coefficient_column` based on:
- Column 2: Single cable pull
- Column 3: Multiple cable pull
- Column 4: Single multi-conductor pull

---

## 📊 Recommended Fixes Priority

### High Priority (Critical for Accuracy):
1. **Fix CoF variable consistency** - Use same variable name throughout
2. **Fix "Begin New Pull" logic** - Properly detect string "Yes" value
3. **Fix data type handling** - Keep numbers as numbers
4. **Add zero-radius protection** - Prevent division by zero

### Medium Priority (Important for Completeness):
5. **Fix Complex SWBP formula** - Explicitly handle Complex case
6. **Verify coefficient column selection** - Ensure correct CoF is looked up

### Low Priority (Code Quality):
7. **Clean up segment direction logic** - Add documentation and simplify

---

## 🔧 Detailed Fix Recommendations

### Fix #1: Consistent CoF Usage

**Change in lines 1701-1743:**
```javascript
// Change ALL occurrences to use pullCalculator.ECoF

if (v == "U") {
    SS_PT = incomingTension + _length * pullCalculator.totalWeight * (
        Math.sin((_slope_deg * Math.PI) / 180) + pullCalculator.ECoF * Math.cos((_slope_deg * Math.PI) / 180)
    );
    // ... same for v600 and ALT
} else if (v == "D") {
    SS_PT = incomingTension - _length * pullCalculator.totalWeight * (
        Math.sin((_slope_deg * Math.PI) / 180) - pullCalculator.ECoF * Math.cos((_slope_deg * Math.PI) / 180)
    );
    // ... same for v600 and ALT
} else {
    SS_PT = incomingTension + _length * pullCalculator.totalWeight * pullCalculator.ECoF;
    // ... same for v600 and ALT
}
```

### Fix #2: Begin New Pull Detection

**Change around line 1612-1616:**
```javascript
// OLD:
if ($(selector).length > 0 && $(selector).val() == "Yes") {
    incomingTension = parseFloat($("#incoming-tension").val());
}

// This part looks correct, but it comes AFTER the parseFloat check
// Move this check BEFORE the parseFloat logic or combine them
```

### Fix #3: Protect Against Zero Radius

**Change around line 1786-1798:**
```javascript
var elbow_radius = parseFloat($(
    ".segments-item .seg_" + _i + " [name='segment-build-list-elbow-radius']"
).val()) || 0;

var SWBP = 0;
if (elbow_radius > 0) {
    var Ri_ft = elbow_radius / 12;  // Keep as number, not string

    if (pullCalculator.pullConfiguration == "Single") {
        SWBP = outgoingTension / Ri_ft;
    } else if (pullCalculator.pullConfiguration == "Triangular") {
        SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
    } else if (pullCalculator.pullConfiguration == "Cradled") {
        SWBP = (3 * pullCalculator.weightCorrection - 2) * (outgoingTension / (3 * Ri_ft));
    } else if (pullCalculator.pullConfiguration == "Complex") {
        // Define explicit formula for Complex
        SWBP = (pullCalculator.weightCorrection * outgoingTension) / (2 * Ri_ft);
    }
}
```

### Fix #4: Keep Numbers as Numbers

**Change around line 1755-1762:**
```javascript
// OLD:
var result = SS_PT * powValue;
if (isNaN(result)) {
    outgoingTensionNoFixed = outgoingTension = 0;
} else {
    outgoingTensionNoFixed = outgoingTension = result.toFixed(2);  // BAD: converts to string
}

// NEW:
var result = SS_PT * powValue;
if (isNaN(result)) {
    outgoingTensionNoFixed = outgoingTension = 0;
} else {
    outgoingTensionNoFixed = outgoingTension = result;  // Keep as number
}
```

---

## 🧪 Testing After Fixes

After implementing these fixes, test with:

1. **Single cable horizontal** - Verify SWBP calculation
2. **Multiple cables upward slope** - Verify CoF consistency
3. **Segment with zero radius** - Should not cause division error
4. **Begin new pull checkbox** - Should reset tension correctly
5. **Complex configuration** - Verify SWBP matches expected

---

## ❓ Questions Needing Clarification

1. What is the exact SWBP formula for "Complex" configuration in Excel?
2. What do the index direction pairs (like "11", "12", etc.) represent?
3. Should the coefficient column be auto-selected based on cable configuration?
4. Are there any other Excel-specific calculation nuances we're missing?
