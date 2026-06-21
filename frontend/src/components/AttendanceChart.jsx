import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function AttendanceChart({ data }) {

  return (

    <ResponsiveContainer
      width="100%"
      height={320}
    >

      <AreaChart
        data={data}
      >

        <defs>

          <linearGradient
            id="attendanceFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="5%"
              stopColor="#2563eb"
              stopOpacity={0.4}
            />

            <stop
              offset="95%"
              stopColor="#2563eb"
              stopOpacity={0}
            />

          </linearGradient>

        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e5e7eb"
        />

        <XAxis
          dataKey="day"
          tick={{
            fill: "#64748b"
          }}
        />

        <YAxis
          tick={{
            fill: "#64748b"
          }}
        />

        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.12)"
          }}
        />

        <Area
          type="monotone"
          dataKey="total"
          stroke="#2563eb"
          strokeWidth={4}
          fill="url(#attendanceFill)"
        />

      </AreaChart>

    </ResponsiveContainer>

  );

}

export default AttendanceChart;