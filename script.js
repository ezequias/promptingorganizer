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
            activeCategory = null; // No active category if none exist
            renderPrompts(); // Update prompts display
            return;
        }

        categories.forEach(category => {
            const li = document.createElement('li');
            li.dataset.category = category;

            // Category Name Span
            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = category;
            categoryNameSpan.classList.add('category-name'); // Add class to distinguish from button
            categoryNameSpan.addEventListener('click', (e) => {
                // Prevent event from bubbling to the parent li click which might trigger menu close
                e.stopPropagation();
                if (activeCategory !== category) {
                    activeCategory = category;
                    renderCategories(); // Re-render to update active class
                    renderPrompts();
                }
            });
            li.appendChild(categoryNameSpan);

            // Three dots menu button
            const menuBtn = document.createElement('button');
            menuBtn.classList.add('category-actions-btn');
            menuBtn.innerHTML = '<i class="material-icons">more_vert</i>';
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent li click
                toggleCategoryMenu(li, category);
            });
            li.appendChild(menuBtn);

            // Menu container
            const menu = document.createElement('div');
            menu.classList.add('category-menu');
            menu.innerHTML = `
                <ul>
                    <li class="delete-item" data-action="delete"><i class="material-icons">delete</i> Delete</li>
                </ul>
            `;
            li.appendChild(menu);

            // Event listener for menu items
            menu.querySelector('.delete-item').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent parent clicks
                const action = e.currentTarget.dataset.action;
                if (action === 'delete') {
                    deleteCategory(category);
                }
                menu.classList.remove('active'); // Close menu after action
            });

            if (category === activeCategory) {
                li.classList.add('active');
            }
            categoryList.appendChild(li);

            // Render for prompt category select
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            promptCategorySelect.appendChild(option);
        });

        // Ensure the select box reflects the active category if possible, or default
        if (activeCategory && categories.includes(activeCategory)) {
            promptCategorySelect.value = activeCategory;
        } else if (categories.length > 0) {
            activeCategory = categories[0];
            promptCategorySelect.value = activeCategory;
            renderCategories(); // Re-render to show active
        } else {
            activeCategory = null;
        }

        renderPrompts();
    }

    function toggleCategoryMenu(categoryListItem, categoryName) {
        // Close any other open menus first
        document.querySelectorAll('.category-menu.active').forEach(openMenu => {
            openMenu.classList.remove('active');
        });

        const menu = categoryListItem.querySelector('.category-menu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    // Close menu when clicking anywhere else on the document
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.category-actions-btn') && !e.target.closest('.category-menu')) {
            document.querySelectorAll('.category-menu.active').forEach(openMenu => {
                openMenu.classList.remove('active');
            });
        }
    });

    function deleteCategory(categoryToDelete) {
        if (!confirm(`Are you sure you want to delete the category "${categoryToDelete}"? All prompts within this category will also be deleted.`)) {
            return; // User cancelled
        }

        // Remove category from list
        categories = categories.filter(c => c !== categoryToDelete);
        saveCategories();

        // Remove associated prompts
        prompts = prompts.filter(p => p.category !== categoryToDelete);
        savePrompts();

        // If the deleted category was active, set a new active category
        if (activeCategory === categoryToDelete) {
            activeCategory = categories.length > 0 ? categories[0] : null;
        }

        renderCategories(); // Re-render to update display
        renderPrompts();    // Re-render prompts (will show for new active or none)
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
