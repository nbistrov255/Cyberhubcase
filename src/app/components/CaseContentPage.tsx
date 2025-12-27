import { CaseContentCard } from './CaseContentCard';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { FooterSection } from './FooterSection';

interface CaseContentPageProps {
  onBack: () => void;
}

const mockCaseContent = [
  {
    id: '1',
    name: 'AK-47 | Fire Serpent',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?w=400&h=400&fit=crop',
    rarity: 'mythic' as const,
    dropChance: 0.26,
  },
  {
    id: '2',
    name: 'M4A4 | Howl',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=400&fit=crop',
    rarity: 'mythic' as const,
    dropChance: 0.32,
  },
  {
    id: '3',
    name: 'AWP | Dragon Lore',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=400&h=400&fit=crop',
    rarity: 'mythic' as const,
    dropChance: 0.18,
  },
  {
    id: '4',
    name: 'Karambit | Fade',
    type: 'knife' as const,
    image: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=400&h=400&fit=crop',
    rarity: 'legendary' as const,
    dropChance: 1.84,
  },
  {
    id: '5',
    name: 'Butterfly Knife | Tiger Tooth',
    type: 'knife' as const,
    image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop',
    rarity: 'legendary' as const,
    dropChance: 2.15,
  },
  {
    id: '6',
    name: 'Desert Eagle | Blaze',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rarity: 'legendary' as const,
    dropChance: 3.42,
  },
  {
    id: '7',
    name: 'Glock-18 | Fade',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
    rarity: 'epic' as const,
    dropChance: 7.28,
  },
  {
    id: '8',
    name: 'USP-S | Kill Confirmed',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop',
    rarity: 'epic' as const,
    dropChance: 8.93,
  },
  {
    id: '9',
    name: 'P250 | Asiimov',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rarity: 'epic' as const,
    dropChance: 9.67,
  },
  {
    id: '10',
    name: '$50 Bonus Balance',
    type: 'bonus' as const,
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop',
    rarity: 'epic' as const,
    dropChance: 5.22,
  },
  {
    id: '11',
    name: 'AK-47 | Redline',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
    rarity: 'rare' as const,
    dropChance: 12.45,
  },
  {
    id: '12',
    name: 'M4A1-S | Hyper Beast',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?w=400&h=400&fit=crop',
    rarity: 'rare' as const,
    dropChance: 13.87,
  },
  {
    id: '13',
    name: 'AWP | Asiimov',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=400&fit=crop',
    rarity: 'rare' as const,
    dropChance: 11.23,
  },
  {
    id: '14',
    name: 'P90 | Asiimov',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=400&h=400&fit=crop',
    rarity: 'rare' as const,
    dropChance: 10.58,
  },
  {
    id: '15',
    name: 'Premium Access (7 Days)',
    type: 'privilege' as const,
    image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop',
    rarity: 'rare' as const,
    dropChance: 8.45,
  },
  {
    id: '16',
    name: 'Five-SeveN | Case Hardened',
    type: 'weapon' as const,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rarity: 'common' as const,
    dropChance: 4.15,
  },
];

export function CaseContentPage({ onBack }: CaseContentPageProps) {
  return (
    <div className="min-h-screen bg-[#17171c] pt-48 pb-12">
      <div className="max-w-[1600px] mx-auto px-8">
        {/* Header Section */}
        <div className="mb-8">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1L2 7L10 13V1Z" fill="white"/>
            </svg>
            <span className="font-bold text-sm tracking-wider uppercase">Back to Cases</span>
          </motion.button>

          <div className="flex items-center gap-6">
            {/* Case Image */}
            <div className="w-32 h-32 bg-gradient-to-br from-[#7c2d3a] to-[#4a1a23] p-1 shadow-2xl">
              <div className="w-full h-full bg-black/40 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
                  alt="Case"
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            {/* Case Info */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Case Name</h1>
              <p className="text-white/60 text-lg">View all possible drops from this case</p>
            </div>
          </div>
        </div>

        {/* Content Grid - Unified Block */}
        <div className="bg-gradient-to-b from-black/20 to-black/10 border border-white/5 p-8">
          <div className="grid grid-cols-4 gap-6">
            {mockCaseContent.map((item) => (
              <CaseContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Total Probability Check */}
        <div className="mt-6 text-center">
          <span className="text-white/40 text-sm">
            Total Drop Rate: {mockCaseContent.reduce((sum, item) => sum + item.dropChance, 0).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}