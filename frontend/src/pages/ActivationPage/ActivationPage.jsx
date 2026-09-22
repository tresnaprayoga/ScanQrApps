import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ActivationForm from '../../components/ActivationForm/ActivationForm';
import PinInput from '../../components/PinInput/PinInput';
import { API_BASE_URL } from '../../services/api';
import styles from './ActivationPage.module.css';

function isValidReviewLink(value) {
  try {
    const url = new URL(value);
    return ['google.com', 'g.page', 'goo.gl'].some((domain) => url.hostname.includes(domain));
  } catch {
    return false;
  }
}

export default function ActivationPage() {
  const { card_id: cardId } = useParams();
  const [pin, setPin] = useState('');
  const [businessData, setBusinessData] = useState({
    business_name: '',
    business_address: '',
    review_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const formComplete = Boolean(
    businessData.business_name.trim() && isValidReviewLink(businessData.review_link.trim()),
  );

  const activateCard = async (form) => {
    if (pin.length !== 4 || !cardId) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/cards/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, ...form, pin }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Aktivasi kartu gagal. Silakan coba lagi.');
      }
      setSuccess(result.data || { card_id: cardId, business_name: form.business_name });
    } catch (requestError) {
      setError(requestError.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className={styles.page}>
        <section className={styles.successPanel} aria-live="polite">
          <div className={styles.successIcon} aria-hidden="true">✓</div>
          <p className={styles.eyebrow}>Aktivasi berhasil</p>
          <h1>Kartu siap digunakan</h1>
          <p className={styles.successText}>
            Kartu <strong>{success.card_id}</strong> untuk <strong>{success.business_name}</strong> sudah aktif.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Aktivasi kartu</p>
        <h1>Siapkan kartu bisnis Anda</h1>
        <p className={styles.intro}>Lengkapi data bisnis dan buat PIN untuk mulai menggunakan kartu.</p>
        <div className={styles.cardId}>
          <span>ID kartu</span>
          <strong>{cardId || 'Tidak ditemukan'}</strong>
        </div>
      </header>

      {!cardId && <div className={styles.errorBanner}>ID kartu tidak ditemukan pada URL.</div>}
      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      <div className={styles.formStack}>
        <ActivationForm
          onSubmit={activateCard}
          loading={loading}
          pinComplete={pin.length === 4}
          formComplete={Boolean(cardId) && formComplete}
          onFormChange={setBusinessData}
        />
        <PinInput onChange={setPin} disabled={loading} />
      </div>
    </main>
  );
}