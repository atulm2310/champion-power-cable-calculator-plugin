# Champion Power Cable Calculator - Excel Analysis

## Overview
This document analyzes the ChampPullv1.75.xls file and compares it with the current WordPress plugin implementation.

## Excel File Structure

The Excel file contains 8 sheets:

### 1. Power Cable Pull (Main Sheet)
This is the primary calculator interface for power cable calculations.

**Sections:**
- **Project Information**
  - Pull Profile Date
  - Project Name
  - Contractor
  - Calculated By
  - Notes

- **Project Inputs**
  - Raceway (dropdown: Champion Fiberglass types)
  - Trade Size (dropdown: depends on raceway)
  - Conduit Type (dropdown: IPS, PVC Sch 40, PVC Sch 80, HDPE Sch 40, EMT, Galvanized-Coated RC, Aluminum-Coated RC)
  - NEC Minimum Trade Size (calculated)
  - Incoming Tension (lbs)
  - Project Notes (Grip Type, Lubricant)

- **Cable Information**
  - **Phase Cables:**
    - # Cables, CU/AL, Size, CC Count, Voltage, V/kV, Armor, Jacket, O.D., Lbs/ft
  - **Ground Cables:**
    - Same fields as Phase
  - **Cable Summary:**
    - Total # of Cables (calculated)
    - Pull Configuration (calculated: Blank/Single/Triangular/Cradled/Complex)
    - Total Weight (lbs/ft) (calculated)
    - Weight Correction (calculated)

- **Pull Profile Summary**
  - Cable description
  - Raceway type
  - Conduit Condition
  - Conduit ID
  - Conduit Fill %
  - NEC Max %
  - Cable Clearance (in)
  - Configuration
  - Coefficient of Friction (calculated)
  - Weight Correction Factor (calculated)
  - Max. Continuous Tension (lbs)
  - Max. Reverse Pull Tension (lbs)
  - Jam Probability (calculated)
  - Maximum Pulling Limit (PL) (lbs)
  - Maximum SWBP Limit (lbs/ft)
  - Length of SS / B / Total (ft)

- **Comparison of Conduit Types**
  - Champion Fiberglass vs Other conduits
  - Install Man/Hrs Est. (NECA 2022)
  - Maximum Support Distance (ft)
  - Coefficient of Friction comparison
  - Total Conduit Weight (lbs)
  - Cable Fault analysis
  - Material Cost $/100 ft

- **Segment Build List**
  - Up to 18 segments
  - Each segment has:
    - Seg #
    - Segment Note
    - **Straight Section:**
      - Slope (Deg)
      - Slope Direction (Horizontal/Up/Down)
      - Length (ft)
    - **Bend Section:**
      - Type (dropdown)
      - Direction (dropdown)
      - Elbow Angle (Deg)
      - Elbow Radius (in)
    - **Continuous Tension/SWBP:**
      - Tension (lbs) - calculated
      - SWBP (lbs/ft) - calculated
    - Begin New Pull in this Segment (checkbox)

- **Project Overrides**
  - Coefficient of Friction (override)
  - Pull Configuration (override)
  - Maximum Pulling Limit (lbs) (override)
  - Maximum SWBP Limit (lbs/ft) (override)
  - Notes

### 2. 600V Pull Sheet
Similar to Power Cable Pull but for 600V and under applications.

**Key Differences:**
- Includes Neutral cable section (in addition to Phase and Ground)
- Different cable type dropdown (THHN, XHHW, etc.)
- Simplified cable information fields (no CC Count, Voltage, V/kV, Armor)

### 3. Help Information
User documentation and instructions for using the calculator.

### 4. Calculation Sheet
Backend calculation sheet with formulas for:
- Conduit diameter lookups
- Weight calculations
- Tension calculations for each segment
- SWBP (Sidewall Bearing Pressure) calculations
- Coefficient of friction calculations
- Pull tension formulas
- Reverse pull calculations

### 5. Lists
Dropdown list values and lookup tables for:
- Cable clearance calculations
- Pulling configuration lookup
- NEC fill calculations
- Weight correction factor tables
- Jam probability tables

