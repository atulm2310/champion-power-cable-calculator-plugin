#!/usr/bin/env python3
import xlrd
import re

def analyze_calculation_sheet(filename):
    """Analyze the Calculation Sheet to extract actual Excel formulas"""
    try:
        # Open with formatting_info to try to get formulas (won't work for .xls but let's try)
        workbook = xlrd.open_workbook(filename, formatting_info=False)

        # Get Calculation Sheet
        sheet = workbook.sheet_by_name("Calculation Sheet")

        print("="*100)
        print("ANALYZING EXCEL CALCULATION SHEET - LOOKING FOR CALCULATION PATTERNS")
        print("="*100)

        # Look at the calculation area more carefully
        # Based on the earlier scan, calculations start around row 14-17

        print("\n🔍 EXAMINING CALCULATION STRUCTURE:")

        # Check rows 14-40 which seem to have the calculation logic
        print("\nRows 14-20 (Headers and first calculations):")
        for row in range(14, 21):
            row_data = []
            for col in range(0, 50):
                cell = sheet.cell(row, col)
                if cell.value and str(cell.value).strip():
                    val = str(cell.value)[:30]
                    row_data.append(f"[{col}]:{val}")
            if row_data:
                print(f"Row {row}: {' | '.join(row_data)}")

        print("\n" + "="*100)
        print("POWER CABLE SECTION (Starting around row 45)")
        print("="*100)

        for row in range(45, 65):
            row_data = []
            for col in range(0, 50):
                cell = sheet.cell(row, col)
                if cell.value and str(cell.value).strip():
                    val = str(cell.value)[:30]
                    row_data.append(f"[{col}]:{val}")
            if row_data:
                print(f"Row {row}: {' | '.join(row_data)}")

        print("\n" + "="*100)
        print("LOOKING FOR NUMERICAL PATTERNS THAT INDICATE FORMULAS")
        print("="*100)

        # Look for specific calculation indicators
        print("\nSearching for tension/SWBP calculation areas...")

        for row in range(0, min(80, sheet.nrows)):
            for col in range(0, min(40, sheet.ncols)):
                cell = sheet.cell(row, col)
                val = str(cell.value).lower()

                # Look for keywords that indicate calculation areas
                if any(keyword in val for keyword in ['tension', 'swbp', 'coef', 'ecof', 'bcof', 'outgoing']):
                    context = []
                    # Get context: 3 cells before and after
                    for c in range(max(0, col-3), min(sheet.ncols, col+4)):
                        ctx_val = sheet.cell(row, c).value
                        if ctx_val:
                            context.append(f"[{c}]:{str(ctx_val)[:20]}")
                    print(f"\nRow {row}, Col {col}: {val}")
                    print(f"  Context: {' | '.join(context)}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    filename = 'ChampPullv1.75.xls'
    analyze_calculation_sheet(filename)
