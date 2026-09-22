import { useSearchParams } from 'react-router-dom';

const NotActive = () => {
  const [searchParams] = useSearchParams();
  const isInvalid = searchParams.get('reason') === 'invalid';

  return (
    <div>
      <h1>{isInvalid ? 'Kartu tidak valid' : 'Kartu belum aktif'}</h1>
      <p>
        {isInvalid
          ? 'QR atau kartu yang Anda gunakan tidak terdaftar. Silakan hubungi pemilik kartu.'
          : 'Kartu ini belum diaktivasi. Silakan hubungi pemilik kartu.'}
      </p>
    </div>
  );
};

export default NotActive;
