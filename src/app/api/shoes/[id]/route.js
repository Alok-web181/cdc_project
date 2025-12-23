import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Shoe from '@/models/Shoe';

// GET - Fetch single shoe by ID
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    await dbConnect();
    
    const shoe = await Shoe.findById(id).lean();
    
    if (!shoe) {
      return NextResponse.json(
        { success: false, error: 'Shoe not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: shoe 
    });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch shoe' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update shoe
export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    await dbConnect();
    
    const formData = await request.formData();
    
    // Get the current shoe data first
    const currentShoe = await Shoe.findById(id);
    
    if (!currentShoe) {
      return NextResponse.json(
        { success: false, error: 'Shoe not found' },
        { status: 404 }
      );
    }

    const newSales = parseInt(formData.get('sales'));
    const newPrice = parseFloat(formData.get('price'));
    const newDiscount = parseFloat(formData.get('discount')) || 0;

    const updateData = {
      name: formData.get('name'),
      brand: formData.get('brand'),
      price: newPrice,
      discount: newDiscount,
      stock: parseInt(formData.get('stock')),
      sales: newSales,
    };

    // Check if sales value has changed
    if (newSales !== currentShoe.sales) {
      // Add new entry to sales history
      const historyEntry = {
        sales: newSales,
        price: newPrice,
        discount: newDiscount,
        timestamp: new Date(),
      };
      
      updateData.$push = {
        salesHistory: historyEntry
      };
    }

    const shoe = await Shoe.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: shoe 
    });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update shoe' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete shoe
export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await dbConnect();
    
    const shoe = await Shoe.findByIdAndDelete(id);

    if (!shoe) {
      return NextResponse.json(
        { success: false, error: 'Shoe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Shoe deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete shoe' 
      },
      { status: 500 }
    );
  }
}