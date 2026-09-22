import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ActivationForm from '../../components/ActivationForm/ActivationForm';
import PinInput from '../../components/PinInput/PinInput';
import { API_BASE_URL } from '../../services/api';
import styles from './EditCardPage.module.css';

function isValidReviewLink(value) {
  try {
    const url = new URL(value);
    return ['google.com', 'g.page', 'goo.gl'].some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

const emptyBusinessData = {
  business_name: '',
  business_address: '',
  review_link: '',
};

export default function EditCardPage() {
  const { card_id: cardId } = useParams();
  const [pin, setPin] = useState('');
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const formComplete = Boolean(
    businessData?.business_name?.trim() &&
      isValidReviewLink(businessData.review_link?.trim() || ''),
  );

  const verifyPin = async () => {
    if (!cardId || pin.length !== 4) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/cards/${cardId}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'PIN tidak valid.');
      setBusinessData({ ...emptyBusinessData, ...result.data });
    } catch (requestError) {
      setError(requestError.message || 'Terjadi kesalahan saat memverifikasi PIN.');
    } finally {
      setLoading(false);
    }
  };

  const updateCard = async (form) => {
    if (!cardId || !businessData || pin.length !== 4) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pin }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Perubahan kartu gagal disimpan.');
      setSuccess(result.data || { card_id: cardId, business_name: form.business_name });
    } catch (requestError) {
      setError(requestError.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className={styles.page}>
        <section className={styles.successPanel} aria-live="polite">
          <div className={styles.successIcon} aria-hidden="true">✓</div>
          <p className={styles.eyebrow}>Perubahan berhasil</p>
          <h1>Data kartu sudah diperbarui</h1>
          <p className={styles.successText}>
            Data <strong>{success.business_name}</strong> akan langsung digunakan saat kartu dipindai kembali.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Edit kartu</p>
        <h1>Perbarui data bisnis</h1>
        <p className={styles.intro}>
          Verifikasi PIN terlebih dahulu untuk melihat dan mengubah informasi kartu.
        </p>
        <div className={styles.cardId}>
          <span>ID kartu</span>
          <strong>{cardId || 'Tidak ditemukan'}</strong>
        </div>
      </header>

      {!cardId && <div className={styles.errorBanner}>ID kartu tidak ditemukan pada URL.</div>}
      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {!businessData ? (
        <section className={styles.verifyPanel}>
          <div className={styles.stepLabel}>Langkah 1 dari 2</div>
          <h2>Verifikasi PIN</h2>
          <p className={styles.panelText}>Data kartu baru akan ditampilkan setelah PIN benar.</p>
          <PinInput
            onChange={setPin}
            disabled={loading || !cardId}
            label="PIN kartu"
            helperText="Masukkan PIN 4 digit untuk membuka data kartu."
            error={error && pin.length === 4 ? error : ''}
          />
          <button
            type="button"
            className={styles.actionButton}
            onClick={verifyPin}
            disabled={loading || pin.length !== 4 || !cardId}
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi PIN'}
          </button>
        </section>
      ) : (
        <div className={styles.formStack}>
          <div className={styles.stepLabel}>Langkah 2 dari 2</div>
          <ActivationForm
            initialData={businessData}
            onSubmit={updateCard}
            onFormChange={setBusinessData}
            loading={loading}
            pinComplete
            formComplete={formComplete}
            title="Data bisnis kartu"
            subtitle="Perubahan akan langsung berlaku pada kartu ini."
            submitLabel="Simpan perubahan"
          />
        </div>
      )}
    </main>
  );
}
