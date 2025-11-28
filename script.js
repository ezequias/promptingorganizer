document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('categoryList');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const newPromptText = document.getElementById('newPromptText');
    const promptCategorySelect = document.getElementById('promptCategorySelect');
    const addPromptBtn = document.getElementById('addPromptBtn');
    const promptDisplay = document.getElementById('promptDisplay');
    const downloadPromptsBtn = document.getElementById('downloadPromptsBtn');

    let categories = JSON.parse(localStorage.getItem('promptCategories')) || ['General', 'Creative', 'Technical'];
    let prompts = JSON.parse(localStorage.getItem('userPrompts')) || [];
    let activeCategory = categories[0]; // Set initial active category

    function saveCategories() {
        localStorage.setItem('promptCategories', JSON.stringify(categories));
    }

    function savePrompts() {
        localStorage.setItem('userPrompts', JSON.stringify(prompts));
    }

    function downloadPrompts() {
        if (prompts.length === 0) {
            showToast('No prompts to download!', 'info');
            return;
        }
    
        const dataStr = JSON.stringify(prompts, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_prompts.json';
    
        document.body.appendChild(a);
        a.click();
    
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    
        showToast('Prompts downloaded successfully!');
    }
    
    function renderCategories() {
        categoryList.innerHTML = '';
        promptCategorySelect.innerHTML = ''; // Clear options for select as well
https://github.com/ezequias/promptingorganizer/actions
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
                //renderPrompts();
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
            //promptCard.innerHTML = `<p>${prompt.text}</p><button class="delete-prompt-btn" data-id="${prompt.id}">🗑️</button>`;
            promptCard.innerHTML = `
           <p>${prompt.text}</p>
            <div class="prompt-actions">
                <button class="copy-prompt-btn" data-text="${prompt.text}" title="Copy Prompt">
                    <i class="material-icons">content_copy</i>
                </button>
                <button class="delete-prompt-btn" data-id="${prompt.id}" title="Delete Prompt">
                    <svg aria-hidden="true" focusable="false" class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path></svg>
                </button>
            </div>
        `;
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

    // Function to delete a prompt by its ID
    function deletePrompt(id) {
        // CRUCIAL FIX: Convert the string 'id' back to a Number for correct comparison
        prompts = prompts.filter(prompt => prompt.id !== Number(id));
        
        savePrompts(); // Save the updated list to localStorage
        renderPrompts(); // Re-render the UI
        showToast('Prompt deleted.');
    }
    
    promptDisplay.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
    
        if (!targetButton) return; // Not a button click
    
        if (targetButton.classList.contains('delete-prompt-btn')) {
            const promptId = targetButton.dataset.id;
            deletePrompt(promptId);    
        } else if (targetButton.classList.contains('copy-prompt-btn')) {
       const textToCopy = targetButton.dataset.text;
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showToast('Prompt copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy prompt: ', err);
                showToast('Failed to copy prompt.', 'error');
            });
    }
});
   
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

    const downloadPromptsBtn = document.getElementById('downloadPromptsBtn');
    // ...
    if (downloadPromptsBtn) {
        downloadPromptsBtn.addEventListener('click', downloadPrompts);
    }

    function initApp() {
    // ... all your initialization logic ...
    renderPrompts(); // Call renderPrompts here
    // ...
    }
    // Make sure initApp is called at the very end
    initApp();
    
    // Initial render
    renderCategories();
});
