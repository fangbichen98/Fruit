import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
        <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
        />
        {/* Gradient overlay for better text contrast if we wanted text on image, but here just for polish */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <h3 className="font-semibold text-slate-800 text-lg mb-1">{product.name}</h3>
        <p className="text-slate-500 text-sm mb-3">/ {product.unit}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900">¥{product.price.toFixed(2)}</span>
          <button 
            onClick={() => onAdd(product)}
            className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all shadow-lg shadow-slate-200"
            aria-label={`将 ${product.name} 加入购物车`}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};