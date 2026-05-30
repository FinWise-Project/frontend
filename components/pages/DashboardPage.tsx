'use client';
import { useEffect, useState } from 'react';
import { useToast } from '../Toast';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchDashboardSummary,
  fetchDashboardMonthly,
  fetchDashboardYearly,
  DashboardData,
  MonthlyData,
  YearlyData,
} from '@/lib/dashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

type Page =
  | 'dashboard'
  | 'transaksi'
  | 'analisis'
  | 'prediksi'
  | 'budget'
  | 'laporan'
  | 'profil';

const chartOpts = (yFmt?: (v: number) => string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
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
        callback: yFmt || ((v: any) => 'Rp' + (v / 1000000).toFixed(1) + 'Jt'),
      },
    },
  },
});

const CATEGORY_COLORS = [
  '#7c3aed',
  '#a78bfa',
  '#6366f1',
  '#22d3ee',
  '#f472b6',
  '#34d399',
];

// Helper: fallback rangeLabel jika undefined atau mengandung "undefined"
const getRangeLabel = (
  label: string | undefined,
  year: string | number,
  chart?: { monthLabel: string }[],
): string => {
  if (label && !label.toLowerCase().includes('undefined')) return label;
  if (chart && chart.length > 0) {
    return `${chart[0].monthLabel} — ${chart[chart.length - 1].monthLabel}`;
  }
  return `Tahun ${year}`;
};

