export interface CSVValidationResult {
  isValid: boolean;
  entityType: string;
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  duplicateRowsCount: number;
  previewRecords: any[];
  errors: { row: number; column: string; message: string }[];
  sanitizedRecords: any[];
}

export function parseCSVText(csvText: string): string[][] {
  const lines = csvText.split(/\r\n|\n/);
  const result: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser handling quotes
    const row: string[] = [];
    let insideQuote = false;
    let currentCell = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    result.push(row);
  }

  return result;
}

export function validateCSVImport(
  csvContent: string, 
  targetEntity: 'beneficiaries' | 'donations' | 'projects' | 'volunteers'
): CSVValidationResult {
  const rows = parseCSVText(csvContent);

  if (rows.length < 2) {
    return {
      isValid: false,
      entityType: targetEntity,
      totalRows: 0,
      validRowsCount: 0,
      errorRowsCount: 0,
      duplicateRowsCount: 0,
      previewRecords: [],
      errors: [{ row: 0, column: 'File', message: 'CSV file must contain a header row and at least one data row.' }],
      sanitizedRecords: []
    };
  }

  const headers = rows[0].map(h => h.toLowerCase());
  const dataRows = rows.slice(1);
  const errors: { row: number; column: string; message: string }[] = [];
  const sanitizedRecords: any[] = [];
  const seenKeys = new Set<string>();
  let duplicateCount = 0;

  dataRows.forEach((rowValues, idx) => {
    const rowNum = idx + 2;
    const record: any = {};
    let rowHasError = false;

    headers.forEach((header, colIdx) => {
      const value = rowValues[colIdx] || '';
      record[header] = value;
    });

    // Entity specific validation
    if (targetEntity === 'beneficiaries') {
      const id = record['beneficiary_id'] || record['id'] || record['code'];
      if (!id) {
        errors.push({ row: rowNum, column: 'beneficiary_id', message: 'Missing required Beneficiary ID' });
        rowHasError = true;
      } else if (seenKeys.has(id)) {
        duplicateCount++;
        rowHasError = true;
        errors.push({ row: rowNum, column: 'beneficiary_id', message: `Duplicate Beneficiary ID: ${id}` });
      } else {
        seenKeys.add(id);
      }
    } else if (targetEntity === 'donations') {
      const amount = parseFloat(record['amount']);
      if (isNaN(amount) || amount <= 0) {
        errors.push({ row: rowNum, column: 'amount', message: 'Invalid or missing numeric donation amount' });
        rowHasError = true;
      }
    } else if (targetEntity === 'projects') {
      const budget = parseFloat(record['budget']);
      if (isNaN(budget) || budget <= 0) {
        errors.push({ row: rowNum, column: 'budget', message: 'Invalid or missing numeric project budget' });
        rowHasError = true;
      }
    }

    if (!rowHasError) {
      sanitizedRecords.push(record);
    }
  });

  return {
    isValid: errors.length === 0,
    entityType: targetEntity,
    totalRows: dataRows.length,
    validRowsCount: sanitizedRecords.length,
    errorRowsCount: errors.length,
    duplicateRowsCount: duplicateCount,
    previewRecords: sanitizedRecords.slice(0, 5),
    errors: errors.slice(0, 10), // Limit top 10 error messages
    sanitizedRecords
  };
}
