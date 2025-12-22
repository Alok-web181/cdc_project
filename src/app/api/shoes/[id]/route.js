import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Shoe from '@/models/Shoe';

// GET - Fetch single shoe by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const shoe = await Shoe.findById(params.id).lean();
    
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
  try {
    await dbConnect();
    
    const formData = await request.formData();
    
    const updateData = {
      name: formData.get('name'),
      brand: formData.get('brand'),
      price: parseFloat(formData.get('price')),
      discount: parseFloat(formData.get('discount')) || 0,
      stock: parseInt(formData.get('stock')),
      sales: formData.get('sales'),
    };

    const shoe = await Shoe.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

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
  try {
    await dbConnect();
    
    const shoe = await Shoe.findByIdAndDelete(params.id);

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