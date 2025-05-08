export const getColSpanClass = (colSpan?: 1 | 2 | 3 | "full") => {
  switch (colSpan) {
    case 1:
      return "col-span-1";
    case 2:
      return "col-span-2";
    case 3:
      return "col-span-3";
    case "full":
      return "col-span-full";
    default:
      return "col-span-1";
  }
};
