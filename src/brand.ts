import { defineBrand } from './lib/brand-type';

export const brand = defineBrand({
  name: 'Ankara Blocks',
  colors: { primary: '#F5B82E', primaryText: '#0E0B2E', accent: '#C2287A' },
  screens: [
    { name: 'index', title: 'Ankara Blocks', hideHeader: true },
    { name: 'how-to-play', title: 'How to play', hideHeader: true },
  ],
});
