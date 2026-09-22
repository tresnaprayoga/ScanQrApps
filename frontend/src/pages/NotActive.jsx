import { useSearchParams } from 'react-router-dom';
import styles from './NotActive.module.css';

const NotActive = () => {
  const [searchParams] = useSearchParams();
  const isInvalid = searchParams.get('reason') === 'invalid';
  const cardId = searchParams.get('card_id');

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="status-title">
        <div className={`${styles.icon} ${isInvalid ? styles.invalidIcon : ''}`} aria-hidden="true">
          {isInvalid ? '?' : '!'}
        </div>
        <p className={styles.eyebrow}>Informasi kartu</p>
        <h1 id="status-title">{isInvalid ? 'Kartu tidak dikenali' : 'Kartu belum aktif'}</h1>
        <p className={styles.message}>
          {isInvalid
            ? 'QR atau kartu ini belum terdaftar di sistem. Periksa kembali kartu yang Anda gunakan.'
            : 'Kartu ini belum diaktifkan oleh pemiliknya, jadi belum dapat digunakan.'}
        </p>

        <div className={styles.contactBox}>
          <span className={styles.contactIcon} aria-hidden="true">i</span>
          <div>
            <h2>Butuh bantuan?</h2>
            <p>Silakan hubungi penjual atau pemilik kartu untuk mendapatkan bantuan.</p>
            {cardId && (
              <p className={styles.cardReference}>
                Sampaikan ID kartu <strong>{cardId}</strong> saat menghubungi mereka.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotActive;
