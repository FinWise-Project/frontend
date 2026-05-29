'use client';

import { useEffect, useState } from 'react';
import { useToast } from '../Toast';
import Modal from '../Modal';

import {
  getTransactions,
  getTransactionById,
  deleteTransaction,
  createTransaction,
  updateTransaction,
} from '@/lib/transaction';

import { getCategories } from '@/lib/category';
import { getSubcategories } from '@/lib/subcategory';
import { getPaymentMethods } from '@/lib/payment-method';

const filters = [
  { id: 'all', label: 'Semua' },
  { id: 'income', label: 'Pemasukan' },
  { id: 'expense', label: 'Pengeluaran' },
  { id: 'Makanan', label: 'Makanan' },
  { id: 'Pendidikan', label: 'Pendidikan' },
  { id: 'Perjalanan', label: 'Perjalanan' },
  { id: 'Transportasi', label: 'Transportasi' },
  { id: 'Gaji & Pendapatan', label: 'Gaji & Pendapatan' },
  { id: 'Kesehatan', label: 'Kesehatan' },
  { id: 'Tagihan', label: 'Tagihan' },
  { id: 'Hiburan', label: 'Hiburan' },
  { id: 'Lainnya', label: 'Lainnya' },
  { id: 'Belanja', label: 'Belanja' },
];

const initialForm = {
  date: '',
  amount: '',
  type: 'expense',
  description: '',
  category_id: '',
  subCategoryId: '',
  paymentMethodId: '',
};

