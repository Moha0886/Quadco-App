import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  companyInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 10,
  },
  companyDetails: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'right',
    marginBottom: 5,
  },
  documentNumber: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 20,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    color: '#1F2937',
    marginBottom: 5,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#D1D5DB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableColItem: {
    flex: 3,
  },
  tableColDesc: {
    flex: 3,
  },
  tableColQty: {
    flex: 1,
    textAlign: 'center',
  },
  tableColPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  tableColTotal: {
    flex: 1.5,
    textAlign: 'right',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 9,
    color: '#1F2937',
  },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
    minWidth: 200,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginRight: 20,
    flex: 1,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 10,
    color: '#1F2937',
    width: 80,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: '#3B82F6',
    minWidth: 200,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 20,
    flex: 1,
    textAlign: 'right',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    width: 80,
    textAlign: 'right',
  },
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTop: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
    padding: 5,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
});

interface QuotationPDFProps {
  quotation: {
    id: string;
    date: string;
    validUntil: string;
    status: string;
    total: number;
    notes?: string;
    customer: {
      name: string;
      email: string;
      phone?: string;
      address?: string;
    };
    lineItems: Array<{
      id: string;
      itemType: string;
      quantity: number;
      unitPrice: number;
      total: number;
      description?: string;
      product?: {
        name: string;
        unit: string;
      };
      service?: {
        name: string;
        unit: string;
      };
    }>;
  };
}

const QuotationPDF: React.FC<QuotationPDFProps> = ({ quotation }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo and Company Info */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
            {/* React-PDF Image component doesn't support alt prop - accessibility handled by document structure */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              style={styles.logo}
              src="/quadco-logo.png"
            />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Quadco Consults Limited</Text>
              <Text style={styles.companyTagline}>Business Management Solutions</Text>
              <Text style={styles.companyDetails}>
                Professional consulting services for business growth{'\n'}
                Email: info@quadcoconsults.com{'\n'}
                Phone: +1 (555) 123-4567
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.documentTitle}>QUOTATION</Text>
            <Text style={styles.documentNumber}>QUO-{quotation.id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { marginTop: 10 }]}>
              <Text>{quotation.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Quotation and Customer Information */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Quotation Details</Text>
            <View>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(quotation.date)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Valid Until:</Text>
              <Text style={styles.value}>{formatDate(quotation.validUntil)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{quotation.status}</Text>
            </View>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <View>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{quotation.customer.name}</Text>
            </View>
            <View>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{quotation.customer.email}</Text>
            </View>
            {quotation.customer.phone && (
              <View>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{quotation.customer.phone}</Text>
              </View>
            )}
            {quotation.customer.address && (
              <View>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{quotation.customer.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Items</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.tableColItem]}>Item</Text>
            <Text style={[styles.tableCellHeader, styles.tableColDesc]}>Description</Text>
            <Text style={[styles.tableCellHeader, styles.tableColQty]}>Qty</Text>
            <Text style={[styles.tableCellHeader, styles.tableColPrice]}>Unit Price</Text>
            <Text style={[styles.tableCellHeader, styles.tableColTotal]}>Total</Text>
          </View>

          {/* Table Rows */}
          {quotation.lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.tableColItem}>
                <Text style={styles.tableCell}>
                  {item.product?.name || item.service?.name || 'Unknown Item'}
                </Text>
                <Text style={[styles.tableCell, { fontSize: 8, color: '#9CA3AF' }]}>
                  {item.itemType === 'product' ? 'Product' : 'Service'}
                </Text>
              </View>
              <Text style={[styles.tableCell, styles.tableColDesc]}>
                {item.description || '-'}
              </Text>
              <Text style={[styles.tableCell, styles.tableColQty]}>
                {item.quantity} {item.product?.unit || item.service?.unit || ''}
              </Text>
              <Text style={[styles.tableCell, styles.tableColPrice]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.tableColTotal]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quotation.total)}</Text>
          </View>
        </View>

        {/* Notes Section */}
        {quotation.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes & Terms:</Text>
            <Text style={styles.notesText}>{quotation.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This quotation is valid until {formatDate(quotation.validUntil)}. Thank you for your business!
          </Text>
          <Text style={[styles.footerText, { marginTop: 5 }]}>
            Quadco Consults Limited - Business Management Solutions
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;
