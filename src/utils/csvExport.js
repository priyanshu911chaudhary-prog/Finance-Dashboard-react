/**
 * Converts an array of objects into a CSV string and triggers a native browser download.
 */
export function exportToCSV(data, filename = 'transactions.csv') {
  if (!data || !data.length) return;

  // Extract headers dynamically from the first object
  const headers = Object.keys(data[0]);
  
  // Map data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        let value = row[fieldName] === null ? '' : row[fieldName];
        // Wrap strings containing commas in quotes
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}