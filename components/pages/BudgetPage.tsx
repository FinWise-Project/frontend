'use client';

import { useEffect, useState } from 'react';
import { useToast } from '../Toast';
import Modal from '../Modal';

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '@/lib/budgets';

import { getCategories } from '@/lib/category';

const initialForm = {
  categoryId: '',
  limitAmount: '',
  alertThreshold: '80',
  month: new Date().toISOString().slice(0, 7),
};

export default function BudgetPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [summary, setSummary] = useState({
    month: '',
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    percentageSpent: 0,
    percentageRemaining: 0,
  });

  const [budgets, setBudgets] = useState<any[]>([]);

  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  async function fetchBudgets() {
    try {
      setLoading(true);

      const token = localStorage.getItem('accessToken');

      if (!token) return;

      const response = await getBudgets(token);

      const data = response.data;

      setSummary({
        month: data.month,
        totalBudget: data.totalBudget,
        totalSpent: data.totalSpent,
        totalRemaining: data.totalRemaining,
        percentageSpent: data.percentageSpent,
        percentageRemaining: data.percentageRemaining,
      });

      setBudgets(data.budgets);
    } catch (error) {
      console.error(error);

      showToast('Error', 'Gagal mengambil budget');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      const response = await getCategories(token);

      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateBudget() {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      if (
        !form.categoryId ||
        !form.limitAmount ||
        !form.alertThreshold ||
        !form.month
      ) {
        showToast('Error', 'Semua field wajib diisi');

        return;
      }

      const payload = {
        categoryId: form.categoryId,
        limitAmount: Number(form.limitAmount),
        alertThreshold: Number(form.alertThreshold),
        month: form.month,
      };

      await createBudget(token, payload);

      showToast('Berhasil', 'Budget berhasil ditambahkan');

      setAddOpen(false);

      setForm(initialForm);

      fetchBudgets();
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Gagal menambah budget';
      showToast('Error', msg);
    }
  }

  async function handleOpenEdit(budget: any) {
    setSelectedBudgetId(budget.id);

    const category = categories.find((c) => c.name === budget.categoryName);

    setForm({
      categoryId: category?.id || '',
      limitAmount: budget.limitAmount.toString(),
      alertThreshold: budget.alertThreshold.toString(),
      month: budget.month,
    });

    setEditOpen(true);
  }

  async function handleUpdateBudget() {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      if (
        !form.categoryId ||
        !form.limitAmount ||
        !form.alertThreshold ||
        !form.month
      ) {
        showToast('Error', 'Semua field wajib diisi');

        return;
      }

      const payload = {
        categoryId: form.categoryId,
        limitAmount: Number(form.limitAmount),
        alertThreshold: Number(form.alertThreshold),
        month: form.month,
      };

      await updateBudget(token, selectedBudgetId, payload);

      showToast('Berhasil', 'Budget berhasil diperbarui');

      setEditOpen(false);

      setForm(initialForm);

      fetchBudgets();
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Gagal menambah budget';
      showToast('Error', msg);
    }
  }

  async function handleDeleteBudget(id: string) {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      await deleteBudget(token, id);

      showToast('Berhasil', 'Budget dihapus');

      fetchBudgets();
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal menghapus budget');
    }
  }

  function formatCurrency(value: number) {
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
  }

  function renderForm(onSubmit: () => void, submitText: string) {
    return (
      <>
        <div className="form-group">
          <label className="form-label">Kategori</label>

          <select
            className="form-select"
            value={form.categoryId}
            onChange={(e) =>
              setForm({
                ...form,
                categoryId: e.target.value,
              })
            }
          >
            <option value="">Pilih Kategori</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Batas Budget (Rp)</label>

          <input
            className="form-input"
            type="number"
            value={form.limitAmount}
            onChange={(e) =>
              setForm({
                ...form,
                limitAmount: e.target.value,
              })
            }
            placeholder="500000"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Alert di (%)</label>

          <input
            className="form-input"
            type="number"
            value={form.alertThreshold}
            onChange={(e) =>
              setForm({
                ...form,
                alertThreshold: e.target.value,
              })
            }
            placeholder="80"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bulan</label>

          <input
            className="form-input"
            type="month"
            value={form.month}
            onChange={(e) =>
              setForm({
                ...form,
                month: e.target.value,
              })
            }
          />
        </div>

        <div className="btn-group">
          <button
            className="btn-cancel"
            onClick={() => {
              setAddOpen(false);
              setEditOpen(false);
            }}
          >
            Batal
          </button>

          <button className="btn-save" onClick={onSubmit}>
            {submitText}
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="cards-grid" style={{ marginBottom: '16px' }}>
        <div className="card">
          <div className="card-label">Total Budget</div>

          <div className="card-value">
            {formatCurrency(summary.totalBudget)}
          </div>

          <div className="card-sub">{summary.month}</div>
        </div>

        <div className="card">
          <div className="card-label">Terpakai</div>

          <div
            className="card-value"
            style={{
              color: 'var(--yellow)',
            }}
          >
            {formatCurrency(summary.totalSpent)}
          </div>

          <div className="card-sub">{summary.percentageSpent}% dari total</div>
        </div>

        <div className="card">
          <div className="card-label">Sisa Budget</div>

          <div
            className="card-value"
            style={{
              color: summary.totalRemaining < 0 ? 'var(--red)' : 'var(--green)',
            }}
          >
            {formatCurrency(summary.totalRemaining)}
          </div>

          <div className="card-sub">{summary.percentageRemaining}% tersisa</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          Budget per Kategori
        </div>

        <button className="btn-primary" onClick={() => setAddOpen(true)}>
          <svg viewBox="0 0 16 16">
            <line x1="8" y1="3" x2="8" y2="13" />

            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          Tambah
        </button>
      </div>

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
          }}
        >
          Memuat budget...
        </div>
      )}

      {!loading &&
        budgets.map((b) => {
          const percentage =
            b.limitAmount > 0
              ? Math.min((b.spentAmount / b.limitAmount) * 100, 100)
              : 0;

          return (
            <div key={b.id} className="budget-set-item">
              <div className="budget-set-row">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span className="budget-set-name">{b.categoryName}</span>
                </div>

                <div className="budget-set-val">
                  {formatCurrency(b.spentAmount)} /{' '}
                  {formatCurrency(b.limitAmount)}
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${percentage}%`,
                    background: b.isExceeded ? 'var(--red)' : 'var(--green)',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text3)',
                  }}
                >
                  Alert: {b.alertThreshold}%
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    className="btn-save"
                    onClick={() => handleOpenEdit(b)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn-cancel"
                    onClick={() => handleDeleteBudget(b.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>

              {b.isExceeded && (
                <div
                  className="alert-box"
                  style={{
                    marginTop: '8px',
                  }}
                >
                  <div className="alert-title">
                    Melebihi budget {formatCurrency(b.exceededAmount)}
                  </div>
                </div>
              )}
            </div>
          );
        })}

      {!loading && budgets.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text3)',
          }}
        >
          Belum ada budget
        </div>
      )}

      <Modal
        id="addBudget"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Budget"
        sub="Set batas pengeluaran per kategori"
      >
        {renderForm(handleCreateBudget, 'Simpan Budget')}
      </Modal>

      <Modal
        id="editBudget"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Budget"
        sub="Ubah batas budget kategori"
      >
        {renderForm(handleUpdateBudget, 'Simpan')}
      </Modal>
    </div>
  );
}
