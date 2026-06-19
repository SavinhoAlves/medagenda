export function useMascaras() {
  function mascaraCpf(valor) {
    return String(valor || '')
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14)
  }

  // Mantém uppercase e permite apenas letras, dígitos, /, - e espaço
  // Ex: CRM/SP 123456 · CRO/RJ 12345 · COREN/SP 654321
  function mascaraConselho(valor) {
    return String(valor || '')
      .toUpperCase()
      .replace(/[^A-Z0-9/\- ]/g, '')
      .slice(0, 25)
  }

  // Celular: (00) 00000-0000 · Fixo: (00) 0000-0000
  function mascaraTelefone(valor) {
    const digits = String(valor || '').replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})/, '$1-$2')
    }
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2')
  }

  return { mascaraCpf, mascaraConselho, mascaraTelefone }
}
