<script setup>
import { ref } from 'vue'
import api from '~/services/api'
import { useMascaras } from '~/composables/useMascaras'

const emit = defineEmits(['fechar', 'salvo'])
const toast = useToast()
const { mascaraCpf, mascaraTelefone, mascaraData, mascaraCep, mascaraRg, mascaraCns } = useMascaras()

const loading = ref(false)
const abaAtiva = ref('pessoais')

const form = ref({
  nome: '',
  dataNascimento: '',
  sexo: 'Masculino',
  email: '',
  cpf: '',
  rg: '',
  celular: '',
  casa: '',
  trabalho: '',
  aceitaSms: true,
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  naturalidade: '',
  nacionalidade: 'Brasileiro',
  etnia: '',
  religiao: '',
  estadoCivil: '',
  escolaridade: '',
  profissao: '',
  obito: false,
  ativo: true,
  cns: '',
  informacoesAdicionais: ''
})

async function salvarPaciente() {
  loading.value = true
  try {
    const { data } = await api.post('/pacientes', form.value)
    toast.sucesso('Paciente cadastrado com sucesso!')
    emit('salvo', data)
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao salvar paciente.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="novo-paciente">

    <!-- Prévia do paciente -->
    <div class="pac-preview">
      <div class="pac-prev-avatar">{{ form.nome ? form.nome.trim().charAt(0).toUpperCase() : '?' }}</div>
      <div class="pac-prev-info">
        <p class="pac-prev-nome">{{ form.nome || 'Nome do paciente' }}</p>
        <p class="pac-prev-sub">{{ form.dataNascimento ? form.dataNascimento : 'Data de nascimento' }} · {{ form.sexo || 'Sexo' }}</p>
      </div>
    </div>

    <!-- Abas -->
    <div class="tab-nav">
      <button
        v-for="aba in [
          { key: 'pessoais', label: 'Dados Pessoais' },
          { key: 'endereco', label: 'Endereço' },
          { key: 'complementares', label: 'Complementares' },
        ]"
        :key="aba.key"
        :class="['tab-btn', { active: abaAtiva === aba.key }]"
        type="button"
        @click="abaAtiva = aba.key"
      >
        {{ aba.label }}
      </button>
    </div>

    <!-- Aba: Dados Pessoais -->
    <div v-if="abaAtiva === 'pessoais'" class="form-grid">
      <div class="field-group span-2">
        <label>Nome Completo <span class="obrigatorio">*</span></label>
        <input v-model="form.nome" type="text" required :disabled="loading" placeholder="Nome completo do paciente" />
      </div>
      <div class="field-group">
        <label>Data de Nascimento</label>
        <input :value="form.dataNascimento" @input="form.dataNascimento = mascaraData($event.target.value)" type="text" placeholder="DD/MM/AAAA" maxlength="10" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Sexo</label>
        <select v-model="form.sexo" :disabled="loading">
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
        </select>
      </div>
      <div class="field-group">
        <label>CPF</label>
        <input :value="form.cpf" @input="form.cpf = mascaraCpf($event.target.value)" type="text" placeholder="000.000.000-00" maxlength="14" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>RG</label>
        <input :value="form.rg" @input="form.rg = mascaraRg($event.target.value)" type="text" placeholder="00.000.000-0" maxlength="12" :disabled="loading" />
      </div>
      <div class="field-group span-2">
        <label>E-mail</label>
        <input v-model="form.email" type="email" placeholder="email@exemplo.com" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Celular</label>
        <input :value="form.celular" @input="form.celular = mascaraTelefone($event.target.value)" type="text" placeholder="(00) 00000-0000" maxlength="15" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Telefone Residencial</label>
        <input :value="form.casa" @input="form.casa = mascaraTelefone($event.target.value)" type="text" placeholder="(00) 0000-0000" maxlength="14" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Telefone Trabalho</label>
        <input :value="form.trabalho" @input="form.trabalho = mascaraTelefone($event.target.value)" type="text" placeholder="(00) 0000-0000" maxlength="14" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>CNS</label>
        <input :value="form.cns" @input="form.cns = mascaraCns($event.target.value)" type="text" placeholder="000 0000 0000 0000" maxlength="18" :disabled="loading" />
      </div>
      <div class="field-group span-2">
        <label class="label-switch">
          <span>Aceita receber lembretes por SMS</span>
          <div class="switch">
            <input type="checkbox" v-model="form.aceitaSms" :disabled="loading" />
            <span class="slider"></span>
          </div>
        </label>
      </div>
    </div>

    <!-- Aba: Endereço -->
    <div v-if="abaAtiva === 'endereco'" class="form-grid">
      <div class="field-group">
        <label>CEP</label>
        <input :value="form.cep" @input="form.cep = mascaraCep($event.target.value)" type="text" placeholder="00000-000" maxlength="9" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>País</label>
        <select v-model="form.pais" :disabled="loading">
          <option value="Brasil">Brasil</option>
        </select>
      </div>
      <div class="field-group span-2">
        <label>Endereço</label>
        <input v-model="form.endereco" type="text" placeholder="Rua, Avenida..." :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Número</label>
        <input v-model="form.numero" type="text" placeholder="Nº" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Complemento</label>
        <input v-model="form.complemento" type="text" placeholder="Apto, sala..." :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Bairro</label>
        <input v-model="form.bairro" type="text" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Cidade</label>
        <input v-model="form.cidade" type="text" :disabled="loading" />
      </div>
      <div class="field-group span-2">
        <label>Estado</label>
        <select v-model="form.estado" :disabled="loading">
          <option value="">Selecione...</option>
          <option value="AC">Acre</option>
          <option value="AL">Alagoas</option>
          <option value="AP">Amapá</option>
          <option value="AM">Amazonas</option>
          <option value="BA">Bahia</option>
          <option value="CE">Ceará</option>
          <option value="DF">Distrito Federal</option>
          <option value="ES">Espírito Santo</option>
          <option value="GO">Goiás</option>
          <option value="MA">Maranhão</option>
          <option value="MT">Mato Grosso</option>
          <option value="MS">Mato Grosso do Sul</option>
          <option value="MG">Minas Gerais</option>
          <option value="PA">Pará</option>
          <option value="PB">Paraíba</option>
          <option value="PR">Paraná</option>
          <option value="PE">Pernambuco</option>
          <option value="PI">Piauí</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="RN">Rio Grande do Norte</option>
          <option value="RS">Rio Grande do Sul</option>
          <option value="RO">Rondônia</option>
          <option value="RR">Roraima</option>
          <option value="SC">Santa Catarina</option>
          <option value="SP">São Paulo</option>
          <option value="SE">Sergipe</option>
          <option value="TO">Tocantins</option>
        </select>
      </div>
    </div>

    <!-- Aba: Dados Complementares -->
    <div v-if="abaAtiva === 'complementares'" class="form-grid">
      <div class="field-group">
        <label>Naturalidade</label>
        <input v-model="form.naturalidade" type="text" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Nacionalidade</label>
        <select v-model="form.nacionalidade" :disabled="loading">
          <option value="Brasileiro">Brasileiro</option>
          <option value="Estrangeiro">Estrangeiro</option>
        </select>
      </div>
      <div class="field-group">
        <label>Etnia</label>
        <select v-model="form.etnia" :disabled="loading">
          <option value="">Selecione...</option>
          <option value="Branca">Branca</option>
          <option value="Preta">Preta</option>
          <option value="Parda">Parda</option>
          <option value="Amarela">Amarela</option>
          <option value="Indígena">Indígena</option>
        </select>
      </div>
      <div class="field-group">
        <label>Religião</label>
        <input v-model="form.religiao" type="text" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Estado Civil</label>
        <select v-model="form.estadoCivil" :disabled="loading">
          <option value="">Selecione...</option>
          <option value="Solteiro">Solteiro(a)</option>
          <option value="Casado">Casado(a)</option>
          <option value="Divorciado">Divorciado(a)</option>
          <option value="Viúvo">Viúvo(a)</option>
          <option value="União Estável">União Estável</option>
        </select>
      </div>
      <div class="field-group">
        <label>Escolaridade</label>
        <select v-model="form.escolaridade" :disabled="loading">
          <option value="">Selecione...</option>
          <option value="Fundamental Incompleto">Fundamental Incompleto</option>
          <option value="Fundamental Completo">Fundamental Completo</option>
          <option value="Médio Incompleto">Médio Incompleto</option>
          <option value="Médio Completo">Médio Completo</option>
          <option value="Superior Incompleto">Superior Incompleto</option>
          <option value="Superior Completo">Superior Completo</option>
          <option value="Pós-graduação">Pós-graduação</option>
        </select>
      </div>
      <div class="field-group">
        <label>Profissão</label>
        <input v-model="form.profissao" type="text" :disabled="loading" />
      </div>
      <div class="field-group">
        <label>Status</label>
        <select v-model="form.ativo" :disabled="loading">
          <option :value="true">Ativo</option>
          <option :value="false">Inativo</option>
        </select>
      </div>
      <div class="field-group span-2">
        <label>Informações Adicionais</label>
        <textarea v-model="form.informacoesAdicionais" :disabled="loading" rows="4" placeholder="Observações visíveis para toda a equipe..."></textarea>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="form-footer">
      <button type="button" class="btn-cancelar" @click="emit('fechar')" :disabled="loading">Cancelar</button>
      <button type="button" class="btn-salvar" @click="salvarPaciente" :disabled="loading">
        {{ loading ? 'Salvando...' : 'Salvar Paciente' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

.novo-paciente {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 20px 24px 24px;
}

/* Patient preview */
.pac-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #86efac;
  border-radius: 12px;
  margin-bottom: 20px;
}

.pac-prev-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.pac-prev-info { min-width: 0; }

.pac-prev-nome {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 2px;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
}

.pac-prev-sub {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

/* Abas */
.tab-nav {
  display: flex;
  gap: 2px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 22px;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #334155;
  background: rgba(255,255,255,0.6);
}

.tab-btn.active {
  color: #059669;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* Grid de campos */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-group.span-2 {
  grid-column: span 2;
}

.field-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  font-family: 'Inter', sans-serif;
}

.obrigatorio {
  color: #ef4444;
}

.field-group input,
.field-group select,
.field-group textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #334155;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  width: 100%;
}

.field-group input,
.field-group select {
  height: 42px;
}

.field-group textarea {
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.5;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}

.field-group input:disabled,
.field-group select:disabled,
.field-group textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-group input::placeholder,
.field-group textarea::placeholder {
  color: #94a3b8;
}

/* Switch SMS */
.label-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500 !important;
  color: #475569 !important;
  font-size: 14px !important;
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s;
  border-radius: 20px;
  border: none !important;
  height: 20px !important;
  padding: 0 !important;
  box-shadow: none !important;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #059669;
}

input:checked + .slider:before {
  transform: translateX(16px);
}

/* Rodapé */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancelar {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background 0.2s;
}

.btn-cancelar:hover { background: #e2e8f0; }
.btn-cancelar:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-salvar {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  transition: all 0.2s ease;
}

.btn-salvar:hover { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