export default function DashboardPage({
  onNavigate,
}: {
  onNavigate: (p: Page) => void;
}) {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [tab, setTab] = useState<'ring' | 'bul' | 'tah'>('ring');
  const [data, setData] = useState<DashboardData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData | null>(null);
  const [yearly, setYearly] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchDashboardSummary(),
      fetchDashboardMonthly(),
      fetchDashboardYearly(),
    ])
      .then(([summary, monthlyData, yearlyData]) => {
        setData(summary);
        setMonthly(monthlyData);
        setYearly(yearlyData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}
      >
        Memuat data...
      </div>
    );

  if (error || !data)
    return (
      <div
        style={{ textAlign: 'center', padding: '60px', color: 'var(--red)' }}
      >
        ⚠ {error || 'Data tidak tersedia'}
      </div>
    );

  const saldo = data.balance.total;
  const pemasukan = data.summary.income.amount;
  const pengeluaran = data.summary.expense.amount;
  const incomeChange = data.summary.income.changePercentage;
  const expenseChange = data.summary.expense.changePercentage;

  const trendLabels = data.trend.map((t) => t.month.slice(0, 7));
  const trendValues = data.trend.map((t) => t.totalExpense);
  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        data: trendValues,
        borderColor: '#a78bfa',
        backgroundColor: '#a78bfa18',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#a78bfa',
        borderWidth: 2,
      },
    ],
  };

  const pieData = {
    labels: data.categories.map((c) => c.categoryName),
    datasets: [
      {
        data: data.categories.map((c) => c.totalAmount),
        backgroundColor: data.categories.map(
          (_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        ),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const barData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Pemasukan',
        data: trendLabels.map(() => pemasukan),
        backgroundColor: '#4ade80cc',
        borderRadius: 4,
        borderWidth: 0,
      },
      {
        label: 'Pengeluaran',
        data: trendValues,
        backgroundColor: '#f87171cc',
        borderRadius: 4,
        borderWidth: 0,
      },
    ],
  };

  const exceededBudgets = data.budgets.filter((b) => b.isExceeded);

  return (
    <div>
      <div className="tab-bar">
        {(['ring', 'bul', 'tah'] as const).map((t, i) => (
          <div
            key={t}
            className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {['Ringkasan', 'Bulanan', 'Tahunan'][i]}
          </div>
        ))}
      </div>

      {tab === 'ring' && (
        <>
          <div className="cards-grid">
            <div
              className="card purple"
              onClick={() =>
                showToast('Total Saldo', 'Saldo dari semua rekening aktif kamu')
              }
            >
              <div className="card-label">Total Saldo</div>
              <div className="card-value">
                Rp {saldo.toLocaleString('id-ID')}
              </div>
              <div className="card-sub">Semua rekening</div>
            </div>
            <div
              className="card"
              onClick={() =>
                showToast('Pemasukan', `Total pemasukan ${data.month}`)
              }
            >
              <div className="card-label">Pemasukan</div>
              <div className="card-value" style={{ color: 'var(--green)' }}>
                Rp {pemasukan.toLocaleString('id-ID')}
              </div>
              <div className="card-sub">{data.month}</div>
              {incomeChange !== 0 && (
                <div className={`tag ${incomeChange >= 0 ? 'up' : 'dn'}`}>
                  {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange)}%
                </div>
              )}
            </div>
            <div
              className="card"
              onClick={() =>
                showToast('Pengeluaran', `Total pengeluaran ${data.month}`)
              }
            >
              <div className="card-label">Pengeluaran</div>
              <div className="card-value" style={{ color: 'var(--red)' }}>
                Rp {pengeluaran.toLocaleString('id-ID')}
              </div>
              <div className="card-sub">{data.month}</div>
              {expenseChange !== 0 && (
                <div className={`tag ${expenseChange <= 0 ? 'up' : 'dn'}`}>
                  {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange)}%
                </div>
              )}
            </div>
          </div>

          <div className="two-col">
            <div className="chart-card">
              <div className="chart-title">Tren Pengeluaran</div>
              <div style={{ position: 'relative', height: '130px' }}>
                <Line data={lineData} options={chartOpts() as any} />
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-title">Kategori Pengeluaran</div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '90px',
                    height: '90px',
                    flexShrink: 0,
                  }}
                >
                  <Doughnut
                    data={pieData}
                    options={
                      {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        cutout: '70%',
                      } as any
                    }
                  />
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}
                >
                  {data.categories.map((c, i) => (
                    <div
                      key={c.categoryName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        showToast(
                          c.categoryName,
                          `Rp ${c.totalAmount.toLocaleString('id-ID')} (${c.percentage}%)`,
                        )
                      }
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '2px',
                          background:
                            CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ color: 'var(--text2)' }}>
                        {c.categoryName} {c.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="two-col">
            <div className="chart-card">
              <div className="section-header">
                <div className="chart-title" style={{ margin: 0 }}>
                  Transaksi Terbaru
                </div>
                <button
                  className="link-btn"
                  onClick={() => onNavigate('transaksi')}
                >
                  Lihat semua →
                </button>
              </div>
              <div className="tx-list">
                {data.recentTransactions.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '30px',
                      color: 'var(--text3)',
                    }}
                  >
                    Belum ada transaksi
                  </div>
                ) : (
                  data.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="tx-item"
                      onClick={() =>
                        showToast(
                          tx.description,
                          `${tx.categoryName} • ${tx.subCategoryName}`,
                        )
                      }
                    >
                      <div className="tx-icon">
                        {tx.type === 'income' ? '💰' : '💸'}
                      </div>
                      <div>
                        <div className="tx-name">{tx.description}</div>
                        <div className="tx-cat">
                          {tx.categoryName} • {tx.subCategoryName}
                        </div>
                      </div>
                      <div
                        className={`tx-amt ${tx.type === 'income' ? 'pos' : 'neg'}`}
                      >
                        {tx.type === 'income' ? '+' : '-'}Rp{' '}
                        {tx.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="section-header">
                <div className="chart-title" style={{ margin: 0 }}>
                  Budget Progress
                </div>
                <button
                  className="link-btn"
                  onClick={() => onNavigate('budget')}
                >
                  Atur budget →
                </button>
              </div>
              {data.budgets.map((b) => (
                <div key={b.categoryName} className="budget-item">
                  <div className="budget-row">
                    <span className="budget-name">{b.categoryName}</span>
                    <span
                      className="budget-pct"
                      style={{
                        color: b.isExceeded
                          ? 'var(--red)'
                          : b.percentage >= 80
                            ? 'var(--yellow)'
                            : 'var(--green)',
                      }}
                    >
                      {b.percentage}%
                    </span>
                  </div>
                  <div
                    className="progress-bar"
                    onClick={() =>
                      showToast(
                        b.categoryName,
                        `Rp ${b.spentAmount.toLocaleString('id-ID')} dari Rp ${b.limitAmount.toLocaleString('id-ID')}`,
                      )
                    }
                  >
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(b.percentage, 100)}%`,
                        background: b.isExceeded
                          ? 'var(--red)'
                          : b.percentage >= 80
                            ? 'var(--yellow)'
                            : 'var(--green)',
                      }}
                    />
                  </div>
                </div>
              ))}
              {exceededBudgets.length > 0 && (
                <div className="alert-box" onClick={() => onNavigate('budget')}>
                  <div className="alert-title">
                    ⚠ Budget{' '}
                    {exceededBudgets.map((b) => b.categoryName).join(', ')}{' '}
                    Melebihi Batas!
                  </div>
                  <div className="alert-sub">
                    {exceededBudgets
                      .map(
                        (b) =>
                          `${b.categoryName}: Rp ${b.spentAmount.toLocaleString('id-ID')} dari Rp ${b.limitAmount.toLocaleString('id-ID')}`,
                      )
                      .join(' • ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'bul' && (
        <>
          {!monthly ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px',
                color: 'var(--text3)',
              }}
            >
              Memuat data bulanan...
            </div>
          ) : (
            <>
              <div className="chart-card" style={{ marginBottom: '12px' }}>
                <div className="chart-title">
                  Perbandingan Pemasukan vs Pengeluaran — Bulanan
                </div>
                <div style={{ position: 'relative', height: '200px' }}>
                  <Bar
                    data={{
                      labels: monthly.chart.map((c) => c.monthLabel),
                      datasets: [
                        {
                          label: 'Pemasukan',
                          data: monthly.chart.map((c) => c.totalIncome),
                          backgroundColor: '#4ade80cc',
                          borderRadius: 4,
                          borderWidth: 0,
                        },
                        {
                          label: 'Pengeluaran',
                          data: monthly.chart.map((c) => c.totalExpense),
                          backgroundColor: '#f87171cc',
                          borderRadius: 4,
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={
                      {
                        ...chartOpts(),
                        plugins: {
                          legend: {
                            display: true,
                            labels: { color: '#9ca3af', font: { size: 10 } },
                          },
                        },
                      } as any
                    }
                  />
                </div>
              </div>
              <div className="cards-grid">
                <div
                  className="card"
                  onClick={() =>
                    showToast(
                      'Rata-rata Pengeluaran',
                      'Rata-rata pengeluaran bulan ini',
                    )
                  }
                >
                  <div className="card-label">Rata-rata Pengeluaran</div>
                  <div className="card-value" style={{ color: 'var(--red)' }}>
                    Rp {monthly.summary.avgExpense.toLocaleString('id-ID')}
                  </div>
                  <div className="card-sub">per bulan</div>
                </div>
                <div
                  className="card"
                  onClick={() =>
                    showToast('Bulan Terbaik', 'Pengeluaran terendah')
                  }
                >
                  <div className="card-label">Bulan Terbaik</div>
                  <div className="card-value" style={{ color: 'var(--green)' }}>
                    {monthly.summary.bestMonth}
                  </div>
                  <div className="card-sub">Pengeluaran terendah</div>
                </div>
                <div
                  className="card"
                  onClick={() =>
                    showToast('Total Tabungan', 'Total tabungan bulan ini')
                  }
                >
                  <div className="card-label">Total Tabungan</div>
                  <div
                    className="card-value"
                    style={{ color: 'var(--purple2)' }}
                  >
                    Rp {monthly.summary.totalSavings.toLocaleString('id-ID')}
                  </div>
                  <div className="card-sub">{monthly.month}</div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'tah' && (
        <>
          {!yearly ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px',
                color: 'var(--text3)',
              }}
            >
              Memuat data tahunan...
            </div>
          ) : (
            <>
              <div className="chart-card" style={{ marginBottom: '12px' }}>
                <div className="chart-title">Arus Keuangan {yearly.year}</div>
                <div style={{ position: 'relative', height: '200px' }}>
                  <Line
                    data={{
                      labels: yearly.chart.map((c) => c.monthLabel),
                      datasets: [
                        {
                          label: 'Pemasukan',
                          data: yearly.chart.map((c) => c.totalIncome),
                          borderColor: '#4ade80',
                          backgroundColor: '#4ade8018',
                          tension: 0.4,
                          fill: true,
                          pointRadius: 3,
                          pointBackgroundColor: '#4ade80',
                          borderWidth: 2,
                        },
                        {
                          label: 'Pengeluaran',
                          data: yearly.chart.map((c) => c.totalExpense),
                          borderColor: '#f87171',
                          backgroundColor: '#f8717118',
                          tension: 0.4,
                          fill: true,
                          pointRadius: 3,
                          pointBackgroundColor: '#f87171',
                          borderWidth: 2,
                        },
                        {
                          label: 'Net Cashflow',
                          data: yearly.chart.map((c) => c.netCashflow),
                          borderColor: '#a78bfa',
                          backgroundColor: '#a78bfa18',
                          tension: 0.4,
                          fill: false,
                          pointRadius: 3,
                          pointBackgroundColor: '#a78bfa',
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={
                      {
                        ...chartOpts(),
                        plugins: {
                          legend: {
                            display: true,
                            labels: { color: '#9ca3af', font: { size: 10 } },
                          },
                        },
                      } as any
                    }
                  />
                </div>
              </div>
              <div className="two-col">
                <div
                  className="card"
                  onClick={() =>
                    showToast(
                      'Total Pemasukan',
                      getRangeLabel(
                        yearly.summary.totalIncome.rangeLabel,
                        yearly.year,
                        yearly.chart,
                      ),
                    )
                  }
                >
                  <div className="card-label">
                    Total Pemasukan {yearly.year}
                  </div>
                  <div className="card-value" style={{ color: 'var(--green)' }}>
                    Rp{' '}
                    {yearly.summary.totalIncome.amount.toLocaleString('id-ID')}
                  </div>
                  <div className="card-sub">
                    {getRangeLabel(
                      yearly.summary.totalIncome.rangeLabel,
                      yearly.year,
                      yearly.chart,
                    )}
                  </div>
                  <div className="tag up">
                    ↑ {yearly.summary.totalIncome.status}
                  </div>
                </div>
                <div
                  className="card"
                  onClick={() =>
                    showToast(
                      'Total Pengeluaran',
                      getRangeLabel(
                        yearly.summary.totalExpense.rangeLabel,
                        yearly.year,
                        yearly.chart,
                      ),
                    )
                  }
                >
                  <div className="card-label">
                    Total Pengeluaran {yearly.year}
                  </div>
                  <div className="card-value" style={{ color: 'var(--red)' }}>
                    Rp{' '}
                    {yearly.summary.totalExpense.amount.toLocaleString('id-ID')}
                  </div>
                  <div className="card-sub">
                    {getRangeLabel(
                      yearly.summary.totalExpense.rangeLabel,
                      yearly.year,
                      yearly.chart,
                    )}
                  </div>
                  <div className="tag up">
                    ↑ {yearly.summary.totalExpense.status}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}