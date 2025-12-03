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
                    prompts = prompts.filter(p => p.category !== category);
                    categories = categories.filter(c => c !== category);
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

        renderPrompts();
        makeCategoriesDraggable();
        console.log("renderCategories() terminou");
    }

    // ====== RENDER PROMPTS ======
    function renderPrompts() {
        promptDisplay.innerHTML = '';
        if (!activeCategory) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">Select a category to view prompts.</p>';
            return;
        }

        const categoryPrompts = prompts.filter(p => p.category === activeCategory);
        if (categoryPrompts.length === 0) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">No prompts in this category yet.</p>';
            return;
        }

        categoryPrompts.forEach(prompt => {
            const card = document.createElement('div');
            card.className = 'prompt-card';

            let text = prompt.text
                .replace(/\[/g, '<span class="placeholder-highlight">[')
                .replace(/\]/g, ']</span>');

            card.innerHTML = `
                <p>${text}</p>
    <div class="prompt-actions">
        <button class="copy-prompt-btn" data-text="${prompt.text.replace(/"/g, '&quot;')}" title="Copy">
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

        document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.text);
            });
        });

        document.querySelectorAll('.delete-prompt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                prompts = prompts.filter(p => p.id !== parseInt(btn.dataset.id));
                savePrompts();
                renderPrompts();
            });
        });
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

    resizeHandle.addEventListener('mousedown', e => {
        isResizing = true;
        startY = e.clientY;
        startHeight = newPromptText.offsetHeight;
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!isResizing) return;
        const diff = e.clientY - startY;
        const newH = Math.max(80, Math.min(startHeight + diff, 400));
        newPromptText.style.height = newH + 'px';
    });

    document.addEventListener('mouseup', () => { isResizing = false; });

    setTimeout(autoResize, 100);

    // ====== INICIALIZAÇÃO ======
    function initApp() {
        console.log('Iniciando aplicação...');
        renderCategories();
    }

    initApp();

    // Debug
    window.appDebug = { categories, prompts, activeCategory: () => activeCategory, renderCategories, renderPrompts };
});