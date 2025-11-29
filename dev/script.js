document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('categoryList');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const newPromptText = document.getElementById('newPromptText');
    const promptCategorySelect = document.getElementById('promptCategorySelect');
    const addPromptBtn = document.getElementById('addPromptBtn');
    const promptDisplay = document.getElementById('promptDisplay');

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

    function renderCategories() {
        console.log("renderCategories() começou");
        categoryList.innerHTML = '';
        promptCategorySelect.innerHTML = '';

        if (categories.length === 0) {
            categoryList.innerHTML = '<p class="no-prompts-message">No categories yet. Add one!</p>';
            promptCategorySelect.innerHTML = '<option value="">No Categories Available</option>';
            activeCategory = null;
            renderPrompts();
            return;
        }

        categories.forEach(category => {
            const li = document.createElement('li');
            li.dataset.category = category;

            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = category;
            categoryNameSpan.classList.add('category-name');
            categoryNameSpan.style.flexGrow = '1';

            let clickTimeout = null;

            categoryNameSpan.addEventListener('click', (e) => {
                if (e.detail === 1) {
                    clickTimeout = setTimeout(() => {
                        if (activeCategory !== category) {
                            activeCategory = category;
                            renderCategories();
                            renderPrompts();
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
            deleteBtn.innerHTML = '<i class="material-icons">delete</i>';
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

            // Update category options for prompt input
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            promptCategorySelect.appendChild(option);
        });

        // After rendering all categories, set the promptCategorySelect value
        // to the active category if it still exists, or default to the first
        if (activeCategory && categories.includes(activeCategory)) {
            promptCategorySelect.value = activeCategory;
        } else if (categories.length > 0) {
            activeCategory = categories[0];
            promptCategorySelect.value = activeCategory;
            //renderCategories(); // Re-render to show correct active category
        } else {
            activeCategory = null;
        }

        renderPrompts();
        console.log("renderCategories() terminou");
    }

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
        if (!activeCategory || categories.length === 0) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">Please select or add a category to view prompts.</p>';
            return;
        }

        const filteredPrompts = prompts.filter(p => p.category === activeCategory);

        if (filteredPrompts.length === 0) {
            promptDisplay.innerHTML = `<p class="no-prompts-message">No prompts in "${activeCategory}" yet. Add one!</p>`;
            return;
        }

        filteredPrompts.forEach(prompt => {
            const promptCard = document.createElement('div');
            promptCard.classList.add('prompt-card');
            promptCard.innerHTML = `
                <p>${prompt.text}</p>
                <div class="prompt-actions">
                    <button class="copy-prompt-btn" data-text="${prompt.text}" title="Copy Prompt">
                        <svg aria-hidden="true" focusable="false" class="octicon octicon-copy" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>
                    </button>
                    <button class="delete-prompt-btn" data-id="${prompt.id}" title="Delete Prompt">
                        <svg aria-hidden="true" focusable="false" class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path></svg>
                    </button>
                </div>
`;
            promptDisplay.appendChild(promptCard);
        });
        document.querySelectorAll('.copy-prompt-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const targetButton = e.target.closest('.copy-prompt-btn');
                if (targetButton) {
                    const promptTextToCopy = targetButton.dataset.text;
                    try {
                        await navigator.clipboard.writeText(promptTextToCopy);
                        showToast('Prompt copied to clipboard!', 'success');
                    } catch (err) {
                        console.error('Failed to copy prompt:', err);
                        showToast('Failed to copy prompt. Please copy manually.', 'error');
                    }
                }
            });
        });


        document.querySelectorAll('.delete-prompt-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetButton = e.target.closest('.delete-prompt-btn');
                if (targetButton) {
                    const promptIdToDelete = parseInt(targetButton.dataset.id);
                    prompts = prompts.filter(p => p.id !== promptIdToDelete);
                    savePrompts();
                    renderPrompts();
                }
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
});