### 6. Tables
Data tables for:
- 600V Wire Profiles (NEC Chapter 9, Table 5)
- Maximum Allowable Conductor Stress
- Conduit diameters
- Weight per foot by cable type
- Maximum pull tensions by conductor type and size

### 7. ddLists
Additional dropdown lists for form fields

### 8. Images
Images and diagrams for documentation

## Key Calculations from Excel

### 1. NEC Minimum Trade Size
```
Based on cable cross-sectional area and NEC fill percentages:
- 1 cable: 53% max fill
- 2 cables: 31% max fill
- 3+ cables: 40% max fill
```

### 2. Weight Correction Factor
Depends on pull configuration and cable arrangement:
- **Blank/Empty**: 1.0
- **Single**: 1.0
- **Triangular (2 cables)**: `1 / sqrt(1 - (OD / (ID - OD))^2)`
- **Cradled (3 cables)**: `1 + (4/3) * (OD / (ID - OD))^2`
- **Triangular (3 cables)**: Same as 2-cable triangular
- **Complex (4+ cables)**: 1.4

### 3. Coefficient of Friction
Lookup table based on:
- Raceway type
- Jacket material
- Number of cables
- Conduit condition

### 4. Pull Tension Calculations
For each segment:

**Straight Section:**
```
Tension_out = Tension_in * e^(μ * θ)
Where:
- μ = coefficient of friction
- θ = angle of slope in radians
```

**Bend Section:**
```
Tension_out = Tension_in * e^(μ * θ / R)
Where:
- θ = elbow angle in radians
- R = elbow radius
```

### 5. SWBP (Sidewall Bearing Pressure)
```
SWBP = (Tension * Weight_Correction) / Radius
```

### 6. Jam Probability
Based on ratio of cable diameter to conduit diameter:
- D/dx ≤ 3.0: Various risk levels
- Table lookup based on calculated ratio

## Current Plugin Implementation Status

### ✅ Implemented Features:
1. Dual mode support (regular/v600)
2. Project Information section
3. Project Inputs with dynamic dropdowns
4. Cable Information forms for Phase/Neutral/Ground
5. Cable Summary calculations (total cables, weight)
6. Pull Profile Summary display
7. Segment Build List (18 segments)
8. Pull Configuration detection
9. Weight Correction calculation
10. Coefficient of Friction lookup
11. NEC Minimum Trade Size calculation
12. Conduit ID lookup
13. Segment tension calculations
14. PDF export
15. Save/Load functionality
16. Data persistence via database

### ⚠️ Partially Implemented:
1. Wire profile lookups - needs verification
2. Maximum pulling limits - basic calculation present
3. SWBP calculations - formula present but needs testing
4. Reverse pull calculations - structure present
5. Comparison charts - UI present but calculations need review

### ❌ Missing/Needs Enhancement:
1. Complete calculation formulas matching Excel exactly
2. Jam Probability calculation display
3. Cable Fault analysis display
4. Maximum Support Distance calculations
5. NECA labor hours estimates display
6. Material cost calculations
7. Comprehensive reverse pull analysis
8. Cable clearance visual display
9. Pull configuration images
10. More detailed validation messages

## Recommendations

### High Priority:
1. Verify all calculation formulas match Excel formulas exactly
2. Implement missing displays in Pull Profile Summary
3. Add Jam Probability calculation and display
4. Complete Comparison of Conduit Types section
5. Test with various cable configurations

### Medium Priority:
1. Add cable clearance visual indicators
2. Implement material cost estimation
3. Add NECA labor hours display
4. Enhance error messages and validation

### Low Priority:
1. Add help tooltips matching Excel help documentation
2. Add visual cable configuration images
3. Implement print formatting improvements

## Testing Checklist

- [ ] Test Power Cable Pull mode with various configurations
- [ ] Test 600V Pull mode with various configurations
- [ ] Verify NEC minimum trade size calculations
- [ ] Verify weight correction factors
- [ ] Test segment calculations (straight + bends)
- [ ] Test reverse pull functionality
- [ ] Verify coefficient of friction lookups
- [ ] Test with single, dual, triple, and complex cable configs
- [ ] Verify maximum pulling limits
- [ ] Test SWBP calculations
- [ ] Verify PDF export includes all data
- [ ] Test save/load functionality