export default function TransaksiPage({ onAddTx }: { onAddTx: () => void }) {
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('all');
  const [txList, setTxList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [form, setForm] = useState(initialForm);

  const isFormValid = Boolean(
    form.description &&
    form.amount &&
    form.date &&
    form.category_id &&
    form.subCategoryId &&
    form.paymentMethodId,
  );

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchPaymentMethods();
  }, []);

  async function fetchTransactions(categoryName?: string) {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await getTransactions(token, { categoryName });
      setTxList(response.data.transactions);
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal mengambil transaksi');
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

  async function fetchSubcategories(categoryId: string) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await getSubcategories(token, categoryId);
      setSubcategories(response.data.subCategories);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPaymentMethods() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await getPaymentMethods(token);
      setPaymentMethods(response.data.paymentMethods);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      await deleteTransaction(token, id);
      setTxList((prev) => prev.filter((t) => t.id !== id));
      showToast('Berhasil', 'Transaksi berhasil dihapus');
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal menghapus transaksi');
    }
  }

  async function handleFilterChange(filterId: string) {
    setActiveFilter(filterId);
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      setLoading(true);
      let response;
      if (filterId === 'all') {
        response = await getTransactions(token);
      } else if (filterId === 'income' || filterId === 'expense') {
        response = await getTransactions(token, {
          type: filterId as 'income' | 'expense',
        });
      } else {
        response = await getTransactions(token, {
          categoryName: filterId,
        });
      }
      setTxList(response.data.transactions);
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal filter transaksi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTransaction() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const payload = {
        date: form.date,
        amount: Number(form.amount),
        type: form.type as 'income' | 'expense',
        subCategoryId: form.subCategoryId,
        paymentMethodId: form.paymentMethodId,
        description: form.description,
      };

      await createTransaction(token, payload);

      showToast('Berhasil', 'Transaksi berhasil ditambahkan');
      setAddOpen(false);
      setForm(initialForm);
      setSubcategories([]);
      fetchTransactions();
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal menambah transaksi');
    }
  }

  async function handleOpenEdit(id: string) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await getTransactionById(token, id);
      const tx = response.data.transaction;

      setSelectedTxId(id);
      setForm({
        date: tx.date.split('T')[0],
        amount: tx.amount.toString(),
        type: tx.type,
        description: tx.description,
        category_id: tx.category_id,
        subCategoryId: tx.sub_category_id,
        paymentMethodId: tx.payment_method_id,
      });

      if (tx.category_id) {
        await fetchSubcategories(tx.category_id);
      }

      setEditOpen(true);
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal mengambil detail transaksi');
    }
  }

  async function handleUpdateTransaction() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const payload = {
        date: form.date,
        amount: Number(form.amount),
        type: form.type as 'income' | 'expense',
        subCategoryId: form.subCategoryId,
        paymentMethodId: form.paymentMethodId,
        description: form.description,
      };

      await updateTransaction(token, selectedTxId, payload);

      showToast('Berhasil', 'Transaksi berhasil diperbarui');
      setEditOpen(false);
      setForm(initialForm);
      setSubcategories([]);
      fetchTransactions();
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal update transaksi');
    }
  }

  function renderForm(onSubmit: () => void, submitText: string) {
    return (
      <>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <input
            required
            className="form-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nominal</label>
          <input
            required
            className="form-input"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              required
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              required
              className="form-input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            required
            className="form-select"
            value={form.category_id}
            onChange={(e) => {
              const categoryId = e.target.value;
              setForm({
                ...form,
                category_id: categoryId,
                subCategoryId: '',
              });
              fetchSubcategories(categoryId);
            }}
          >
            <option value="">Pilih Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Subcategory</label>
          <select
            required
            className="form-select"
            value={form.subCategoryId}
            onChange={(e) =>
              setForm({ ...form, subCategoryId: e.target.value })
            }
          >
            <option value="">Pilih Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select
            required
            className="form-select"
            value={form.paymentMethodId}
            onChange={(e) =>
              setForm({ ...form, paymentMethodId: e.target.value })
            }
          >
            <option value="">Pilih Payment Method</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
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

          <button
            className="btn-save"
            onClick={onSubmit}
            disabled={!isFormValid}
            style={{
              opacity: isFormValid ? 1 : 0.5,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
            }}
          >
            {submitText}
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div className="filter-bar">
          {filters.map((f) => (
            <div
              key={f.id}
              className={`filter-chip${activeFilter === f.id ? ' active' : ''}`}
              onClick={() => handleFilterChange(f.id)}
            >
              {f.label}
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={() => setAddOpen(true)}>
          <svg viewBox="0 0 16 16">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          Tambah
        </button>
      </div>

      <div>
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text3)',
            }}
          >
            Memuat transaksi...
          </div>
        )}

        {!loading &&
          txList.map((tx) => (
            <div key={tx.id} className="tx-full-item">
              <div
                className="tx-icon"
                style={{
                  background: tx.type === 'income' ? '#16a34a20' : '#dc262620',
                }}
              >
                {tx.type === 'income' ? '↑' : '↓'}
              </div>

              <div style={{ flex: 1 }}>
                <div className="tx-name">{tx.description}</div>
                <div className="tx-cat">
                  {tx.category_name} • {tx.payment_method_name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text3)',
                    marginTop: '2px',
                  }}
                >
                  {new Date(tx.date).toLocaleDateString('id-ID')}
                </div>
              </div>

              <div
                className={`tx-amt ${tx.type === 'income' ? 'pos' : 'neg'}`}
                style={{ marginRight: '12px' }}
              >
                {tx.type === 'income' ? '+' : '-'}Rp{' '}
                {Number(tx.amount).toLocaleString('id-ID')}
              </div>

              <div className="tx-actions">
                <div
                  className="tx-action-btn"
                  onClick={() => handleOpenEdit(tx.id)}
                >
                  <svg viewBox="0 0 16 16">
                    <path d="M11 2l3 3-8 8H3v-3l8-8z" />
                  </svg>
                </div>

                <div
                  className="tx-action-btn del"
                  onClick={() => handleDelete(tx.id)}
                >
                  <svg viewBox="0 0 16 16">
                    <path d="M3 4h10M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

        {!loading && txList.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text3)',
              fontSize: '13px',
            }}
          >
            Belum ada transaksi
          </div>
        )}
      </div>

      <Modal
        id="addTx"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Transaksi"
        sub="Tambahkan transaksi baru"
      >
        {renderForm(handleCreateTransaction, 'Simpan')}
      </Modal>

      <Modal
        id="editTx"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Transaksi"
        sub="Ubah transaksi"
      >
        {renderForm(handleUpdateTransaction, 'Update')}
      </Modal>
    </div>
  );
}
