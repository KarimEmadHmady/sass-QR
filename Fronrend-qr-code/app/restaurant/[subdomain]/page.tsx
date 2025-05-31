'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';

export default function RestaurantPage() {
  const params = useParams();
  const { subdomain } = useSubdomain();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${subdomain}`);
        if (!response.ok) {
          throw new Error('Restaurant not found');
        }
        const data = await response.json();
        setRestaurant(data);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchRestaurantData();
    }
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Restaurant Header */}
      <header className="relative h-64 bg-gray-900">
        {restaurant.banner && (
          <img
            src={restaurant.banner}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            {restaurant.logo && (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
            )}
            <h1 className="text-4xl font-bold">{restaurant.name}</h1>
          </div>
        </div>
      </header>

      {/* Restaurant Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">About Us</h2>
            <p className="text-gray-600 mb-4">{restaurant.address}</p>
            <p className="text-gray-600">{restaurant.phone}</p>
          </div>

          {/* Menu Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Menu Categories</h2>
            {/* Add your menu categories here */}
          </div>
        </div>
      </main>
    </div>
  );
} 