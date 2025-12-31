import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function YearGraph({x, y}: any){
    console.log(x, y)
    return (
        <Box>
        <LineChart
            xAxis={[
                { 
                data: x,
                label: 'Year',
                scaleType: 'band',
                labelStyle: { fontSize: 12 }        
                },
            ]}
            yAxis={[{ label: 'Paper Count', labelStyle: { fontSize: 12 }, }]}
            series={[
                {
                data: y
                },
            ]}
            height={300}
        />
        <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
            This graph shows the number of papers associated with each year.
        </Typography>
      </Box>
    )
}