'use client';

import { useEffect, useState } from 'react';
import { useToast } from '../Toast';
import { Line } from 'react-chartjs-2';
import { getPrediction } from '@/lib/predict';

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#9ca3af',
        font: { size: 10 },
      },
    },
  },
  scales: {
    x: {
      grid: { color: '#2a2a3840' },
      ticks: { color: '#6b7280', font: { size: 10 } },
    },
    y: {
      grid: { color: '#2a2a3840' },
      ticks: {
        color: '#6b7280',
        font: { size: 10 },
        callback: (v: any) => 'Rp' + (v / 1000000).toFixed(1) + 'Jt',
      },
    },
  },
};

export default function PrediksiPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    fetchPrediction();
  }, []);

  async function fetchPrediction() {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await getPrediction(token);
      setPrediction(response.data.result);
    } catch (err) {
      console.error(err);
      setPrediction({
        predicted_expense: 0,
        predicted_expense_formatted: 'Rp 0',
        confidence: '-',
        months_of_data: 0,
        mode: '-',
        note: 'Belum ada data yang cukup untuk membuat prediksi.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, color: 'var(--text3)' }}>
        Memuat prediksi...
      </div>
    );
  }


  const formattedAmount = prediction.predicted_expense_formatted;

  const chartData = {
    labels: ['Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Prediksi AI',
        data: [null, null, null, prediction.predicted_expense],
        borderColor: '#facc15',
        borderDash: [6, 3],
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#facc15',
        borderWidth: 2,
        fill: false,
        spanGaps: false,
      },
    ],
  };

  return (
    <div>
      {/* HERO PREDIKSI */}
      <div
        className="predict-hero"
        onClick={() => showToast('Prediksi AI', prediction.note)}
      >
        <div className="predict-label">Prediksi Pengeluaran Bulan Depan</div>

        <div className="predict-amount">{formattedAmount}</div>

        <div className="predict-info">
          Berdasarkan pola transaksi sebelumnya
        </div>
      </div>

      {/* CARDS */}
      <div className="cards-grid" style={{ marginBottom: '16px' }}>
        <div className="card">
          <div className="card-label">Confidence</div>
          <div className="card-value" style={{ color: 'var(--green)' }}>
            {prediction.confidence}
          </div>
          <div className="card-sub">Model confidence</div>
        </div>

        <div className="card">
          <div className="card-label">Data Bulan</div>
          <div className="card-value">{prediction.months_of_data}</div>
          <div className="card-sub">bulan digunakan</div>
        </div>

        <div className="card">
          <div className="card-label">Mode Model</div>
          <div className="card-value">{prediction.mode}</div>
          <div className="card-sub">AI mode</div>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-card" style={{ marginBottom: '12px' }}>
        <div className="chart-title">Prediksi Pengeluaran</div>

        <div style={{ position: 'relative', height: '200px' }}>
          <Line data={chartData} options={chartOpts as any} />
        </div>
      </div>

      {/* REKOMENDASI */}
      <div className="chart-card">
        <div className="chart-title">Insight AI</div>

        <div
          style={{
            fontSize: '12px',
            color: 'var(--text3)',
            marginTop: '6px',
            lineHeight: '1.5',
          }}
        >
          {prediction.note}
        </div>
      </div>
    </div>
  );
}
