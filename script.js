document.addEventListener('DOMContentLoaded', () => {
    // ====== ELEMENTOS ======
    const categoryList = document.getElementById('categoryList');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const newPromptText = document.getElementById('newPromptText');
    const promptCategorySelect = document.getElementById('promptCategorySelect');
    const addPromptBtn = document.getElementById('addPromptBtn');
    const promptDisplay = document.getElementById('promptDisplay');
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    const uploadFileInput = document.getElementById('uploadFileInput');
    const uploadDataBtn = document.getElementById('uploadDataBtn');
    const searchInput = document.getElementById('searchInput');
    const categoryHeading = document.getElementById('category-heading');

    // ======= CORES E CATEGORIAS PADRÃO =======
    const DEFAULT_CATEGORIES = ['Geral', 'Criativo', 'Técnico']; // Use os nomes que você costuma usar
    const DEFAULT_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

    // Função para garantir que todas as categorias são objetos com cores
    function ensureCategoryObjects(cats) {
        // Se a lista de categorias não existir ou for vazia, usa o padrão.
        if (!cats || cats.length === 0) return DEFAULT_CATEGORIES.map((c, i) => ({
            name: c,
            color: DEFAULT_COLORS[i % DEFAULT_COLORS.length]
        }));

        // Converte categorias antigas (strings) em objetos (para manter dados antigos)
        return cats.map((cat, index) => {
            if (typeof cat === 'string') {
                return {
                    name: cat,
                    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length] // Cor padrão
                };
            }
            return cat;
        });
    }

    // ====== DADOS ======
    // 1. ATUALIZAÇÃO CRÍTICA: Usa a função de segurança
    let categories = ensureCategoryObjects(JSON.parse(localStorage.getItem('promptCategories')));

    // 2. Prompts permanece o mesmo
    let prompts = JSON.parse(localStorage.getItem('userPrompts')) || [];

    // 3. ATUALIZAÇÃO CRÍTICA: Pega o NOME da categoria ativa
    let activeCategory = categories.length > 0 ? categories[0].name : null;

    console.log("SCRIPT EXECUTED");
    addCategoryBtn.textContent = 'Add';

    // ====== FUNÇÕES DE ARMAZENAMENTO ======
    function saveCategories() {
        localStorage.setItem('promptCategories', JSON.stringify(categories));
    }

    function savePrompts() {
        localStorage.setItem('userPrompts', JSON.stringify(prompts));
    }

    // ====== RENDER CATEGORIES (RECUPERADA) ======
    function renderCategories() {
        searchInput.value = '';
        categoryList.innerHTML = '';
        promptCategorySelect.innerHTML = '';

        if (categories.length === 0) {
            categoryList.innerHTML = '<p class="no-prompts-message">No categories yet. Add one!</p>';
            promptCategorySelect.innerHTML = '<option value="">No Categories Available</option>';
            activeCategory = null;
            promptDisplay.innerHTML = '<p class="no-prompts-message">Please select or add a category to view prompts.</p>';
            return;
        }

        categories.forEach(catObj => { // Itera sobre o OBJETO da categoria
            const name = catObj.name;
            const color = catObj.color;

            const li = document.createElement('li');
            li.dataset.category = name; // Usa o nome

            // Grip
            const handle = document.createElement('span');
            handle.className = 'drag-handle';
            li.appendChild(handle);

            // Nome + contador
            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = name; // ✅ CORREÇÃO: Usa o NOME para exibir
            categoryNameSpan.classList.add('category-name');

            // ✅ NOVO: Borda colorida
            li.style.borderLeft = `5px solid ${color}`;
            li.classList.add('category-item');

            const promptCount = prompts.filter(p => p.category === name).length; // Filtra pelo nome
            const countSpan = document.createElement('span');
            countSpan.className = 'prompt-count';
            countSpan.textContent = promptCount;
            categoryNameSpan.appendChild(countSpan);

            if (promptCount > 0) li.classList.add('has-prompts');

            li.appendChild(categoryNameSpan);

            // ====== CLIQUE PARA ATIVAR CATEGORIA ======
            li.addEventListener('click', (e) => {
                // Se clicar no botão de delete ou se estivermos editando (input), ignore o clique de seleção
                if (e.target.closest('.delete-category-btn') || e.target.tagName === 'INPUT') return;

                // Define a categoria ativa pelo NOME (que é como você filtra os prompts)
                activeCategory = name;

                // Atualiza a interface das categorias (para mostrar qual está ativa/azul)
                renderCategories();

                // CRÍTICO: Chama a renderização dos prompts para a nova categoria selecionada
                renderPrompts();

                console.log("Categoria ativa alterada para:", activeCategory);
            });

            // Double-click para renomear a categoria
            li.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                // Ignora se o clique for no botão de deletar ou no ícone de arrastar
                if (e.target.closest('.delete-category-btn') || e.target.closest('.drag-handle')) return;

                enterCategoryEditMode(li, name);
            });

            // Botão delete
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-category-btn');
            deleteBtn.innerHTML = `<svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path></svg>`;
            deleteBtn.title = `Delete "${name}" category`; // Usa o nome
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${name}" and all its prompts?`)) {
                    // DELETA PROMPTS: Filtra por nome
                    prompts = prompts.filter(p => p.category !== name);

                    // DELETA CATEGORIA: Filtra o array de objetos 'categories'
                    categories = categories.filter(c => c.name !== name);

                    // Atualiza a categoria ativa
                    if (activeCategory === name) activeCategory = categories.length > 0 ? categories[0].name : null;

                    saveCategories();
                    savePrompts();
                    renderCategories();
                }
            });
            li.appendChild(deleteBtn);

            if (name === activeCategory) li.classList.add('active'); // Compara com o nome
            categoryList.appendChild(li);

            // Renderiza o seletor de prompts
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            promptCategorySelect.appendChild(option);
        });

        // Atualiza a categoria ativa se a lista mudar (agora usa .name)
        if (activeCategory && categories.some(c => c.name === activeCategory)) {
            promptCategorySelect.value = activeCategory;
        } else if (categories.length > 0) {
            activeCategory = categories[0].name; // Pega o nome
            promptCategorySelect.value = activeCategory;
        }

        if (categoryHeading) {
            // ... (o restante da renderCategories)
            categoryHeading.innerHTML = `Categories (${categories.length}) | Prompts (${prompts.length})`;
        }

        renderPrompts();
        makeCategoriesDraggable();
        console.log("renderCategories() terminou");
    }

    function editCategoryName(element, categoryId) {
        // 1. Pega o nome atual (removendo espaços extras ou contagem de itens se houver)
        const currentName = element.childNodes[0].textContent.trim();

        // 2. Cria o input de edição
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.classList.add('edit-category-input'); // Estilize no CSS

        // 3. Substitui o texto pelo input
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();

        // 4. Lógica para salvar ao apertar Enter ou perder o foco (Blur)
        const saveChange = () => {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                updateCategoryInStorage(categoryId, newName);
            }
            // Re-renderiza as categorias para voltar ao normal
            renderCategories();
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveChange();
            if (e.key === 'Escape') renderCategories(); // Cancela
        });

        input.addEventListener('blur', saveChange);
    }

    function updateCategoryInStorage(categoryId, newName) {
        // 1. Carrega os dados atuais (ajuste as chaves 'categories' conforme seu código)
        let categories = JSON.parse(localStorage.getItem('categories')) || [];
        let prompts = JSON.parse(localStorage.getItem('prompts')) || [];

        // 2. Localiza a categoria e atualiza o nome
        const categoryIndex = categories.findIndex(cat => cat.id === categoryId);

        if (categoryIndex !== -1) {
            const oldName = categories[categoryIndex].name;
            categories[categoryIndex].name = newName;

            // 3. SE seus prompts usam o NOME da categoria como referência (e não o ID)
            // Você precisa atualizar os prompts também para eles não "sumirem"
            prompts = prompts.map(prompt => {
                if (prompt.category === oldName) {
                    return { ...prompt, category: newName };
                }
                return prompt;
            });

            // 4. Salva as atualizações no localStorage
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('prompts', JSON.stringify(prompts));

            console.log(`Categoria '${oldName}' atualizada para '${newName}'`);
        }
    }

    function renderPrompts() {
        promptDisplay.innerHTML = '';

        // --- NOVO LOG DE DIAGNÓSTICO ---
        console.log(`Prompts Totais no Array: ${prompts.length}`);
        console.log(`Categoria Ativa: ${activeCategory}`);
        // -------------------------------

        // 1. INSERIDO AQUI: OBTÉM O TERMO DE PESQUISA (Resolve o ReferenceError)
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        if (!activeCategory) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">Select a category to view prompts.</p>';
            return;
        }

        // CRÍTICO: Mude 'const' para 'let' para que possamos reatribuir o array após o filtro de busca.
        let categoryPrompts = prompts.filter(p => p.category === activeCategory);

        // let categoryPrompts = prompts.filter(p =>
        //     p.category &&
        //     p.category.trim().toLowerCase() === activeCategory.trim().toLowerCase()
        // );

        // 2. APLICA O FILTRO DE PESQUISA
        if (searchTerm) {
            categoryPrompts = categoryPrompts.filter(p =>
                p.text && p.text.toLowerCase().includes(searchTerm)
            );
        }
        // 💡 NOVA LINHA CRÍTICA: INVERTE A ORDEM DO ARRAY
        // Isso garante que os prompts mais recentes (que têm maior ID/timestamp) apareçam primeiro.
        categoryPrompts.reverse();

        if (categoryPrompts.length === 0) {
            // 3. ATUALIZA A MENSAGEM
            if (searchTerm) {
                promptDisplay.innerHTML = `<p class="no-prompts-message">No prompts found matching "${searchTerm}" in this category.</p>`;
            } else {
                promptDisplay.innerHTML = '<p class="no-prompts-message">No prompts in this category yet.</p>';
            }
            return;
        }

        console.log(`Prompts encontrados para renderizar: ${categoryPrompts.length}`); // NOVO LOG
        categoryPrompts.forEach(prompt => {
            const card = document.createElement('div');
            card.className = 'prompt-card';

            // BOTÃO DE EXPANDIR CARD
            card.addEventListener('click', (e) => {
                const target = e.target;

                // 2. Verifica se o clique ocorreu em um elemento de AÇÃO ou EDIÇÃO
                // Se o clique foi em um destes elementos, a função retorna (ignora a expansão)
                if (
                    // Verifica se o clique foi em um dos wrappers de ações (Copy/Delete)
                    target.closest('.prompt-actions') ||

                    // Verifica se o clique foi no textarea (no modo edição)
                    target.tagName === 'TEXTAREA' ||

                    // Verifica se o clique foi nos botões de edição (Save/Cancel)
                    target.closest('.save-edit-btn') ||
                    target.closest('.cancel-edit-btn')
                ) {
                    // Ignora a expansão e permite que a ação de controle aconteça
                    return;
                }

                // 3. Se o clique foi em uma área segura, alterna a classe 'expanded'
                card.classList.toggle('expanded');
                // BOTÃO DE EXPANDIR CARD FIM
            });
            // 1. Prepara o texto para exibição (com highlight)
            let text = prompt.text
                .replace(/\[/g, '<span class="placeholder-highlight">[')
                .replace(/\]/g, ']</span>');

            // 2. CRÍTICO: Prepara o texto para o atributo data-text. 
            // Implementa o escape robusto.
            const safeTextForAttribute = prompt.text
                .replace(/"/g, '&quot;') // Escapa aspas duplas
                .replace(/'/g, '&#39;'); // Escapa aspas simples

            card.innerHTML = `
            <div class="prompt-header-info">
                <span class="date-added">${prompt.dateAdded || 'N/A'}</span>
            </div>
            <p>${text}</p>
            <div class="prompt-actions">
                <button class="copy-prompt-btn" data-text="${safeTextForAttribute}" title="Copy">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                        <path d="M5.25 1.75C5.25 .784 6.034 0 7 0h7.25C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11H7c-.966 0-1.75-.784-1.75-1.75v-7.5Z"></path>
                    </svg>
                </button>
                <button class="delete-prompt-btn" data-id="${prompt.id}" title="Delete">
                    <svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
                    </svg>
                </button>
            </div>
        `;

            const pElement = card.querySelector('p');
            if (pElement) {
                pElement.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    enterEditModePrompt(card, prompt.id, prompt.text);
                });
            }
            promptDisplay.appendChild(card);
        });
    }

    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();

        // NOVO: Pega o valor da cor
        const newColor = categoryColorInput ? categoryColorInput.value : DEFAULT_COLORS[0];

        // Verifica se a categoria já existe (checando a propriedade .name)
        if (newCategory && !categories.some(c => c.name.toLowerCase() === newCategory.toLowerCase())) {

            // Salva como OBJETO (nome + cor)
            categories.push({ name: newCategory, color: newColor });

            saveCategories();
            newCategoryInput.value = '';

            // Define o activeCategory usando o nome
            activeCategory = newCategory;

            renderCategories();
        } else if (newCategory) {
            alert('Category already exists!');
        }
    });

    // ====== DELEGAÇÃO DE EVENTOS PARA PROMPTS (COPY/DELETE) ======
    promptDisplay.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');

        if (!targetButton) return;

        // Lógica de DELETAR
        if (targetButton.classList.contains('delete-prompt-btn')) {
            const promptId = targetButton.dataset.id;

            // Verifica se o usuário realmente quer deletar
            if (confirm('Tem certeza que deseja deletar este prompt?')) {
                deletePrompt(promptId);
            }

            // Lógica de COPIAR
        } else if (targetButton.classList.contains('copy-prompt-btn')) {
            const textToCopy = targetButton.dataset.text;
            navigator.clipboard.writeText(textToCopy);
            // showToast('Prompt copiado!', 'success');
        }
    });

    addPromptBtn.addEventListener('click', () => {
        const promptText = newPromptText.value.trim();
        const selectedCategory = promptCategorySelect.value;

        if (promptText && selectedCategory) {
            // 1. Cria a data formatada
            const currentDate = new Date(Date.now());
            const formattedDate = currentDate.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const newPrompt = {
                id: Date.now(),
                text: promptText,
                category: selectedCategory,
                // 2. SALVA A DATA FORMATADA NO PROMPT
                dateAdded: formattedDate
            };
            prompts.push(newPrompt);
            savePrompts();
            newPromptText.value = '';

            if (selectedCategory === activeCategory) {
                renderPrompts();
            }
        } else {
            alert('Please enter a prompt and select a category.');
        }
    });

    // ====== FUNÇÃO DE DELETAR PROMPT ======
    function deletePrompt(id) {
        // CRÍTICO: Converte a string ID para número para garantir a comparação correta.
        const promptIdToDelete = parseFloat(id);

        console.log('--- DELETANDO PROMPT ---'); // LOG 1
        console.log('ID a ser deletado (Number):', promptIdToDelete); // LOG 2
        console.log('IDs do Array ANTES:', prompts.map(p => p.id)); // LOG 3

        prompts = prompts.filter(p => p.id !== promptIdToDelete);
        console.log('IDs do Array DEPOIS:', prompts.map(p => p.id)); // LOG 4
        savePrompts();
        renderCategories(); // Rerenderiza categorias para atualizar a contagem
    }

    function downloadData() {
        // 1. VERIFICAÇÃO
        if (prompts.length === 0) {
            // showToast('No prompts to download!', 'info'); // descomente se tiver showToast
            console.warn('Nenhum prompt para download. Sair.');
            return;
        }

        // 2. SERIALIZAÇÃO E CRIAÇÃO DO ARQUIVO (BLOB)
        const dataStr = JSON.stringify(prompts, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });

        // 3. CRIAÇÃO DO LINK E DOWNLOAD
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Configurações do link
        a.href = url;
        a.download = 'prompt_organizer_data.json'; // Nome do arquivo de saída

        // Dispara o download
        document.body.appendChild(a);
        a.click();

        // 4. LIMPEZA
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // showToast('Prompts baixados com sucesso!'); // descomente se tiver showToast
        console.log('Download disparado!');
    }

    function handleUpload(event) {
        const file = event.target.files[0];

        // Se nenhum arquivo foi selecionado ou se a leitura não for bem-sucedida, saia
        if (!file) {
            // showToast('Nenhum arquivo selecionado.', 'info');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                // Tenta analisar o conteúdo do arquivo como JSON
                const uploadedData = JSON.parse(e.target.result);

                // Verifica se o arquivo JSON é uma lista válida de prompts (o formato que esperamos)
                if (!Array.isArray(uploadedData) || uploadedData.some(p => !p.text || !p.category)) {
                    // showToast('Arquivo inválido: formato incorreto.', 'error');
                    return;
                }

                // 1. GARANTIR UNICIDADE DE IDS: Mapeia os dados, criando novos IDs para evitar conflitos
                const newPrompts = uploadedData.map(p => ({
                    id: Date.now() + Math.random(), // Novo ID único
                    text: p.text,
                    category: p.category
                }));

                // 2. ATUALIZA CATEGORIAS: Coleta todas as categorias novas e existentes
                const newCategories = newPrompts.map(p => p.category);
                // Usa 'Set' para garantir que não haja duplicatas
                const combinedCategories = [...new Set([...categories, ...newCategories])];
                categories = combinedCategories;
                saveCategories();

                // 3. ATUALIZA PROMPTS: Adiciona os prompts novos ao final da lista existente
                prompts.push(...newPrompts);
                savePrompts();

                // 4. RENDERIZA TUDO
                renderCategories(); // Redesenha categorias e, por consequência, prompts

                // showToast('Dados importados com sucesso! Verifique todas as categorias.', 'success');

            } catch (error) {
                // showToast('Erro ao processar o arquivo. Verifique se é um JSON válido.', 'error');
                console.error('Erro ao processar arquivo:', error);
            }
        };

        // Inicia a leitura do arquivo como texto
        reader.readAsText(file);
    }

    // ====== DRAG & DROP ======
    let draggedItem = null;
    function makeCategoriesDraggable() {
        const items = document.querySelectorAll('#categoryList li');
        items.forEach(item => {
            item.draggable = true;
            item.addEventListener('dragstart', () => {
                draggedItem = item;
                setTimeout(() => item.classList.add('dragging'), 0);
            });
            item.addEventListener('dragend', () => {
                setTimeout(() => {
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                    saveCategoryOrder();
                }, 0);
            });
            item.addEventListener('dragover', e => { e.preventDefault(); item.classList.add('drag-over'); });
            item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
            item.addEventListener('drop', e => {
                e.preventDefault();
                if (draggedItem && draggedItem !== item) {
                    const all = [...document.querySelectorAll('#categoryList li')];
                    const from = all.indexOf(draggedItem);
                    const to = all.indexOf(item);
                    const [moved] = categories.splice(from, 1);
                    categories.splice(to, 0, moved);
                    if (activeCategory === draggedItem.dataset.category) activeCategory = moved;
                    renderCategories();
                }
                item.classList.remove('drag-over');
            });
        });
    }

    function saveCategoryOrder() {
        saveCategories();
    }

    // ====== TEXTAREA RESIZE COM HANDLE ======
    const textareaWrapper = newPromptText.parentElement;
    const resizeHandle = textareaWrapper.querySelector('.resize-handle');
    let isResizing = false;
    let startY, startHeight;

    function autoResize() {
        newPromptText.style.height = 'auto';
        const max = 400;
        const newH = Math.min(newPromptText.scrollHeight, max);
        newPromptText.style.height = newH + 'px';
    }

    newPromptText.addEventListener('input', autoResize);

    if (resizeHandle) { // <--- PROTEÇÃO ADICIONADA
        resizeHandle.addEventListener('mousedown', e => {
            isResizing = true;
            startY = e.clientY;
            startHeight = newPromptText.offsetHeight;
            e.preventDefault();
        });
    }
    document.addEventListener('mousemove', e => {
        if (!isResizing) return;
        const diff = e.clientY - startY;
        const newH = Math.max(80, Math.min(startHeight + diff, 400));
        newPromptText.style.height = newH + 'px';
    });

    document.addEventListener('mouseup', () => { isResizing = false; });

    setTimeout(autoResize, 100);

    if (downloadDataBtn) {
        downloadDataBtn.addEventListener('click', downloadData);
    }

    // <--- LISTENER 1: Botão clica no Input de arquivo (uploadDataBtn -> uploadFileInput) --->
    if (uploadDataBtn && uploadFileInput) {
        uploadDataBtn.addEventListener('click', () => {
            uploadFileInput.click();
        });
    }

    // <--- LISTENER 2: Processa o arquivo quando o usuário o seleciona (uploadFileInput -> handleUpload) --->
    if (uploadFileInput) {
        uploadFileInput.addEventListener('change', handleUpload);
    }

    // ====== FUNÇÃO PARA ENTRAR NO MODO DE EDIÇÃO DE PROMPT ======
    function enterEditModePrompt(card, promptId, currentText) {
        // 1. Elementos existentes
        const pElement = card.querySelector('p');
        const actionsDiv = card.querySelector('.prompt-actions');
        const headerInfo = card.querySelector('.prompt-header-info'); // O elemento da data

        if (card.querySelector('.prompt-edit-textarea')) return;

        // 2. Criação dos novos elementos

        // A. Textarea
        const textarea = document.createElement('textarea');
        textarea.value = currentText;
        textarea.classList.add('prompt-edit-textarea');
        textarea.rows = 5;

        // B. Botões (Salvar e Cancelar)
        const saveButton = document.createElement('button');
        saveButton.textContent = 'SAVE'; // Usando caixa alta para estética
        saveButton.classList.add('md-button', 'save-edit-btn');

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.classList.add('md-button', 'cancel-edit-btn');

        // C. Wrapper para os botões (Coluna Esquerda)
        const leftColumnWrapper = document.createElement('div');
        leftColumnWrapper.classList.add('edit-left-column');

        // D. Wrapper para o Textarea e Data (Coluna Direita)
        const rightColumnWrapper = document.createElement('div');
        rightColumnWrapper.classList.add('edit-right-column');

        // 3. Montagem da Nova Estrutura

        // Esconde as ações antigas
        if (actionsDiv) actionsDiv.style.display = 'none';

        // Coluna Esquerda: Botões empilhados
        leftColumnWrapper.appendChild(saveButton);
        leftColumnWrapper.appendChild(cancelButton);

        // Coluna Direita: Data e Textarea
        if (headerInfo) rightColumnWrapper.appendChild(headerInfo);
        rightColumnWrapper.appendChild(textarea);

        // Insere no Card: remove o <p>
        pElement.remove(); // Remove o parágrafo original

        // Adiciona os wrappers ao card
        card.prepend(rightColumnWrapper);
        card.prepend(leftColumnWrapper);

        textarea.focus();

        // 4. Lógica de Salvar e Cancelar (CRÍTICO: Adicionar os Listeners)
        saveButton.addEventListener('click', () => {
            const newText = textarea.value.trim();
            if (newText) {
                const promptIndex = prompts.findIndex(p => p.id == promptId);
                if (promptIndex !== -1) {
                    prompts[promptIndex].text = newText;
                    savePrompts();
                    renderPrompts();
                }
            } else {
                alert('Prompt text cannot be empty.');
            }
        });
        cancelButton.addEventListener('click', () => {
            renderPrompts(); // Renderiza para sair do modo de edição
        });
    }

    // ====== FUNÇÃO DE FEEDBACK VISUAL SIMPLES (para o JS) ======
    function showSuccessFlash(cardElement) {
        if (cardElement) {
            cardElement.classList.add('flash-success');

            // Remove a classe após 0.6 segundos (um pouco mais que a duração da animação)
            setTimeout(() => {
                cardElement.classList.remove('flash-success');
            }, 600);
        }
    }

    function enterCategoryEditMode(liElement, oldName) {
        const nameSpan = liElement.querySelector('.category-name');
        if (!nameSpan) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldName;
        input.className = 'edit-category-input';
        input.style.width = "85%";

        nameSpan.innerHTML = '';
        nameSpan.appendChild(input);
        input.focus();
        input.select();

        const save = () => {
            const newName = input.value.trim();
            if (newName && newName !== oldName) {
                // Atualiza o nome no array de categorias
                categories = categories.map(c => c.name === oldName ? { ...c, name: newName } : c);
                // Atualiza a referência em todos os prompts vinculados
                prompts = prompts.map(p => p.category === oldName ? { ...p, category: newName } : p);

                if (activeCategory === oldName) activeCategory = newName;
                saveCategories();
                savePrompts();
            }
            renderCategories();
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') renderCategories();
        });
        input.addEventListener('blur', save);
    }

    // ====== INICIALIZAÇÃO ======
    function initApp() {
        console.log('Iniciando aplicação...');
        renderCategories();
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderPrompts);
    }

    initApp();

    // Debug
    window.appDebug = { categories, prompts, activeCategory: () => activeCategory, renderCategories, renderPrompts };
});
