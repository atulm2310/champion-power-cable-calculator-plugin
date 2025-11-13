# Champion Power Cable Calculator - Test Cases

**Date:** 2025-11-13
**Purpose:** Verify calculator accuracy against manual calculations

---

## Test Case 1: Three-Phase with Ground (Complex Configuration)

### Input Parameters

#### Project Inputs
| Field | Value |
|-------|-------|
| Raceway | Champion Fiberglass SW/MW/HW (ID: 1) |
| Trade Size | 3/4" |
| Conduit Type | IPS |
| Incoming Tension | 50 lbs |

#### Cable Information

**Phase Cables:**
| Field | Value |
|-------|-------|
| # Cables | 3 |
| CU/AL | CU |
| Size | 4/0 |
| CC Count | 1/C |
| Voltage | 480 |
| V/kV | V |
| Armor | Aluminum |
| Jacket | PVC |
| O.D. | 1.0 in |
| Lbs/ft | 0.9 lbs/ft |

**Ground Cable:**
| Field | Value |
|-------|-------|
| # Cables | 1 |
| CU/AL | CU |
| Size | 2 |
| O.D. | 0.5 in |
| Lbs/ft | 0.3 lbs/ft |

#### Segment Build List

**Segment 1:**
- Slope: 0°
- Direction: Horizontal
- Length: 100 ft
- Type: Sweep
- Direction: Right
- Elbow Angle: 90°
- Elbow Radius: 36 in

**Segment 2:**
- Slope: 15°
- Direction: Up
- Length: 50 ft
- Type: Sweep
- Direction: Up
- Elbow Angle: 90°
- Elbow Radius: 36 in

**Segment 3:**
- Slope: 0°
- Direction: Horizontal
- Length: 75 ft
- Type: Sweep
- Direction: Right
- Elbow Angle: 90°
- Elbow Radius: 36 in

---

### Expected Results

#### Cable Summary
| Calculation | Expected Value | Formula |
|-------------|----------------|---------|
| Total # of Cables | 4 | 3 phase + 1 ground |
| Pull Configuration | Complex | 4 cables = Complex |
| Total Weight | 3.0 lbs/ft | (3 × 0.9) + (1 × 0.3) |
| Weight Correction | 1.40 | Complex configuration |

#### Coefficient of Friction
| Parameter | Expected Value |
|-----------|----------------|
| Basic CoF (μ) | ~0.25 | PVC jacket in Champion FG |
| Effective CoF | 0.35 | 0.25 × 1.40 |

---

### Manual Calculations

#### Initial Conditions
```
Incoming Tension (T₀) = 50 lbs
Total Weight (W) = 3.0 lbs/ft
Weight Correction (WC) = 1.40
Basic CoF (μ) = 0.25
Effective CoF (ECoF) = μ × WC = 0.35
```

---

#### Segment 1: Horizontal 100 ft with 90° Bend

**Straight Section:**
```
Formula: T_out = T_in + L × W × ECoF
```
```
T_straight = 50 + (100 × 3.0 × 0.35)
T_straight = 50 + 105
T_straight = 155.00 lbs
```

**Bend Section:**
```
Formula: T_out = T_in × e^(ECoF × θ)
Where: θ = 90° = π/2 radians
```
```
T_bend = 155.00 × e^(0.35 × 1.5708)
T_bend = 155.00 × e^0.5498
T_bend = 155.00 × 1.733
T_bend = 268.59 lbs
```

**SWBP (Sidewall Bearing Pressure):**
```
Formula for Complex: SWBP = (WC × T) / (2 × R)
Where: R = 36"/12 = 3.0 ft
```
```
SWBP = (1.40 × 268.59) / (2 × 3.0)
SWBP = 376.03 / 6.0
SWBP = 62.67 lbs/ft
```

**Expected Display:**
- Tension: **269 lbs** (rounded)
- SWBP: **62.67 lbs/ft**

---

#### Segment 2: Upward 50 ft at 15° with 90° Bend

