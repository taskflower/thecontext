/* eslint-disable @typescript-eslint/no-explicit-any */
interface MainTitleProps {
    title: string;
    icon: React.ComponentType<any>;
    description?: string;
  }
  const MainTitle = ({ title, description, icon: Icon }: MainTitleProps) => {
    return (
     
       <div>
        <div className="flex items-center gap-4">
        <Icon className="h-10 w-10 p-2 bg-black text-white rounded" />
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

       {description && <p className="text-muted-foreground mt-2">
         {description}
       </p>}
     </div>
    );
  };
  
  export default MainTitle;