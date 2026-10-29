/* Website enquiries: no customer data is sent until the company form is configured. */
(function () {
  'use strict';
  const text = {
    en: {
      send: 'Send Enquiry →', sending: 'Sending enquiry…',
      unavailable: 'Online enquiries are not available yet. Please call or WhatsApp us using the links below. Your details have been kept here.',
      required: 'Please enter your name, phone number and project location, and select an enquiry type.',
      phone: 'Please enter a valid Egyptian mobile number, for example 01229 688 688.',
      plan: 'Please select a maintenance assessment or a maintenance plan.',
      rejected: 'We could not accept this enquiry. Please check your details and try again, or call or WhatsApp us. Your details have been kept here.',
      limited: 'Online enquiries are temporarily unavailable. Please call or WhatsApp us. Your details have been kept here.',
      uncertain: 'We could not confirm receipt. Your enquiry may have arrived. Please call or WhatsApp us before sending it again. Your details have been kept here.',
      success: 'Your enquiry has been received. Our team will contact you using the details you provided.',
      salesHint: 'Share your application, required capacity (if known), and preferred timing. We can help with sizing.',
      maintenanceHint: 'Share your generator brand, capacity, running hours or current issue, if known.',
      optionalCapacity: 'Enter a positive capacity or leave it blank.', optionalCount: 'Enter a positive whole number of generators or leave it blank.',
      optionalSummary: 'Add optional details', salesHeading: 'Generator request details',
      application: 'Application or intended use', capacity: 'Required capacity (kVA)',
      capacityUnknown: 'I do not know the capacity yet', capacityHelp: 'Leave the capacity blank if you are unsure.',
      timing: 'Preferred timing', timingPlaceholder: 'For example, a planned project date or timeframe',
      maintenanceHeading: 'Maintenance request details', purpose: 'Request purpose',
      choosePurpose: 'Select if known', purposeContract: 'Maintenance contract',
      purposeService: 'Service for an existing generator', generatorCount: 'Number of generators',
      countHelp: 'Leave blank if you do not know the count.', makeModel: 'Generator make and model',
      currentIssue: 'Current issue, if any',
    },
    ar: {
      send: 'إرسال الاستفسار ←', sending: 'جارٍ إرسال الاستفسار…',
      unavailable: 'استقبال الاستفسارات عبر الموقع غير متاح حالياً. يرجى الاتصال بنا أو مراسلتنا عبر واتساب باستخدام الروابط أدناه. احتفظنا بالبيانات التي أدخلتها هنا.',
      required: 'يرجى إدخال الاسم ورقم الهاتف وموقع المشروع واختيار نوع الاستفسار.',
      phone: 'يرجى إدخال رقم محمول مصري صحيح، مثل \u206601229 688 688\u2069.',
      plan: 'يرجى اختيار تقييم الصيانة أو إحدى خطط الصيانة.',
      rejected: 'تعذّر قبول الاستفسار. يرجى مراجعة البيانات والمحاولة مرة أخرى، أو الاتصال بنا أو مراسلتنا عبر واتساب. احتفظنا بالبيانات هنا.',
      limited: 'استقبال الاستفسارات عبر الموقع غير متاح مؤقتاً. يرجى الاتصال بنا أو مراسلتنا عبر واتساب. احتفظنا بالبيانات هنا.',
      uncertain: 'لم نتمكن من تأكيد استلام الاستفسار، وربما وصل بالفعل. يرجى الاتصال بنا أو مراسلتنا عبر واتساب قبل إرساله مرة أخرى. احتفظنا بالبيانات هنا.',
      success: 'تم استلام استفسارك. سيتواصل معك فريقنا باستخدام البيانات التي قدمتها.',
      salesHint: 'اذكر طبيعة الاستخدام والقدرة المطلوبة إن كانت معروفة والموعد المناسب. يمكننا مساعدتك في تحديد القدرة.',
      maintenanceHint: 'اذكر ماركة المولد وقدرته وساعات التشغيل أو المشكلة الحالية، إن كانت معروفة.',
      optionalCapacity: 'أدخل قدرة أكبر من صفر أو اترك الخانة فارغة.', optionalCount: 'أدخل عددًا صحيحًا أكبر من صفر للمولدات أو اترك الخانة فارغة.',
      optionalSummary: 'إضافة تفاصيل اختيارية', salesHeading: 'تفاصيل طلب المولد',
      application: 'الاستخدام المطلوب للمولد', capacity: 'القدرة المطلوبة (ك.ف.أ)',
      capacityUnknown: 'لا أعرف القدرة المطلوبة بعد', capacityHelp: 'اترك خانة القدرة فارغة إذا لم تكن متأكدًا.',
      timing: 'الموعد المناسب', timingPlaceholder: 'مثل موعد المشروع أو الفترة المتوقعة',
      maintenanceHeading: 'تفاصيل طلب الصيانة', purpose: 'الغرض من الطلب',
      choosePurpose: 'اختر عند معرفة الغرض', purposeContract: 'عقد صيانة',
      purposeService: 'خدمة لمولد موجود', generatorCount: 'عدد المولدات',
      countHelp: 'اترك الخانة فارغة إذا لم تعرف العدد.', makeModel: 'ماركة المولد وموديله',
      currentIssue: 'المشكلة الحالية، إن وجدت',
    }
  };
  let pending = false;
  let formStarted = false;
  let statusKey = '';
  let statusKind = '';
  const byId = id => document.getElementById(id);
  const language = () => document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const normalizeDigits = value => value.replace(/[٠-٩۰-۹]/g, char => String(char.charCodeAt(0) - (char >= '۰' ? 1776 : 1632)));
  const normalizedPhone = value => normalizeDigits(value).replace(/[\s\-()]/g, '');

  function emitEnquiryEvent(stage, type = byId('f-type')?.value) {
    if (typeof document.dispatchEvent !== 'function' || typeof window.CustomEvent !== 'function') return;
    const detail = {
      stage,
      type: ['sales', 'maintenance'].includes(type) ? type : 'unknown',
      lang: language(),
    };
    document.dispatchEvent(new window.CustomEvent('premium-power:enquiry', { detail }));
  }

  function translatedNode(parent, tag, key, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.setAttribute('data-enquiry-copy', key);
    node.textContent = text[language()][key];
    parent.appendChild(node);
    return node;
  }

  function optionalField(parent, { id, name, key, type = 'text', full = false, placeholderKey = '' }) {
    const group = document.createElement('div');
    group.className = 'form-group' + (full ? ' optional-full' : '');
    const label = translatedNode(group, 'label', key, 'form-label');
    label.htmlFor = id;
    let control;
    if (type === 'textarea') control = document.createElement('textarea');
    else if (type === 'select') control = document.createElement('select');
    else control = document.createElement('input');
    control.id = id;
    control.name = name;
    control.className = 'form-input' + (type === 'select' ? ' form-select' : type === 'textarea' ? ' form-textarea' : '');
    control.setAttribute('aria-required', 'false');
    if (type === 'number') {
      control.type = 'number';
      control.min = id === 'f-maintenance-count' ? '1' : '0';
      control.step = id === 'f-maintenance-count' ? '1' : 'any';
      control.inputMode = id === 'f-maintenance-count' ? 'numeric' : 'decimal';
    } else if (type === 'text') {
      control.type = 'text';
    }
    if (placeholderKey) {
      control.setAttribute('data-enquiry-placeholder', placeholderKey);
      control.placeholder = text[language()][placeholderKey];
    }
    parent.appendChild(group);
    group.appendChild(control);
    return { group, control };
  }

  function bindOptionalDetails() {
    const form = byId('contact-form');
    if (!form || typeof document.createElement !== 'function' || typeof form.appendChild !== 'function' || byId('enquiry-details')) return;
    const details = document.createElement('details');
    details.id = 'enquiry-details';
    translatedNode(details, 'summary', 'optionalSummary');

    const sales = document.createElement('div');
    sales.id = 'sales-optional-details';
    sales.className = 'optional-fields';
    sales.setAttribute('role', 'group');
    sales.setAttribute('aria-labelledby', 'sales-optional-heading');
    const salesHeading = translatedNode(sales, 'p', 'salesHeading', 'optional-section-title');
    salesHeading.id = 'sales-optional-heading';
    const salesGrid = document.createElement('div');
    salesGrid.className = 'optional-fields-grid';
    sales.appendChild(salesGrid);
    const application = optionalField(salesGrid, { id: 'f-sales-application', name: 'application', key: 'application' });
    application.control.maxLength = 200;

    const capacity = optionalField(salesGrid, { id: 'f-sales-capacity', name: 'required_capacity_kva', key: 'capacity', type: 'number' });
    const capacityHelp = translatedNode(capacity.group, 'p', 'capacityHelp', 'optional-help');
    capacityHelp.id = 'f-sales-capacity-help';
    capacity.control.setAttribute('aria-describedby', capacityHelp.id);
    const unknownLabel = document.createElement('label');
    unknownLabel.className = 'optional-capacity-known optional-full';
    const unknown = document.createElement('input');
    unknown.id = 'f-sales-capacity-unknown';
    unknown.name = 'required_capacity_unknown';
    unknown.type = 'checkbox';
    unknown.checked = false;
    unknown.defaultChecked = false;
    unknownLabel.appendChild(unknown);
    const unknownText = translatedNode(unknownLabel, 'span', 'capacityUnknown');
    unknownLabel.htmlFor = unknown.id;
    salesGrid.appendChild(unknownLabel);

    const timing = optionalField(salesGrid, { id: 'f-sales-timing', name: 'preferred_timing', key: 'timing', full: true, placeholderKey: 'timingPlaceholder' });
    timing.control.maxLength = 100;

    const maintenance = document.createElement('div');
    maintenance.id = 'maintenance-optional-details';
    maintenance.className = 'optional-fields';
    maintenance.hidden = true;
    maintenance.setAttribute('role', 'group');
    maintenance.setAttribute('aria-labelledby', 'maintenance-optional-heading');
    const maintenanceHeading = translatedNode(maintenance, 'p', 'maintenanceHeading', 'optional-section-title');
    maintenanceHeading.id = 'maintenance-optional-heading';
    const maintenanceGrid = document.createElement('div');
    maintenanceGrid.className = 'optional-fields-grid';
    maintenance.appendChild(maintenanceGrid);

    const purpose = optionalField(maintenanceGrid, { id: 'f-maintenance-purpose', name: 'maintenance_purpose', key: 'purpose', type: 'select' });
    const purposeOptions = [
      ['', 'choosePurpose'],
      ['contract', 'purposeContract'],
      ['service', 'purposeService'],
    ];
    for (const [value, key] of purposeOptions) {
      const option = document.createElement('option');
      option.value = value;
      option.setAttribute('data-enquiry-copy', key);
      option.textContent = text[language()][key];
      purpose.control.appendChild(option);
    }

    const count = optionalField(maintenanceGrid, { id: 'f-maintenance-count', name: 'generator_count', key: 'generatorCount', type: 'number' });
    const countHelp = translatedNode(count.group, 'p', 'countHelp', 'optional-help');
    countHelp.id = 'f-maintenance-count-help';
    count.control.setAttribute('aria-describedby', countHelp.id);
    const makeModel = optionalField(maintenanceGrid, { id: 'f-maintenance-make-model', name: 'generator_make_model', key: 'makeModel', full: true });
    makeModel.control.maxLength = 120;
    const issue = optionalField(maintenanceGrid, { id: 'f-maintenance-issue', name: 'current_issue', key: 'currentIssue', type: 'textarea', full: true });
    issue.control.maxLength = 1000;
    issue.control.rows = 3;

    details.appendChild(sales);
    details.appendChild(maintenance);
    const messageGroup = byId('f-msg')?.parentElement;
    if (messageGroup && messageGroup.parentNode) messageGroup.parentNode.insertBefore(details, messageGroup.nextSibling);
    else form.appendChild(details);
    unknown.addEventListener('change', refreshOptionalFields);
    capacity.control.disabled = unknown.checked;
  }

  function refreshOptionalFields() {
    const sales = byId('sales-optional-details');
    const maintenance = byId('maintenance-optional-details');
    if (!sales || !maintenance || !byId('f-type')) return;
    const salesActive = byId('f-type').value === 'sales';
    const maintenanceActive = byId('f-type').value === 'maintenance';
    sales.hidden = !salesActive;
    maintenance.hidden = !maintenanceActive;
    const unknown = byId('f-sales-capacity-unknown');
    const capacity = byId('f-sales-capacity');
    sales.querySelectorAll('input, select, textarea').forEach(control => {
      control.disabled = pending || !salesActive || (control === capacity && unknown?.checked);
    });
    maintenance.querySelectorAll('input, select, textarea').forEach(control => {
      control.disabled = pending || !maintenanceActive;
    });
  }

  function refreshOptionalLanguage() {
    document.querySelectorAll('#enquiry-details [data-enquiry-copy]').forEach(node => {
      const key = node.getAttribute('data-enquiry-copy');
      if (key && text[language()][key]) node.textContent = text[language()][key];
    });
    document.querySelectorAll('#enquiry-details [data-enquiry-placeholder]').forEach(node => {
      const key = node.getAttribute('data-enquiry-placeholder');
      if (key && text[language()][key]) node.placeholder = text[language()][key];
    });
    refreshOptionalFields();
  }

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
    refreshProduct();
    refreshOptionalLanguage();
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

  function refreshProduct() {
    const context=byId('product-context');
    if (!context) return;
    const data=byId('contact-form').dataset;
    const parts=[data.brand, data.model, data.capacity ? data.capacity+' kVA'+(data.rating?' ('+data.rating+')':'') : ''].filter(Boolean);
    context.hidden=!parts.length;
    context.textContent=parts.length ? (language()==='ar'?'الاختيار: ':'Selected: ')+parts.join(' · ') : '';
  }

  function setProduct(product) {
    if(pending || byId('f-type').value!=='sales') return false;
    const data=byId('contact-form').dataset;
    for(const key of ['brand','model','capacity','rating']) delete data[key];
    if(['Perkins','Volvo Penta','Doosan'].includes(product.brand)) data.brand=product.brand;
    if(data.brand && /^G[0-9]+[A-Z]{2}$/.test(product.model||'')) data.model=product.model;
    const capacity=Number(product.capacity);
    if(Number.isFinite(capacity)&&capacity>0) data.capacity=String(capacity);
    if(['Prime','Standby'].includes(product.rating)) data.rating=product.rating;
    refreshProduct();
    return true;
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
    delete form.dataset.model;
    delete form.dataset.rating;
    refreshProduct();
    updatePlan();
    if(type==='sales' && document.body.dataset?.brand) setProduct({brand:document.body.dataset.brand});
    showStatus('', '');
    emitEnquiryEvent('path_change', type);
    return true;
  }

  function open(type, plan) {
    if (!setPath(type, plan)) return false;
    byId('f-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    for (const id of ['f-sales-capacity', 'f-maintenance-count']) byId(id)?.removeAttribute('aria-invalid');
    const optionalId = type === 'sales' ? 'f-sales-capacity' : 'f-maintenance-count';
    const optional = byId(optionalId);
    const entered = optional?.value.trim();
    const explicitlyUnknown = type === 'sales' && byId('f-sales-capacity-unknown')?.checked;
    if (optional && !explicitlyUnknown && (optional.validity?.badInput || (entered &&
        (!Number.isFinite(Number(entered)) || Number(entered) <= 0 ||
         (type === 'maintenance' && !Number.isSafeInteger(Number(entered))))))) {
      const details = byId('enquiry-details');
      if (details) details.open = true;
      optional.setAttribute('aria-invalid', 'true');
      optional.focus();
      showStatus(type === 'sales' ? 'optionalCapacity' : 'optionalCount', 'error');
      return null;
    }
    const payload = {
      name: byId('f-name').value.trim(), phone,
      location: byId('f-location').value.trim(), enquiry_type: type,
      message: byId('f-msg').value.trim(), language: language()
    };
    if (type === 'maintenance') payload.maintenance_plan = plan;
    if (type === 'sales') {
      if (form.dataset.brand) payload.brand = form.dataset.brand;
      if (form.dataset.model) payload.model = form.dataset.model;
      if (form.dataset.rating) payload.rating = form.dataset.rating;
      const capacity = Number(form.dataset.capacity);
      if (Number.isFinite(capacity) && capacity > 0) payload.capacity = capacity;
      const application = byId('f-sales-application')?.value.trim();
      const requiredCapacity = byId('f-sales-capacity')?.value.trim();
      const capacityUnknown = byId('f-sales-capacity-unknown')?.checked;
      const timing = byId('f-sales-timing')?.value.trim();
      if (application) payload.application = application;
      if (capacityUnknown) payload.required_capacity = 'unknown';
      else if (requiredCapacity && Number.isFinite(Number(requiredCapacity)) && Number(requiredCapacity) > 0) {
        payload.required_capacity_kva = Number(requiredCapacity);
      }
      if (timing) payload.preferred_timing = timing;
    }
    if (type === 'maintenance') {
      const purpose = byId('f-maintenance-purpose')?.value;
      const count = byId('f-maintenance-count')?.value.trim();
      const makeModel = byId('f-maintenance-make-model')?.value.trim();
      const issue = byId('f-maintenance-issue')?.value.trim();
      if (['contract', 'service'].includes(purpose)) payload.maintenance_purpose = purpose;
      if (count && Number.isInteger(Number(count)) && Number(count) > 0) payload.generator_count = Number(count);
      if (makeModel) payload.generator_make_model = makeModel;
      if (issue) payload.current_issue = issue;
    }
    return payload;
  }

  async function submit(form) {
    if (pending) return false;
    const payload = validate(form);
    if (!payload) {
      emitEnquiryEvent('error');
      return false;
    }
    emitEnquiryEvent('submit', payload.enquiry_type);
    const endpoint = typeof window.PREMIUM_POWER_FORM_ENDPOINT === 'string' ? window.PREMIUM_POWER_FORM_ENDPOINT.trim() : '';
    if (!/^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint)) {
      emitEnquiryEvent('error', payload.enquiry_type);
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
    let received = false;
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal, credentials: 'omit', redirect: 'error'
      });
      if (!response.ok) {
        emitEnquiryEvent('error', payload.enquiry_type);
        showStatus(response.status === 429 ? 'limited' : response.status >= 500 ? 'uncertain' : 'rejected', response.status >= 500 ? 'uncertain' : 'error');
        return false;
      }
      const acknowledgement = await response.json();
      // Formspree's official client identifies successful receipts by a `next` string.
      // Keep visitors on this page; never navigate to a URL supplied in a response.
      if (acknowledgement && (typeof acknowledgement.error === 'string' || Array.isArray(acknowledgement.errors))) {
        emitEnquiryEvent('error', payload.enquiry_type);
        showStatus('rejected', 'error'); return false;
      }
      if (!acknowledgement || typeof acknowledgement.next !== 'string') {
        emitEnquiryEvent('error', payload.enquiry_type);
        showStatus('uncertain', 'uncertain'); return false;
      }
      form.reset();
      if (byId('enquiry-details')) byId('enquiry-details').open = false;
      byId('f-type').value = payload.enquiry_type;
      if (payload.maintenance_plan) byId('f-plan').value = payload.maintenance_plan;
      delete form.dataset.brand;
      delete form.dataset.capacity;
      delete form.dataset.model;
      delete form.dataset.rating;
      refreshProduct();
      emitEnquiryEvent('receipt', payload.enquiry_type);
      received=true;
      formStarted = false;
      showStatus('success', 'success');
      return true;
    } catch (error) {
      // A lost response may follow an accepted request. Do not encourage blind retries.
      emitEnquiryEvent('error', payload.enquiry_type);
      showStatus('uncertain', 'uncertain');
      return false;
    } finally {
      clearTimeout(timeout);
      pending = false;
      controls.forEach((control, index) => { control.disabled = previous[index]; });
      form.removeAttribute('aria-busy');
      updatePlan();
      if(received && payload.enquiry_type==='sales' && document.body.dataset?.brand) setProduct({brand:document.body.dataset.brand});
    }
  }

  function submitForm(event) {
    event.preventDefault();
    return submit(event.currentTarget || byId('contact-form'));
  }

  function init() {
    if (!byId('contact-form')) return;
    bindOptionalDetails();
    const form = byId('contact-form');
    form.addEventListener('focusin', () => {
      if (!formStarted) {
        formStarted = true;
        emitEnquiryEvent('form_start');
      }
    });
    byId('f-type').addEventListener('change', () => setPath(byId('f-type').value));
    updatePlan();
  }
  window.PremiumPowerEnquiry = { submit, submitForm, open, setPath, setProduct, refreshLanguage };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
