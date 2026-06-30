export interface CompanyDetails {
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
  }
  
  export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }
  
  export interface Invoice {
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    sender: CompanyDetails;
    client: CompanyDetails;
    items: InvoiceItem[];
    taxRate: number; // Percentage (e.g., 18 for 18%)
    discount: number; // Absolute value or percentage
    notes: string;
  }