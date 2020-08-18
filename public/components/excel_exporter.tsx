import React from 'react';
import { EuiButton } from '@elastic/eui';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

export const ExportCSV = ({ csvData, fileName, buttonName }: any) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const exportToCSV = (dataset: any, file: any) => {
    const ws = XLSX.utils.json_to_sheet(dataset);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, file + fileExtension);
  };

  return (
    <EuiButton
      data-test-subj="export"
      onClick={() => exportToCSV(csvData, fileName)}
      color="secondary"
      iconType="exportAction"
      iconSide="left"
      size="s"
    >
      Export data grid to excel
    </EuiButton>
  );
};
