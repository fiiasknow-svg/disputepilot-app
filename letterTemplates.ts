export type LetterTemplate = {
  id: string;
  category: string;
  title: string;
  description: string;
  body: string;
};

const baseLetterBody = (title: string, purpose: string) => `
{{client_name}}
{{client_address}}
{{client_city}}, {{client_state}} {{client_zip}}

{{date}}

{{recipient_name}}
{{recipient_address}}
{{recipient_city}}, {{recipient_state}} {{recipient_zip}}

Re: ${title}

To Whom It May Concern,

I am writing regarding the information appearing in my consumer report/account records. I am requesting that the item listed below be reviewed for accuracy, completeness, and verifiability.

Consumer Name: {{client_name}}
Account/Furnisher: {{account_name}}
Account Number: {{account_number}}
Dispute Reason: {{dispute_reason}}

${purpose}

Please conduct a reasonable investigation and provide the results of your investigation in writing. If the information cannot be verified as accurate and complete, please update or delete the item as required by applicable law.

Please also provide a description of the procedure used to verify the information, including the name, address, and telephone number of each person or business contacted during the investigation.

Sincerely,

{{client_name}}
`;

export const letterTemplates: LetterTemplate[] = [
  {
    id: "personal-information-letter",
    category: "Dispute Flow Letters",
    title: "Personal Information Letter",
    description: "Request correction or removal of inaccurate personal identifying information.",
    body: baseLetterBody(
      "Personal Information Letter",
      "The personal identifying information listed on my report appears inaccurate, outdated, incomplete, or unverifiable. Please review and correct or remove any information that cannot be verified."
    ),
  },
  {
    id: "initial-dispute",
    category: "Dispute Flow Letters",
    title: "1-Initial dispute.",
    description: "Initial dispute request for inaccurate or unverifiable reporting.",
    body: baseLetterBody(
      "1-Initial dispute.",
      "I dispute the accuracy and completeness of this account. Please investigate the reporting and provide documentation showing how the information was verified."
    ),
  },
  {
    id: "how-did-you-verify",
    category: "Dispute Flow Letters",
    title: "2-How did you verify the account.",
    description: "Follow-up request asking how the account was verified.",
    body: baseLetterBody(
      "2-How did you verify the account.",
      "I previously disputed this account and request a description of the verification method used. Please provide the procedure, documents, and source used to confirm the reporting."
    ),
  },
  {
    id: "other-bureaus-deleted",
    category: "Dispute Flow Letters",
    title: "3-Other credit bureaus deleted it.",
    description: "Challenge based on inconsistent bureau reporting.",
    body: baseLetterBody(
      "3-Other credit bureaus deleted it.",
      "This item has been removed or corrected by another consumer reporting agency. Please reinvestigate this inconsistent reporting and remove or correct the item if it cannot be verified."
    ),
  },
  {
    id: "creditor-did-not-validate",
    category: "Dispute Flow Letters",
    title: "4-Creditor did not validate it.",
    description: "Challenge when the creditor/furnisher did not validate the account.",
    body: baseLetterBody(
      "4-Creditor did not validate it.",
      "The furnisher has not provided sufficient validation of this account. Please review whether this item can be verified as accurate, complete, and legally reportable."
    ),
  },
  {
    id: "new-relevant-information",
    category: "Dispute Flow Letters",
    title: "5- New and relevant information.",
    description: "Dispute using new supporting information.",
    body: baseLetterBody(
      "5- New and relevant information.",
      "I am providing new and relevant information related to this dispute. Please consider this information during your reinvestigation and update the account accordingly."
    ),
  },
  {
    id: "legal-options-explored",
    category: "Dispute Flow Letters",
    title: "6 - Legal options explored.",
    description: "Final follow-up before considering additional remedies.",
    body: baseLetterBody(
      "6 - Legal options explored.",
      "I have made multiple attempts to resolve this matter. If the item cannot be verified as accurate and complete, please delete or correct it immediately."
    ),
  },

  {
    id: "personal-info-fix",
    category: "General Letters",
    title: "1.Personal information fix.",
    description: "Request correction of name, address, employer, or other personal information.",
    body: baseLetterBody(
      "1.Personal information fix.",
      "Please correct or remove inaccurate personal information associated with my consumer file, including names, addresses, employers, phone numbers, or other identifying data that cannot be verified."
    ),
  },

  {
    id: "r1-accuracy-review",
    category: "General Letters",
    title: "R1 – Accuracy Review",
    description: "Round 1 accuracy-based dispute.",
    body: baseLetterBody(
      "R1 – Accuracy Review",
      "I request an accuracy review of the account listed above. Please verify all reporting fields, including balance, payment history, dates, account status, and ownership."
    ),
  },
  {
    id: "r1-identity-mismatch",
    category: "General Letters",
    title: "R1 – Identity Mismatch",
    description: "Round 1 dispute for possible identity mismatch.",
    body: baseLetterBody(
      "R1 – Identity Mismatch",
      "The account information may not belong to me or may be associated with incorrect identifying information. Please investigate and remove any unverifiable reporting."
    ),
  },
  {
    id: "r1-reporting-standards",
    category: "General Letters",
    title: "R1 – Reporting Standards",
    description: "Round 1 reporting standards dispute.",
    body: baseLetterBody(
      "R1 – Reporting Standards",
      "Please verify that this account meets all applicable reporting standards for accuracy, completeness, and consistency. Correct or delete any information that fails to meet those standards."
    ),
  },
  {
    id: "r1-ownership-challenge",
    category: "General Letters",
    title: "R1 – Ownership Challenge",
    description: "Round 1 ownership challenge.",
    body: baseLetterBody(
      "R1 – Ownership Challenge",
      "I dispute ownership and responsibility for this account as reported. Please provide documentation verifying that the account belongs to me and is being reported accurately."
    ),
  },
  {
    id: "r1-record-verification",
    category: "General Letters",
    title: "R1 – Record Verification",
    description: "Round 1 record verification request.",
    body: baseLetterBody(
      "R1 – Record Verification",
      "Please verify the records used to report this account. If reliable records are unavailable, please delete or correct the reporting."
    ),
  },
  {
    id: "r2-follow-up-reminder",
    category: "General Letters",
    title: "R2 – Follow-up Reminder",
    description: "Round 2 follow-up after prior dispute.",
    body: baseLetterBody(
      "R2 – Follow-up Reminder",
      "This is a follow-up to my prior dispute. Please complete a reasonable reinvestigation and provide the results in writing."
    ),
  },
  {
    id: "r2-verification-challenge",
    category: "General Letters",
    title: "R2 – Verification Challenge",
    description: "Round 2 verification challenge.",
    body: baseLetterBody(
      "R2 – Verification Challenge",
      "I challenge the previous verification of this account. Please identify the specific documents and sources used to verify each disputed field."
    ),
  },
  {
    id: "r2-reinvestigation-request",
    category: "General Letters",
    title: "R2 – Reinvestigation Request",
    description: "Round 2 reinvestigation request.",
    body: baseLetterBody(
      "R2 – Reinvestigation Request",
      "Please conduct a reinvestigation of this account based on the disputed information and any supporting documents provided."
    ),
  },
  {
    id: "r2-accuracy-concern",
    category: "General Letters",
    title: "R2 – Accuracy Concern",
    description: "Round 2 accuracy concern.",
    body: baseLetterBody(
      "R2 – Accuracy Concern",
      "I remain concerned that this account is not being reported accurately. Please review the disputed information and correct any inaccurate or incomplete data."
    ),
  },
  {
    id: "r2-resolution-required",
    category: "General Letters",
    title: "R2 – Resolution Required",
    description: "Round 2 resolution request.",
    body: baseLetterBody(
      "R2 – Resolution Required",
      "This matter remains unresolved. Please provide a final written resolution and correct or remove any information that cannot be verified."
    ),
  },

  {
    id: "dispute-letter-1",
    category: "Credit Bureau Letters",
    title: "1.Dispute letter.",
    description: "General bureau dispute letter.",
    body: baseLetterBody(
      "1.Dispute letter.",
      "I dispute this account because the information appears inaccurate, incomplete, or unverifiable. Please investigate and provide written results."
    ),
  },
  {
    id: "dispute-letter-b",
    category: "Credit Bureau Letters",
    title: "2.Dispute letter (b).",
    description: "Alternative general bureau dispute letter.",
    body: baseLetterBody(
      "2.Dispute letter (b).",
      "Please review this disputed account and verify the source, dates, balance, status, and ownership. If unverifiable, please delete it."
    ),
  },
  {
    id: "round-2",
    category: "Credit Bureau Letters",
    title: "1.Round 2.",
    description: "Second-round dispute.",
    body: baseLetterBody(
      "1.Round 2.",
      "This is a second request for investigation. My prior concerns were not fully addressed. Please reinvestigate and provide documentation of your verification."
    ),
  },
  {
    id: "round-2-b",
    category: "Credit Bureau Letters",
    title: "2.Round 2-b.",
    description: "Second-round dispute variation.",
    body: baseLetterBody(
      "2.Round 2-b.",
      "I continue to dispute this account. Please complete a new review of the disputed data and correct or remove any unverifiable information."
    ),
  },
  {
    id: "round-2-c",
    category: "Credit Bureau Letters",
    title: "3.Round 2-c.",
    description: "Second-round dispute variation.",
    body: baseLetterBody(
      "3.Round 2-c.",
      "The previous response did not provide enough information to confirm accuracy. Please provide the method of verification and update the account as needed."
    ),
  },

  {
    id: "how-verified-a",
    category: "Credit Bureau Letters",
    title: "1.How was it verified (a).",
    description: "Method-of-verification request.",
    body: baseLetterBody(
      "1.How was it verified (a).",
      "Please explain how this item was verified and identify the records or parties contacted during the investigation."
    ),
  },
  {
    id: "how-verified-b",
    category: "Credit Bureau Letters",
    title: "2.How was it verified (b).",
    description: "Method-of-verification request variation.",
    body: baseLetterBody(
      "2.How was it verified (b).",
      "I request a detailed explanation of the verification process used for this account, including all sources relied upon."
    ),
  },
  {
    id: "how-verified-c",
    category: "Credit Bureau Letters",
    title: "3.How was it verified (c).",
    description: "Method-of-verification request variation.",
    body: baseLetterBody(
      "3.How was it verified (c).",
      "Please provide the method of verification and any documentation supporting the continued reporting of this account."
    ),
  },
  {
    id: "how-verified-d",
    category: "Credit Bureau Letters",
    title: "4.How was it verified (d).",
    description: "Method-of-verification request variation.",
    body: baseLetterBody(
      "4.How was it verified (d).",
      "Please identify how each disputed field was verified. If full verification cannot be provided, please delete or correct the account."
    ),
  },

  {
    id: "collector-not-validate",
    category: "Collector's Letters",
    title: "1.Collector did not validate.",
    description: "Collector validation challenge.",
    body: baseLetterBody(
      "1.Collector did not validate.",
      "The collector has not provided sufficient validation of this alleged debt. Please review the reporting and remove it if it cannot be verified."
    ),
  },
  {
    id: "creditor-not-validate-b",
    category: "Creditor's Letters",
    title: "2.Creditor did not validate (b).",
    description: "Creditor validation challenge.",
    body: baseLetterBody(
      "2.Creditor did not validate (b).",
      "The creditor has not provided sufficient documentation supporting the reporting. Please verify or remove the account."
    ),
  },
  {
    id: "collector-failed-validate",
    category: "Collector's Letters",
    title: "3.Collector failed to validate.",
    description: "Collector failed validation follow-up.",
    body: baseLetterBody(
      "3.Collector failed to validate.",
      "The collector failed to provide adequate validation. Please cease reporting or update the account if it cannot be verified."
    ),
  },

  {
    id: "no-response-1",
    category: "Respond Letters",
    title: "1.No response.",
    description: "No-response follow-up.",
    body: baseLetterBody(
      "1.No response.",
      "I have not received a proper response to my prior dispute. Please complete the investigation and provide written results."
    ),
  },
  {
    id: "no-response-b",
    category: "Respond Letters",
    title: "2.No response (b).",
    description: "No-response follow-up variation.",
    body: baseLetterBody(
      "2.No response (b).",
      "This is a follow-up because my previous request has not been adequately answered. Please respond with the investigation results."
    ),
  },
  {
    id: "no-response-c",
    category: "Respond Letters",
    title: "3.No response (c).",
    description: "No-response follow-up variation.",
    body: baseLetterBody(
      "3.No response (c).",
      "I am requesting a written response regarding my unresolved dispute. Please correct or delete any information that cannot be verified."
    ),
  },

  {
    id: "request-verification-1",
    category: "Respond Letters",
    title: "1.Request for verification.",
    description: "Request verification of account details.",
    body: baseLetterBody(
      "1.Request for verification.",
      "Please verify the account information listed above and provide documentation supporting the reporting."
    ),
  },
  {
    id: "request-verification-b",
    category: "Respond Letters",
    title: "2.Request for verification (b).",
    description: "Verification request variation.",
    body: baseLetterBody(
      "2.Request for verification (b).",
      "I request verification of the disputed information, including the source of the account data and all relevant reporting details."
    ),
  },

  {
    id: "accounts-included-bk",
    category: "Credit Bureau Letters",
    title: "1.Accounts included in BK.",
    description: "Bankruptcy-related account dispute.",
    body: baseLetterBody(
      "1.Accounts included in BK.",
      "This account appears related to a bankruptcy matter. Please verify that all bankruptcy-related reporting is accurate and complete."
    ),
  },
  {
    id: "bk-info-inaccurate",
    category: "Credit Bureau Letters",
    title: "2.BK info - inaccurate.",
    description: "Inaccurate bankruptcy information dispute.",
    body: baseLetterBody(
      "2.BK info - inaccurate.",
      "The bankruptcy-related information appears inaccurate or incomplete. Please investigate and correct or remove any inaccurate data."
    ),
  },
  {
    id: "bureau-verified-bk",
    category: "Credit Bureau Letters",
    title: "3.Credit bureau verified BK.",
    description: "Challenge bureau verification of bankruptcy information.",
    body: baseLetterBody(
      "3.Credit bureau verified BK.",
      "Please provide details explaining how the bankruptcy-related information was verified and what records were relied upon."
    ),
  },

  {
    id: "collector-creditor-balance",
    category: "Creditor's Letters",
    title: "1.Coll&Creditor - balance.",
    description: "Balance mismatch between collector and creditor.",
    body: baseLetterBody(
      "1.Coll&Creditor - balance.",
      "The reported balance appears inconsistent between the creditor and collector. Please investigate and correct any inaccurate balance information."
    ),
  },
  {
    id: "different-balances",
    category: "Creditor's Letters",
    title: "2.Showing different balances.",
    description: "Different balances dispute.",
    body: baseLetterBody(
      "2.Showing different balances.",
      "The account is showing different balances across records. Please verify the correct balance and update or delete inaccurate reporting."
    ),
  },

  {
    id: "judgment-1",
    category: "Credit Bureau Letters",
    title: "1.Disputing a judgment.",
    description: "Judgment dispute.",
    body: baseLetterBody(
      "1.Disputing a judgment.",
      "I dispute the accuracy and reporting of this judgment-related item. Please verify all court records and reporting details."
    ),
  },
  {
    id: "judgment-b",
    category: "Credit Bureau Letters",
    title: "2.Disputing a judgment (b).",
    description: "Judgment dispute variation.",
    body: baseLetterBody(
      "2.Disputing a judgment (b).",
      "Please investigate the judgment-related reporting and provide documentation proving it is accurate, complete, and reportable."
    ),
  },

  {
    id: "remove-inquiries-1",
    category: "Credit Bureau Letters",
    title: "1.Remove inquiries letter 1.",
    description: "Inquiry removal request.",
    body: baseLetterBody(
      "1.Remove inquiries letter 1.",
      "I dispute the inquiry listed above and request verification that I authorized it. If it cannot be verified, please remove it."
    ),
  },
  {
    id: "remove-inquiries-1b",
    category: "Credit Bureau Letters",
    title: "2.Remove inquiries letter 1(b).",
    description: "Inquiry removal request variation.",
    body: baseLetterBody(
      "2.Remove inquiries letter 1(b).",
      "Please verify the permissible purpose and authorization for this inquiry. Remove it if it cannot be verified."
    ),
  },
  {
    id: "remove-inquiries-round-2",
    category: "Credit Bureau Letters",
    title: "3.Removing inquiries round 2.",
    description: "Second inquiry removal request.",
    body: baseLetterBody(
      "3.Removing inquiries round 2.",
      "This is a follow-up dispute regarding the inquiry. Please provide verification or remove the inquiry."
    ),
  },
  {
    id: "remove-inquiries-round-3",
    category: "Credit Bureau Letters",
    title: "4.Removing inquires round 3.",
    description: "Third inquiry removal request.",
    body: baseLetterBody(
      "4.Removing inquires round 3.",
      "I continue to dispute this inquiry. Please provide documentation showing authorization and permissible purpose."
    ),
  },
  {
    id: "remove-inquiries-round-4",
    category: "Credit Bureau Letters",
    title: "5.Remove inquiries round 4.",
    description: "Fourth inquiry removal request.",
    body: baseLetterBody(
      "5.Remove inquiries round 4.",
      "This matter remains unresolved. Please remove the inquiry if it cannot be verified with proper authorization."
    ),
  },

  {
    id: "duplicate-accounts",
    category: "Credit Bureau Letters",
    title: "1.Duplicate accounts.",
    description: "Duplicate account dispute.",
    body: baseLetterBody(
      "1.Duplicate accounts.",
      "This account appears to be duplicated or reported more than once. Please investigate and remove any duplicate reporting."
    ),
  },
  {
    id: "outdated-information",
    category: "Credit Bureau Letters",
    title: "2.Outdated information.",
    description: "Outdated reporting dispute.",
    body: baseLetterBody(
      "2.Outdated information.",
      "This information appears outdated and should no longer be reported. Please investigate and remove outdated information."
    ),
  },
  {
    id: "reinserted-negative-item",
    category: "Credit Bureau Letters",
    title: "3.Re-inserted a negative item.",
    description: "Reinserted item dispute.",
    body: baseLetterBody(
      "3.Re-inserted a negative item.",
      "This negative item appears to have been reinserted. Please provide required notice and verification, or remove the item."
    ),
  },
  {
    id: "other-bureaus-deleted-account",
    category: "Credit Bureau Letters",
    title: "4.Other Credit Bureaus Deleted the Account.",
    description: "Other bureaus deleted account dispute.",
    body: baseLetterBody(
      "4.Other Credit Bureaus Deleted the Account.",
      "Other reporting agencies have removed this account. Please investigate the inconsistency and remove or correct this item."
    ),
  },
  {
    id: "legal-options",
    category: "Credit Bureau Letters",
    title: "5.Legal Options.",
    description: "Final dispute before considering legal options.",
    body: baseLetterBody(
      "5.Legal Options.",
      "I have attempted to resolve this issue through prior disputes. Please correct or delete any unverifiable information immediately."
    ),
  },

  {
    id: "campaign-letter-1",
    category: "Campaign Letters",
    title: "1.Letter 1.",
    description: "Campaign letter 1.",
    body: baseLetterBody(
      "1.Letter 1.",
      "This campaign letter requests review and correction of inaccurate, incomplete, or unverifiable information."
    ),
  },
  {
    id: "campaign-letter-2",
    category: "Campaign Letters",
    title: "2.Letter 2.",
    description: "Campaign letter 2.",
    body: baseLetterBody(
      "2.Letter 2.",
      "This follow-up campaign letter requests additional review and written verification of the disputed item."
    ),
  },
  {
    id: "campaign-letter-3",
    category: "Campaign Letters",
    title: "3.Letter 3.",
    description: "Campaign letter 3.",
    body: baseLetterBody(
      "3.Letter 3.",
      "This campaign letter requests final review and correction or deletion of unverifiable information."
    ),
  },
  {
    id: "campaign-letter-4",
    category: "Campaign Letters",
    title: "4.Letter 4.",
    description: "Campaign letter 4.",
    body: baseLetterBody(
      "4.Letter 4.",
      "This campaign letter requests confirmation that all disputed data has been reviewed for accuracy and completeness."
    ),
  },
  {
    id: "campaign-letter-5",
    category: "Campaign Letters",
    title: "5.Letter 5.",
    description: "Campaign letter 5.",
    body: baseLetterBody(
      "5.Letter 5.",
      "This campaign letter requests updated results and correction of any unresolved reporting concerns."
    ),
  },
  {
    id: "campaign-letter-6",
    category: "Campaign Letters",
    title: "6.Letter 6.",
    description: "Campaign letter 6.",
    body: baseLetterBody(
      "6.Letter 6.",
      "This campaign letter requests final written confirmation of the investigation outcome."
    ),
  },
];

export const letterVaultControls = [
  "Attorney Review",
  "Add Image",
  "Image Name",
  "Preview Image",
  "Date",
  "Delete Image",
  "Image Preview",
  "Training Videos",
  "Letter Vault Training Video",
  "Move Letters Training Video",
  "Credit Bureau Letters",
  "Creditor's Letters",
  "Collector's Letters",
  "Respond Letters",
  "Manual Letters",
  "Select All",
  "Delete All",
  "Move Letters",
  "Letter Preview",
  "Add Manual Letter",
  "Undo Deleted Letters",
  "Move Manual Letters",
  "Move to Letter Category",
  "Credit Bureau",
  "Creditor",
  "Collector",
  "Respond Credit Bureau",
  "Respond Creditor",
  "Respond Collector",
];