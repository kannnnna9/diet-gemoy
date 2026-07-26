// Pilih palet layar login secara acak 50/50: 'paypey' (Matcha) atau 'ffazeyall' (Cranberry).
// Dipisah dari komponen agar bentuk keluarannya bisa di-unit-test.
export function pilihTemaLogin() {
  return Math.random() < 0.5 ? 'paypey' : 'ffazeyall'
}
