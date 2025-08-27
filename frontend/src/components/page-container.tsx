import React from "react";

const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center pt-10 pb-20">
      <main className="container p-2 xl:max-w-[1000px] space-y-4">
        {children}
      </main>
    </div>
  );
};

export default PageContainer;
