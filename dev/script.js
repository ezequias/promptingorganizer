document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('categoryList');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const newPromptText = document.getElementById('newPromptText');
    const promptCategorySelect = document.getElementById('promptCategorySelect');
    const addPromptBtn = document.getElementById('addPromptBtn');
    const promptDisplay = document.getElementById('promptDisplay');

    // Ajusta altura automaticamente + respeita limite
    // document.getElementById('newPromptText').addEventListener('input', function () {
    //     this.style.height = 'auto';
    //     const maxHeight = 400;
    //     const newHeight = Math.min(this.scrollHeight, maxHeight);
    //     this.style.height = newHeight + 'px';
    // });

    // ====== TEXTAREA: AJUSTE AUTOMÁTICO + REDIMENSIONAMENTO COM MOUSE ======
    //const textarea = document.getElementById('newPromptText');

    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        const maxHeight = 400;
        const newHeight = Math.min(this.scrollHeight, maxHeight);
        this.style.height = newHeight + 'px';
    });

    // Garante que o resize funcione mesmo se o CSS for sobrescrito
    textarea.style.resize = 'vertical';
    textarea.style.maxHeight = '400px';

    // NEW: Data Management Buttons - Get references to the new elements
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    const uploadFileInput = document.getElementById('uploadFileInput'); // The hidden file input
    const uploadDataBtn = document.getElementById('uploadDataBtn'); // The visible upload button


    let categories = JSON.parse(localStorage.getItem('promptCategories')) || ['General', 'Creative', 'Technical'];
    let prompts = JSON.parse(localStorage.getItem('userPrompts')) || [];
    let activeCategory = categories.length > 0 ? categories[0] : null;

    console.log("SCRIPT EXECUTED");
    // Set button text on load
    addCategoryBtn.textContent = 'Add';

    function showToast(message, type = 'info') {
        console.log(`[TOAST ${type.toUpperCase()}] ${message}`);
    }

    function saveCategories() {
        localStorage.setItem('promptCategories', JSON.stringify(categories));
    }

    function savePrompts() {
        localStorage.setItem('userPrompts', JSON.stringify(prompts));
    }

    categories.forEach(category => {
        const li = document.createElement('li');
        li.dataset.category = category;

        const handle = document.createElement('span');
        handle.className = 'drag-handle';
        li.appendChild(handle);

        const categoryNameSpan = document.createElement('span');
        categoryNameSpan.textContent = category;
        categoryNameSpan.classList.add('category-name');
        categoryNameSpan.style.flexGrow = '1';

        // Contador de prompts na categoria
        const promptCount = prompts.filter(p => p.category === category).length;

        const countSpan = document.createElement('span');
        countSpan.className = 'prompt-count';
        countSpan.innerHTML = `${promptCount}`;
        categoryNameSpan.appendChild(countSpan);

        // ADICIONA CLASSE SE TEM PROMPTS
        if (promptCount > 0) {
            li.classList.add('has-prompts');
        }

        // (o código de click/double-click continua igual — não mexer)

        categoryNameSpan.addEventListener('click', (e) => {
            if (e.detail === 1) {
                clickTimeout = setTimeout(() => {
                    if (activeCategory !== category) {
                        activeCategory = category;
                        renderCategories();
                    }
                }, 200);
            }
        });

        categoryNameSpan.addEventListener('dblclick', (e) => {
            clearTimeout(clickTimeout);
            e.stopPropagation();
            enterEditMode(li, category);
        });

        li.appendChild(categoryNameSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-category-btn');
        deleteBtn.innerHTML = `
    <svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="vertical-align: text-bottom;">
    <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
    </svg>`;
        deleteBtn.title = `Delete "${category}" category`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCategory(category);
        });
        li.appendChild(deleteBtn);

        if (category === activeCategory) {
            li.classList.add('active');
        }
        categoryList.appendChild(li);

        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        promptCategorySelect.appendChild(option);
    });

    function enterEditMode(categoryListItem, oldCategoryName) {
        if (categoryListItem.querySelector('.category-edit-input')) {
            return;
        }

        const categoryNameSpan = categoryListItem.querySelector('.category-name');
        const deleteBtn = categoryListItem.querySelector('.delete-category-btn');

        categoryNameSpan.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';

        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = oldCategoryName;
        editInput.classList.add('category-edit-input');
        categoryListItem.prepend(editInput);

        editInput.focus();
        editInput.select();

        const saveChanges = () => {
            if (!editInput.parentNode) {
                return;
            }
            const newCategoryName = editInput.value.trim();

            if (newCategoryName === oldCategoryName) {
                exitEditMode(categoryListItem, categoryNameSpan, deleteBtn, editInput);
                return;
            }

            if (newCategoryName === '') {
                alert('Category name cannot be empty.');
                editInput.focus();
                return;
            }

            if (categories.includes(newCategoryName)) {
                alert(`Category "${newCategoryName}" already exists.`);
                editInput.focus();
                return;
            }

            const oldIndex = categories.indexOf(oldCategoryName);
            if (oldIndex > -1) {
                categories[oldIndex] = newCategoryName;
                saveCategories();
            }

            prompts.forEach(prompt => {
                if (prompt.category === oldCategoryName) {
                    prompt.category = newCategoryName;
                }
            });
            savePrompts();

            if (activeCategory === oldCategoryName) {
                activeCategory = newCategoryName;
            }

            //renderCategories();
        };

        editInput.addEventListener('blur', saveChanges, { once: true });
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                editInput.blur();
            }
        });
    }

    function exitEditMode(categoryListItem, categoryNameSpan, deleteBtn, editInput) {
        if (editInput && editInput.parentNode === categoryListItem) {
            categoryListItem.removeChild(editInput);
        }
        categoryNameSpan.style.display = '';
        if (deleteBtn) deleteBtn.style.display = '';
    }


    function deleteCategory(categoryToDelete) {
        if (!confirm(`Are you sure you want to delete the category "${categoryToDelete}"? All prompts within this category will also be deleted.`)) {
            return;
        }

        categories = categories.filter(c => c !== categoryToDelete);
        saveCategories();

        prompts = prompts.filter(p => p.category !== categoryToDelete);
        savePrompts();

        if (activeCategory === categoryToDelete) {
            activeCategory = categories.length > 0 ? categories[0] : null;
        }

        renderCategories();
        renderPrompts();
    }


    function renderPrompts() {
        promptDisplay.innerHTML = '';

        if (!activeCategory) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">Selecione ou crie uma categoria para ver os prompts.</p>';
            return;
        }

        const categoryPrompts = prompts.filter(p => p.category === activeCategory);

        if (categoryPrompts.length === 0) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">Nenhum prompt nesta categoria ainda. Adicione o primeiro!</p>';
            return;
        }

        categoryPrompts.forEach(prompt => {
            const promptCard = document.createElement('div');
            promptCard.className = 'prompt-card';

            // === AQUI É A MÁGICA: transforma [texto] em destaque ===
            let textWithHighlights = prompt.text
                .replace(/\[/g, '<span class="placeholder-highlight">[')
                .replace(/\]/g, ']</span>');

            promptCard.innerHTML = `
            <p>${textWithHighlights}</p>
            <div class="prompt-actions">
                <button class="copy-prompt-btn" data-text="${prompt.text.replace(/"/g, '&quot;')}" title="Copiar Prompt">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5.25 1.75C5.25.784 6.034 0 7 0h7.25C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11H7c-.966 0-1.75-.784-1.75-1.75v-7.5Z"></path></svg>
                </button>
                <button class="delete-prompt-btn" data-id="${prompt.id}" title="Delete Prompt">
                    <svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path></svg>
                </button>
            </div>
        `;

            promptDisplay.appendChild(promptCard);
        });

        // Re-ativa os botões de copiar/excluir (igual antes)
        document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const text = btn.dataset.text;
                await navigator.clipboard.writeText(text);
                showToast('Prompt copiado!', 'success');
            });
        });

        document.querySelectorAll('.delete-prompt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                prompts = prompts.filter(p => p.id !== id);
                savePrompts();
                renderPrompts();
            });
        });
    }

    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory) {
            if (!categories.includes(newCategory)) {
                categories.push(newCategory);
                saveCategories();
                newCategoryInput.value = '';
                activeCategory = newCategory;
                renderCategories();
            } else {
                alert('Category already exists!');
            }
        } else {
            alert('Please enter a category name.');
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
            if (selectedCategory === activeCategory) {
                renderPrompts();
            }
        } else {
            alert('Please enter a prompt and select a category.');
        }
    });

    // --- NEW: Data Management Functions ---

    // Function to download data as JSON
    function downloadData() {
        const data = {
            categories: categories,
            prompts: prompts
        };
        // Format filename with current date
        const filename = `prompt_organizer_data_${new Date().toISOString().slice(0, 10)}.json`;
        const jsonStr = JSON.stringify(data, null, 2); // Pretty print JSON

        // Create a Blob and a download link
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a); // Clean up the element
        URL.revokeObjectURL(url); // Free up memory
        alert('Prompt data downloaded successfully!');
    }

    // Function to upload data from JSON
    function uploadData(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);

                // Basic validation of the loaded JSON structure
                if (!loadedData.categories || !Array.isArray(loadedData.categories) ||
                    !loadedData.prompts || !Array.isArray(loadedData.prompts)) {
                    throw new Error("Invalid JSON file format. Expected 'categories' and 'prompts' arrays.");
                }

                if (confirm('Uploading data will REPLACE your current prompts and categories. Do you want to proceed?')) {
                    categories = loadedData.categories;
                    prompts = loadedData.prompts;

                    saveCategories();
                    savePrompts();

                    // Re-evaluate active category after load to ensure it's valid
                    if (categories.length > 0 && categories.includes(activeCategory)) {
                        // If the previously active category exists in the new data, keep it
                    } else if (categories.length > 0) {
                        // Otherwise, set the first category as active
                        activeCategory = categories[0];
                    } else {
                        // No categories after upload
                        activeCategory = null;
                    }

                    renderCategories(); // Re-render the UI with the new data
                    alert('Prompt data uploaded and loaded successfully!');
                }
            } catch (error) {
                alert('Error processing file: ' + error.message);
                console.error('File upload error:', error);
            } finally {
                // Reset the file input to allow uploading the same file again if needed
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    }

    // Event Listeners for new buttons
    downloadDataBtn.addEventListener('click', downloadData);

    // Clicking the visible upload button will programmatically click the hidden file input
    uploadDataBtn.addEventListener('click', () => {
        uploadFileInput.click();
    });
    uploadFileInput.addEventListener('change', uploadData); // This listener fires when a file is selected


    function initApp() {
        console.log('Iniciando aplicação...');
        renderCategories();
    }

    // Make sure initApp is called at the very end
    console.log('initApp vai executar');
    initApp();

    renderCategories();  // Essa única linha resolve tudo!

    console.log('%cPrompt Organizer carregado com sucesso!', 'color: #4CAF50; font-weight: bold;');

    // Debug global (opcional, mas muito útil)
    window.appDebug = {
        categories,
        prompts,
        activeCategory: () => activeCategory,
        renderCategories,
        renderPrompts,
        reload: () => renderCategories()
    };


    // ==================== DRAG & DROP PARA REORDENAR CATEGORIAS ====================
    let draggedItem = null;

    function makeCategoriesDraggable() {
        const items = document.querySelectorAll('#categoryList li');

        items.forEach(item => {
            item.setAttribute('draggable', true);

            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                setTimeout(() => {
                    item.classList.add('dragging');
                }, 0);
            });

            item.addEventListener('dragend', (e) => {
                setTimeout(() => {
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                    saveCategoryOrder();        // ← salva a nova ordem
                }, 0);
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });

            item.addEventListener('dragleave', (e) => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem && draggedItem !== item) {
                    const allItems = [...document.querySelectorAll('#categoryList li')];
                    const fromIndex = allItems.indexOf(draggedItem);
                    const toIndex = allItems.indexOf(item);

                    // Reordena o array de categorias
                    const [movedCategory] = categories.splice(fromIndex, 1);
                    categories.splice(toIndex, 0, movedCategory);

                    // Atualiza a categoria ativa se necessário
                    if (activeCategory === draggedItem.dataset.category) {
                        activeCategory = movedCategory;
                    }

                    renderCategories();   // recarrega a lista na nova ordem
                }
                item.classList.remove('drag-over');
            });
        });
    }

    // Função para salvar a ordem atualizada
    function saveCategoryOrder() {
        saveCategories();           // já salva no localStorage
        console.log('Ordem das categorias salva:', categories);
    }

    // newPromptText.addEventListener('input', function () {
    //     this.style.height = 'auto';
    //     this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    // });

});

// ====== TEXTAREA: REDIMENSIONAMENTO 100% FUNCIONAL ======
const textarea = document.getElementById('newPromptText');
const wrapper = textarea.parentElement;
let isResizing = false;
let startY, startHeight;

function resizeTextarea() {
    textarea.style.height = 'auto';
    const maxHeight = 400;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';
}

// Ajuste automático
textarea.addEventListener('input', resizeTextarea);

// Redimensionamento com mouse
const handle = wrapper.querySelector('.resize-handle');

handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = textarea.offsetHeight;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const diff = e.clientY - startY;
    const newHeight = Math.max(80, Math.min(startHeight + diff, 400));
    textarea.style.height = newHeight + 'px';
});

document.addEventListener('mouseup', () => {
    isResizing = false;
});

// Inicializa
setTimeout(resizeTextarea, 100);