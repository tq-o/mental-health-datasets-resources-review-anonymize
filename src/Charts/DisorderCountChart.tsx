import { useState, useMemo } from "react";
import { Box, Button, Typography, Select, MenuItem } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import FormControl from '@mui/material/FormControl';

export default function DisorderCountChart({ x, y }: any) {
  const [sortBy, setSortBy] = useState("count");   // "name" | "count"
  const [sortDir, setSortDir] = useState("desc");  // "asc" | "desc"
  const [page, setPage] = useState(0);
  const rowsPerPage = 1000;
  const maxValue = Math.max(...y);  // highest count across all rows

  // 1. Combine x + y into one array so sorting keeps them aligned
  const combined = useMemo(
    () =>
      x.map((goal: string, i: number) => ({
        goal,
        count: y[i],
      })),
    [x, y]
  );

  // 2. Sorting logic
  const sorted = useMemo(() => {
    return [...combined].sort((a, b) => {
      let cmp =
        sortBy === "count"
          ? a.count - b.count
          : a.goal.localeCompare(b.goal);

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [combined, sortBy, sortDir]);

  // 3. Pagination logic
  const pageCount = Math.ceil(sorted.length / rowsPerPage);

  const pageData = sorted.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 4. Extract x & y for the chart
  const paginatedX = pageData.map((row) => row.goal);
  const paginatedY = pageData.map((row) => row.count);

  const rowHeight = 35;
  const dynamicHeight = Math.max(300, paginatedX.length * rowHeight);

  return (
    <Box>

      {/* Sorting Controls */}
      {/* <FormControl size="small" sx={{ display: "flex", flexDirection: "row", gap: 2, ml:2 , mb: 2 }}>
        <Select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <MenuItem value="count">Sort by Count</MenuItem>
          <MenuItem value="name">Sort by Name</MenuItem>
        </Select>

        <Select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl> */}

      {/* Chart */}
      <BarChart
        layout="horizontal"
        xAxis={[{ data: paginatedY, label: "Paper Counts", min: 0, max: maxValue,  }]}
        yAxis={[
          {
            data: paginatedX,
            scaleType: "band",
            label: "Disorder Count",
            width: 200,
          },
        ]}
        series={[{ data: paginatedY }]}
        height={dynamicHeight}
      />

      {/* Pagination Controls */}
      {/* <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
        <Button
          variant="outlined"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>

        <Typography sx={{ alignSelf: "center" }}>
          Page {page + 1} of {pageCount}
        </Typography>

        <Button
          variant="outlined"
          disabled={page === pageCount - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </Box> */}

      <Typography
        variant="body1"
        align="center"
        color="textSecondary"
        gutterBottom
        sx={{ mt: 2 }}
      >
        This chart displays the number of papers grouped by how many disorders they include.
        <br/>
        <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
          For example, a count of "2" indicates the number of papers that address exactly two different mental health disorders.
        </Typography>
      </Typography>
    </Box>
  );
}