**Straight Section (Upward):**
```
Formula: T_out = T_in + L × W × (sin(θ) + ECoF × cos(θ))
```
```
T_straight = 268.59 + (50 × 3.0 × (sin(15°) + 0.35 × cos(15°)))
T_straight = 268.59 + (150 × (0.2588 + 0.35 × 0.9659))
T_straight = 268.59 + (150 × (0.2588 + 0.3381))
T_straight = 268.59 + (150 × 0.5969)
T_straight = 268.59 + 89.54
T_straight = 358.13 lbs
```

**Bend Section:**
```
T_bend = 358.13 × e^(0.35 × π/2)
T_bend = 358.13 × 1.733
T_bend = 620.59 lbs
```

**SWBP:**
```
SWBP = (1.40 × 620.59) / (2 × 3.0)
SWBP = 868.83 / 6.0
SWBP = 144.81 lbs/ft
```

**Expected Display:**
- Tension: **621 lbs** (rounded)
- SWBP: **144.81 lbs/ft**

---

#### Segment 3: Horizontal 75 ft with 90° Bend

**Straight Section:**
```
T_straight = 620.59 + (75 × 3.0 × 0.35)
T_straight = 620.59 + 78.75
T_straight = 699.34 lbs
```

**Bend Section:**
```
T_bend = 699.34 × e^(0.35 × π/2)
T_bend = 699.34 × 1.733
T_bend = 1211.87 lbs
```

**SWBP:**
```
SWBP = (1.40 × 1211.87) / (2 × 3.0)
SWBP = 1696.62 / 6.0
SWBP = 282.77 lbs/ft
```

**Expected Display:**
- Tension: **1212 lbs** (rounded)
- SWBP: **282.77 lbs/ft**

---

### Summary of Expected Results

| Segment | Tension (lbs) | SWBP (lbs/ft) |
|---------|---------------|---------------|
| 1 | 269 | 62.67 |
| 2 | 621 | 144.81 |
| 3 | **1212** | 282.77 |

**Maximum Continuous Tension:** **1212 lbs**
**Maximum SWBP:** **282.77 lbs/ft**

---

## Test Case 2: Single Cable (Horizontal)

### Input Parameters

#### Cable Information
- Phase Cables: 1
- O.D.: 0.5 in
- Weight: 0.3 lbs/ft

#### Segments
- Segment 1: 100 ft horizontal, 90° bend, 24" radius

### Expected Results

**Cable Summary:**
- Total Cables: 1
- Pull Configuration: Single
- Weight Correction: 1.0
- Total Weight: 0.3 lbs/ft

**Manual Calculation:**
```
Incoming Tension = 50 lbs
ECoF = 0.25 × 1.0 = 0.25

Straight: T = 50 + (100 × 0.3 × 0.25) = 57.5 lbs
Bend: T = 57.5 × e^(0.25 × π/2) = 57.5 × 1.276 = 73.4 lbs

SWBP (Single) = T / R = 73.4 / 2.0 = 36.7 lbs/ft
```

**Expected Display:**
- Tension: **73 lbs**
- SWBP: **36.7 lbs/ft**

---

## Test Case 3: Triangular Configuration (2 Cables)

### Input Parameters

#### Cable Information
- Phase Cables: 2
- O.D.: 0.8 in
- Weight: 0.7 lbs/ft each
- Conduit ID: 3.0 in

#### Expected Results

**Cable Summary:**
- Total Cables: 2
- Pull Configuration: Triangular
- Total Weight: 1.4 lbs/ft

**Weight Correction Calculation:**
```
Formula: WC = 1 / √(1 - (OD/(ID-OD))²)

OD = 0.8 in
ID = 3.0 in

WC = 1 / √(1 - (0.8/(3.0-0.8))²)
WC = 1 / √(1 - (0.8/2.2)²)
WC = 1 / √(1 - 0.1322)
WC = 1 / √(0.8678)
WC = 1 / 0.9315
WC = 1.07
```

**Expected Display:**
- Weight Correction: **1.07**

---

## Test Case 4: Cradled Configuration (3 Cables)

### Input Parameters

