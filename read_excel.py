#!/usr/bin/env python3
import xlrd
import json
import sys

def read_excel_file(filename):
    """Read Excel file and extract all sheets with their data"""
    try:
        workbook = xlrd.open_workbook(filename, formatting_info=False)
        result = {
            'sheet_names': workbook.sheet_names(),
            'sheets': {}
        }

        for sheet_name in workbook.sheet_names():
            sheet = workbook.sheet_by_name(sheet_name)
            sheet_data = {
                'name': sheet_name,
                'rows': sheet.nrows,
                'cols': sheet.ncols,
                'data': []
            }

            # Read all rows
            for row_idx in range(sheet.nrows):
                row = []
                for col_idx in range(sheet.ncols):
                    cell = sheet.cell(row_idx, col_idx)
                    row.append({
                        'value': cell.value,
                        'type': cell.ctype
                    })
                sheet_data['data'].append(row)

            result['sheets'][sheet_name] = sheet_data

        return result
    except Exception as e:
        print(f"Error reading Excel file: {e}", file=sys.stderr)
        return None

if __name__ == '__main__':
    filename = 'ChampPullv1.75.xls'
    data = read_excel_file(filename)

    if data:
        print(f"\nFound {len(data['sheet_names'])} sheets:")
        for sheet_name in data['sheet_names']:
            sheet = data['sheets'][sheet_name]
            print(f"\n{'='*80}")
            print(f"Sheet: {sheet_name}")
            print(f"Dimensions: {sheet['rows']} rows x {sheet['cols']} columns")
            print(f"{'='*80}")

            # Print first 50 rows of data
            max_rows = min(50, sheet['rows'])
            for row_idx in range(max_rows):
                row_values = [str(cell['value'])[:30] for cell in sheet['data'][row_idx]]
                print(f"Row {row_idx}: {' | '.join(row_values)}")

            if sheet['rows'] > 50:
                print(f"\n... ({sheet['rows'] - 50} more rows)")
