'use client';

interface ChildSelectorProps {
  childrenList: any[];
  currentChild: number | null;
  onSelectChild: (childId: number) => void;
  child1Emoji?: string;
  child2Emoji?: string;
}

export function ChildSelector({ 
  childrenList, 
  currentChild, 
  onSelectChild,
  child1Emoji = '👦',
  child2Emoji = '👧'
}: ChildSelectorProps) {
  const childrenArray = Array.isArray(childrenList) ? childrenList : [];
  
  const getEmoji = (index: number) => {
    return index === 0 ? child1Emoji : child2Emoji;
  };

  return (
    <div className="flex gap-4 mb-6">
      {childrenArray.map((child, index) => {
        const isSelected = currentChild === child.id;
        let buttonClass = "flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ";
        if (isSelected) {
          buttonClass += index === 1
            ? "bg-pink-500 text-white shadow-lg scale-105"
            : "bg-blue-500 text-white shadow-lg scale-105";
        } else {
          buttonClass += "bg-gray-300 text-gray-600";
        }
        return (
          <button
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            className={buttonClass}
          >
            {getEmoji(index)} {child.name}
          </button>
        );
      })}
    </div>
  );
}
