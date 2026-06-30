import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, FileText, Download } from 'lucide-react';
import type { Invoice, InvoiceItem } from '../types/invoice.types';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const initialItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  price: 0,
});

export default function InvoiceDashboard() {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 1. Lazy initialization for Logo from localStorage
  const [logo, setLogo] = useState<string>(() => {
    return localStorage.getItem('smart_invoice_logo') || '';
  });

  // 2. Lazy initialization for Invoice Data from localStorage
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const savedData = localStorage.getItem('smart_invoice_data');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing saved invoice data", e);
      }
    }
    return {
      id: crypto.randomUUID(),
      invoiceNumber: 'INV-2026-001',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      sender: { name: '', email: '', phone: '', address: '', taxId: '' },
      client: { name: '', email: '', phone: '', address: '', taxId: '' },
      items: [initialItem()],
      taxRate: 18,
      discount: 0,
      notes: '',
    };
  });

  // 3. Persistence Effects
  useEffect(() => {
    localStorage.setItem('smart_invoice_data', JSON.stringify(invoice));
  }, [invoice]);

  useEffect(() => {
    localStorage.setItem('smart_invoice_logo', logo);
  }, [logo]);

  // 4. Dynamic calculations
  const subtotal = useMemo(() => {
    return invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  }, [invoice.items]);

  const taxAmount = useMemo(() => {
    return subtotal * (invoice.taxRate / 100);
  }, [subtotal, invoice.taxRate]);

  const total = useMemo(() => {
    return subtotal + taxAmount - Number(invoice.discount);
  }, [subtotal, taxAmount, invoice.discount]);

  // 5. Action Handlers
  const handleSenderChange = (field: string, value: string) => {
    setInvoice((prev) => ({ ...prev, sender: { ...prev.sender, [field]: value } }));
  };

  const handleClientChange = (field: string, value: string) => {
    setInvoice((prev) => ({ ...prev, client: { ...prev.client, [field]: value } }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
      ),
    }));
  };

  const addItem = () => {
    setInvoice((prev) => ({ ...prev, items: [...prev.items, initialItem()] }));
  };

  const removeItem = (id: string) => {
    if (invoice.items.length > 1) {
      setInvoice((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setLogo('');

  const handleResetInvoice = () => {
    if (window.confirm('Are you sure you want to clear all invoice data? This action cannot be undone.')) {
      setLogo('');
      setInvoice({
        id: crypto.randomUUID(),
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        sender: { name: '', email: '', phone: '', address: '', taxId: '' },
        client: { name: '', email: '', phone: '', address: '', taxId: '' },
        items: [initialItem()],
        taxRate: 18,
        discount: 0,
        notes: '',
      });
      alert('Invoice cleared successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-indigo-600" /> Smart Invoice Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create, calculate, and export professional invoices in real-time.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleResetInvoice}
            className="text-slate-600 hover:text-red-600 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors border border-slate-300 hover:border-red-200 hover:bg-red-50 cursor-pointer"
          >
            Clear Data
          </button>
          <button
            onClick={() => generateInvoicePDF(previewRef.current, invoice.invoiceNumber)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: DYNAMIC FORM */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6 overflow-y-auto max-h-[80vh]">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Invoice Configuration</h2>
          
          {/* Logo Upload Slot */}
          <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Company Logo</label>
            {logo ? (
              <div className="flex items-center gap-4">
                <img src={logo} alt="Company Logo Preview" className="h-12 w-auto object-contain rounded border bg-white p-1" />
                <button onClick={removeLogo} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer">
                  Remove Logo
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
              />
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Due Date</label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Sender & Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">From (Sender)</h3>
              <input type="text" placeholder="Company Name" onChange={(e) => handleSenderChange('name', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              <input type="email" placeholder="Email Address" onChange={(e) => handleSenderChange('email', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              <input type="text" placeholder="Full Address" onChange={(e) => handleSenderChange('address', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">To (Client)</h3>
              <input type="text" placeholder="Client Name" onChange={(e) => handleClientChange('name', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              <input type="email" placeholder="Client Email" onChange={(e) => handleClientChange('email', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              <input type="text" placeholder="Client Address" onChange={(e) => handleClientChange('address', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Line Items</h3>
              <button onClick={addItem} className="text-xs bg-slate-100 hover:bg-indigo-50 text-indigo-600 font-semibold py-1.5 px-3 rounded-md flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer">
                <Plus size={14} /> Add Item
              </button>
            </div>

            {invoice.items.map((item) => (
              <div key={item.id} className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex-[3]">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <input type="text" placeholder="Service description" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm bg-white" />
                </div>
                <div className="flex-[1]">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qty</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity === 0 ? '' : item.quantity} 
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                    className="w-full px-2 py-1.5 border rounded text-sm bg-white" 
                  />
                </div>
                <div className="flex-[1.5]">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={item.price === 0 ? '' : item.price} 
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} 
                    className="w-full px-2 py-1.5 border rounded text-sm bg-white" 
                  />
                </div>
                <button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} className="text-slate-400 hover:text-red-500 p-2 pb-2 disabled:opacity-40 transition-colors cursor-pointer">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Tax & Discount Inputs */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tax Rate (%)</label>
              <input 
                type="number" 
                value={invoice.taxRate === 0 ? '' : invoice.taxRate} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => setInvoice({ ...invoice, taxRate: Number(e.target.value) })} 
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Discount ($)</label>
              <input 
                type="number" 
                value={invoice.discount === 0 ? '' : invoice.discount} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => setInvoice({ ...invoice, discount: Number(e.target.value) })} 
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: LIVE A4 PREVIEW */}
        <section className="bg-slate-200 p-4 rounded-xl border border-slate-300 overflow-auto max-h-[80vh] flex justify-start lg:justify-center items-start">
          <div
            ref={previewRef}
            className="bg-white p-12 shadow-lg text-slate-800 flex flex-col justify-between w-[210mm] min-h-[297mm] box-border shrink-0 my-2"
          >
            <div>
              {/* Preview Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                <div className="flex items-start gap-4">
                  {logo && <img src={logo} alt="Sender Logo" className="h-14 w-auto object-contain bg-white" />}
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 break-words max-w-[350px]">{invoice.sender.name || 'YOUR COMPANY'}</h3>
                    <p className="text-xs text-slate-500 mt-1 whitespace-pre-line max-w-[350px]">{invoice.sender.address || 'Your Business Address'}</p>
                    <p className="text-xs text-slate-500">{invoice.sender.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <h2 className="text-3xl font-light text-slate-400 tracking-wide">INVOICE</h2>
                  <p className="text-sm font-semibold text-slate-700 mt-2">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-slate-500 mt-1">Date: {invoice.issueDate}</p>
                  {invoice.dueDate && <p className="text-xs text-red-500 font-medium mt-1">Due: {invoice.dueDate}</p>}
                </div>
              </div>

              {/* Preview Bill To */}
              <div className="my-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bill To:</h4>
                <p className="text-sm font-bold text-slate-800">{invoice.client.name || 'Client Name / Company'}</p>
                <p className="text-xs text-slate-500 whitespace-pre-line max-w-[400px]">{invoice.client.address || 'Client Address'}</p>
                <p className="text-xs text-slate-500">{invoice.client.email}</p>
              </div>

              {/* Preview Table */}
              <table className="w-full text-left text-sm mt-8 table-fixed">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-2 font-semibold w-[50%]">Description</th>
                    <th className="py-2 text-center font-semibold w-[10%]">Qty</th>
                    <th className="py-2 text-right font-semibold w-[20%]">Price</th>
                    <th className="py-2 text-right font-semibold w-[20%]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 text-slate-700 font-medium break-words pr-4">{item.description || 'Untitled Service'}</td>
                      <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">${item.price.toFixed(2)}</td>
                      <td className="py-3 text-right text-slate-900 font-semibold">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Preview Totals */}
            <div className="border-t-2 border-slate-100 pt-4 mt-8 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-${Number(invoice.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-2">
                  <span>Total Due:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}