// src/themes/energygrant/utils/ColorUtils.ts

export type ColorScheme = {
  icon: string;
  bg: string;
  border: string;
  hover: string;
  selected: string;
  button: string;
  gradient: string;
  ring: string;
};

export type ColorVariant = "blue" | "orange" | "indigo" | "green" | "gray";

// Base color schemes for different color variants
export const colorSchemes: Record<ColorVariant, ColorScheme> = {
  blue: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hover: "hover:border-blue-300 hover:bg-blue-50",
    selected: "border-blue-500 bg-blue-50/70",
    button: "bg-blue-600 hover:bg-blue-700",
    gradient: "from-blue-500 to-blue-600",
    ring: "ring-blue-500/20",
  },
  orange: {
    icon: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    hover: "hover:border-orange-300 hover:bg-orange-50",
    selected: "border-orange-500 bg-orange-50/70",
    button: "bg-orange-600 hover:bg-orange-700",
    gradient: "from-orange-500 to-orange-600",
    ring: "ring-orange-500/20",
  },
  indigo: {
    icon: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    hover: "hover:border-indigo-300 hover:bg-indigo-50",
    selected: "border-indigo-500 bg-indigo-50/70",
    button: "bg-indigo-600 hover:bg-indigo-700",
    gradient: "from-indigo-500 to-indigo-600",
    ring: "ring-indigo-500/20",
  },
  green: {
    icon: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    hover: "hover:border-green-300 hover:bg-green-50",
    selected: "border-green-500 bg-green-50/70",
    button: "bg-green-600 hover:bg-green-700",
    gradient: "from-green-500 to-green-600",
    ring: "ring-green-500/20",
  },
  gray: {
    icon: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    hover: "hover:border-gray-300 hover:bg-gray-50",
    selected: "border-gray-500 bg-gray-50/70",
    button: "bg-gray-600 hover:bg-gray-700",
    gradient: "from-gray-500 to-gray-600",
    ring: "ring-gray-500/20",
  },
};

// Function to get color classes based on color name and selection state
export const getColorClasses = (
  color: string,
  isSelected: boolean,
  hasAnimated: boolean = true
) => {
  const scheme = colorSchemes[color as ColorVariant] || colorSchemes.gray;

  return {
    cardClasses: `border rounded-xl overflow-hidden transition-all ${
      isSelected
        ? `${scheme.selected} shadow-lg ring-1 ${scheme.ring}`
        : `${scheme.border} ${scheme.hover} shadow-sm`
    } ${
      hasAnimated
        ? "opacity-100 transform translate-y-0"
        : "opacity-0 transform translate-y-4"
    }`,
    iconClasses: `${scheme.icon} ${isSelected ? "bg-white" : scheme.bg}`,
    iconContainerClasses: `${
      isSelected
        ? `bg-gradient-to-br ${scheme.gradient} text-white shadow-md`
        : `bg-white ${scheme.border}`
    }`,
    bgClasses: isSelected ? scheme.bg : "",
    borderClasses: `${scheme.border}`,
    buttonClasses: `bg-gradient-to-br ${scheme.gradient} shadow-md`,
    featureClasses: `py-2 px-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow`,
    ring: scheme.ring,
  };
};
