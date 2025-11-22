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
    let activeCategory = categories[0]; // Set initial active category

    function saveCategories() {
        localStorage.setItem('promptCategories', JSON.stringify(categories));
    }

    function savePrompts() {
        localStorage.setItem('userPrompts', JSON.stringify(prompts));
    }

    function renderCategories() {
        categoryList.innerHTML = '';
        promptCategorySelect.innerHTML = ''; // Clear options for select as well

        if (categories.length === 0) {
            categoryList.innerHTML = '<p class="no-prompts-message">No categories yet. Add one!</p>';
            promptCategorySelect.innerHTML = '<option value="">No Categories Available</option>';
            return;
        }

        categories.forEach(category => {
            // Render for sidebar
            const li = document.createElement('li');
            li.textContent = category;
            li.dataset.category = category;
            if (category === activeCategory) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => {
                activeCategory = category;
                renderCategories(); // Re-render to update active class
                renderPrompts();
            });
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

        renderPrompts(); // Always render prompts after categories update
    }

    function renderPrompts() {
        promptDisplay.innerHTML = '';
        const filteredPrompts = prompts.filter(p => p.category === activeCategory);

        if (filteredPrompts.length === 0) {
            promptDisplay.innerHTML = `<p class="no-prompts-message">No prompts in "${activeCategory}" yet. Add one!</p>`;
            return;
        }

        filteredPrompts.forEach(prompt => {
            const promptCard = document.createElement('div');
            promptCard.classList.add('prompt-card');
            promptCard.innerHTML = `<p>${prompt.text}</p><button class="delete-prompt-btn" data-id="${prompt.id}">X</button>`;
            promptDisplay.appendChild(promptCard);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-prompt-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const promptIdToDelete = parseInt(e.target.dataset.id);
                prompts = prompts.filter(p => p.id !== promptIdToDelete);
                savePrompts();
                renderPrompts();
            });
        });
    }

    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            saveCategories();
            newCategoryInput.value = '';
            activeCategory = newCategory; // Make new category active
            renderCategories();
        } else if (newCategory && categories.includes(newCategory)) {
            alert('Category already exists!');
        }
    });

    addPromptBtn.addEventListener('click', () => {
        const promptText = newPromptText.value.trim();
        const selectedCategory = promptCategorySelect.value;

        if (promptText && selectedCategory) {
            const newPrompt = {
                id: Date.now(), // Simple unique ID
                text: promptText,
                category: selectedCategory
            };
            prompts.push(newPrompt);
            savePrompts();
            newPromptText.value = '';
            // If the added prompt is in the currently active category, re-render prompts
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