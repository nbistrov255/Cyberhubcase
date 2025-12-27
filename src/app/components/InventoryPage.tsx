import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { InventoryItem } from '../App';
import { FooterSection } from './FooterSection';

interface InventoryPageProps {
  items: InventoryItem[];
  onAction: (itemId: string) => void;
  onBack: () => void;
}

const rarityColors = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
  mythic: '#ef4444',
};

const statusColors = {
  available: { bg: 'bg-green-900/80', text: 'text-green-300', label: 'AVAILABLE' },
  processing: { bg: 'bg-yellow-900/80', text: 'text-yellow-300', label: 'PROCESSING' },
  received: { bg: 'bg-blue-900/80', text: 'text-blue-300', label: 'RECEIVED' },
  failed: { bg: 'bg-red-900/80', text: 'text-red-300', label: 'FAILED' },
};

export function InventoryPage({ items, onAction, onBack }: InventoryPageProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'rarity' | 'status'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'money' | 'cs2' | 'physical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'processing' | 'received'>('all');

  const filteredItems = items
    .filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return 0;
      if (sortBy === 'rarity') {
        const rarityOrder = { mythic: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      }
      return 0;
    });

  const getActionButton = (item: InventoryItem) => {
    if (item.status === 'received') return null;
    if (item.status === 'processing') return null;

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          onAction(item.id);
        }}
        className="px-8 py-3 bg-gradient-to-r from-green-700 to-green-600 rounded-full font-bold shadow-xl"
      >
        CLAIM
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen px-12 py-8 bg-[#17171c]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-[Aldrich] transition-all border-2"
              style={{
                backgroundColor: '#17171c',
                borderColor: '#ffffff20',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1f1f25';
                e.currentTarget.style.borderColor = '#ffffff30';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#17171c';
                e.currentTarget.style.borderColor = '#ffffff20';
              }}
            >
              {/* Filled Triangle Arrow */}
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1L2 7L10 13V1Z" fill="white"/>
              </svg>
              <span className="font-bold text-sm tracking-wider uppercase">НАЗАД</span>
            </motion.button>
            <h1 className="text-4xl font-bold">My Inventory</h1>
          </div>
          <div className="text-gray-400">
            {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="rarity">By Rarity</option>
              <option value="status">By Status</option>
            </select>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="money">Money</option>
              <option value="cs2">CS2 Skin</option>
              <option value="physical">Physical</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="processing">Processing</option>
              <option value="received">Received</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">No items found</h2>
            <p className="text-gray-400">Try adjusting your filters or open some cases!</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-6">
            {filteredItems.map((item) => {
              const isHovered = hoveredItem === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: isHovered ? -3 : 0,
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    y: { duration: 0.2, ease: "easeOut" }
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative overflow-hidden transition-all duration-200"
                  style={{ 
                    width: '225px',
                    height: '308px',
                    flexShrink: 0,
                    borderRadius: '6px',
                    border: isHovered
                      ? '2px solid #eab308'
                      : `2px solid ${rarityColors[item.rarity]}80`,
                    boxShadow: isHovered
                      ? '0 8px 30px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(234, 179, 8, 0.3)'
                      : `0 4px 20px ${rarityColors[item.rarity]}50, 0 0 30px ${rarityColors[item.rarity]}30`,
                  }}
                >
                  {/* Item Image - Full Height */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 h-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient Hover Effect */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        background: isHovered
                          ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, ${rarityColors[item.rarity]} 100%)`
                          : 'transparent',
                        opacity: isHovered ? 0.6 : 0,
                      }}
                    />

                    {/* Status Badge - Top Left */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 font-bold text-xs backdrop-blur-md ${
                        statusColors[item.status].bg
                      } ${statusColors[item.status].text}`}
                      style={{ borderRadius: '4px' }}
                    >
                      {statusColors[item.status].label}
                    </div>

                    {/* Type Badge - Top Right */}
                    <div 
                      className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold uppercase"
                      style={{ borderRadius: '4px' }}
                    >
                      {item.type}
                    </div>

                    {/* Item Name and Rarity - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent px-4 py-4">
                      <div className="text-sm font-bold mb-1 line-clamp-2">{item.name}</div>
                      <div
                        className="text-xs font-bold uppercase"
                        style={{ color: rarityColors[item.rarity] }}
                      >
                        {item.rarity}
                      </div>
                      {item.value && (
                        <div className="text-green-400 font-bold text-sm mt-1">€{item.value}</div>
                      )}
                    </div>

                    {/* Processing Overlay */}
                    {item.status === 'processing' && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-3" />
                        <div className="text-center px-4">
                          <div className="font-bold mb-1">Processing</div>
                          <div className="text-sm text-gray-400">
                            {item.type === 'physical'
                              ? 'Admin is processing'
                              : 'Being processed'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button on Hover */}
                    <AnimatePresence>
                      {isHovered && item.status === 'available' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction(item.id);
                            }}
                            className="px-8 py-3 rounded-xl font-bold tracking-wider transition-all relative overflow-hidden border-2"
                            style={{
                              backgroundColor: 'rgba(234, 179, 8, 0.15)',
                              borderColor: '#eab308',
                              color: '#eab308',
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 4px 20px rgba(234, 179, 8, 0.3)',
                            }}
                          >
                            ЗАБРАТЬ
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}