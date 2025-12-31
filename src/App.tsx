import React from 'react';
import './App.css';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { getChipColor, parseDisorders } from './utils/utils';
import MainTable from './Tables/MainTable'
import GoalChart from './Charts/GoalChart'
import YearGraph from './Charts/YearGraph'
import Papa from "papaparse";
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import DisorderCountChart from './Charts/DisorderCountChart';
import Description from './Description/Description';
import { Typography } from '@mui/material';

function App() {

  const [dataTable, setDataTable] = React.useState<{
    cols: GridColDef[];
    rows: GridRowsProp;
  }>({
    cols: [],
    rows: [],
  });

  const [dataForGoalChart, setDataForGoalChart] = React.useState<any>({
    uniqueGoals: [],
    counts: [],
  })

  const [dataForYearGraph, setDataForYearGraph] = React.useState<any>({
    years: [],
    counts: [],
  })

  const [dataForDisorderCountChart, setDataForDisorderCountChart] = React.useState<any>({
    labels: [],
    counts: [],
  })

  const dataTableFunc = (data: any) => { 
    let keys = Object.keys(data[0])
      .filter((key) => !["Cited by", "Turn of Spans", "from_sheet", "Evaluation Metrics And Method", "Benchmark"].includes(key));

    // Insert Disorders Count column after Mental Disorder Type
    const disorderTypeIdx = keys.indexOf("Mental Disorder Type");
    if (disorderTypeIdx !== -1) {
      keys.splice(disorderTypeIdx + 1, 0, "Disorders Count");
    }

    const cols: GridColDef[] = keys.map((key) => {
      // Render any column whose name contains "link" or "url" as an anchor when possible
      if (/link|url/i.test(key)) {
        return {
          field: key,
          headerName: key,
          width: 220,
          renderCell: (params: any) => {
            const val = params.value;
            if (val == null || val === "") return null;
            const text = String(val).trim();
            // rudimentary URL check: absolute http(s) or common domain pattern
            const isAbsolute = /^https?:\/\//i.test(text);
            const looksLikeDomain = /^[\w.-]+\.(com|org|edu|net|io|gov|mil)(\/|$)/i.test(text);
            if (isAbsolute || looksLikeDomain) {
              const href = isAbsolute ? text : `https://${text}`;
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                  {text}
                </a>
              );
            }

            return <span>{text}</span>;
          },
        };
      }

      if (key === "Mental Disorder Type") {
        return {
          field: key,
          headerName: key,
          width: 300,
          renderCell: (params: any) => {
            const chips = parseDisorders(params.value).map((d) => (
              <Chip
                key={d}
                label={d}
                size="small"
                sx={{
                  backgroundColor: getChipColor(d),
                  color: "#fff",
                  marginRight: 0.5,
                  fontWeight: 500,
                }}
              />
            ));
            return (
              <div 
                style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  whiteSpace: 'nowrap', 
                  width: '100%' 
                }}
              >
                {chips}
              </div>
            );
          },
        };
      }
      if (key === "Disorders Count") {
        return {
          field: key,
          headerName: key,
          width: 150,
          type: 'number',
        };
      }
      return {
        field: key,
        headerName: key,
        width: 200,
      };
    });

    setDataTable((prev) => ({
      ...prev,
      cols: cols,
    }));

    // Add Disorders Count to each row
    const rowsWithId: GridRowsProp[] = data.map((row: any, index: any) => {
      const disorderCount = parseDisorders(row["Mental Disorder Type"] || "").length;
      return { id: index + 1, ...row, "Disorders Count": disorderCount };
    });
    setDataTable((prev) => ({
      ...prev,
      rows: rowsWithId,
    }));
  }

  const dataForGoalChartFunc = (data: any) => {
    const goalCounts: Record<string, number> = {};

    data.forEach((row: any) => {
      const disorders = parseDisorders(row["Mental Disorder Type"] || "");
      
      disorders.forEach((d) => {
        goalCounts[d] = (goalCounts[d] || 0) + 1;
      });
    });

    const entries = Object.entries(goalCounts);
    const uniqueGoals = entries.map(([goal]) => goal);
    const counts = entries.map(([_, count]) => count);

    setDataForGoalChart((prev: any) => ({
      ...prev,
      uniqueGoals,
      counts,
    }));
  };

  const dataForDisorderCountChartFunc = (data: any) => {
    const countBuckets: Record<number, number> = {};

    data.forEach((row: any) => {
      const disorders = parseDisorders(row["Mental Disorder Type"] || "");
      const n = disorders.length;

      if (n > 0) {
        countBuckets[n] = (countBuckets[n] || 0) + 1;
      }
    });

    // Sort keys numerically
    const sortedCounts = Object.keys(countBuckets)
      .map((k) => parseInt(k))
      .sort((a, b) => a - b);

    const labels = sortedCounts.map((n) => `${n} Disorder${n > 1 ? "s" : ""}`);
    const counts = sortedCounts.map((n) => countBuckets[n]);

    setDataForDisorderCountChart((prev: any) => ({
      ...prev,
      labels,
      counts,
    }));
  };


  const dataForYearGraphFunc = (data: any) => {
    const goalCounts = data.reduce((acc: any, row: any) => {
      const goal = row["Year Published"];
      if (goal == null || goal === "") return acc;
      acc[goal] = (acc[goal] || 0) + 1;
      return acc;
    }, {})
    const entries = Object.entries(goalCounts);
    const years = entries.map(([goal]) => goal);
    const counts = entries.map(([_, count]) => count);
    setDataForYearGraph((prev: any) => ({... prev, years: years, counts: counts }))
  }

  React.useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/data/final.csv`) // CSV in public/data/fakeData.csv
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          delimiter: ",",
          quoteChar: '"',
          dynamicTyping: true,
          complete: (results) => {
            const data = results.data as any[];
            if (data.length > 0) {
              dataTableFunc(data)
              dataForGoalChartFunc(data)
              dataForYearGraphFunc(data)
              dataForDisorderCountChartFunc(data)
            }
          },
        });
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, []);

  return (
    <Box sx={styles.appContainer}>
      {/* <Box sx={styles.headerContainer}>
        <Typography variant="h4">Mental Health Dataset Tracker</Typography>
      </Box> */}
      <Box>
        <Description />
      </Box>
      <Box sx={styles.tableContainer}>
        <MainTable rows={dataTable.rows} columns={dataTable.cols}/>
      </Box>
      <Box sx={styles.graphContainer}>
        <GoalChart x={dataForGoalChart.uniqueGoals} y={dataForGoalChart.counts}/>
      </Box>
      <Box sx={styles.graphContainer}>
        <DisorderCountChart x={dataForDisorderCountChart.labels} y={dataForDisorderCountChart.counts}/>
      </Box>
      <Box sx={styles.graphContainer}>
        <YearGraph x={dataForYearGraph.years} y={dataForYearGraph.counts}/>
      </Box>
    </Box>
  );
}

interface StyleTypes {
  appContainer: React.CSSProperties;
  headerContainer: React.CSSProperties;
  tableContainer: React.CSSProperties;
  graphContainer: React.CSSProperties;
}

const styles: StyleTypes ={
  appContainer: {
    flexDirection: 'column', 
    justifyContent: 'center', 
    textAlign: "center",
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: '18px',
  },
  headerContainer: {
    margin: "15px",
  },
  tableContainer: {
    margin: "15px",
  },
  graphContainer: {
    margin: "15px",
    border: '1px solid #fff',
    backgroundColor: '#fff',   
  }  
}
export default App;
