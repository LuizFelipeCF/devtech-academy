// Aguarda o DOM ser totalmente carregado para executar o script
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- MODELO DE DADOS (Model) ---

    /**
     * Classe que representa um Aluno.
     * @param {number} id - Identificador único do aluno.
     * @param {string} nome - Nome do aluno.
     * @param {number} idade - Idade do aluno.
     * @param {string} curso - Curso do aluno.
     * @param {number} notaFinal - Nota final do aluno.
     */
    class Aluno {
        constructor(id, nome, idade, curso, notaFinal) {
            this.id = id;
            this.nome = nome;
            this.idade = parseInt(idade, 10);
            this.curso = curso;
            this.notaFinal = parseFloat(notaFinal);
        }

        /**
         * Verifica se o aluno foi aprovado (nota >= 7).
         * @returns {boolean} - True se aprovado, false caso contrário.
         */
        isAprovado() {
            return this.notaFinal >= 7;
        }

        /**
         * Retorna uma representação em string dos dados do aluno.
         * @returns {string} - Dados formatados.
         */
        toString() {
            return `ID: ${this.id}, Nome: ${this.nome}, Idade: ${this.idade}, Curso: ${this.curso}, Nota: ${this.notaFinal}`;
        }
    }

    // --- ESTADO DA APLICAÇÃO (State) ---

    // Array para armazenar os objetos Aluno em memória
    let alunos = [];
    // Contador para gerar IDs únicos
    let nextId = 1;

    // --- REFERÊNCIAS DO DOM (View) ---

    const studentForm = document.getElementById('student-form');
    const submitButton = document.getElementById('submit-button');
    const studentTableBody = document.getElementById('student-table-body');
    const alertPlaceholder = document.getElementById('alert-placeholder');

    const editStudentModalElement = document.getElementById('editStudentModal');
    const editStudentModal = editStudentModalElement ? new bootstrap.Modal(editStudentModalElement) : null;
    const editStudentForm = document.getElementById('edit-student-form');

    // --- FUNÇÕES DE RENDERIZAÇÃO E UTILITÁRIAS (Controller/View) ---

    /**
     * Exibe um alerta dinâmico na página.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - O tipo de alerta (e.g., 'success', 'danger').
     */
    const showAlert = (message, type) => {
        if (!alertPlaceholder) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertPlaceholder.append(wrapper);
        // Remove o alerta após 5 segundos
        setTimeout(() => {
            wrapper.remove();
        }, 5000);
    };

    /**
     * Renderiza a tabela de alunos com os dados do array 'alunos'.
     */
    const renderTable = () => {
        if (!studentTableBody) return;
        studentTableBody.innerHTML = ''; // Limpa a tabela

        if (alunos.length === 0) {
            studentTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum aluno cadastrado.</td></tr>';
            return;
        }

        // Ordena os alunos por nome antes de renderizar
        const sortedAlunos = [...alunos].sort((a, b) => a.nome.localeCompare(b.nome));

        sortedAlunos.forEach(aluno => {
            const tr = document.createElement('tr');
            const statusClass = aluno.isAprovado()? 'text-success' : 'text-danger';
            const statusText = aluno.isAprovado()? 'Aprovado' : 'Reprovado';

            tr.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.idade}</td>
                <td>${aluno.curso}</td>
                <td>${aluno.notaFinal.toFixed(1)}</td>
                <td><span class="${statusClass} fw-bold">${statusText}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${aluno.id}" aria-label="Editar aluno ${aluno.nome}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${aluno.id}" aria-label="Excluir aluno ${aluno.nome}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `;
            studentTableBody.appendChild(tr);
        });
    };

    /**
     * Atualiza o painel de relatórios.
     */
    const updateReports = () => {
        const avgGradeEl = document.getElementById('report-avg-grade');
        const avgAgeEl = document.getElementById('report-avg-age');
        const byCourseList = document.getElementById('report-by-course');
        const approvedList = document.getElementById('report-approved');

        if (!avgGradeEl || !avgAgeEl || !byCourseList || !approvedList) return;

        if (alunos.length === 0) {
            avgGradeEl.textContent = 'N/A';
            avgAgeEl.textContent = 'N/A';
            byCourseList.innerHTML = '<li class="list-group-item">Nenhum aluno cadastrado.</li>';
            approvedList.innerHTML = '<li class="list-group-item">Nenhum aluno cadastrado.</li>';
            return;
        }

        // Média de Notas
        const totalGrades = alunos.reduce((sum, aluno) => sum + aluno.notaFinal, 0);
        const avgGrade = (totalGrades / alunos.length).toFixed(2);
        avgGradeEl.textContent = avgGrade;

        // Média de Idades
        const totalAges = alunos.reduce((sum, aluno) => sum + aluno.idade, 0);
        const avgAge = (totalAges / alunos.length).toFixed(1);
        avgAgeEl.textContent = avgAge;

        // Alunos por Curso
        const coursesCount = alunos.reduce((acc, aluno) => {
            acc[aluno.curso] = (acc[aluno.curso] || 0) + 1;
            return acc;
        }, {});
        byCourseList.innerHTML = '';
        Object.entries(coursesCount).sort().forEach(([curso, count]) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `${curso} <span class="badge bg-primary rounded-pill">${count}</span>`;
            byCourseList.appendChild(li);
        });

        // Alunos Aprovados
        const approvedStudents = alunos.filter(aluno => aluno.isAprovado()).sort((a, b) => a.nome.localeCompare(b.nome));
        approvedList.innerHTML = '';
        if (approvedStudents.length > 0) {
            approvedStudents.forEach(aluno => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = aluno.nome;
                approvedList.appendChild(li);
            });
        } else {
            approvedList.innerHTML = '<li class="list-group-item">Nenhum aluno aprovado.</li>';
        }
    };

    /**
     * Habilita ou desabilita o estado de carregamento do botão de submissão.
     * @param {boolean} isLoading - True para mostrar o spinner, false para mostrar o texto.
     */
    const setSubmitButtonLoading = (isLoading) => {
        if (!submitButton) return;
        const buttonText = submitButton.querySelector('.button-text');
        const spinner = submitButton.querySelector('.spinner-border');
        if (isLoading) {
            submitButton.disabled = true;
            if (buttonText) buttonText.classList.add('d-none');
            if (spinner) spinner.classList.remove('d-none');
        } else {
            submitButton.disabled = false;
            if (buttonText) buttonText.classList.remove('d-none');
            if (spinner) spinner.classList.add('d-none');
        }
    };

    // --- LÓGICA DE EVENTOS (Controller) ---

    // Evento de submissão do formulário de cadastro
    if (studentForm) {
        studentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            studentForm.classList.add('was-validated');

            if (studentForm.checkValidity()) {
                setSubmitButtonLoading(true);

                const nome = document.getElementById('nome').value;
                const idade = document.getElementById('idade').value;
                const curso = document.getElementById('curso').value;
                const notaFinal = document.getElementById('notaFinal').value;

                // Simula um pequeno atraso para UX
                setTimeout(() => {
                    const newStudent = new Aluno(nextId++, nome, idade, curso, notaFinal);
                    alunos.push(newStudent);

                    renderTable();
                    updateReports();
                    showAlert(`Aluno <strong>${nome}</strong> cadastrado com sucesso!`, 'success');

                    studentForm.reset();
                    studentForm.classList.remove('was-validated');
                    setSubmitButtonLoading(false);
                }, 500); // 500ms de delay
            }
        });
    }

    // Delegação de eventos para botões de editar e excluir
    if (studentTableBody) {
        studentTableBody.addEventListener('click', (event) => {
            const target = event.target.closest('button');
            if (!target) return;

            const studentId = parseInt(target.dataset.id, 10);

            if (target.classList.contains('edit-btn')) {
                // Ação de Editar
                const studentToEdit = alunos.find(aluno => aluno.id === studentId);
                if (studentToEdit) {
                    const editIdEl = document.getElementById('edit-student-id');
                    const editNomeEl = document.getElementById('edit-nome');
                    const editIdadeEl = document.getElementById('edit-idade');
                    const editCursoEl = document.getElementById('edit-curso');
                    const editNotaEl = document.getElementById('edit-notaFinal');

                    if (editIdEl) editIdEl.value = studentToEdit.id;
                    if (editNomeEl) editNomeEl.value = studentToEdit.nome;
                    if (editIdadeEl) editIdadeEl.value = studentToEdit.idade;
                    if (editCursoEl) editCursoEl.value = studentToEdit.curso;
                    if (editNotaEl) editNotaEl.value = studentToEdit.notaFinal;

                    if (editStudentModal) editStudentModal.show();
                }
            } else if (target.classList.contains('delete-btn')) {
                // Ação de Excluir
                const studentToDelete = alunos.find(aluno => aluno.id === studentId);
                if (studentToDelete && confirm(`Tem certeza que deseja excluir o aluno ${studentToDelete.nome}?`)) {
                    alunos = alunos.filter(aluno => aluno.id !== studentId);
                    renderTable();
                    updateReports();
                    showAlert(`Aluno <strong>${studentToDelete.nome}</strong> excluído com sucesso.`, 'info');
                }
            }
        });
    }

    // Evento de submissão do formulário de edição (no modal)
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const id = parseInt(document.getElementById('edit-student-id').value, 10);
            const studentIndex = alunos.findIndex(aluno => aluno.id === id);

            if (studentIndex > -1) {
                alunos[studentIndex].nome = document.getElementById('edit-nome').value;
                alunos[studentIndex].idade = parseInt(document.getElementById('edit-idade').value, 10);
                alunos[studentIndex].curso = document.getElementById('edit-curso').value;
                alunos[studentIndex].notaFinal = parseFloat(document.getElementById('edit-notaFinal').value);

                renderTable();
                updateReports();
                if (editStudentModal) editStudentModal.hide();
                showAlert(`Dados do aluno <strong>${alunos[studentIndex].nome}</strong> atualizados com sucesso.`, 'success');
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    renderTable();
    updateReports();
});