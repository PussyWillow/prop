export const getThemeColor = (theme?: string): string => {
    const colors: { [key: string]: string } = {
      impermanence: 'from-pink-400 to-rose-300',
      friendship: 'from-green-400 to-emerald-300',
      solitude: 'from-blue-400 to-indigo-300',
      longing: 'from-purple-400 to-violet-300',
      community: 'from-orange-400 to-amber-300',
      creativity: 'from-red-400 to-pink-300',
      inspiration: 'from-yellow-400 to-orange-300',
      discovery: 'from-cyan-400 to-blue-300',
      wonder: 'from-indigo-400 to-purple-300',
      hope: 'from-emerald-400 to-green-300',
      artistry: 'from-violet-400 to-purple-300',
      love: 'from-red-500 to-pink-500',
      war: 'from-slate-500 to-gray-600',
      peace: 'from-sky-400 to-cyan-300',
    };
    return theme ? colors[theme.toLowerCase()] || 'from-gray-400 to-slate-300' : 'from-gray-400 to-slate-300';
};
