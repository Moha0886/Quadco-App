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
    borderBottomColor: '#8B5CF6',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  companyInfo: {
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
    color: '#8B5CF6',
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
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
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 9,
    color: '#1F2937',
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
    backgroundColor: '#F3E8FF',
    color: '#8B5CF6',
    padding: 5,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  deliveredBadge: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  signature: {
    marginTop: 40,
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    flex: 1,
    marginHorizontal: 10,
    borderTop: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 10,
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6B7280',
  },
});

interface DeliveryNotePDFProps {
  deliveryNote: {
    id: string;
    deliveryNumber: string;
    date: string;
    deliveredDate?: string;
    status: string;
    notes?: string;
    customer: {
      name: string;
      email: string;
      phone?: string;
      address?: string;
    };
    invoice?: {
      invoiceNumber: string;
    };
    lineItems: Array<{
      id: string;
      itemType: string;
      quantity: number;
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

const DeliveryNotePDF: React.FC<DeliveryNotePDFProps> = ({ deliveryNote }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return [styles.statusBadge, styles.deliveredBadge];
      case 'pending':
        return [styles.statusBadge, styles.pendingBadge];
      default:
        return styles.statusBadge;
    }
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
            <Text style={styles.documentTitle}>DELIVERY NOTE</Text>
            <Text style={styles.documentNumber}>{deliveryNote.deliveryNumber}</Text>
            <View style={getStatusBadgeStyle(deliveryNote.status)}>
              <Text>{deliveryNote.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Note and Customer Information */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <View>
              <Text style={styles.label}>Delivery Note Number:</Text>
              <Text style={styles.value}>{deliveryNote.deliveryNumber}</Text>
            </View>
            <View>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(deliveryNote.date)}</Text>
            </View>
            {deliveryNote.deliveredDate && (
              <View>
                <Text style={styles.label}>Delivered Date:</Text>
                <Text style={styles.value}>{formatDate(deliveryNote.deliveredDate)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{deliveryNote.status}</Text>
            </View>
            {deliveryNote.invoice && (
              <View>
                <Text style={styles.label}>Invoice Reference:</Text>
                <Text style={styles.value}>{deliveryNote.invoice.invoiceNumber}</Text>
              </View>
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Deliver To</Text>
            <View>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{deliveryNote.customer.name}</Text>
            </View>
            <View>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{deliveryNote.customer.email}</Text>
            </View>
            {deliveryNote.customer.phone && (
              <View>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{deliveryNote.customer.phone}</Text>
              </View>
            )}
            {deliveryNote.customer.address && (
              <View>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{deliveryNote.customer.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Items Delivered</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.tableColItem]}>Item</Text>
            <Text style={[styles.tableCellHeader, styles.tableColDesc]}>Description</Text>
            <Text style={[styles.tableCellHeader, styles.tableColQty]}>Qty</Text>
          </View>

          {/* Table Rows */}
          {deliveryNote.lineItems.map((item) => (
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
            </View>
          ))}
        </View>

        {/* Notes Section */}
        {deliveryNote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Delivery Notes:</Text>
            <Text style={styles.notesText}>{deliveryNote.notes}</Text>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signature}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Delivered By</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Received By</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Items delivered in good condition. Please inspect all items upon receipt.
          </Text>
          <Text style={[styles.footerText, { marginTop: 5 }]}>
            Quadco Consults Limited - Business Management Solutions
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryNotePDF;
