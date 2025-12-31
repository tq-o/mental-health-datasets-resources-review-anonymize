import * as React from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import Papa from "papaparse";

type MainTableProps = {
  rows: GridRowsProp;
  columns: GridColDef[];
};

export default function MainTable({rows, columns }: MainTableProps) {
  return (
    // <div style={{height: "90vh"}}>
    <div>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        showToolbar
        pagination
        density="compact"
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        sx={{
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#CBCBCB",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
          },
        }}
        
      />
    </div>
  );
}
