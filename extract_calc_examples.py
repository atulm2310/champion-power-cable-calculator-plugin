#!/usr/bin/env python3
import xlrd

def check_for_examples(filename):
    """Look for any populated data in calculation sheets"""
    try:
        workbook = xlrd.open_workbook(filename, formatting_info=False)

        # Check all sheets for non-zero data
        for sheet_name in workbook.sheet_names():
            sheet = workbook.sheet_by_name(sheet_name)

            print(f"\n{'='*80}")
            print(f"Checking: {sheet_name}")
            print(f"{'='*80}")

            # Look for numeric values that might indicate example data
            found_data = False
            for row_idx in range(min(20, sheet.nrows)):
                for col_idx in range(min(30, sheet.ncols)):
                    cell = sheet.cell(row_idx, col_idx)
                    # Look for specific example values
                    if cell.ctype == 2:  # Number
                        val = cell.value
                        if val > 0 and val not in [1.0, 0.91, 10.0]:  # Exclude defaults
                            if not found_data:
                                print(f"\nFound example data:")
                                found_data = True
                            print(f"  Row {row_idx}, Col {col_idx}: {val}")

        # Create a sample test case based on typical power cable scenarios
        print("\n" + "="*80)
        print("CREATING SAMPLE TEST CASE (Typical 3-Phase Installation)")
        print("="*80)

        test_case = {
            "project_inputs": {
                "raceway": "Champion Fiberglass SW/MW/HW",
                "trade_size": "3/4",
                "conduit_type": "IPS",
                "incoming_tension": 50
            },
            "cable_information": {
                "phase": {
                    "num_cables": 3,
                    "cu_al": "CU",
                    "size": "4/0",
                    "cc_count": "1/C",
                    "voltage": 480,
                    "v_kv": "V",
                    "armor": "Aluminum",
                    "jacket": "PVC",
                    "od": 1.0,
                    "lbs_ft": 0.9
                },
                "ground": {
                    "num_cables": 1,
                    "cu_al": "CU",
                    "size": "2",
                    "od": 0.5,
                    "lbs_ft": 0.3
                }
            },
            "segments": [
                {
                    "segment": 1,
                    "slope": 0,
                    "slope_direction": "Horizontal",
                    "length": 100,
                    "type": "Sweep",
                    "direction": "Right",
                    "elbow_angle": 90,
                    "elbow_radius": 36
                },
                {
                    "segment": 2,
                    "slope": 15,
                    "slope_direction": "Up",
                    "length": 50,
                    "type": "Sweep",
                    "direction": "Up",
                    "elbow_angle": 90,
                    "elbow_radius": 36
                },
                {
                    "segment": 3,
                    "slope": 0,
                    "slope_direction": "Horizontal",
                    "length": 75,
                    "type": "Sweep",
                    "direction": "Right",
                    "elbow_angle": 90,
                    "elbow_radius": 36
                }
            ],
            "expected_results": {
                "total_cables": 4,
                "pull_configuration": "Complex",
                "total_weight_lbs_ft": 3.0,  # 3 * 0.9 + 1 * 0.3
                "weight_correction": 1.40,  # Complex = 1.4
                "nec_minimum_trade_size": "Should calculate based on fill"
            }
        }

        print("\n📋 TEST CASE 1: Three-Phase with Ground")
        print("\nProject Inputs:")
        for key, val in test_case["project_inputs"].items():
            print(f"  {key}: {val}")

        print("\nPhase Cables:")
        for key, val in test_case["cable_information"]["phase"].items():
            print(f"  {key}: {val}")

        print("\nGround Cable:")
        for key, val in test_case["cable_information"]["ground"].items():
            print(f"  {key}: {val}")

        print("\nSegments:")
        for seg in test_case["segments"]:
            print(f"  Segment {seg['segment']}:")
            print(f"    {seg['slope_direction']}: {seg['length']} ft, Slope: {seg['slope']}°")
            print(f"    Bend: {seg['elbow_angle']}° at {seg['elbow_radius']}\" radius")

        print("\nExpected Results:")
        for key, val in test_case["expected_results"].items():
            print(f"  {key}: {val}")

        # Calculate expected tensions manually
        print("\n📊 MANUAL CALCULATIONS:")

        # Cable summary
        total_weight = 3 * 0.9 + 1 * 0.3
        print(f"\nTotal Weight = (3 × 0.9) + (1 × 0.3) = {total_weight} lbs/ft")

        # Pull configuration
        print(f"Pull Configuration = Complex (4 cables)")
        print(f"Weight Correction = 1.40 (for Complex)")

        # Coefficient of friction (typical for PVC jacket in Champion FG)
        coef = 0.25  # Typical value
        print(f"\nCoefficient of Friction ≈ {coef} (PVC in Champion FG)")
        print(f"Effective CoF = {coef} × {1.40} = {coef * 1.40}")

        # Segment 1: Horizontal 100 ft
        print(f"\n🔧 Segment 1: Horizontal 100 ft with 90° bend")
        T_in = 50
        length = 100
        ecof = coef * 1.40
        T_straight = T_in + length * total_weight * ecof
        print(f"  After straight: T = {T_in} + ({length} × {total_weight} × {ecof:.2f})")
        print(f"  T_straight = {T_straight:.2f} lbs")

        import math
        T_bend = T_straight * math.exp(ecof * math.radians(90))
        print(f"  After bend: T = {T_straight:.2f} × e^({ecof:.2f} × π/2)")
        print(f"  T_out = {T_bend:.2f} lbs")

        # SWBP
        R_ft = 36 / 12
        SWBP = (1.40 * T_bend) / (2 * R_ft)  # For complex, use formula
        print(f"  SWBP = (1.40 × {T_bend:.2f}) / (2 × {R_ft})")
        print(f"  SWBP = {SWBP:.2f} lbs/ft")

        # Segment 2: Up 50 ft at 15° slope
        print(f"\n🔧 Segment 2: Up 50 ft at 15° with 90° bend")
        T_in2 = T_bend
        length2 = 50
        slope = 15
        T_straight2 = T_in2 + length2 * total_weight * (
            math.sin(math.radians(slope)) + ecof * math.cos(math.radians(slope))
        )
        print(f"  After straight: T = {T_in2:.2f} + ({length2} × {total_weight} × (sin({slope}°) + {ecof:.2f}×cos({slope}°)))")
        print(f"  T_straight = {T_straight2:.2f} lbs")

        T_bend2 = T_straight2 * math.exp(ecof * math.radians(90))
        print(f"  After bend: T = {T_straight2:.2f} × e^({ecof:.2f} × π/2)")
        print(f"  T_out = {T_bend2:.2f} lbs")

        # Segment 3: Horizontal 75 ft
        print(f"\n🔧 Segment 3: Horizontal 75 ft with 90° bend")
        T_in3 = T_bend2
        length3 = 75
        T_straight3 = T_in3 + length3 * total_weight * ecof
        print(f"  After straight: T = {T_in3:.2f} + ({length3} × {total_weight} × {ecof:.2f})")
        print(f"  T_straight = {T_straight3:.2f} lbs")

        T_bend3 = T_straight3 * math.exp(ecof * math.radians(90))
        print(f"  After bend: T = {T_straight3:.2f} × e^({ecof:.2f} × π/2)")
        print(f"  T_out = {T_bend3:.2f} lbs")

        print(f"\n✅ FINAL MAXIMUM TENSION: {T_bend3:.0f} lbs")

        import json
        with open('test_case_example.json', 'w') as f:
            json.dump(test_case, f, indent=2)
        print("\n✅ Test case saved to: test_case_example.json")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    filename = 'ChampPullv1.75.xls'
    check_for_examples(filename)
