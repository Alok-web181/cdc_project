// src/app/api/shoes/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Shoe from '@/models/Shoe';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET - Fetch all shoes
export async function GET() {
  try {
    console.log('=== GET /api/shoes started ===');
    console.log('Environment check:');
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('- MONGODB_URI value:', process.env.MONGODB_URI?.substring(0, 20) + '...');
    
    console.log('Attempting database connection...');
    await dbConnect();
    console.log('✓ Database connected successfully');
    
    console.log('Fetching shoes from database...');
    const shoes = await Shoe.find({}).sort({ createdAt: -1 }).lean();
    console.log(`✓ Found ${shoes.length} shoes`);
    
    return NextResponse.json({ 
      success: true, 
      data: shoes,
      count: shoes.length
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch (error) {
    console.error('=== GET Error Details ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch shoes',
        details: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

// POST - Add new shoe
export async function POST(request) {
  try {
    console.log('=== POST /api/shoes started ===');
    
    console.log('Connecting to database...');
    await dbConnect();
    console.log('✓ Database connected');

    console.log('Parsing form data...');
    const formData = await request.formData();
    
    // Extract fields
    const name = formData.get('name');
    const brand = formData.get('brand');
    const price = parseFloat(formData.get('price'));
    const discount = parseFloat(formData.get('discount')) || 0;
    const stock = parseInt(formData.get('stock'));
    const category = formData.get('category');
    
    console.log('Extracted fields:', { 
      name, 
      brand, 
      price, 
      discount, 
      stock, 
      category 
    });
    
    // Validate required fields
    if (!name || !brand || !price || !stock || !category) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!brand) missingFields.push('brand');
      if (!price) missingFields.push('price');
      if (!stock) missingFields.push('stock');
      if (!category) missingFields.push('category');
      
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      );
    }
    
    // Get all image files
    const images = formData.getAll('images');
    console.log(`Processing ${images.length} images`);
    
    // Upload images to Cloudinary
    const imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image && image.size > 0) {
        try {
          console.log(`Uploading image ${i + 1}/${images.length}...`);
          
          // Convert File to buffer
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Convert buffer to base64
          const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;
          
          // Upload to Cloudinary
          const uploadedUrl = await uploadToCloudinary(base64Image);
          imageUrls.push(uploadedUrl);
          console.log(`✓ Image ${i + 1} uploaded successfully`);
        } catch (uploadError) {
          console.error(`✗ Error uploading image ${i + 1}:`, uploadError.message);
          // Continue with other images even if one fails
        }
      }
    }

    console.log(`Total images uploaded: ${imageUrls.length}`);

    // Create shoe in database
    console.log('Creating shoe document...');
    const shoe = await Shoe.create({
      name,
      brand,
      price,
      discount,
      stock,
      category,
      images: imageUrls,
    });

    console.log('✓ Shoe created successfully:', shoe._id);

    return NextResponse.json(
      { success: true, data: shoe },
      { status: 201 }
    );
  } catch (error) {
    console.error('=== POST Error Details ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to add shoe',
        details: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}