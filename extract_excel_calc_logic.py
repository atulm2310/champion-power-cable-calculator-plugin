#!/usr/bin/env python3
import xlrd

def extract_calculation_flow(filename):
    """Extract the calculation column structure from Excel"""
    try:
        workbook = xlrd.open_workbook(filename, formatting_info=False)
        sheet = workbook.sheet_by_name("Calculation Sheet")

        print("="*100)
        print("EXCEL CALCULATION FLOW - POWER CABLE SECTION")
        print("="*100)

        # Power Cable section headers are at row 61 (0-indexed: 60)
        # Data starts at row 62 (0-indexed: 61)

        print("\n📋 CALCULATION COLUMNS:")
        headers_row = 61
        for col in [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]:
            header = sheet.cell_value(headers_row, col)
            print(f"  Col {col}: {header}")

        print("\n🔍 SEGMENT CALCULATION DATA (Rows 62-70):")
        print("="*100)

        for row in range(62, 71):
            seg = sheet.cell_value(row, 1) if sheet.cell_value(row, 1) else "-"

            # Input columns
            slope_dir = sheet.cell_value(row, 5) if sheet.cell_value(row, 5) else "-"
            length = sheet.cell_value(row, 6) if sheet.cell_value(row, 6) else 0
            elbow_angle = sheet.cell_value(row, 10) if sheet.cell_value(row, 10) else 0
            elbow_radius = sheet.cell_value(row, 11) if sheet.cell_value(row, 11) else 0

            # Calculation columns
            input_tension = sheet.cell_value(row, 22) if sheet.cell_value(row, 22) else 0
            bcof = sheet.cell_value(row, 23) if sheet.cell_value(row, 23) else 0
            ecof = sheet.cell_value(row, 24) if sheet.cell_value(row, 24) else 0
            ss_pt = sheet.cell_value(row, 25) if sheet.cell_value(row, 25) else 0
            bend_radius = sheet.cell_value(row, 26) if sheet.cell_value(row, 26) else 0
            ri_ft = sheet.cell_value(row, 27) if sheet.cell_value(row, 27) else 0
            swbp = sheet.cell_value(row, 28) if sheet.cell_value(row, 28) else 0
            bcof_bend = sheet.cell_value(row, 29) if sheet.cell_value(row, 29) else 0
            ecof_bend = sheet.cell_value(row, 30) if sheet.cell_value(row, 30) else 0
            outgoing = sheet.cell_value(row, 31) if sheet.cell_value(row, 31) else 0

            if seg != "-":
                print(f"\nSegment {seg}:")
                print(f"  Input: {slope_dir}, {length} ft, {elbow_angle}°, {elbow_radius}\" radius")
                print(f"  Input Tension: {input_tension}")
                print(f"  BCoF: {bcof}, ECoF: {ecof}")
                print(f"  SS PT: {ss_pt}")
                print(f"  Bend Radius (ft): {ri_ft}")
                print(f"  BCoF(bend): {bcof_bend}, ECoF(bend): {ecof_bend}")
                print(f"  Outgoing Tension: {outgoing}")
                print(f"  SWBP: {swbp}")

        # Now check if there are any actual values in Power Cable pull sheet
        print("\n" + "="*100)
        print("CHECKING POWER CABLE PULL SHEET FOR REAL DATA")
        print("="*100)

        pc_sheet = workbook.sheet_by_name("Power Cable Pull")

        # Segment data should be around row 28-45 (rows 27-44 in 0-index)
        print("\nSegment Build List from Power Cable Pull sheet:")
        for row in range(28, 46):
            seg = row - 27
            slope = pc_sheet.cell_value(row, 3) if pc_sheet.cell_value(row, 3) else 0
            slope_dir = pc_sheet.cell_value(row, 5) if pc_sheet.cell_value(row, 5) else ""
            length = pc_sheet.cell_value(row, 6) if pc_sheet.cell_value(row, 6) else 0
            seg_type = pc_sheet.cell_value(row, 7) if pc_sheet.cell_value(row, 7) else ""
            direction = pc_sheet.cell_value(row, 8) if pc_sheet.cell_value(row, 8) else ""
            elbow_angle = pc_sheet.cell_value(row, 10) if pc_sheet.cell_value(row, 10) else 0
            elbow_radius = pc_sheet.cell_value(row, 11) if pc_sheet.cell_value(row, 11) else 0
            tension = pc_sheet.cell_value(row, 12) if pc_sheet.cell_value(row, 12) else 0
            swbp = pc_sheet.cell_value(row, 13) if pc_sheet.cell_value(row, 13) else 0

            # Only show if there's data
            if length > 0 or slope != 0 or elbow_angle > 0:
                print(f"\n  Seg {seg}:")
                print(f"    Slope: {slope}°, Dir: {slope_dir}")
                print(f"    Length: {length} ft")
                print(f"    Type: {seg_type}, Direction: {direction}")
                print(f"    Elbow: {elbow_angle}°, Radius: {elbow_radius}\"")
                print(f"    Tension: {tension} lbs")
                print(f"    SWBP: {swbp}")

        # Check CoF lookup
        print("\n" + "="*100)
        print("COEFFICIENT OF FRICTION VALUES")
        print("="*100)

        # Check the lists sheet for CoF values
        lists_sheet = workbook.sheet_by_name("Lists")
        print("\nScanning Lists sheet for CoF data...")

        for row in range(0, min(50, lists_sheet.nrows)):
            row_data = []
            has_cof = False
            for col in range(0, min(30, lists_sheet.ncols)):
                val = str(lists_sheet.cell_value(row, col)).lower()
                if 'coef' in val or 'friction' in val or 'cof' in val:
                    has_cof = True

            if has_cof:
                for col in range(0, min(30, lists_sheet.ncols)):
                    val = lists_sheet.cell_value(row, col)
                    if val:
                        row_data.append(f"[{col}]:{str(val)[:20]}")
                print(f"Row {row}: {' | '.join(row_data)}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    filename = 'ChampPullv1.75.xls'
    extract_calculation_flow(filename)
