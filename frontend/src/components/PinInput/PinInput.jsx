import { useState, useRef } from 'react';
import styles from './PinInput.module.css';

/**
 * PinInput — komponen 4-digit PIN dengan OTP-style boxes
 *
 * Props:
 *   onChange(pin: string)  — dipanggil setiap kali nilai berubah
 *   error (string)         — pesan error dari parent (opsional)
 *   disabled (bool)
 */
export default function PinInput({ onChange, error: externalError, disabled }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [touched, setTouched] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, ''); // angka saja
    if (!val && e.nativeEvent.inputType !== 'deleteContentBackward') return;

    const newDigits = [...digits];

    if (val) {
      // Jika user paste 4 digit sekaligus
      if (val.length === 4) {
        const pasted = val.split('');
        setDigits(pasted);
        if (onChange) onChange(pasted.join(''));
        refs[3].current.focus();
        return;
      }
      newDigits[index] = val[0];
      setDigits(newDigits);
      if (onChange) onChange(newDigits.join(''));
      // Pindah ke kotak berikutnya
      if (index < 3) refs[index + 1].current.focus();
    } else {
      newDigits[index] = '';
      setDigits(newDigits);
      if (onChange) onChange(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      if (digits[index]) {
        // Hapus digit saat ini
        newDigits[index] = '';
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(''));
      } else if (index > 0) {
        // Pindah ke kotak sebelumnya dan hapus
        newDigits[index - 1] = '';
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(''));
        refs[index - 1].current.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) refs[index - 1].current.focus();
    if (e.key === 'ArrowRight' && index < 3) refs[index + 1].current.focus();
  };

  const handleFocus = (index) => {
    // Tandai kotak pertama yang punya nilai jika ada
    refs[index].current.select();
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const filledCount = digits.filter(Boolean).length;
  const inlineError =
    touched && filledCount > 0 && filledCount < 4
      ? 'PIN harus tepat 4 digit angka.'
      : '';

  const activeError = externalError || inlineError;

  return (
    <div className={styles.wrapper}>
      {/* Label */}
      <label className={styles.label}>
        PIN Kartu <span className={styles.required}>*</span>
      </label>

      {/* Helper text */}
      <div className={styles.helperBox}>
        <span className={styles.helperIcon}>🔒</span>
        <p className={styles.helperText}>
          Buat PIN 4 digit untuk melindungi kartu ini. PIN digunakan saat UMKM ingin mengubah data kartu di kemudian hari. <strong>Jangan bagikan PIN ke siapapun.</strong>
        </p>
      </div>

      {/* OTP-style 4 boxes */}
      <div className={styles.boxRow}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={refs[i]}
            id={`pin-box-${i}`}
            type="password"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={() => handleFocus(i)}
            onBlur={handleBlur}
            disabled={disabled}
            autoComplete="one-time-code"
            className={`${styles.box} ${digit ? styles.boxFilled : ''} ${activeError ? styles.boxError : ''}`}
            aria-label={`Digit PIN ke-${i + 1}`}
          />
        ))}
      </div>

      {/* Strength dots */}
      <div className={styles.dots} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`${styles.dot} ${digits[i] ? styles.dotFilled : ''}`}
          />
        ))}
        <span className={styles.dotsLabel}>{filledCount}/4 digit</span>
      </div>

      {/* Error message */}
      {activeError && (
        <p className={styles.errorText}>
          <span>⚠</span> {activeError}
        </p>
      )}
    </div>
  );
}
