// Field metadata for each supported Salesforce standard object.
// "label" is shown in the UI, "name" is the actual Salesforce API field name.
// "required" fields are enforced (lightly) on the create form.
// "type" drives which HTML input is rendered on the frontend.

module.exports = {
  Account: {
    label: "Account",
    fields: [
      { name: "Name", label: "Account Name", type: "text", required: true },
      { name: "Industry", label: "Industry", type: "text" },
      { name: "Phone", label: "Phone", type: "text" },
      { name: "Website", label: "Website", type: "text" },
      { name: "BillingCity", label: "Billing City", type: "text" },
      { name: "AnnualRevenue", label: "Annual Revenue", type: "number" },
      { name: "NumberOfEmployees", label: "Employees", type: "number" }
    ]
  },
  Opportunity: {
    label: "Opportunity",
    fields: [
      { name: "Name", label: "Opportunity Name", type: "text", required: true },
      { name: "StageName", label: "Stage", type: "text", required: true },
      { name: "CloseDate", label: "Close Date", type: "date", required: true },
      { name: "Amount", label: "Amount", type: "number" },
      { name: "Probability", label: "Probability (%)", type: "number" },
      { name: "Type", label: "Type", type: "text" }
    ]
  },
  Lead: {
    label: "Lead",
    fields: [
      { name: "FirstName", label: "First Name", type: "text" },
      { name: "LastName", label: "Last Name", type: "text", required: true },
      { name: "Company", label: "Company", type: "text", required: true },
      { name: "Email", label: "Email", type: "email" },
      { name: "Phone", label: "Phone", type: "text" },
      { name: "Status", label: "Status", type: "text" },
      { name: "LeadSource", label: "Lead Source", type: "text" }
    ]
  },
  Contact: {
    label: "Contact",
    fields: [
      { name: "FirstName", label: "First Name", type: "text" },
      { name: "LastName", label: "Last Name", type: "text", required: true },
      { name: "Email", label: "Email", type: "email" },
      { name: "Phone", label: "Phone", type: "text" },
      { name: "Title", label: "Title", type: "text" },
      { name: "Department", label: "Department", type: "text" }
    ]
  },
  Case: {
    label: "Case",
    fields: [
      { name: "Subject", label: "Subject", type: "text", required: true },
      { name: "Status", label: "Status", type: "text" },
      { name: "Priority", label: "Priority", type: "text" },
      { name: "Origin", label: "Origin", type: "text" },
      { name: "Description", label: "Description", type: "textarea" }
    ]
  }
};
