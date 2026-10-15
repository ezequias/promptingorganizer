document.addEventListener('DOMContentLoaded', () => {
    // ====== ELEMENTOS DOM ======
    // Accordion Prompts
    const promptsAccordionHeader = document.getElementById('promptsAccordionHeader');
    const promptsAccordionContent = document.getElementById('promptsAccordionContent');
    const promptsCountBadge = document.getElementById('promptsCountBadge');
    const promptCategoryList = document.getElementById('promptCategoryList');
    const newPromptCategoryInput = document.getElementById('newPromptCategoryInput');
    const promptCategoryColorInput = document.getElementById('promptCategoryColorInput');
    const addPromptCategoryBtn = document.getElementById('addPromptCategoryBtn');

    // Accordion Skills
    const skillsAccordionHeader = document.getElementById('skillsAccordionHeader');
    const skillsAccordionContent = document.getElementById('skillsAccordionContent');
    const skillsCountBadge = document.getElementById('skillsCountBadge');
    const skillCategoryList = document.getElementById('skillCategoryList');
    const newSkillCategoryInput = document.getElementById('newSkillCategoryInput');
    const skillCategoryColorInput = document.getElementById('skillCategoryColorInput');
    const addSkillCategoryBtn = document.getElementById('addSkillCategoryBtn');

    // Formulário de Criação (Prompts e Skills)
    const inputSectionHeading = document.getElementById('inputSectionHeading');
    const skillTitleWrapper = document.getElementById('skillTitleWrapper');
    const skillTitleInput = document.getElementById('skillTitleInput');
    const newPromptText = document.getElementById('newPromptText');
    const promptCategorySelect = document.getElementById('promptCategorySelect');
    const addPromptBtn = document.getElementById('addPromptBtn');

    // Exibição e Pesquisa
    const displaySectionHeading = document.getElementById('displaySectionHeading');
    const searchInput = document.getElementById('searchInput');
    const promptDisplay = document.getElementById('promptDisplay');

    // Data Management
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    const uploadFileInput = document.getElementById('uploadFileInput');
    const uploadDataBtn = document.getElementById('uploadDataBtn');

    // ======= CORES E CATEGORIAS PADRÃO =======
    const DEFAULT_PROMPT_CATEGORIES = ['Geral', 'Criativo', 'Técnico'];
    const DEFAULT_SKILL_CATEGORIES = ['Automação', 'Análise de Dados', 'Assistente'];
    const DEFAULT_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#E91E63'];

    // Função de sanitização e compatibilidade de categorias
    function ensureCategoryObjects(cats, defaults) {
        if (!cats || cats.length === 0) {
            return defaults.map((c, i) => ({
                name: c,
                color: DEFAULT_COLORS[i % DEFAULT_COLORS.length]
            }));
        }
        return cats.map((cat, index) => {
            if (typeof cat === 'string') {
                return {
                    name: cat,
                    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                };
            }
            return cat;
        });
    }

    // ====== DADOS / ESTADO ======
    let promptCategories = ensureCategoryObjects(
        JSON.parse(localStorage.getItem('promptCategories')),
        DEFAULT_PROMPT_CATEGORIES
    );
    let prompts = JSON.parse(localStorage.getItem('userPrompts')) || [];
    let activePromptCategory = promptCategories.length > 0 ? promptCategories[0].name : null;

    let skillCategories = ensureCategoryObjects(
        JSON.parse(localStorage.getItem('skillCategories')),
        DEFAULT_SKILL_CATEGORIES
    );
    let skills = JSON.parse(localStorage.getItem('userSkills')) || [];
    let activeSkillCategory = skillCategories.length > 0 ? skillCategories[0].name : null;

    // Seção ativa: 'prompts' ou 'skills'
    let currentSection = 'prompts';

    // ====== FUNÇÕES DE ARMAZENAMENTO ======
    function savePromptCategories() {
        localStorage.setItem('promptCategories', JSON.stringify(promptCategories));
    }

    function savePrompts() {
        localStorage.setItem('userPrompts', JSON.stringify(prompts));
    }

    function saveSkillCategories() {
        localStorage.setItem('skillCategories', JSON.stringify(skillCategories));
    }

    function saveSkills() {
        localStorage.setItem('userSkills', JSON.stringify(skills));
    }

    function saveAll() {
        savePromptCategories();
        savePrompts();
        saveSkillCategories();
        saveSkills();
    }

    // ====== ALTERNÂNCIA DE SEÇÕES ======
    function switchSection(section, categoryToSelect = null) {
        currentSection = section;

        if (section === 'prompts') {
            if (categoryToSelect) {
                activePromptCategory = categoryToSelect;
            } else if (!activePromptCategory && promptCategories.length > 0) {
                activePromptCategory = promptCategories[0].name;
            }

            // Abre o accordion de Prompts
            promptsAccordionContent.classList.add('open');
            promptsAccordionHeader.classList.add('active');
            promptsAccordionHeader.setAttribute('aria-expanded', 'true');

            // Formulário em modo Prompt
            if (inputSectionHeading) inputSectionHeading.textContent = 'Add New Prompt';
            if (skillTitleWrapper) skillTitleWrapper.style.display = 'none';
            if (newPromptText) newPromptText.placeholder = 'Enter your prompt here...';
            if (addPromptBtn) addPromptBtn.textContent = 'Add Prompt';
            if (displaySectionHeading) displaySectionHeading.textContent = 'Prompts 🔍';
            if (searchInput) searchInput.placeholder = 'Search prompts...';

        } else if (section === 'skills') {
            if (categoryToSelect) {
                activeSkillCategory = categoryToSelect;
            } else if (!activeSkillCategory && skillCategories.length > 0) {
                activeSkillCategory = skillCategories[0].name;
            }

            // Abre o accordion de Skills
            skillsAccordionContent.classList.add('open');
            skillsAccordionHeader.classList.add('active');
            skillsAccordionHeader.setAttribute('aria-expanded', 'true');

            // Formulário em modo Skill
            if (inputSectionHeading) inputSectionHeading.textContent = 'Add New Skill';
            if (skillTitleWrapper) skillTitleWrapper.style.display = 'block';
            if (newPromptText) newPromptText.placeholder = 'Enter skill instructions / prompt here...';
            if (addPromptBtn) addPromptBtn.textContent = 'Add Skill';
            if (displaySectionHeading) displaySectionHeading.textContent = 'Skills ⚡ 🔍';
            if (searchInput) searchInput.placeholder = 'Search skills (title or instructions)...';
        }

        renderCategorySelect();
        renderPromptCategoriesUI();
        renderSkillCategoriesUI();
        renderItems();
    }

    // ====== RENDERIZAÇÃO DO SELECT DE CATEGORIAS ======
    function renderCategorySelect() {
        if (!promptCategorySelect) return;
        promptCategorySelect.innerHTML = '';

        const activeList = currentSection === 'prompts' ? promptCategories : skillCategories;
        const currentActive = currentSection === 'prompts' ? activePromptCategory : activeSkillCategory;

        if (activeList.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No categories available';
            promptCategorySelect.appendChild(opt);
            return;
        }

        activeList.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            promptCategorySelect.appendChild(option);
        });

        if (currentActive && activeList.some(c => c.name === currentActive)) {
            promptCategorySelect.value = currentActive;
        } else if (activeList.length > 0) {
            promptCategorySelect.value = activeList[0].name;
            if (currentSection === 'prompts') activePromptCategory = activeList[0].name;
            else activeSkillCategory = activeList[0].name;
        }
    }

    // ====== RENDERIZAÇÃO DAS CATEGORIAS DE PROMPTS ======
    function renderPromptCategoriesUI() {
        if (!promptCategoryList) return;
        promptCategoryList.innerHTML = '';

        if (promptsCountBadge) {
            promptsCountBadge.textContent = prompts.length;
        }

        if (promptCategories.length === 0) {
            promptCategoryList.innerHTML = '<p class="no-prompts-message" style="padding: 10px; font-size: 0.85rem;">No categories yet.</p>';
            return;
        }

        promptCategories.forEach(catObj => {
            const name = catObj.name;
            const color = catObj.color;

            const li = document.createElement('li');
            li.dataset.category = name;
            li.dataset.section = 'prompts';
            li.classList.add('category-item');
            li.style.borderLeft = `5px solid ${color}`;

            // Grip / Drag handle
            const handle = document.createElement('span');
            handle.className = 'drag-handle';
            li.appendChild(handle);

            // Nome da categoria
            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = name;
            categoryNameSpan.classList.add('category-name');

            const promptCount = prompts.filter(p => p.category === name).length;
            const countSpan = document.createElement('span');
            countSpan.className = 'prompt-count';
            countSpan.textContent = promptCount;
            categoryNameSpan.appendChild(countSpan);

            if (promptCount > 0) {
                li.classList.add('has-prompts');
            }

            li.appendChild(categoryNameSpan);

            // Clique para ativar
            li.addEventListener('click', (e) => {
                if (e.target.closest('.delete-category-btn') ||
                    e.target.closest('.drag-handle') ||
                    e.target.tagName === 'INPUT') return;

                switchSection('prompts', name);
            });

            // Duplo clique no nome para renomear
            categoryNameSpan.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target.closest('.delete-category-btn') || e.target.closest('.drag-handle')) return;
                enterCategoryEditMode(li, name, 'prompts');
            });

            // Botão Deletar Categoria
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-category-btn');
            deleteBtn.innerHTML = `<svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path></svg>`;
            deleteBtn.title = `Delete "${name}" category and its prompts`;

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${name}" and all its prompts?`)) {
                    prompts = prompts.filter(p => p.category !== name);
                    promptCategories = promptCategories.filter(c => c.name !== name);
                    if (activePromptCategory === name) {
                        activePromptCategory = promptCategories.length > 0 ? promptCategories[0].name : null;
                    }
                    savePromptCategories();
                    savePrompts();
                    renderCategorySelect();
                    renderPromptCategoriesUI();
                    if (currentSection === 'prompts') renderItems();
                }
            });

            li.appendChild(deleteBtn);

            if (currentSection === 'prompts' && name === activePromptCategory) {
                li.classList.add('active');
            }

            promptCategoryList.appendChild(li);
        });

        makeCategoriesDraggable(promptCategoryList, promptCategories, () => {
            savePromptCategories();
            renderCategorySelect();
        });
    }

    // ====== RENDERIZAÇÃO DAS CATEGORIAS DE SKILLS ======
    function renderSkillCategoriesUI() {
        if (!skillCategoryList) return;
        skillCategoryList.innerHTML = '';

        if (skillsCountBadge) {
            skillsCountBadge.textContent = skills.length;
        }

        if (skillCategories.length === 0) {
            skillCategoryList.innerHTML = '<p class="no-prompts-message" style="padding: 10px; font-size: 0.85rem;">No skill categories yet.</p>';
            return;
        }

        skillCategories.forEach(catObj => {
            const name = catObj.name;
            const color = catObj.color;

            const li = document.createElement('li');
            li.dataset.category = name;
            li.dataset.section = 'skills';
            li.classList.add('category-item');
            li.style.borderLeft = `5px solid ${color}`;

            // Grip / Drag handle
            const handle = document.createElement('span');
            handle.className = 'drag-handle';
            li.appendChild(handle);

            // Nome da categoria
            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.textContent = name;
            categoryNameSpan.classList.add('category-name');

            const skillCount = skills.filter(s => s.category === name).length;
            const countSpan = document.createElement('span');
            countSpan.className = 'prompt-count';
            countSpan.textContent = skillCount;
            categoryNameSpan.appendChild(countSpan);

            if (skillCount > 0) {
                li.classList.add('has-prompts');
            }

            li.appendChild(categoryNameSpan);

            // Clique para ativar
            li.addEventListener('click', (e) => {
                if (e.target.closest('.delete-category-btn') ||
                    e.target.closest('.drag-handle') ||
                    e.target.tagName === 'INPUT') return;

                switchSection('skills', name);
            });

            // Duplo clique no nome para renomear
            categoryNameSpan.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target.closest('.delete-category-btn') || e.target.closest('.drag-handle')) return;
                enterCategoryEditMode(li, name, 'skills');
            });

            // Botão Deletar Categoria
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-category-btn');
            deleteBtn.innerHTML = `<svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path></svg>`;
            deleteBtn.title = `Delete "${name}" category and its skills`;

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${name}" and all its skills?`)) {
                    skills = skills.filter(s => s.category !== name);
                    skillCategories = skillCategories.filter(c => c.name !== name);
                    if (activeSkillCategory === name) {
                        activeSkillCategory = skillCategories.length > 0 ? skillCategories[0].name : null;
                    }
                    saveSkillCategories();
                    saveSkills();
                    renderCategorySelect();
                    renderSkillCategoriesUI();
                    if (currentSection === 'skills') renderItems();
                }
            });

            li.appendChild(deleteBtn);

            if (currentSection === 'skills' && name === activeSkillCategory) {
                li.classList.add('active');
            }

            skillCategoryList.appendChild(li);
        });

        makeCategoriesDraggable(skillCategoryList, skillCategories, () => {
            saveSkillCategories();
            renderCategorySelect();
        });
    }

    // ====== MODO DE EDIÇÃO DE NOME DE CATEGORIA ======
    function enterCategoryEditMode(liElement, oldName, type) {
        const nameSpan = liElement.querySelector('.category-name');
        if (!nameSpan) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldName;
        input.className = 'edit-category-input';
        input.style.width = '85%';

        nameSpan.innerHTML = '';
        nameSpan.appendChild(input);

        setTimeout(() => {
            input.focus();
            input.select();
        }, 50);

        const save = () => {
            const newName = input.value.trim();
            if (document.body.contains(input)) {
                if (newName && newName !== oldName) {
                    if (type === 'prompts') {
                        promptCategories = promptCategories.map(c => c.name === oldName ? { ...c, name: newName } : c);
                        prompts = prompts.map(p => p.category === oldName ? { ...p, category: newName } : p);
                        if (activePromptCategory === oldName) activePromptCategory = newName;
                        savePromptCategories();
                        savePrompts();
                        renderPromptCategoriesUI();
                    } else {
                        skillCategories = skillCategories.map(c => c.name === oldName ? { ...c, name: newName } : c);
                        skills = skills.map(s => s.category === oldName ? { ...s, category: newName } : s);
                        if (activeSkillCategory === oldName) activeSkillCategory = newName;
                        saveSkillCategories();
                        saveSkills();
                        renderSkillCategoriesUI();
                    }
                    renderCategorySelect();
                    renderItems();
                } else {
                    if (type === 'prompts') renderPromptCategoriesUI();
                    else renderSkillCategoriesUI();
                }
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                save();
            }
            if (e.key === 'Escape') {
                if (type === 'prompts') renderPromptCategoriesUI();
                else renderSkillCategoriesUI();
            }
        });

        input.addEventListener('blur', () => {
            setTimeout(save, 100);
        });
    }

    // ====== ADICIONAR NOVA CATEGORIA (PROMPTS) ======
    if (addPromptCategoryBtn && newPromptCategoryInput) {
        addPromptCategoryBtn.addEventListener('click', () => {
            const newCategory = newPromptCategoryInput.value.trim();
            const newColor = promptCategoryColorInput ? promptCategoryColorInput.value : DEFAULT_COLORS[0];

            if (newCategory) {
                if (!promptCategories.some(c => c.name.toLowerCase() === newCategory.toLowerCase())) {
                    promptCategories.push({ name: newCategory, color: newColor });
                    savePromptCategories();
                    newPromptCategoryInput.value = '';
                    switchSection('prompts', newCategory);
                } else {
                    alert('Category already exists in Prompts!');
                }
            }
        });

        newPromptCategoryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addPromptCategoryBtn.click();
            }
        });
    }

    // ====== ADICIONAR NOVA CATEGORIA (SKILLS) ======
    if (addSkillCategoryBtn && newSkillCategoryInput) {
        addSkillCategoryBtn.addEventListener('click', () => {
            const newCategory = newSkillCategoryInput.value.trim();
            const newColor = skillCategoryColorInput ? skillCategoryColorInput.value : DEFAULT_COLORS[1];

            if (newCategory) {
                if (!skillCategories.some(c => c.name.toLowerCase() === newCategory.toLowerCase())) {
                    skillCategories.push({ name: newCategory, color: newColor });
                    saveSkillCategories();
                    newSkillCategoryInput.value = '';
                    switchSection('skills', newCategory);
                } else {
                    alert('Category already exists in Skills!');
                }
            }
        });

        newSkillCategoryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkillCategoryBtn.click();
            }
        });
    }

    // ====== TOGGLE DOS ACCORDIONS ======
    if (promptsAccordionHeader) {
        promptsAccordionHeader.addEventListener('click', () => {
            const isOpen = promptsAccordionContent.classList.contains('open');
            if (isOpen && currentSection === 'prompts') {
                promptsAccordionContent.classList.remove('open');
                promptsAccordionHeader.classList.remove('active');
                promptsAccordionHeader.setAttribute('aria-expanded', 'false');
            } else {
                switchSection('prompts');
            }
        });
    }

    if (skillsAccordionHeader) {
        skillsAccordionHeader.addEventListener('click', () => {
            const isOpen = skillsAccordionContent.classList.contains('open');
            if (isOpen && currentSection === 'skills') {
                skillsAccordionContent.classList.remove('open');
                skillsAccordionHeader.classList.remove('active');
                skillsAccordionHeader.setAttribute('aria-expanded', 'false');
            } else {
                switchSection('skills');
            }
        });
    }

    // ====== RENDERIZAÇÃO DE ITENS (PROMPTS OU SKILLS) ======
    function renderItems() {
        if (!promptDisplay) return;
        promptDisplay.innerHTML = '';

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        if (currentSection === 'prompts') {
            renderPromptsList(searchTerm);
        } else {
            renderSkillsList(searchTerm);
        }
    }

    // Renderiza lista de Prompts
    function renderPromptsList(searchTerm) {
        if (!activePromptCategory) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">Select a category or add new prompts.</p>';
            return;
        }

        let categoryPrompts = prompts.filter(p => p.category === activePromptCategory);

        if (searchTerm) {
            categoryPrompts = categoryPrompts.filter(p =>
                p.text && p.text.toLowerCase().includes(searchTerm)
            );
        }

        categoryPrompts.reverse();

        if (categoryPrompts.length === 0) {
            if (searchTerm) {
                promptDisplay.innerHTML = `<p class="no-prompts-message">No prompts found matching "${searchTerm}" in "${activePromptCategory}".</p>`;
            } else {
                promptDisplay.innerHTML = `<p class="no-prompts-message">No prompts in "${activePromptCategory}" yet.</p>`;
            }
            return;
        }

        categoryPrompts.forEach(prompt => {
            const card = document.createElement('div');
            card.className = 'prompt-card';

            card.addEventListener('click', (e) => {
                const target = e.target;
                if (
                    target.closest('.prompt-actions') ||
                    target.tagName === 'TEXTAREA' ||
                    target.closest('.save-edit-btn') ||
                    target.closest('.cancel-edit-btn')
                ) return;

                card.classList.toggle('expanded');
            });

            const textWithHighlights = prompt.text
                .replace(/\[/g, '<span class="placeholder-highlight">[')
                .replace(/\]/g, ']</span>');

            const safeTextForAttribute = prompt.text
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

            card.innerHTML = `
                <div class="prompt-header-info">
                    <span class="date-added">${prompt.dateAdded || 'N/A'}</span>
                </div>
                <p>${textWithHighlights}</p>
                <div class="prompt-actions">
                    <button class="copy-prompt-btn" data-text="${safeTextForAttribute}" title="Copy Prompt">
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                            <path d="M5.25 1.75C5.25 .784 6.034 0 7 0h7.25C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11H7c-.966 0-1.75-.784-1.75-1.75v-7.5Z"></path>
                        </svg>
                    </button>
                    <button class="delete-prompt-btn" data-id="${prompt.id}" title="Delete Prompt">
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

    // Renderiza lista de Skills
    function renderSkillsList(searchTerm) {
        if (!activeSkillCategory) {
            promptDisplay.innerHTML = '<p class="no-prompts-message">Select a skill category or add new skills.</p>';
            return;
        }

        let categorySkills = skills.filter(s => s.category === activeSkillCategory);

        if (searchTerm) {
            categorySkills = categorySkills.filter(s =>
                (s.title && s.title.toLowerCase().includes(searchTerm)) ||
                (s.text && s.text.toLowerCase().includes(searchTerm))
            );
        }

        categorySkills.reverse();

        if (categorySkills.length === 0) {
            if (searchTerm) {
                promptDisplay.innerHTML = `<p class="no-prompts-message">No skills found matching "${searchTerm}" in "${activeSkillCategory}".</p>`;
            } else {
                promptDisplay.innerHTML = `<p class="no-prompts-message">No skills in "${activeSkillCategory}" yet.</p>`;
            }
            return;
        }

        categorySkills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'prompt-card skill-card';

            card.addEventListener('click', (e) => {
                const target = e.target;
                if (
                    target.closest('.prompt-actions') ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'INPUT' ||
                    target.closest('.save-edit-btn') ||
                    target.closest('.cancel-edit-btn')
                ) return;

                card.classList.toggle('expanded');
            });

            const textWithHighlights = skill.text
                .replace(/\[/g, '<span class="placeholder-highlight">[')
                .replace(/\]/g, ']</span>');

            const safeTextForAttribute = skill.text
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

            card.innerHTML = `
                <div class="prompt-header-info">
                    <span class="date-added">${skill.dateAdded || 'N/A'}</span>
                </div>
                <div class="skill-card-content">
                    <h3 class="skill-card-title">
                        <i class="material-icons">psychology</i>
                        <span>${skill.title}</span>
                    </h3>
                    <p>${textWithHighlights}</p>
                </div>
                <div class="prompt-actions">
                    <button class="copy-prompt-btn" data-text="${safeTextForAttribute}" title="Copy Skill Instructions">
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                            <path d="M5.25 1.75C5.25 .784 6.034 0 7 0h7.25C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11H7c-.966 0-1.75-.784-1.75-1.75v-7.5Z"></path>
                        </svg>
                    </button>
                    <button class="delete-prompt-btn" data-id="${skill.id}" title="Delete Skill">
                        <svg class="octicon octicon-trash" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
                        </svg>
                    </button>
                </div>
            `;

            const contentDiv = card.querySelector('.skill-card-content');
            if (contentDiv) {
                contentDiv.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    enterEditModeSkill(card, skill.id, skill.title, skill.text);
                });
            }

            promptDisplay.appendChild(card);
        });
    }

    // ====== ADICIONAR NOVO ITEM (PROMPT OU SKILL) ======
    if (addPromptBtn) {
        addPromptBtn.addEventListener('click', () => {
            const selectedCategory = promptCategorySelect ? promptCategorySelect.value : '';
            const textContent = newPromptText.value.trim();

            if (currentSection === 'prompts') {
                if (!textContent || !selectedCategory) {
                    alert('Please enter a prompt and select a category.');
                    return;
                }

                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const newPrompt = {
                    id: Date.now(),
                    text: textContent,
                    category: selectedCategory,
                    dateAdded: formattedDate
                };

                prompts.push(newPrompt);
                savePrompts();
                newPromptText.value = '';
                newPromptText.style.height = 'auto';

                renderPromptCategoriesUI();
                renderItems();

            } else if (currentSection === 'skills') {
                const title = skillTitleInput ? skillTitleInput.value.trim() : '';

                if (!title) {
                    alert('Please enter a title for the skill.');
                    if (skillTitleInput) skillTitleInput.focus();
                    return;
                }

                if (!textContent || !selectedCategory) {
                    alert('Please enter skill instructions and select a category.');
                    return;
                }

                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const newSkill = {
                    id: Date.now(),
                    title: title,
                    text: textContent,
                    category: selectedCategory,
                    dateAdded: formattedDate
                };

                skills.push(newSkill);
                saveSkills();
                if (skillTitleInput) skillTitleInput.value = '';
                newPromptText.value = '';
                newPromptText.style.height = 'auto';

                renderSkillCategoriesUI();
                renderItems();
            }
        });
    }

    // ====== DELEGAÇÃO DE EVENTOS PARA COPY / DELETE ======
    if (promptDisplay) {
        promptDisplay.addEventListener('click', (event) => {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;

            // Deletar Item
            if (targetButton.classList.contains('delete-prompt-btn')) {
                const itemId = parseFloat(targetButton.dataset.id);
                if (currentSection === 'prompts') {
                    if (confirm('Tem certeza que deseja deletar este prompt?')) {
                        prompts = prompts.filter(p => p.id !== itemId);
                        savePrompts();
                        renderPromptCategoriesUI();
                        renderItems();
                    }
                } else {
                    if (confirm('Tem certeza que deseja deletar esta skill?')) {
                        skills = skills.filter(s => s.id !== itemId);
                        saveSkills();
                        renderSkillCategoriesUI();
                        renderItems();
                    }
                }

            // Copiar Item
            } else if (targetButton.classList.contains('copy-prompt-btn')) {
                const textToCopy = targetButton.dataset.text;
                navigator.clipboard.writeText(textToCopy);

                // Feedback visual sutil no botão
                const originalHtml = targetButton.innerHTML;
                targetButton.innerHTML = `<span style="font-size: 14px; font-weight: bold; color: #4CAF50;">✓</span>`;
                setTimeout(() => {
                    targetButton.innerHTML = originalHtml;
                }, 1200);
            }
        });
    }

    // ====== MODO DE EDIÇÃO INLINE: PROMPTS ======
    function enterEditModePrompt(card, promptId, currentText) {
        const pElement = card.querySelector('p');
        const actionsDiv = card.querySelector('.prompt-actions');
        const headerInfo = card.querySelector('.prompt-header-info');

        if (card.querySelector('.prompt-edit-textarea')) return;

        const textarea = document.createElement('textarea');
        textarea.value = currentText;
        textarea.classList.add('prompt-edit-textarea');
        textarea.rows = 5;

        const saveButton = document.createElement('button');
        saveButton.textContent = 'SAVE';
        saveButton.classList.add('md-button', 'save-edit-btn');

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.classList.add('md-button', 'cancel-edit-btn');

        const leftColumnWrapper = document.createElement('div');
        leftColumnWrapper.classList.add('edit-left-column');
        leftColumnWrapper.appendChild(saveButton);
        leftColumnWrapper.appendChild(cancelButton);

        const rightColumnWrapper = document.createElement('div');
        rightColumnWrapper.classList.add('edit-right-column');
        if (headerInfo) rightColumnWrapper.appendChild(headerInfo);
        rightColumnWrapper.appendChild(textarea);

        if (actionsDiv) actionsDiv.style.display = 'none';
        pElement.remove();

        card.prepend(rightColumnWrapper);
        card.prepend(leftColumnWrapper);

        textarea.focus();

        saveButton.addEventListener('click', () => {
            const newText = textarea.value.trim();
            if (newText) {
                const promptIndex = prompts.findIndex(p => p.id == promptId);
                if (promptIndex !== -1) {
                    prompts[promptIndex].text = newText;
                    savePrompts();
                    renderItems();
                }
            } else {
                alert('Prompt text cannot be empty.');
            }
        });

        cancelButton.addEventListener('click', () => {
            renderItems();
        });
    }

    // ====== MODO DE EDIÇÃO INLINE: SKILLS ======
    function enterEditModeSkill(card, skillId, currentTitle, currentText) {
        const contentDiv = card.querySelector('.skill-card-content');
        const actionsDiv = card.querySelector('.prompt-actions');
        const headerInfo = card.querySelector('.prompt-header-info');

        if (card.querySelector('.prompt-edit-textarea')) return;

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = currentTitle;
        titleInput.classList.add('skill-edit-title-input');
        titleInput.placeholder = 'Skill Title';

        const textarea = document.createElement('textarea');
        textarea.value = currentText;
        textarea.classList.add('prompt-edit-textarea');
        textarea.rows = 5;

        const saveButton = document.createElement('button');
        saveButton.textContent = 'SAVE';
        saveButton.classList.add('md-button', 'save-edit-btn');

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.classList.add('md-button', 'cancel-edit-btn');

        const leftColumnWrapper = document.createElement('div');
        leftColumnWrapper.classList.add('edit-left-column');
        leftColumnWrapper.appendChild(saveButton);
        leftColumnWrapper.appendChild(cancelButton);

        const rightColumnWrapper = document.createElement('div');
        rightColumnWrapper.classList.add('edit-right-column');
        if (headerInfo) rightColumnWrapper.appendChild(headerInfo);
        rightColumnWrapper.appendChild(titleInput);
        rightColumnWrapper.appendChild(textarea);

        if (actionsDiv) actionsDiv.style.display = 'none';
        contentDiv.remove();

        card.prepend(rightColumnWrapper);
        card.prepend(leftColumnWrapper);

        titleInput.focus();

        saveButton.addEventListener('click', () => {
            const newTitle = titleInput.value.trim();
            const newText = textarea.value.trim();

            if (!newTitle) {
                alert('Skill title cannot be empty.');
                titleInput.focus();
                return;
            }

            if (!newText) {
                alert('Skill instructions cannot be empty.');
                textarea.focus();
                return;
            }

            const skillIndex = skills.findIndex(s => s.id == skillId);
            if (skillIndex !== -1) {
                skills[skillIndex].title = newTitle;
                skills[skillIndex].text = newText;
                saveSkills();
                renderItems();
            }
        });

        cancelButton.addEventListener('click', () => {
            renderItems();
        });
    }

    // ====== DRAG & DROP PARA CATEGORIAS ======
    let draggedItem = null;
    function makeCategoriesDraggable(listElement, categoriesArray, onOrderChanged) {
        const items = listElement.querySelectorAll('li');
        items.forEach(item => {
            item.draggable = true;
            item.addEventListener('dragstart', () => {
                draggedItem = item;
                setTimeout(() => item.classList.add('dragging'), 0);
            });
            item.addEventListener('dragend', () => {
                setTimeout(() => {
                    if (draggedItem) draggedItem.classList.remove('dragging');
                    draggedItem = null;
                    if (onOrderChanged) onOrderChanged();
                }, 0);
            });
            item.addEventListener('dragover', e => {
                e.preventDefault();
                item.classList.add('drag-over');
            });
            item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
            item.addEventListener('drop', e => {
                e.preventDefault();
                if (draggedItem && draggedItem !== item && draggedItem.parentElement === listElement) {
                    const all = [...listElement.querySelectorAll('li')];
                    const from = all.indexOf(draggedItem);
                    const to = all.indexOf(item);
                    const [moved] = categoriesArray.splice(from, 1);
                    categoriesArray.splice(to, 0, moved);
                    if (onOrderChanged) onOrderChanged();
                    renderPromptCategoriesUI();
                    renderSkillCategoriesUI();
                }
                item.classList.remove('drag-over');
            });
        });
    }

    // ====== DOWNLOAD / EXPORT DATA ======
    function downloadData() {
        if (prompts.length === 0 && skills.length === 0) {
            alert('Nenhum dado para exportar.');
            return;
        }

        const exportData = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            promptCategories: promptCategories,
            prompts: prompts,
            skillCategories: skillCategories,
            skills: skills
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'prompt_and_skill_organizer_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ====== UPLOAD / IMPORT DATA ======
    function handleUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const uploadedData = JSON.parse(e.target.result);

                // Caso 1: Versão 2.0 (Objeto com prompts e skills)
                if (uploadedData && typeof uploadedData === 'object' && !Array.isArray(uploadedData)) {
                    if (Array.isArray(uploadedData.promptCategories)) {
                        uploadedData.promptCategories.forEach(cat => {
                            const catObj = typeof cat === 'string' ? { name: cat, color: DEFAULT_COLORS[0] } : cat;
                            if (!promptCategories.some(c => c.name.toLowerCase() === catObj.name.toLowerCase())) {
                                promptCategories.push(catObj);
                            }
                        });
                    }

                    if (Array.isArray(uploadedData.prompts)) {
                        const newPrompts = uploadedData.prompts.map(p => ({
                            id: Date.now() + Math.random(),
                            text: p.text,
                            category: p.category,
                            dateAdded: p.dateAdded || new Date().toLocaleDateString('pt-BR')
                        }));
                        prompts.push(...newPrompts);

                        // Garante que todas as categorias dos prompts existam
                        newPrompts.forEach(p => {
                            if (!promptCategories.some(c => c.name.toLowerCase() === p.category.toLowerCase())) {
                                promptCategories.push({ name: p.category, color: DEFAULT_COLORS[promptCategories.length % DEFAULT_COLORS.length] });
                            }
                        });
                    }

                    if (Array.isArray(uploadedData.skillCategories)) {
                        uploadedData.skillCategories.forEach(cat => {
                            const catObj = typeof cat === 'string' ? { name: cat, color: DEFAULT_COLORS[1] } : cat;
                            if (!skillCategories.some(c => c.name.toLowerCase() === catObj.name.toLowerCase())) {
                                skillCategories.push(catObj);
                            }
                        });
                    }

                    if (Array.isArray(uploadedData.skills)) {
                        const newSkills = uploadedData.skills.map(s => ({
                            id: Date.now() + Math.random(),
                            title: s.title || 'Untitled Skill',
                            text: s.text,
                            category: s.category,
                            dateAdded: s.dateAdded || new Date().toLocaleDateString('pt-BR')
                        }));
                        skills.push(...newSkills);

                        // Garante que todas as categorias das skills existam
                        newSkills.forEach(s => {
                            if (!skillCategories.some(c => c.name.toLowerCase() === s.category.toLowerCase())) {
                                skillCategories.push({ name: s.category, color: DEFAULT_COLORS[skillCategories.length % DEFAULT_COLORS.length] });
                            }
                        });
                    }

                    saveAll();
                    switchSection(currentSection);
                    alert('Dados importados com sucesso!');
                    return;
                }

                // Caso 2: Formato Legado (Array de Prompts)
                if (Array.isArray(uploadedData) && uploadedData.some(p => p.text && p.category)) {
                    const newPrompts = uploadedData.map(p => ({
                        id: Date.now() + Math.random(),
                        text: p.text,
                        category: p.category,
                        dateAdded: p.dateAdded || new Date().toLocaleDateString('pt-BR')
                    }));

                    newPrompts.forEach(p => {
                        if (!promptCategories.some(c => c.name.toLowerCase() === p.category.toLowerCase())) {
                            promptCategories.push({ name: p.category, color: DEFAULT_COLORS[promptCategories.length % DEFAULT_COLORS.length] });
                        }
                    });

                    prompts.push(...newPrompts);
                    savePromptCategories();
                    savePrompts();
                    switchSection('prompts');
                    alert('Prompts legados importados com sucesso!');
                    return;
                }

                alert('Arquivo JSON com formato inválido ou não reconhecido.');
            } catch (err) {
                console.error('Erro ao processar arquivo:', err);
                alert('Erro ao processar o arquivo JSON.');
            }
        };
        reader.readAsText(file);
    }

    if (downloadDataBtn) {
        downloadDataBtn.addEventListener('click', downloadData);
    }
    if (uploadDataBtn && uploadFileInput) {
        uploadDataBtn.addEventListener('click', () => uploadFileInput.click());
    }
    if (uploadFileInput) {
        uploadFileInput.addEventListener('change', handleUpload);
    }

    // ====== PESQUISA ======
    if (searchInput) {
        searchInput.addEventListener('input', renderItems);
    }

    // ====== AUTO-RESIZE DO TEXTAREA ======
    function autoResize() {
        if (!newPromptText) return;
        newPromptText.style.height = 'auto';
        const max = 400;
        const newH = Math.min(newPromptText.scrollHeight, max);
        newPromptText.style.height = newH + 'px';
    }

    if (newPromptText) {
        newPromptText.addEventListener('input', autoResize);
        const textareaWrapper = newPromptText.parentElement;
        const resizeHandle = textareaWrapper ? textareaWrapper.querySelector('.resize-handle') : null;
        let isResizing = false;
        let startY, startHeight;

        if (resizeHandle) {
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

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });

        setTimeout(autoResize, 100);
    }

    // ====== INICIALIZAÇÃO DA APLICAÇÃO ======
    function initApp() {
        console.log('Iniciando Prompt & Skill Organizer...');
        switchSection('prompts');
    }

    initApp();

    // Debugging global
    window.appDebug = {
        promptCategories: () => promptCategories,
        prompts: () => prompts,
        skillCategories: () => skillCategories,
        skills: () => skills,
        currentSection: () => currentSection,
        switchSection,
        renderItems
    };
});
