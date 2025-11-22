document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('categoryList');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const newPromptText = document.getElementById('newPromptText');
    const promptCategorySelect = document.getElementById('promptCategorySelect');
    const addPromptBtn = document.getElementById('addPromptBtn');
    const promptDisplay = document.getElementById('promptDisplay');

    let categories = JSON.parse(localStorage.getItem('promptCategories')) || ['General', 'Creative', 'Technical'];
    let prompts = JSON.parse(localStorage.getItem('userPrompts')) || [];
    let activeCategory = categories.length > 0 ? categories[0] : null;

    function saveCategories() {
        localStorage.setItem('promptCategories', JSON.stringify(categories));
    }

    function savePrompts() {
        localStorage.setItem('userPrompts', JSON.stringify(prompts));
    }

    function renderCategories() {
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

            // Double-click to edit
            categoryNameSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                enterEditMode(li, category);
            });

            // Click to activate (single click, not double-click)
            categoryNameSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                if (activeCategory !== category) {
                    activeCategory = category;
                    renderCategories();
                    renderPrompts();
                }
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
            renderCategories();
        } else {
            activeCategory = null;
        }

        renderPrompts();
    }

    function enterEditMode(categoryListItem, oldCategoryName) {
        // Prevent multiple edit modes
        if (categoryListItem.querySelector('.category-edit-input')) {
            return;
        }

        const categoryNameSpan = categoryListItem.querySelector('.category-name');
        const deleteBtn = categoryListItem.querySelector('.delete-category-btn');

        // Hide original span and delete button
        categoryNameSpan.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';

        // Create input field
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = oldCategoryName;
        editInput.classList.add('category-edit-input');
        categoryListItem.prepend(editInput); // Add at the beginning of the li

        editInput.focus();
        editInput.select(); // Select text for easy editing

        const saveChanges = () => {
            const newCategoryName = editInput.value.trim();

            if (newCategoryName === oldCategoryName) {
                // No change, just revert
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

            // Update categories array
            const oldIndex = categories.indexOf(oldCategoryName);
            if (oldIndex > -1) {
                categories[oldIndex] = newCategoryName;
                saveCategories();
            }

            // Update prompts with the new category name
            prompts.forEach(prompt => {
                if (prompt.category === oldCategoryName) {
                    prompt.category = newCategoryName;
                }
            });
            savePrompts();

            // Update active category if it was the one being edited
            if (activeCategory === oldCategoryName) {
                activeCategory = newCategoryName;
            }

            renderCategories(); // Re-render everything to reflect changes
        };

        editInput.addEventListener('blur', saveChanges); // Save on blur (lose focus)
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                editInput.blur(); // Trigger blur to save
            }
        });
    }

    function exitEditMode(categoryListItem, categoryNameSpan, deleteBtn, editInput) {
        if (editInput && editInput.parentNode === categoryListItem) {
            categoryListItem.removeChild(editInput);
        }
        categoryNameSpan.style.display = ''; // Show original span
        if (deleteBtn) deleteBtn.style.display = ''; // Show delete button
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
            promptCard.innerHTML = `<p>${prompt.text}</p><button class="delete-prompt-btn" data-id="${prompt.id}"><i class="material-icons">close</i></button>`;
            promptDisplay.appendChild(promptCard);
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

    // Initial render
    renderCategories();
});
