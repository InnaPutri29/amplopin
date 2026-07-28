// Daftar default jenis acara. User tetap bebas mengetik jenis acara lain
// di form, tapi UI mengarahkan mereka memilih kategori_acara yang tepat
// (suka_cita vs duka) agar kalkulasi Jejak Silaturahmi akurat.
export const JENIS_ACARA_DEFAULT = [
  { label: 'Pernikahan', kategori_acara: 'suka_cita' },
  { label: 'Khitanan', kategori_acara: 'suka_cita' },
  { label: 'Syukuran', kategori_acara: 'suka_cita' },
  { label: 'Aqiqah', kategori_acara: 'suka_cita' },
  { label: 'Ulang Tahun', kategori_acara: 'suka_cita' },
  { label: 'Duka Cita', kategori_acara: 'duka' },
  { label: 'Lainnya', kategori_acara: 'suka_cita' },
]

export const KATEGORI_LABEL = {
  suka_cita: 'Suka Cita',
  duka: 'Duka',
}
