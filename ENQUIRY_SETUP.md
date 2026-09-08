# Website enquiry inbox

The English and Arabic enquiry forms use the owner-supplied public Formspree endpoint https://formspree.io/f/mzebjqno. GitHub Pages serves the website; Formspree stores submitted enquiries and runs the email notification action.

## Configuration verified on 8 September 2026

- Form name: Premium Power Website Enquiries.
- Form Enabled and Submission Archive are enabled.
- The email action is enabled; its configured target was info@premiumpower-eg.com when checked.
- Customer email is optional, preserving the phone-based enquiry form.
- Formshield spam filtering is enabled. CAPTCHA was already disabled in the account; its settings were not changed.
- Both language pages load /enquiry-config.js?v=20260908-1 to avoid a cached empty configuration.

## Submission and notification checks

Two clearly labelled technical tests from the local preview were accepted and stored:

- PP-20260908-sales: English sales enquiry, with sales / en and the entered contact details.
- PP-20260908-maintenance: Arabic maintenance enquiry, with maintenance / ar / premium. Formspree initially classified this test as spam. It was marked Not Spam, with general spam protection kept enabled.

Both pages showed confirmation only after the receiver acknowledged the submission. Submitted fields cleared, with the selected enquiry path and maintenance plan preserved. These tests used the company's published phone number and explicitly requested no follow-up; no customer data was used.

The owner confirmed receipt of the Arabic maintenance notification in the mailbox spam folder. Receipt of the English sales notification remains unconfirmed. A saved submission confirms receipt by Formspree, not delivery to the recipient's email inbox. The owner requested publication with this email-delivery limitation known.

## Operation

Check the Formspree Inbox and Spam tab regularly so filtered legitimate enquiries are not missed. Use stored submissions as the source of truth if email is delayed. Monitor the account's submission quota and retention limits.

For an expected notification in mailbox spam, mark it Not Spam and add noreply@formspree.io as a trusted sender where supported. If notifications remain missing, verify the workflow recipient and any mailbox forwarding or quarantine, using Formspree's troubleshooting guidance. Website code cannot guarantee mailbox inbox placement.

After publication, verify the English and Arabic live pages, enquiry paths, and availability of the configuration and submission scripts. Any additional submission tests should be clearly labelled and checked in both Formspree and the recipient mailbox.

Recheck domain restrictions and spam protection for the live domain. Do not disable spam filtering merely to make a test pass. If interactive CAPTCHA is enabled later, implement and test its challenge in the website first.

When changing the public endpoint, also change the configuration script version in index.html and regenerate ar/index.html. Never store an account password or secret API key in enquiry-config.js.

## Local verification

- node --test tests/enquiry.test.cjs: 12 passing tests covering acknowledgement and errors, validation, Arabic digits, routing, timeout and duplicate-submit protection.
- node --check enquiry.js and enquiry-config.js; inline script syntax in both language pages; git diff --check.
- Arabic output regenerated with python build-ar.py using the project's Playwright/Chromium environment.
- Desktop and 390-pixel mobile enquiry paths checked in both languages.

## Official references

- https://github.com/formspree/formspree-js/blob/main/packages/formspree-core/src/submission.ts
- https://help.formspree.io/articles/troubleshooting/how-to-prevent-spam/
- https://help.formspree.io/articles/troubleshooting/i-m-not-receiving-emails