#### Cable Information
- Phase Cables: 3
- O.D.: 0.75 in
- Weight: 0.6 lbs/ft each
- Conduit ID: 3.5 in

#### Expected Results

**Cable Summary:**
- Total Cables: 3
- Pull Configuration: Cradled
- Total Weight: 1.8 lbs/ft

**Weight Correction Calculation:**
```
Formula: WC = 1 + (4/3) × (OD/(ID-OD))²

OD = 0.75 in
ID = 3.5 in

WC = 1 + (4/3) × (0.75/(3.5-0.75))²
WC = 1 + (4/3) × (0.75/2.75)²
WC = 1 + (4/3) × (0.2727)²
WC = 1 + (4/3) × 0.0744
WC = 1 + 0.0991
WC = 1.10
```

**Expected Display:**
- Weight Correction: **1.10**

---

## Test Case 5: Downward Pull with Negative Slope

### Input Parameters

#### Segments
- Segment 1: 50 ft downward at -10° slope

#### Expected Results

**Manual Calculation:**
```
Incoming Tension = 100 lbs
Weight = 2.0 lbs/ft
ECoF = 0.30
Slope = -10°

Formula: T_out = T_in - L × W × (sin(θ) - ECoF × cos(θ))

T_out = 100 - (50 × 2.0 × (sin(10°) - 0.30 × cos(10°)))
T_out = 100 - (100 × (0.1736 - 0.30 × 0.9848))
T_out = 100 - (100 × (0.1736 - 0.2954))
T_out = 100 - (100 × (-0.1218))
T_out = 100 - (-12.18)
T_out = 100 + 12.18
T_out = 112.18 lbs

Note: Tension increases slightly because friction still resists the pull
even though gravity assists (downward).
```

**Expected Display:**
- Tension: **112 lbs**

---

## NEC Fill Verification

### Test Scenario
- 3 cables @ 1.0" O.D. each
- Trade Size: 2" IPS
- Conduit ID: 2.067 in (typical for 2" IPS)

**Cable Area Calculation:**
```
Area per cable = π × (D/2)²
Area per cable = π × (1.0/2)²
Area per cable = π × 0.25
Area per cable = 0.785 in²

Total cable area = 3 × 0.785 = 2.356 in²
```

**Conduit Area:**
```
Conduit area = π × (2.067/2)²
Conduit area = π × 1.0335²
Conduit area = 3.356 in²
```

**Fill Percentage:**
```
Fill % = (Cable area / Conduit area) × 100
Fill % = (2.356 / 3.356) × 100
Fill % = 70.2%
```

**NEC Maximum for 3+ cables: 40%**

**Result:** ❌ Exceeds NEC fill - **minimum 3" trade size required**

---

## Testing Instructions

### For Each Test Case:

1. **Navigate to the calculator page** with shortcode `[power_cable_calc mode="regular"]`

2. **Enter all input parameters** exactly as specified

3. **Verify intermediate calculations:**
   - Check Cable Summary values
   - Verify Pull Configuration detection
   - Confirm Weight Correction factor

4. **Review segment calculations:**
   - Check tension values for each segment
   - Verify SWBP calculations
   - Confirm maximum values are highlighted

5. **Compare results** with expected values:
   - Tensions should match within ±5 lbs (rounding)
   - SWBP should match within ±1 lbs/ft
   - Configuration should match exactly

6. **Document any discrepancies** for investigation

---

## Acceptance Criteria

✅ **Pass:** All calculated values within acceptable tolerance
✅ **Pass:** Configurations detected correctly
✅ **Pass:** NEC fill calculations accurate
❌ **Fail:** Any value differs by >2% from expected

---

## Notes

- All calculations assume coefficient of friction μ = 0.25 for PVC jacket in Champion Fiberglass
- Actual CoF values may vary based on database lookups
- Euler's number (e) = 2.71828...
- All angles converted to radians for calculations
- Tensions rounded to nearest whole number for display
- SWBP displayed to 2 decimal places

---

## Test Data File

JSON test data available in: `test_case_example.json`
