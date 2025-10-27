// app.js — implementação EC02 robusta
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ===== Config =====
  const STORAGE_KEY = 'ec02_funcionarios_v1';

  // ===== Classe Funcionario =====
  class Funcionario {
    constructor(id, nome, idade, cargo, salario) {
      this.id = Number(id);
      this.nome = String(nome).trim();
      this.idade = Number(idade);
      this.cargo = String(cargo).trim();
      this.salario = Number(salario);
    }

    toString() {
      return `${this.nome} — ${this.cargo} — R$ ${this.salario.toFixed(2)}`;
    }

    isAltaRenda() {
      return Number.isFinite(this.salario) && this.salario > 5000;
    }

    isValid() {
      return this.nome.length > 0 &&
             Number.isInteger(this.idade) && this.idade >= 16 &&
             this.cargo.length > 0 &&
             Number.isFinite(this.salario) && this.salario >= 0;
    }
  }

  // ===== Helpers de storage com proteção contra JSON inválido =====
  const safeLoad = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // ensure objects have expected shape (best-effort)
      return parsed.map(p => new Funcionario(p.id, p.nome, p.idade, p.cargo, p.salario));
    } catch (err) {
      console.warn('localStorage parse error, resetting key', key, err);
      localStorage.removeItem(key);
      return [];
    }
  };

  const safeSave = (key, arr) => {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (err) {
      console.error('Falha ao salvar no localStorage', err);
      showAlert('Erro ao salvar dados localmente (storage cheio ou bloqueado).', 'danger');
    }
  };

  // ===== Estado inicial (carrega do storage) =====
  let funcionarios = safeLoad(STORAGE_KEY);

  // recalcula nextId com base nos dados (previne IDs duplicados)
  let nextId = (() => {
    if (!funcionarios.length) return 1;
    const max = funcionarios.reduce((m, f) => (Number(f.id) > m ? Number(f.id) : m), 0);
    return max + 1;
  })();

  // ===== DOM refs =====
  const form = document.getElementById('employee-form');
  const nomeEl = document.getElementById('nome');
  const idadeEl = document.getElementById('idade');
  const cargoEl = document.getElementById('cargo');
  const salarioEl = document.getElementById('salario');
  const editIdEl = document.getElementById('edit-id');
  const tbody = document.getElementById('employee-table-body');
  const alertPlaceholder = document.getElementById('alert-placeholder');
  const btnClearStorage = document.getElementById('btn-clear-storage');

  // Relatórios refs
  const reportAvgSalary = document.getElementById('report-avg-salary');
  const reportHighSalary = document.getElementById('report-high-salary');
  const reportUniqueRoles = document.getElementById('report-unique-roles');
  const reportUpperNames = document.getElementById('report-upper-names');

  // ===== UI helpers =====
  const showAlert = (message, type = 'info', timeout = 4000) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
      </div>`;
    alertPlaceholder.appendChild(wrapper);
    if (timeout) setTimeout(() => wrapper.remove(), timeout);
  };

  const setFormLoading = (isLoading) => {
    const btn = document.getElementById('submit-button');
    if (!btn) return;
    const text = btn.querySelector('.button-text');
    const spinner = btn.querySelector('.spinner-border');
    btn.disabled = isLoading;
    if (isLoading) {
      if (text) text.classList.add('d-none');
      if (spinner) spinner.classList.remove('d-none');
    } else {
      if (text) text.classList.remove('d-none');
      if (spinner) spinner.classList.add('d-none');
    }
  };

  // ===== Render tabela e relatórios =====
  const renderTable = () => {
    tbody.innerHTML = '';
    if (!funcionarios.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum funcionário cadastrado.</td></tr>';
      return;
    }

    // ordena alfabeticamente por nome
    const sorted = [...funcionarios].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

    for (const f of sorted) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(f.nome)}</td>
        <td>${Number(f.idade)}</td>
        <td>${escapeHtml(f.cargo)}</td>
        <td>R$ ${Number(f.salario).toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1 edit-btn" data-id="${f.id}" aria-label="Editar ${escapeHtml(f.nome)}"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${f.id}" aria-label="Excluir ${escapeHtml(f.nome)}"><i class="bi bi-trash-fill"></i></button>
        </td>`;
      tbody.appendChild(tr);
    }
  };

  const updateReports = () => {
    if (!funcionarios.length) {
      reportAvgSalary.textContent = 'N/A';
      reportHighSalary.innerHTML = '<li class="text-muted">Nenhum</li>';
      reportUniqueRoles.innerHTML = '<li class="text-muted">Nenhum</li>';
      reportUpperNames.innerHTML = '<li class="text-muted">Nenhum</li>';
      return;
    }

    // média salarial (reduce)
    const total = funcionarios.reduce((acc, f) => acc + (Number.isFinite(f.salario) ? f.salario : 0), 0);
    const avg = (total / funcionarios.length);
    reportAvgSalary.textContent = `R$ ${avg.toFixed(2)}`;

    // salários > 5000
    const high = funcionarios.filter(f => f.isAltaRenda()).sort((a,b) => a.nome.localeCompare(b.nome));
    reportHighSalary.innerHTML = high.length ? high.map(h => `<li>${escapeHtml(h.nome)} — R$ ${h.salario.toFixed(2)}</li>`).join('') : '<li class="text-muted">Nenhum</li>';

    // cargos únicos
    const cargos = [...new Set(funcionarios.map(f => f.cargo))];
    reportUniqueRoles.innerHTML = cargos.length ? cargos.map(c => `<li>${escapeHtml(c)}</li>`).join('') : '<li class="text-muted">Nenhum</li>';

    // nomes em maiúsculo
    reportUpperNames.innerHTML = funcionarios.map(f => `<li>${escapeHtml(f.nome.toUpperCase())}</li>`).join('');
  };

  // pequeno utilitário para evitar XSS em nomes/cargos
  const escapeHtml = (str) => {
    return String(str || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
  };

  // ===== Operações CRUD =====
  const saveAll = () => {
    safeSave(STORAGE_KEY, funcionarios);
  };

  const addFuncionario = (f) => {
    funcionarios.push(f);
    saveAll();
    renderTable();
    updateReports();
  };

  const updateFuncionario = (id, partial) => {
    const idx = funcionarios.findIndex(x => Number(x.id) === Number(id));
    if (idx === -1) return false;
    const existing = funcionarios[idx];
    // atualiza campos permitidos
    existing.nome = String(partial.nome ?? existing.nome).trim();
    existing.idade = Number(partial.idade ?? existing.idade);
    existing.cargo = String(partial.cargo ?? existing.cargo).trim();
    existing.salario = Number(partial.salario ?? existing.salario);
    if (!existing.isValid()) return false;
    funcionarios[idx] = existing;
    saveAll();
    renderTable();
    updateReports();
    return true;
  };

  const removeFuncionario = (id) => {
    const idx = funcionarios.findIndex(x => Number(x.id) === Number(id));
    if (idx === -1) return false;
    funcionarios.splice(idx, 1);
    saveAll();
    renderTable();
    updateReports();
    return true;
  };

  // ===== Eventos =====
  // Submissão do formulário (cadastro ou salvar edição)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.classList.add('was-validated');

    // leitura segura e sanitizada
    const nome = nomeEl.value.trim();
    const idade = Number(idadeEl.value);
    const cargo = cargoEl.value.trim();
    const salario = Number(salarioEl.value);

    // validações extras no JS (para evitar NaN etc.)
    const temp = new Funcionario(0, nome, Number.isFinite(idade) ? Math.trunc(idade) : NaN, cargo, Number.isFinite(salario) ? salario : NaN);
    if (!temp.isValid()) {
      showAlert('Dados inválidos. Verifique nome, idade (≥16), cargo e salário (≥0).', 'warning');
      return;
    }

    setFormLoading(true);

    // simula pequena latência UX (não bloqueante)
    setTimeout(() => {
      const editId = editIdEl.value ? Number(editIdEl.value) : null;
      if (editId) {
        // atualização
        const ok = updateFuncionario(editId, { nome, idade: Math.trunc(idade), cargo, salario });
        if (ok) {
          showAlert(`Funcionário <strong>${escapeHtml(nome)}</strong> atualizado.`, 'success');
        } else {
          showAlert('Erro ao atualizar — dados inválidos ou funcionário não encontrado.', 'danger');
        }
      } else {
        // novo cadastro
        const f = new Funcionario(nextId++, nome, Math.trunc(idade), cargo, salario);
        addFuncionario(f);
        showAlert(`Funcionário <strong>${escapeHtml(nome)}</strong> cadastrado.`, 'success');
      }

      // limpa form
      form.reset();
      form.classList.remove('was-validated');
      editIdEl.value = '';
      setFormLoading(false);
    }, 250);
  });

  // Delegação para editar/excluir
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains('delete-btn')) {
      const f = funcionarios.find(x => Number(x.id) === Number(id));
      if (!f) { showAlert('Funcionário não encontrado.', 'danger'); return; }
      if (!confirm(`Confirma exclusão de "${f.nome}"?`)) return;
      const removed = removeFuncionario(id);
      if (removed) showAlert('Funcionário excluído.', 'info');
      return;
    }

    if (btn.classList.contains('edit-btn')) {
      const f = funcionarios.find(x => Number(x.id) === Number(id));
      if (!f) { showAlert('Funcionário não encontrado.', 'danger'); return; }
      // popula formulário para edição
      nomeEl.value = f.nome;
      idadeEl.value = f.idade;
      cargoEl.value = f.cargo;
      salarioEl.value = f.salario;
      editIdEl.value = f.id;
      // foco no nome
      nomeEl.focus();
      showAlert('Modo EDIÇÃO: edite os campos e clique em Cadastrar para salvar.', 'warning', 3000);
      return;
    }
  });

  // limpar storage (ação perigosa — pede confirmação)
  btnClearStorage.addEventListener('click', () => {
    if (!confirm('Irá apagar TODAS os dados locais (funcionários). Deseja continuar?')) return;
    localStorage.removeItem(STORAGE_KEY);
    funcionarios = [];
    nextId = 1;
    renderTable();
    updateReports();
    showAlert('Dados locais apagados.', 'info');
  });

  // ===== Inicialização UI =====
  renderTable();
  updateReports();
});