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
    // ====== DADOS ======
    let categories = JSON.parse(localStorage.getItem('promptCategories')) || ['General', 'Creative', 'Technical'];
    let prompts = JSON.parse(localStorage.getItem('userPrompts')) || [];
    let activeCategory = categories.length > 0 ? categories[0] : null;

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
        console.log("renderCategories() começou");
        categoryList.innerHTML = '';
        promptCategorySelect.innerHTML = '';

        //const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (categories.length === 0) {
            categoryList.innerHTML = '<p class="no-prompts-message">No categories yet. Add one!</p>';
            promptCategorySelect.innerHTML = '<option value="">No Categories Available</option>';
            activeCategory = null;
            promptDisplay.innerHTML = '<p class="no-prompts-message">Please select or add a category to view prompts.</p>';
            return;
        }

        categories.forEach(category => {
            const li = document.createElement('li');
            li.dataset.category = category;

            // Grip
            const handle = document.createElement('span');
            handle.className = 'drag-handle';
            li.appendChild(handle);

            // Nome + contador
            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = category;
            categoryNameSpan.classList.add('category-name');

            const promptCount = prompts.filter(p => p.category === category).length;
            const countSpan = document.createElement('span');
            countSpan.className = 'prompt-count';
            countSpan.textContent = promptCount;
            categoryNameSpan.appendChild(countSpan);

            if (promptCount > 0) li.classList.add('has-prompts');

            li.appendChild(categoryNameSpan);

            // ====== CLIQUE PARA ATIVAR CATEGORIA ======
            li.addEventListener('click', (e) => {
                // Ignora clique no botão de delete
                if (e.target.closest('.delete-category-btn')) return;

                // Ativa a categoria
                if (activeCategory !== category) {
                    activeCategory = category;
                    renderCategories();
                }
            });

            // Double-click no nome para renomear
            categoryNameSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                enterEditMode(li, category);
            });

            // Botão delete
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-category-btn');
            deleteBtn.innerHTML = `<svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path></svg>`;
            deleteBtn.title = `Delete "${category}" category`;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${category}" and all its prompts?`)) {
                    // ✅ CORREÇÃO 1: DELETA TODOS OS PROMPTS DESSA CATEGORIA
                    // Filtra removendo todos os prompts onde p.category é igual à categoria sendo deletada.
                    prompts = prompts.filter(p => p.category !== category); 
                    
                    // ✅ CORREÇÃO 2: DELETA A CATEGORIA
                    categories = categories.filter(c => c !== category);
                    
                    // Atualiza a categoria ativa se a deletada era a ativa
                    if (activeCategory === category) activeCategory = categories[0] || null;
                    
                    saveCategories();
                    savePrompts();
                    renderCategories();
                }
            });
            li.appendChild(deleteBtn);

            if (category === activeCategory) li.classList.add('active');
            categoryList.appendChild(li);

            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            promptCategorySelect.appendChild(option);
        });

        if (activeCategory && categories.includes(activeCategory)) {
            promptCategorySelect.value = activeCategory;
        } else if (categories.length > 0) {
            activeCategory = categories[0];
            promptCategorySelect.value = activeCategory;
        }

        if (categoryHeading) {
            // Atualiza o texto: "Categories (Total)"
            categoryHeading.innerHTML = `Categories (${categories.length}) | Prompts (${prompts.length})`;
        }

        renderPrompts();
        makeCategoriesDraggable();
        console.log("renderCategories() terminou");
    }

    // ====== RENDER PROMPTS ======
    // ====== RENDER PROMPTS (CORRIGIDA) ======
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
        // ------------------------------------------

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
        promptDisplay.appendChild(card);
        });
    }

    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();

        if (newCategory && !categories.includes(newCategory)) {

            console.log('1. Array de Categorias ANTES:', categories); // <-- LOG 1

            categories.push(newCategory);

            console.log('2. Array de Categorias DEPOIS:', categories); // <-- LOG 2

            saveCategories();
            newCategoryInput.value = '';
            activeCategory = newCategory;

            console.log('3. Chamando renderCategories()...'); // <-- LOG 3

            renderCategories();
        } else if (newCategory && categories.includes(newCategory)) {
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
            const newPrompt = {
                id: Date.now(),
                text: promptText,
                category: selectedCategory
            };
            prompts.push(newPrompt);
            savePrompts();
            newPromptText.value = '';

            // Se o prompt adicionado está na categoria ativa, apenas renderize os prompts.
            // NÃO precisamos chamar renderCategories aqui.
            if (selectedCategory === activeCategory) {
                renderPrompts();
            }

        } else {
            alert('Please enter a prompt and select a category.');
        }

        // <--- A LINHA renderCategories() DEVE SER REMOVIDA DAQUI. --->

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