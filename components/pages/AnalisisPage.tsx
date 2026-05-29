'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../Toast';
import { Line, Bar } from 'react-chartjs-2';
import { getAnalysis } from '@/lib/analysis';

const chartOpts = (yFmt?: (v: any) => string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },

  scales: {
    x: {
      grid: { color: '#2a2a3840' },
      ticks: {
        color: '#6b7280',
        font: { size: 10 },
      },
    },

    y: {
      grid: { color: '#2a2a3840' },
      ticks: {
        color: '#6b7280',
        font: { size: 10 },
        callback: yFmt || ((v: any) => 'Rp' + (v / 1000000).toFixed(1) + 'Jt'),
      },
    },
  },
});

export default function AnalisisPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  async function fetchAnalysis() {
    try {
      setLoading(true);

      const token = localStorage.getItem('accessToken');

      if (!token) return;

      const response = await getAnalysis(token);

      setAnalysis(response.data);
    } catch (error: any) {
      console.error(error);

      showToast('Error', error?.message || 'Gagal mengambil analisis');
    } finally {
      setLoading(false);
    }
  }

  const breakdownData = useMemo(() => {
    if (!analysis) return null;

    return {
      labels: analysis.breakdown.map((item: any) => item.categoryName),

      datasets: [
        {
          data: analysis.breakdown.map((item: any) => item.totalAmount),
          backgroundColor: [
            '#7c3aed',
            '#a78bfa',
            '#ef4444',
            '#4ade80',
            '#60a5fa',
            '#facc15',
          ],
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    };
  }, [analysis]);

  const trendCharts = useMemo(() => {
    if (!analysis) return [];

    return Object.entries(analysis.trend).map(
      ([categoryName, values]: any) => ({
        categoryName,

        data: {
          labels: values.map((v: any) => v.month),

          datasets: [
            {
              data: values.map((v: any) => v.totalAmount),
              borderColor: '#4ade80',
              backgroundColor: 'transparent',
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: '#4ade80',
              borderWidth: 2,
            },
          ],
        },
      }),
    );
  }, [analysis]);

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text3)',
        }}
      >
        Memuat analisis...
      </div>
    );
  }

  if (!analysis) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text3)',
        }}
      >
        Tidak ada data analisis
      </div>
    );
  }

  return (
    <div>
      {/* INSIGHT CARDS */}
      <div className="insight-cards">
        <div
          className="insight-card"
          onClick={() =>
            showToast(
              'Tingkat Tabungan',
              `Kamu menabung ${analysis.summary.savingsRate}% bulan ini`,
            )
          }
        >
          <div
            className="insight-num"
            style={{
              color: 'var(--green)',
            }}
          >
            {analysis.summary.savingsRate}%
          </div>

          <div className="insight-label">Tingkat Tabungan</div>
        </div>

        <div
          className="insight-card"
          onClick={() =>
            showToast(
              'Kategori Terbesar',
              `Pengeluaran terbesar ada di kategori ${analysis.summary.topCategory}`,
            )
          }
        >
          <div
            className="insight-num"
            style={{
              color: 'var(--purple2)',
            }}
          >
            {analysis.summary.topCategory}
          </div>

          <div className="insight-label">Kategori Terbesar</div>
        </div>

        <div
          className="insight-card"
          onClick={() =>
            showToast(
              'Total Transaksi',
              `Total ${analysis.summary.totalTransactions} transaksi bulan ini`,
            )
          }
        >
          <div
            className="insight-num"
            style={{
              color: 'var(--blue)',
            }}
          >
            {analysis.summary.totalTransactions}
          </div>

          <div className="insight-label">Total Transaksi</div>
        </div>
      </div>

      {/* BREAKDOWN */}
      <div
        className="chart-card"
        style={{
          marginBottom: '12px',
        }}
      >
        <div className="chart-title">
          Breakdown Pengeluaran per Kategori — {analysis.month}
        </div>

        <div
          style={{
            position: 'relative',
            height: '220px',
          }}
        >
          {breakdownData && (
            <Bar
              data={breakdownData}
              options={
                chartOpts((v: any) => 'Rp' + (v / 1000).toFixed(0) + 'k') as any
              }
            />
          )}
        </div>
      </div>

      {/* TREND */}
      <div className="two-col">
        {trendCharts.map((trend: any, index: number) => (
          <div key={index} className="chart-card">
            <div className="chart-title">
              Tren Pengeluaran — {trend.categoryName}
            </div>

            <div
              style={{
                position: 'relative',

                height: '130px',
              }}
            >
              <Line data={trend.data} options={chartOpts() as any} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
