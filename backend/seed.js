require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Customer = require('./src/models/Customer');
const Supplier = require('./src/models/Supplier');
const Purchase = require('./src/models/Purchase');
const Sale = require('./src/models/Sale');
const Invoice = require('./src/models/Invoice');
const InventoryLog = require('./src/models/InventoryLog');
const CompanySettings = require('./src/models/CompanySettings');
const Notification = require('./src/models/Notification');
const { calculateInvoiceTotals } = require('./src/services/gstCalculator');

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI missing in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoURI);
    console.log('[Seed DB Connected]: Clearing existing records...');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Purchase.deleteMany({});
    await Sale.deleteMany({});
    await Invoice.deleteMany({});
    await InventoryLog.deleteMany({});
    await CompanySettings.deleteMany({});
    await Notification.deleteMany({});

    console.log('Seeding default Company Settings...');
    const company = await CompanySettings.create({
      companyName: 'Apex Retail ERP',
      address: '123 Tech Corridor, Indiranagar, Bengaluru, Karnataka - 560038',
      phone: '+91 98765 43210',
      email: 'support@apexretail.com',
      gstNumber: '29ABCDE1234F1Z5',
      invoicePrefix: 'INV-2026-',
      currency: '₹',
      defaultGstPercent: 18
    });

    console.log('Seeding Users...');
    const admin = await User.create({
      name: 'Administrator User',
      email: 'admin@erp.com',
      password: 'Admin@123',
      role: 'Administrator',
      phone: '+91 99999 11111'
    });

    const manager = await User.create({
      name: 'Inventory Manager',
      email: 'manager@erp.com',
      password: 'Manager@123',
      role: 'Inventory Manager',
      phone: '+91 99999 22222'
    });

    const staff = await User.create({
      name: 'Store Staff Executive',
      email: 'staff@erp.com',
      password: 'Staff@123',
      role: 'Store Staff',
      phone: '+91 99999 33333'
    });

    console.log('Seeding Categories...');
    const catElectronics = await Category.create({ name: 'Electronics', description: 'Gadgets, peripherals & hardware' });
    const catGrocery = await Category.create({ name: 'Grocery', description: 'Foodstuff, staples & beverages' });
    const catClothing = await Category.create({ name: 'Clothing', description: 'Apparel, garments & accessories' });
    const catStationery = await Category.create({ name: 'Stationery', description: 'Office supplies & notebooks' });
    const catFurniture = await Category.create({ name: 'Furniture', description: 'Desks, chairs & storage' });

    console.log('Seeding Suppliers...');
    const supTech = await Supplier.create({
      name: 'Global Tech Distribution Pvt Ltd',
      contactPerson: 'Ramesh Patel',
      phone: '+91 98111 22334',
      email: 'orders@globaltech.com',
      gstNumber: '29AAACG1234H1Z1',
      address: 'Plot 45, Electronic City, Bengaluru'
    });

    const supFood = await Supplier.create({
      name: 'Prime Wholesale Foods',
      contactPerson: 'Suresh Kumar',
      phone: '+91 98222 33445',
      email: 'sales@primefoods.com',
      gstNumber: '29AAAFP5678K1Z2',
      address: 'Market Yard, Yeshwanthpur, Bengaluru'
    });

    console.log('Seeding Customers...');
    const custWalkIn = await Customer.create({
      name: 'Walk-In Customer',
      phone: '0000000000',
      email: 'walkin@apexretail.com'
    });

    const custRajesh = await Customer.create({
      name: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh.k@gmail.com',
      address: '42 MG Road, Bengaluru',
      gstNumber: '29AAACK9999J1Z9'
    });

    const custAnita = await Customer.create({
      name: 'Anita Sharma',
      phone: '9876512345',
      email: 'anita.sharma@yahoo.com',
      address: '15 Koramangala 4th Block, Bengaluru'
    });

    console.log('Seeding Products...');
    const productsData = [
      {
        name: 'Wireless Optical Mouse',
        sku: 'ELE-MOU-001',
        barcode: '8901234567890',
        category: catElectronics._id,
        description: 'Ergonomic 2.4GHz wireless mouse with nano receiver',
        purchasePrice: 450,
        sellingPrice: 899,
        gstPercent: 18,
        currentStock: 45,
        minStockLevel: 10,
        unit: 'pcs'
      },
      {
        name: 'Ergonomic Mechanical Keyboard',
        sku: 'ELE-KEY-002',
        barcode: '8901234567891',
        category: catElectronics._id,
        description: 'RGB Backlit mechanical gaming and typing keyboard',
        purchasePrice: 1800,
        sellingPrice: 3499,
        gstPercent: 18,
        currentStock: 20,
        minStockLevel: 5,
        unit: 'pcs'
      },
      {
        name: 'Full HD 27" IPS Monitor',
        sku: 'ELE-MON-003',
        barcode: '8901234567892',
        category: catElectronics._id,
        description: '1080p 75Hz borderless IPS display with HDMI',
        purchasePrice: 8500,
        sellingPrice: 12999,
        gstPercent: 18,
        currentStock: 8,
        minStockLevel: 3,
        unit: 'pcs'
      },
      {
        name: 'Organic Basmati Rice 5kg',
        sku: 'GRO-RIC-001',
        barcode: '8901234567893',
        category: catGrocery._id,
        description: 'Long grain aromatic aged organic basmati rice',
        purchasePrice: 420,
        sellingPrice: 599,
        gstPercent: 5,
        currentStock: 60,
        minStockLevel: 15,
        unit: 'pack'
      },
      {
        name: 'Premium Arabica Coffee Beans 500g',
        sku: 'GRO-COF-002',
        barcode: '8901234567894',
        category: catGrocery._id,
        description: 'Fresh roasted Chikmagalur single-origin coffee beans',
        purchasePrice: 350,
        sellingPrice: 650,
        gstPercent: 12,
        currentStock: 4, // Low Stock Demo
        minStockLevel: 8,
        unit: 'pack'
      },
      {
        name: "Men's Cotton Polo T-Shirt",
        sku: 'CLO-TSH-001',
        barcode: '8901234567895',
        category: catClothing._id,
        description: '100% combed breathable cotton slim-fit polo',
        purchasePrice: 300,
        sellingPrice: 799,
        gstPercent: 12,
        currentStock: 35,
        minStockLevel: 10,
        unit: 'pcs'
      },
      {
        name: 'Executive A5 Leather Notebook',
        sku: 'STA-NOT-001',
        barcode: '8901234567896',
        category: catStationery._id,
        description: '192 pages 100gsm fountain-pen friendly journal',
        purchasePrice: 120,
        sellingPrice: 349,
        gstPercent: 12,
        currentStock: 0, // Out of Stock Demo
        minStockLevel: 10,
        unit: 'pcs'
      },
      {
        name: 'Ergonomic Mesh Desk Chair',
        sku: 'FUR-CHA-001',
        barcode: '8901234567897',
        category: catFurniture._id,
        description: 'High-back lumbar support breathable mesh chair',
        purchasePrice: 4200,
        sellingPrice: 7999,
        gstPercent: 18,
        currentStock: 12,
        minStockLevel: 3,
        unit: 'pcs'
      }
    ];

    const createdProducts = await Product.insertMany(productsData);

    console.log('Seeding Sample Purchases...');
    const purchaseItems = [
      {
        product: createdProducts[0]._id,
        quantity: 50,
        purchasePrice: 450,
        gstPercent: 18
      },
      {
        product: createdProducts[1]._id,
        quantity: 25,
        purchasePrice: 1800,
        gstPercent: 18
      }
    ];
    const purchaseCalc = calculateInvoiceTotals(purchaseItems, 0);

    const purchase = await Purchase.create({
      supplier: supTech._id,
      invoiceNumber: 'SUP-INV-8891',
      purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      items: purchaseCalc.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        purchasePrice: i.purchasePrice,
        gstPercent: i.gstPercent,
        gstAmount: i.gstAmount,
        total: i.lineTotal
      })),
      subtotal: purchaseCalc.subtotal,
      totalGst: purchaseCalc.totalGst,
      totalDiscount: 0,
      grandTotal: purchaseCalc.grandTotal,
      paymentStatus: 'Paid',
      notes: 'Initial stocking batch',
      createdBy: manager._id
    });

    console.log('Seeding Sample Sales & Invoices...');
    // Create Sale 1
    const sale1Items = [
      {
        product: createdProducts[0]._id,
        productName: createdProducts[0].name,
        sku: createdProducts[0].sku,
        quantity: 2,
        unitPrice: 899,
        gstPercent: 18,
        discount: 0
      },
      {
        product: createdProducts[3]._id,
        productName: createdProducts[3].name,
        sku: createdProducts[3].sku,
        quantity: 1,
        unitPrice: 599,
        gstPercent: 5,
        discount: 0
      }
    ];

    const calc1 = calculateInvoiceTotals(sale1Items, 50);
    const sale1 = await Sale.create({
      customer: custRajesh._id,
      saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      invoiceNumber: 'INV-2026-000001',
      items: calc1.items,
      subtotal: calc1.subtotal,
      discountTotal: calc1.discountTotal,
      taxableAmount: calc1.taxableAmount,
      cgst: calc1.cgst,
      sgst: calc1.sgst,
      totalGst: calc1.totalGst,
      grandTotal: calc1.grandTotal,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      createdBy: staff._id
    });

    await Invoice.create({
      sale: sale1._id,
      invoiceNumber: sale1.invoiceNumber,
      invoiceDate: sale1.saleDate,
      customerDetails: {
        name: custRajesh.name,
        phone: custRajesh.phone,
        email: custRajesh.email,
        address: custRajesh.address,
        gstNumber: custRajesh.gstNumber
      },
      companyDetails: {
        companyName: company.companyName,
        address: company.address,
        phone: company.phone,
        email: company.email,
        gstNumber: company.gstNumber
      },
      items: sale1.items,
      subtotal: sale1.subtotal,
      discount: sale1.discountTotal,
      taxableAmount: sale1.taxableAmount,
      cgst: sale1.cgst,
      sgst: sale1.sgst,
      totalGst: sale1.totalGst,
      grandTotal: sale1.grandTotal,
      paymentMethod: sale1.paymentMethod,
      paymentStatus: sale1.paymentStatus,
      createdBy: staff._id
    });

    custRajesh.totalSpent += calc1.grandTotal;
    custRajesh.purchaseCount += 1;
    await custRajesh.save();

    // Create Sale 2
    const sale2Items = [
      {
        product: createdProducts[1]._id,
        productName: createdProducts[1].name,
        sku: createdProducts[1].sku,
        quantity: 1,
        unitPrice: 3499,
        gstPercent: 18,
        discount: 100
      }
    ];

    const calc2 = calculateInvoiceTotals(sale2Items, 0);
    const sale2 = await Sale.create({
      customer: custAnita._id,
      saleDate: Date.now(),
      invoiceNumber: 'INV-2026-000002',
      items: calc2.items,
      subtotal: calc2.subtotal,
      discountTotal: calc2.discountTotal,
      taxableAmount: calc2.taxableAmount,
      cgst: calc2.cgst,
      sgst: calc2.sgst,
      totalGst: calc2.totalGst,
      grandTotal: calc2.grandTotal,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      createdBy: staff._id
    });

    await Invoice.create({
      sale: sale2._id,
      invoiceNumber: sale2.invoiceNumber,
      invoiceDate: sale2.saleDate,
      customerDetails: {
        name: custAnita.name,
        phone: custAnita.phone,
        email: custAnita.email,
        address: custAnita.address
      },
      companyDetails: {
        companyName: company.companyName,
        address: company.address,
        phone: company.phone,
        email: company.email,
        gstNumber: company.gstNumber
      },
      items: sale2.items,
      subtotal: sale2.subtotal,
      discount: sale2.discountTotal,
      taxableAmount: sale2.taxableAmount,
      cgst: sale2.cgst,
      sgst: sale2.sgst,
      totalGst: sale2.totalGst,
      grandTotal: sale2.grandTotal,
      paymentMethod: sale2.paymentMethod,
      paymentStatus: sale2.paymentStatus,
      createdBy: staff._id
    });

    custAnita.totalSpent += calc2.grandTotal;
    custAnita.purchaseCount += 1;
    await custAnita.save();

    // Create Initial Low Stock Notification
    await Notification.create({
      title: 'Low Stock Alert',
      message: `'${createdProducts[4].name}' is low in stock. Only 4 units remaining.`,
      type: 'LOW_STOCK',
      product: createdProducts[4]._id
    });

    await Notification.create({
      title: 'Out of Stock Alert',
      message: `'${createdProducts[6].name}' (SKU: ${createdProducts[6].sku}) is now out of stock!`,
      type: 'OUT_OF_STOCK',
      product: createdProducts[6]._id
    });

    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('------------------------------------------------');
    console.log('Default Seed Accounts:');
    console.log('1. Administrator: admin@erp.com / Admin@123');
    console.log('2. Inventory Manager: manager@erp.com / Manager@123');
    console.log('3. Store Staff: staff@erp.com / Staff@123');
    console.log('------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
};

seedData();
