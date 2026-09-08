/* Website enquiries: no customer data is sent until the company form is configured. */
(function () {
  'use strict';
  const text = {
    en: {
      send: 'Send Enquiry →', sending: 'Sending enquiry…',
      unavailable: 'Online enquiries are not available yet. Please call or WhatsApp us using the links below. Your details have been kept here.',
      required: 'Please enter your name, phone number and project location, and select an enquiry type.',
      phone: 'Please enter a valid Egyptian mobile number, for example 01229688688.',
      plan: 'Please select a maintenance assessment or a maintenance plan.',
      rejected: 'We could not accept this enquiry. Please check your details and try again, or call or WhatsApp us. Your details have been kept here.',
      limited: 'Online enquiries are temporarily unavailable. Please call or WhatsApp us. Your details have been kept here.',
      uncertain: 'We could not confirm receipt. Your enquiry may have arrived. Please call or WhatsApp us before sending it again. Your details have been kept here.',
      success: 'Your enquiry has been received. Our team will contact you using the details you provided.',
      salesHint: 'Share your application, required capacity (if known), and preferred timing. We can help with sizing.',
      maintenanceHint: 'Share your generator brand, capacity, running hours or current issue, if known.'
    },
    ar: {
      send: 'إرسال الاستفسار ←', sending: 'جارٍ إرسال الاستفسار…',
      unavailable: 'استقبال الاستفسارات عبر الموقع غير متاح حالياً. يرجى الاتصال بنا أو مراسلتنا عبر واتساب باستخدام الروابط أدناه. احتفظنا بالبيانات التي أدخلتها هنا.',
      required: 'يرجى إدخال الاسم ورقم الهاتف وموقع المشروع واختيار نوع الاستفسار.',
      phone: 'يرجى إدخال رقم محمول مصري صحيح، مثل 01229688688.',
      plan: 'يرجى اختيار تقييم الصيانة أو إحدى خطط الصيانة.',
      rejected: 'تعذّر قبول الاستفسار. يرجى مراجعة البيانات والمحاولة مرة أخرى، أو الاتصال بنا أو مراسلتنا عبر واتساب. احتفظنا بالبيانات هنا.',
      limited: 'استقبال الاستفسارات عبر الموقع غير متاح مؤقتاً. يرجى الاتصال بنا أو مراسلتنا عبر واتساب. احتفظنا بالبيانات هنا.',
      uncertain: 'لم نتمكن من تأكيد استلام الاستفسار، وربما وصل بالفعل. يرجى الاتصال بنا أو مراسلتنا عبر واتساب قبل إرساله مرة أخرى. احتفظنا بالبيانات هنا.',
      success: 'تم استلام استفسارك. سيتواصل معك فريقنا باستخدام البيانات التي قدمتها.',
      salesHint: 'اذكر طبيعة الاستخدام والقدرة المطلوبة إن كانت معروفة والموعد المناسب. يمكننا مساعدتك في تحديد القدرة.',
      maintenanceHint: 'اذكر ماركة المولد وقدرته وساعات التشغيل أو المشكلة الحالية، إن كانت معروفة.'
    }
  };
  let pending = false;
  let statusKey = '';
  let statusKind = '';
  const byId = id => document.getElementById(id);
  const language = () => document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const normalizeDigits = value => value.replace(/[٠-٩۰-۹]/g, char => String(char.charCodeAt(0) - (char >= '۰' ? 1776 : 1632)));
  const normalizedPhone = value => normalizeDigits(value).replace(/[\s\-()]/g, '');

  function showStatus(key, kind) {
    statusKey = key;
    statusKind = kind || '';
    const status = byId('form-status');
    if (!status) return;
    status.hidden = !key;
    status.textContent = key ? text[language()][key] : '';
    status.classList.remove('success', 'error', 'uncertain');
    if (kind) status.classList.add(kind);
    status.setAttribute('role', kind === 'error' || kind === 'uncertain' ? 'alert' : 'status');
    status.setAttribute('aria-live', kind === 'error' || kind === 'uncertain' ? 'assertive' : 'polite');
  }

  function refreshLanguage() {
    const button = byId('f-submit');
    if (button) button.textContent = text[language()][pending ? 'sending' : 'send'];
    const message = byId('f-msg');
    if (message) message.setAttribute('placeholder', text[language()][byId('f-type').value === 'maintenance' ? 'maintenanceHint' : 'salesHint']);
    if (statusKey) showStatus(statusKey, statusKind);
  }

  function updatePlan() {
    const maintenance = byId('f-type').value === 'maintenance';
    const plan = byId('f-plan');
    plan.disabled = !maintenance;
    plan.required = maintenance;
    plan.setAttribute('aria-required', String(maintenance));
    byId('plan-group').hidden = !maintenance;
    refreshLanguage();
  }

  function setPath(type, plan) {
    if (pending) return false;
    if (type !== 'sales' && type !== 'maintenance') return false;
    const form = byId('contact-form');
    byId('f-type').value = type;
    if (type === 'maintenance') {
      byId('f-plan').value = ['assessment', 'standard', 'premium'].includes(plan) ? plan : 'assessment';
    }
    delete form.dataset.brand;
    delete form.dataset.capacity;
    updatePlan();
    showStatus('', '');
    return true;
  }

  function open(type, plan) {
    if (!setPath(type, plan)) return false;
    const contact = byId('contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth' });
    byId('f-name').focus({ preventScroll: true });
    return true;
  }

  function validate(form) {
    const fields = ['f-name', 'f-phone', 'f-location', 'f-type'];
    for (const id of fields) byId(id).removeAttribute('aria-invalid');
    byId('f-plan').removeAttribute('aria-invalid');
    const empty = fields.find(id => !byId(id).value.trim());
    const type = byId('f-type').value;
    if (empty || !['sales', 'maintenance'].includes(type)) {
      const field = byId(empty || 'f-type');
      field.setAttribute('aria-invalid', 'true'); field.focus();
      showStatus('required', 'error'); return null;
    }
    const phone = normalizedPhone(byId('f-phone').value.trim());
    if (!/^(?:(?:\+|00)?20|0)?1[0125][0-9]{8}$/.test(phone)) {
      byId('f-phone').setAttribute('aria-invalid', 'true'); byId('f-phone').focus();
      showStatus('phone', 'error'); return null;
    }
    const plan = byId('f-plan').value;
    if (type === 'maintenance' && !['assessment', 'standard', 'premium'].includes(plan)) {
      byId('f-plan').setAttribute('aria-invalid', 'true'); byId('f-plan').focus();
      showStatus('plan', 'error'); return null;
    }
    const payload = {
      name: byId('f-name').value.trim(), phone,
      location: byId('f-location').value.trim(), enquiry_type: type,
      message: byId('f-msg').value.trim(), language: language()
    };
    if (type === 'maintenance') payload.maintenance_plan = plan;
    if (type === 'sales') {
      if (form.dataset.brand) payload.brand = form.dataset.brand;
      const capacity = Number(form.dataset.capacity);
      if (Number.isFinite(capacity) && capacity > 0) payload.capacity = capacity;
    }
    return payload;
  }

  async function submit(form) {
    if (pending) return false;
    const payload = validate(form);
    if (!payload) return false;
    const endpoint = typeof window.PREMIUM_POWER_FORM_ENDPOINT === 'string' ? window.PREMIUM_POWER_FORM_ENDPOINT.trim() : '';
    if (!/^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint)) {
      showStatus('unavailable', 'error'); return false;
    }
    pending = true;
    const controls = Array.from(form.querySelectorAll('input, select, textarea, button'));
    const previous = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    showStatus('sending', ''); refreshLanguage();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal, credentials: 'omit', redirect: 'error'
      });
      if (!response.ok) {
        showStatus(response.status === 429 ? 'limited' : response.status >= 500 ? 'uncertain' : 'rejected', response.status >= 500 ? 'uncertain' : 'error');
        return false;
      }
      const acknowledgement = await response.json();
      // Formspree's official client identifies successful receipts by a `next` string.
      // Keep visitors on this page; never navigate to a URL supplied in a response.
      if (acknowledgement && (typeof acknowledgement.error === 'string' || Array.isArray(acknowledgement.errors))) {
        showStatus('rejected', 'error'); return false;
      }
      if (!acknowledgement || typeof acknowledgement.next !== 'string') {
        showStatus('uncertain', 'uncertain'); return false;
      }
      form.reset();
      byId('f-type').value = payload.enquiry_type;
      if (payload.maintenance_plan) byId('f-plan').value = payload.maintenance_plan;
      delete form.dataset.brand;
      delete form.dataset.capacity;
      showStatus('success', 'success');
      return true;
    } catch (error) {
      // A lost response may follow an accepted request. Do not encourage blind retries.
      showStatus('uncertain', 'uncertain');
      return false;
    } finally {
      clearTimeout(timeout);
      pending = false;
      controls.forEach((control, index) => { control.disabled = previous[index]; });
      form.removeAttribute('aria-busy');
      updatePlan();
    }
  }

  function submitForm(event) {
    event.preventDefault();
    return submit(event.currentTarget || byId('contact-form'));
  }

  function init() {
    if (!byId('contact-form')) return;
    byId('f-type').addEventListener('change', () => setPath(byId('f-type').value));
    updatePlan();
  }
  window.PremiumPowerEnquiry = { submit, submitForm, open, setPath, refreshLanguage };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
