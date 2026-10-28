(function () {
  "use strict";
  const form = document.getElementById("contact-form");
  const enquiry = window.PremiumPowerEnquiry;
  if (!form || !enquiry) return;
  document.querySelectorAll("[data-service-purpose]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      if (!enquiry.open("maintenance", "assessment")) return;
      const purpose = document.getElementById("f-maintenance-purpose");
      if (purpose && ["contract", "service"].includes(link.dataset.servicePurpose)) {
        purpose.value = link.dataset.servicePurpose;
        purpose.dispatchEvent(new Event("change", {bubbles: true}));
        const details = document.getElementById("enquiry-details");
        if (details) details.open = true;
      }
    });
  });
})();