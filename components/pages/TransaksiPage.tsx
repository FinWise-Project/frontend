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
  { id: 'Bills', label: 'Tagihan' },
  { id: 'Entertainment', label: 'Hiburan' },
  { id: 'Food', label: 'Makanan' },
  { id: 'Salary', label: 'Gaji & Pendapatan' },
  { id: 'Shopping', label: 'Belanja' },
  { id: 'Transport', label: 'Transportasi' },
  { id: 'Others', label: 'Lainnya' },
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

const ITEMS_PER_PAGE = 50;

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const isFormValid = Boolean(
    form.description &&
    form.amount &&
    form.date &&
    form.category_id &&
    form.subCategoryId &&
    form.paymentMethodId,
  );

  useEffect(() => {
    fetchTransactions(undefined, undefined, 1);
    fetchCategories();
    fetchPaymentMethods();
  }, []);

  /**
   * Fetch transactions with optional filter + pagination.
   * @param categoryName  - filter by category name
   * @param type          - filter by 'income' | 'expense'
   * @param page          - page number (1-based), defaults to currentPage
   */
  async function fetchTransactions(
    categoryName?: string,
    type?: 'income' | 'expense',
    page: number = currentPage,
  ) {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await getTransactions(token, {
        categoryName,
        type,
        page,
        limit: ITEMS_PER_PAGE,
      });

      setTxList(response.data.transactions);

      // Sesuaikan key berikut dengan respons API Anda.
      // Contoh umum: response.data.totalPages & response.data.total
      const total: number = response.data.total ?? response.data.totalData ?? 0;
      const pages: number =
        response.data.totalPages ??
        Math.ceil(total / ITEMS_PER_PAGE) ??
        1;

      setTotalData(total);
      setTotalPages(pages);
      setCurrentPage(page);
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
      // Refresh halaman yang sama; jika page jadi kosong setelah delete, kembali ke page sebelumnya
      const targetPage =
        txList.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await handleFilterChange(activeFilter, targetPage);
      showToast('Berhasil', 'Transaksi berhasil dihapus');
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal menghapus transaksi');
    }
  }

  async function handleFilterChange(filterId: string, page = 1) {
    setActiveFilter(filterId);
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      setLoading(true);
      let response;
      if (filterId === 'all') {
        response = await getTransactions(token, { page, limit: ITEMS_PER_PAGE });
      } else if (filterId === 'income' || filterId === 'expense') {
        response = await getTransactions(token, {
          type: filterId as 'income' | 'expense',
          page,
          limit: ITEMS_PER_PAGE,
        });
      } else {
        response = await getTransactions(token, {
          categoryName: filterId,
          page,
          limit: ITEMS_PER_PAGE,
        });
      }

      setTxList(response.data.transactions);

      const total: number = response.data.total ?? response.data.totalData ?? 0;
      const pages: number =
        response.data.totalPages ?? Math.ceil(total / ITEMS_PER_PAGE) ?? 1;

      setTotalData(total);
      setTotalPages(pages);
      setCurrentPage(page);
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
      // Kembali ke page 1 agar data baru terlihat
      handleFilterChange(activeFilter, 1);
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
      // Tetap di halaman yang sama setelah update
      handleFilterChange(activeFilter, currentPage);
    } catch (error) {
      console.error(error);
      showToast('Error', 'Gagal update transaksi');
    }
  }

  /** Membuat array nomor halaman dengan elipsis. Contoh: [1, '...', 4, 5, 6, '...', 10] */
  function buildPageNumbers(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];
    const delta = 2; // jumlah halaman di kiri/kanan currentPage

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);

    return pages;
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

  const pageNumbers = buildPageNumbers();

  return (
    <div>
      {/* ── Header: filter bar + tombol tambah ── */}
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
              onClick={() => handleFilterChange(f.id, 1)}
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

      {/* ── List transaksi ── */}
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

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '0.5px solid var(--border)',  /* garis pemisah dari list */
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {/* Info total data */}
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
            {totalData > 0
              ? `Menampilkan ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  totalData,
                )} dari ${totalData} transaksi`
              : `Halaman ${currentPage} dari ${totalPages}`}
          </span>

          {/* Tombol halaman */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Prev */}
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => handleFilterChange(activeFilter, currentPage - 1)}
              aria-label="Halaman sebelumnya"
            >
              ‹
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  style={{
                    padding: '0 4px',
                    fontSize: '13px',
                    color: 'var(--text3)',
                  }}
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`page-btn${currentPage === p ? ' active' : ''}`}
                  onClick={() => handleFilterChange(activeFilter, p as number)}
                  aria-label={`Halaman ${p}`}
                  aria-current={currentPage === p ? 'page' : undefined}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => handleFilterChange(activeFilter, currentPage + 1)}
              aria-label="Halaman berikutnya"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Tambah ── */}
      <Modal
        id="addTx"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Transaksi"
        sub="Tambahkan transaksi baru"
      >
        {renderForm(handleCreateTransaction, 'Simpan')}
      </Modal>

      {/* ── Modal Edit ── */}
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