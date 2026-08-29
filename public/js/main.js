(() => {
    const menuButton = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.navbar-menu');
    if (menuButton && menu) {
        menuButton.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        });
    }

    document.querySelectorAll('[data-copy-target]').forEach((button) => {
        button.addEventListener('click', async () => {
            const target = document.querySelector(button.dataset.copyTarget);
            if (!target) return;
            await navigator.clipboard.writeText(target.textContent.trim());
            const original = button.textContent;
            button.textContent = 'Copié';
            window.setTimeout(() => { button.textContent = original; }, 1400);
        });
    });

    const photoInput = document.querySelector('input[name="photo"]');
    const preview = document.querySelector('#photo-preview');
    if (photoInput && preview) {
        photoInput.addEventListener('change', () => {
            const file = photoInput.files?.[0];
            if (!file) { preview.hidden = true; return; }
            preview.src = URL.createObjectURL(file);
            preview.hidden = false;
        });
    }

    document.querySelectorAll('form[data-confirm]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            if (!window.confirm(form.dataset.confirm)) event.preventDefault();
        });
    });

    const form = document.querySelector('.item-form[data-wizard="true"]');
    if (!form || form.dataset.edit === 'true') return;

    const fields = [...form.querySelectorAll('.form-group')];
    const steps = [fields.slice(0, 3), fields.slice(3, 6), fields.slice(6)];
    const progress = document.createElement('div');
    progress.className = 'form-progress';
    progress.setAttribute('aria-label', 'Progression du formulaire');
    progress.innerHTML = '<span class="progress-step active">1</span><i></i><span class="progress-step">2</span><i></i><span class="progress-step">3</span>';
    form.prepend(progress);

    const navigation = document.createElement('div');
    navigation.className = 'step-actions';
    navigation.innerHTML = '<button type="button" class="btn btn-secondary step-back" hidden>Retour</button><button type="button" class="btn btn-primary step-next">Continuer</button>';
    form.querySelector('.form-actions').before(navigation);
    let current = 0;

    const showStep = (step) => {
        fields.forEach((field) => { field.hidden = true; });
        steps[step].forEach((field) => { field.hidden = false; });
        progress.querySelectorAll('.progress-step').forEach((node, index) => node.classList.toggle('active', index <= step));
        navigation.querySelector('.step-back').hidden = step === 0;
        navigation.querySelector('.step-next').hidden = step === steps.length - 1;
        form.querySelector('.form-actions').hidden = step !== steps.length - 1;
    };

    navigation.querySelector('.step-next').addEventListener('click', () => {
        const requiredFields = steps[current].flatMap((field) => [...field.querySelectorAll('[required]')]);
        if (!requiredFields.every((field) => field.reportValidity())) return;
        current += 1;
        showStep(current);
    });
    navigation.querySelector('.step-back').addEventListener('click', () => { current -= 1; showStep(current); });
    showStep(current);
})();
