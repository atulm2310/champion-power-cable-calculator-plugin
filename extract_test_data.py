#!/usr/bin/env python3
import xlrd
import json

def extract_test_data(filename):
    """Extract test data from the Power Cable Pull sheet"""
    try:
        workbook = xlrd.open_workbook(filename, formatting_info=False)

        # Get the "Power Cable Pull" sheet
        sheet = workbook.sheet_by_name("Power Cable Pull")

        print("="*80)
        print("EXTRACTING TEST DATA FROM EXCEL")
        print("="*80)

        # Extract Project Inputs (rows 5-12, columns vary)
        print("\n📋 PROJECT INPUTS:")
        print(f"Raceway (E5): {sheet.cell_value(5, 4)}")
        print(f"Trade Size (F6): {sheet.cell_value(6, 5)}")
        print(f"Conduit Type (H6): {sheet.cell_value(6, 7)}")
        print(f"Incoming Tension (I9): {sheet.cell_value(9, 8)}")

        # Extract Cable Information
        print("\n📦 CABLE INFORMATION:")
        print("Phase Cables:")
        try:
            num_cables = sheet.cell_value(6, 11) if sheet.cell_value(6, 11) else "Not set"
            cu_al = sheet.cell_value(6, 12) if sheet.cell_value(6, 12) else "Not set"
            size = sheet.cell_value(6, 13) if sheet.cell_value(6, 13) else "Not set"
            od = sheet.cell_value(6, 19) if sheet.cell_value(6, 19) else "Not set"
            lbs_ft = sheet.cell_value(6, 20) if sheet.cell_value(6, 20) else "Not set"

            print(f"  # Cables: {num_cables}")
            print(f"  CU/AL: {cu_al}")
            print(f"  Size: {size}")
            print(f"  O.D.: {od}")
            print(f"  Lbs/ft: {lbs_ft}")
        except:
            print("  (No phase cable data)")

        print("\nGround Cables:")
        try:
            num_cables_g = sheet.cell_value(8, 11) if sheet.cell_value(8, 11) else "Not set"
            cu_al_g = sheet.cell_value(8, 12) if sheet.cell_value(8, 12) else "Not set"
            size_g = sheet.cell_value(8, 13) if sheet.cell_value(8, 13) else "Not set"
            od_g = sheet.cell_value(8, 19) if sheet.cell_value(8, 19) else "Not set"
            lbs_ft_g = sheet.cell_value(8, 20) if sheet.cell_value(8, 20) else "Not set"

            print(f"  # Cables: {num_cables_g}")
            print(f"  CU/AL: {cu_al_g}")
            print(f"  Size: {size_g}")
            print(f"  O.D.: {od_g}")
            print(f"  Lbs/ft: {lbs_ft_g}")
        except:
            print("  (No ground cable data)")

        # Extract Cable Summary
        print("\n📊 CABLE SUMMARY:")
        try:
            total_cables = sheet.cell_value(10, 12) if sheet.cell_value(10, 12) else 0
            pull_config = sheet.cell_value(10, 15) if sheet.cell_value(10, 15) else "Not set"
            total_weight = sheet.cell_value(11, 12) if sheet.cell_value(11, 12) else 0
            weight_correction = sheet.cell_value(11, 15) if sheet.cell_value(11, 15) else 0

            print(f"Total # of Cables: {total_cables}")
            print(f"Pull Configuration: {pull_config}")
            print(f"Total Weight (lbs/ft): {total_weight}")
            print(f"Weight Correction: {weight_correction}")
        except Exception as e:
            print(f"  (Error reading summary: {e})")

        # Extract Pull Profile Summary
        print("\n🎯 PULL PROFILE SUMMARY:")
        try:
            conduit_id = sheet.cell_value(18, 2) if sheet.cell_value(18, 2) else "Not set"
            conduit_fill = sheet.cell_value(19, 2) if sheet.cell_value(19, 2) else 0
            nec_max = sheet.cell_value(20, 2) if sheet.cell_value(20, 2) else 0
            cable_clearance = sheet.cell_value(21, 2) if sheet.cell_value(21, 2) else 0
            configuration = sheet.cell_value(22, 2) if sheet.cell_value(22, 2) else "Not set"

            print(f"Conduit ID: {conduit_id} in")
            print(f"Conduit Fill: {conduit_fill} %")
            print(f"NEC Max: {nec_max} %")
            print(f"Cable Clearance: {cable_clearance} in")
            print(f"Configuration: {configuration}")

            coef_friction = sheet.cell_value(16, 7) if sheet.cell_value(16, 7) else 0
            weight_corr = sheet.cell_value(17, 7) if sheet.cell_value(17, 7) else 0
            max_tension = sheet.cell_value(18, 7) if sheet.cell_value(18, 7) else 0
            max_reverse = sheet.cell_value(19, 7) if sheet.cell_value(19, 7) else 0
            jam_prob = sheet.cell_value(20, 7) if sheet.cell_value(20, 7) else 0
            max_pl = sheet.cell_value(21, 7) if sheet.cell_value(21, 7) else 0
            max_swbp = sheet.cell_value(22, 7) if sheet.cell_value(22, 7) else 0

            print(f"Coefficient of Friction: {coef_friction}")
            print(f"Weight Correction Factor: {weight_corr}")
            print(f"Max. Continuous Tension: {max_tension} lbs")
            print(f"Max. Reverse Pull Tension: {max_reverse} lbs")
            print(f"Jam Probability: {jam_prob}")
            print(f"Maximum Pulling Limit: {max_pl} lbs")
            print(f"Maximum SWBP Limit: {max_swbp} lbs")
        except Exception as e:
            print(f"  (Error reading profile: {e})")

        # Extract Segment Build List (first 3 segments as examples)
        print("\n🔧 SEGMENT BUILD LIST (First 3 segments):")
        for seg in range(1, 4):
            row = 27 + seg  # Segments start at row 28
            try:
                slope = sheet.cell_value(row, 3) if sheet.cell_value(row, 3) else 0
                slope_dir = sheet.cell_value(row, 5) if sheet.cell_value(row, 5) else "Not set"
                length = sheet.cell_value(row, 6) if sheet.cell_value(row, 6) else 0
                seg_type = sheet.cell_value(row, 7) if sheet.cell_value(row, 7) else "Not set"
                direction = sheet.cell_value(row, 8) if sheet.cell_value(row, 8) else "Not set"
                elbow_angle = sheet.cell_value(row, 10) if sheet.cell_value(row, 10) else 0
                elbow_radius = sheet.cell_value(row, 11) if sheet.cell_value(row, 11) else 0
                tension = sheet.cell_value(row, 12) if sheet.cell_value(row, 12) else 0
                swbp = sheet.cell_value(row, 13) if sheet.cell_value(row, 13) else 0

                print(f"\nSegment {seg}:")
                print(f"  Slope: {slope}°, Direction: {slope_dir}")
                print(f"  Length: {length} ft")
                print(f"  Type: {seg_type}, Direction: {direction}")
                print(f"  Elbow Angle: {elbow_angle}°, Radius: {elbow_radius} in")
                print(f"  Tension: {tension} lbs")
                print(f"  SWBP: {swbp} lbs/ft")
            except Exception as e:
                print(f"  Segment {seg}: (No data or error: {e})")

        print("\n" + "="*80)

    except Exception as e:
        print(f"Error reading Excel file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    filename = 'ChampPullv1.75.xls'
    extract_test_data(filename)
