#!/usr/bin/env python3
import xlrd
import json

def analyze_sheet(sheet):
    """Analyze a sheet to find formulas and important cells"""
    print(f"\n{'='*100}")
    print(f"Sheet: {sheet.name} ({sheet.nrows} rows x {sheet.ncols} cols)")
    print(f"{'='*100}\n")

    # Look for headers and important sections
    for row_idx in range(min(60, sheet.nrows)):
        row_data = []
        has_content = False
        for col_idx in range(min(25, sheet.ncols)):
            cell = sheet.cell(row_idx, col_idx)
            if cell.value and str(cell.value).strip():
                has_content = True
                # Truncate long values
                val = str(cell.value)[:40]
                row_data.append(f"{col_idx}:{val}")

        if has_content:
            print(f"Row {row_idx:3d}: {' | '.join(row_data)}")

filename = 'ChampPullv1.75.xls'
workbook = xlrd.open_workbook(filename, formatting_info=False)

print(f"\nTotal sheets: {len(workbook.sheet_names())}")
print(f"Sheet names: {', '.join(workbook.sheet_names())}\n")

# Analyze each sheet
for sheet_name in workbook.sheet_names():
    sheet = workbook.sheet_by_name(sheet_name)
    analyze_sheet(sheet)
    print("\n")
