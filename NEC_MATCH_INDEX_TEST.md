# NEC Minimum Trade Size - MATCH/INDEX +1 Logic Test

## Excel Formula Logic

```excel
=INDEX(IPSMINPC, MATCH(R25, Tables!$BM$6:$BM$18, 1) + 1)
```

**What this does:**
1. `MATCH(R25, Tables!$BM$6:$BM$18, 1)` - Find LARGEST conduit area ≤ cable area
2. `+1` - Add 1 to the position
3. `INDEX(IPSMINPC, position)` - Return trade size at that position

**Key insight:** This finds the conduit that's TOO SMALL or just barely fits, then returns the NEXT size up.

---

## Test Case 1: 3 Cables @ 0.75" OD Each (From Excel Example)

**Input:**
- Cable count: 3
- Cable OD: 0.75"
- Total cable area: 3 × π × (0.75/2)² = 3 × 0.4418 = **1.325 in²**

**Lookup:** 3+ cables → 40% fill column (">2")

**IPS Conduit Areas @ 40% Fill:**
```
Position  Trade Size  Conduit Area (40% fill)
0         0           0.000
1         3/4         0.260
2         1           0.437
3         1-1/4       0.707
4         1-1/2       0.983
5         2           1.590  ← First conduit area > 1.325
6         2-1/2       2.324
7         3           3.217
```

**MATCH Logic:**
- Find LARGEST conduit area ≤ 1.325
- Check: 0.983 ≤ 1.325? YES ✓ (position 4)
- Check: 1.590 ≤ 1.325? NO ✗ (STOP)
- **Matched position: 4** (1-1/2" conduit)

**INDEX +1 Logic:**
- Next position: 4 + 1 = 5
- Trade size at position 5: **"2"**

**Expected Result:** `"NEC Minimum Trade Size - 2'' IPS"`

---

## Test Case 2: 1 Cable @ 1.0" OD

**Input:**
- Cable count: 1
- Cable OD: 1.0"
- Total cable area: π × (1.0/2)² = **0.785 in²**

**Lookup:** 1 cable → 53% fill column ("1")

**IPS Conduit Areas @ 53% Fill:**
```
Position  Trade Size  Conduit Area (53% fill)
0         0           0.000
1         3/4         0.346
2         1           0.582
3         1-1/4       0.940  ← First conduit area > 0.785
4         1-1/2       1.309
5         2           2.113
```

**MATCH Logic:**
- Find LARGEST conduit area ≤ 0.785
- Check: 0.582 ≤ 0.785? YES ✓ (position 2)
- Check: 0.940 ≤ 0.785? NO ✗ (STOP)
- **Matched position: 2** (1" conduit)

**INDEX +1 Logic:**
- Next position: 2 + 1 = 3
- Trade size at position 3: **"1-1/4"**

**Expected Result:** `"NEC Minimum Trade Size - 1-1/4'' IPS"`

---

## Test Case 3: 2 Cables @ 0.5" OD Each

**Input:**
- Cable count: 2
- Cable OD: 0.5"
- Total cable area: 2 × π × (0.5/2)² = 2 × 0.1963 = **0.393 in²**

**Lookup:** 2 cables → 31% fill column ("2")

**IPS Conduit Areas @ 31% Fill:**
```
Position  Trade Size  Conduit Area (31% fill)
0         0           0.000
1         3/4         0.202
2         1           0.340
3         1-1/4       0.550  ← First conduit area > 0.393
4         1-1/2       0.766
5         2           1.236
```

**MATCH Logic:**
- Find LARGEST conduit area ≤ 0.393
- Check: 0.340 ≤ 0.393? YES ✓ (position 2)
- Check: 0.550 ≤ 0.393? NO ✗ (STOP)
- **Matched position: 2** (1" conduit)

**INDEX +1 Logic:**
- Next position: 2 + 1 = 3
- Trade size at position 3: **"1-1/4"**

**Expected Result:** `"NEC Minimum Trade Size - 1-1/4'' IPS"`

---

## PHP Implementation

The new PHP code matches this logic:

```php
// MATCH logic: Find LARGEST conduit area that is <= cable area
foreach ($IPSMIN as $k => $v) {
    $conduitArea = (float)$v[$fillColumn];

    if ($conduitArea <= $cableArea) {
        $matchedPosition = $k;  // Keep tracking
    } else {
        break;  // Stop when conduit area > cable area
    }
}

// INDEX +1 logic: Return NEXT trade size
$nextPosition = $matchedPosition + 1;
$IPSMIndex = $IPSMIN[$nextPosition]["original"];
```

---

## Why This Fix Matters

**Old Logic:**
- Found FIRST conduit where cable area ≤ conduit area
- Returned that trade size
- Result: Would return "1-1/2" for Test Case 1

**New Logic:**
- Finds LARGEST conduit where conduit area ≤ cable area
- Returns NEXT trade size up
- Result: Returns "2" for Test Case 1 ✓

This matches Excel's MATCH(value, array, 1) + INDEX(array, position+1) logic exactly.

---

## Verification

To verify this fix works:
1. Test with 3 cables @ 0.75" OD → Should return "2'' IPS"
2. Test with 1 cable @ 1.0" OD → Should return "1-1/4'' IPS"
3. Test with 2 cables @ 0.5" OD → Should return "1-1/4'' IPS"

These should now match the Excel calculations exactly.
