export function initContactForms() {
  const forms = document.querySelectorAll<HTMLFormElement>('.js-contact-form');

  forms.forEach((form) => {
    const feedback = form.querySelector<HTMLDivElement>('.js-contact-feedback');
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    if (!feedback || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear styling and hide feedback
      feedback.classList.add('hidden');
      feedback.className = 'js-contact-feedback p-xs rounded font-body-md text-center my-xs transition-all duration-200';
      
      // Disable submit button & show loading state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.innerHTML = 'Enviando...';

      // Clear previous validation styling
      form.querySelectorAll('input, textarea').forEach(el => {
        el.classList.remove('border-rose-500', 'ring-rose-500');
      });
      form.querySelectorAll('.field-error').forEach(el => el.remove());

      // Collect data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          // Success!
          feedback.innerText = result.message || 'Solicitud enviada exitosamente. Nos contactaremos pronto.';
          feedback.classList.add('bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-200');
          feedback.classList.remove('hidden');
          form.reset();
        } else {
          // Error response
          feedback.innerText = result.error || 'Ocurrió un error al enviar el formulario.';
          feedback.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-200');
          feedback.classList.remove('hidden');

          // Highlight specific Zod field errors
          if (result.fields) {
            Object.entries(result.fields).forEach(([fieldName, message]) => {
              const inputEl = form.querySelector(`[name="${fieldName}"]`);
              if (inputEl) {
                inputEl.classList.add('border-rose-500', 'ring-rose-500');
                
                const errMsg = document.createElement('span');
                errMsg.className = 'field-error text-xs text-rose-600 mt-1 block';
                errMsg.innerText = message as string;
                inputEl.parentElement?.appendChild(errMsg);
              }
            });
          }
        }
      } catch (error) {
        console.error(error);
        feedback.innerText = 'Error de red. Por favor verifica tu conexión a internet e inténtalo de nuevo.';
        feedback.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-200');
        feedback.classList.remove('hidden');
      } finally {
        // Restore button state
        submitBtn.removeAttribute('disabled');
        submitBtn.innerHTML = originalBtnText;

        // Reset Turnstile Widget for this specific form (tokens are single-use)
        if (typeof (window as any).turnstile !== 'undefined') {
          const turnstileEl = form.querySelector('.cf-turnstile');
          if (turnstileEl) {
            (window as any).turnstile.reset(turnstileEl);
          }
        }
      }
    });
  });
}

// Execute on script load (Astro will bundle and run this on the client)
initContactForms();
