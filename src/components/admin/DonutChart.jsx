import React, { useState } from 'react';
import './DonutChart.css';

export const StatusDonutChart = ({ statusCounts = {} }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const statusConfig = [
    { label: 'Còn hàng', key: 'Còn hàng', color: '#10b981' },
    { label: 'Hết hàng', key: 'Hết hàng', color: '#f59e0b' },
    { label: 'Ẩn', key: 'Ẩn', color: '#64748b' },
  ];

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  // Calculate SVG arc paths
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const segments = statusConfig.map((item) => {
    const count = statusCounts[item.key] || 0;
    const percent = count / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      ...item,
      count,
      percent: (percent * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="donut-chart-card">
      <h3 className="chart-card-title">Phân bố sản phẩm theo Trạng thái</h3>
      <div className="donut-chart-container">
        {/* SVG Donut */}
        <div className="svg-wrapper">
          <svg viewBox="0 0 160 160" className="donut-svg">
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="donut-bg"
              strokeWidth="22"
            />
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredSegment === seg.label ? '26' : '22'}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="donut-segment"
                onMouseEnter={() => setHoveredSegment(seg.label)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>
          <div className="donut-center-info">
            <span className="center-value">
              {hoveredSegment
                ? segments.find((s) => s.label === hoveredSegment)?.count
                : total}
            </span>
            <span className="center-label">
              {hoveredSegment || 'Tổng SP'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="chart-legend-list">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={`legend-item ${hoveredSegment === seg.label ? 'active' : ''}`}
              onMouseEnter={() => setHoveredSegment(seg.label)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="legend-left">
                <span className="dot" style={{ backgroundColor: seg.color }}></span>
                <span className="legend-name">{seg.label}</span>
              </div>
              <div className="legend-right">
                <span className="legend-count">{seg.count} SP</span>
                <span className="legend-percent">({seg.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CategoryDonutChart = ({ categoryCounts = {} }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const colors = ['#1578E9', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899', '#06b6d4'];

  const categories = Object.keys(categoryCounts);
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const segments = categories.map((cat, idx) => {
    const count = categoryCounts[cat] || 0;
    const percent = count / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      label: cat,
      count,
      percent: (percent * 100).toFixed(1),
      color: colors[idx % colors.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="donut-chart-card">
      <h3 className="chart-card-title">Phân bố sản phẩm theo Danh mục</h3>
      <div className="donut-chart-container">
        {/* SVG Donut */}
        <div className="svg-wrapper">
          <svg viewBox="0 0 160 160" className="donut-svg">
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="donut-bg"
              strokeWidth="22"
            />
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredSegment === seg.label ? '26' : '22'}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="donut-segment"
                onMouseEnter={() => setHoveredSegment(seg.label)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>
          <div className="donut-center-info">
            <span className="center-value">
              {hoveredSegment
                ? segments.find((s) => s.label === hoveredSegment)?.count
                : total}
            </span>
            <span className="center-label">
              {hoveredSegment ? 'Sản phẩm' : 'Tổng SP'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="chart-legend-list">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={`legend-item ${hoveredSegment === seg.label ? 'active' : ''}`}
              onMouseEnter={() => setHoveredSegment(seg.label)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="legend-left">
                <span className="dot" style={{ backgroundColor: seg.color }}></span>
                <span className="legend-name">{seg.label}</span>
              </div>
              <div className="legend-right">
                <span className="legend-count">{seg.count} SP</span>
                <span className="legend-percent">({seg.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
