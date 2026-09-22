import { useState } from 'react';
import styles from './ActivationForm.module.css';

const VALID_GOOGLE_DOMAINS = ['google.com', 'g.page', 'goo.gl'];

function isValidGoogleReviewUrl(value) {
  try {
    const url = new URL(value);
    return VALID_GOOGLE_DOMAINS.some((domain) => url.hostname.includes(domain));
  } catch {
    return false;
  }
}

export default function ActivationForm({
  onSubmit,
  loading,
  pinComplete,
  formComplete,
  onFormChange,
  initialData,
  title = 'Data Bisnis UMKM',
  subtitle = 'Isi informasi berikut untuk mengaktivasi kartu',
  submitLabel = 'Aktifkan kartu',
}) {
  const emptyForm = {
    activation_code: '',
    business_name: '',
    business_address: '',
    review_link: '',
  };
  const [form, setForm] = useState({ ...emptyForm, ...initialData });

  const [errors, setErrors] = useState({});
  const [showHelper, setShowHelper] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    if (onFormChange) onFormChange(nextForm);
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!/^[A-Za-z0-9]{8}$/.test(form.activation_code.trim())) {
      newErrors.activation_code = 'Kode verifikasi harus terdiri dari 8 karakter.';
    }
    if (!form.business_name.trim()) {
      newErrors.business_name = 'Nama bisnis wajib diisi.';
    }
    if (!form.review_link.trim()) {
      newErrors.review_link = 'Link Google Review wajib diisi.';
    } else if (!isValidGoogleReviewUrl(form.review_link.trim())) {
      newErrors.review_link =
        'Link tidak valid. Pastikan link berasal dari Google (misal: google.com atau g.page).';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="activation_code">
            Kode Verifikasi Kartu <span className={styles.required}>*</span>
          </label>
          <input
            id="activation_code"
            name="activation_code"
            type="text"
            className={`${styles.input} ${errors.activation_code ? styles.inputError : ''}`}
            placeholder="Kode 8 karakter di bagian belakang kartu"
            value={form.activation_code}
            onChange={handleChange}
            disabled={loading}
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
          />
          <p className={styles.helperText}>Masukkan kode pada kartu atau stiker scratch-off. Kode ini tidak sama dengan PIN.</p>
          {errors.activation_code && (
            <p className={styles.errorText}>
              <span className={styles.errorIcon}>⚠</span> {errors.activation_code}
            </p>
          )}
        </div>

        {/* Business Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="business_name">
            Nama Bisnis <span className={styles.required}>*</span>
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            className={`${styles.input} ${errors.business_name ? styles.inputError : ''}`}
            placeholder="Contoh: Warung Makan Budi Jaya"
            value={form.business_name}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.business_name && (
            <p className={styles.errorText}>
              <span className={styles.errorIcon}>⚠</span> {errors.business_name}
            </p>
          )}
        </div>

        {/* Business Address */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="business_address">
            Alamat Bisnis <span className={styles.optional}>(opsional)</span>
          </label>
          <input
            id="business_address"
            name="business_address"
            type="text"
            className={styles.input}
            placeholder="Contoh: Jl. Merdeka No.12, Bekasi"
            value={form.business_address}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Review Link */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="review_link">
              Link Google Review <span className={styles.required}>*</span>
            </label>
            <button
              type="button"
              className={styles.helperToggle}
              onClick={() => setShowHelper((v) => !v)}
            >
              {showHelper ? 'Sembunyikan' : '💡 Cara mendapatkan link?'}
            </button>
          </div>

          {showHelper && (
            <div className={styles.helperBox}>
              <p className={styles.helperTitle}>📌 Cara mendapatkan link Google Review:</p>
              <ol className={styles.helperList}>
                <li>Buka <strong>Google Business Profile</strong> bisnis Anda</li>
                <li>Klik menu <strong>"Dapatkan lebih banyak ulasan"</strong> atau <strong>"Bagikan formulir ulasan"</strong></li>
                <li><strong>Salin link</strong> yang muncul, lalu tempel di kolom ini</li>
              </ol>
              <p className={styles.helperAlt}>
                <strong>Alternatif:</strong> Cari nama toko di Google Maps → klik <em>"Tulis ulasan"</em> → salin link dari browser.
              </p>
            </div>
          )}

          <input
            id="review_link"
            name="review_link"
            type="url"
            className={`${styles.input} ${errors.review_link ? styles.inputError : ''}`}
            placeholder="https://g.page/r/... atau https://maps.google.com/..."
            value={form.review_link}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.review_link && (
            <p className={styles.errorText}>
              <span className={styles.errorIcon}>⚠</span> {errors.review_link}
            </p>
          )}
          {!errors.review_link && form.review_link && isValidGoogleReviewUrl(form.review_link) && (
            <p className={styles.successText}>✓ Link Google Review valid</p>
          )}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading || !formComplete || !pinComplete}>
          {loading ? (
            <span className={styles.loadingDot}>Menyimpan...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
