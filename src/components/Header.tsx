import { Globe } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex justify-between items-center py-6 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#141414] rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#141414] rounded-full" />
            </div>
        </div>
        <h1 className="text-[16px] font-semibold text-[#141414]">{title}</h1>
      </div>

      <div className="flex items-center gap-2 bg-[#F8F8F8] px-3 py-2 rounded-full border border-gray-100">
        <Globe className="w-4 h-4 text-[#141414]/40" />
        <span className="text-[12px] font-medium text-[#141414]/40">Nigeria</span>
      </div>
    </header>
  );
}
