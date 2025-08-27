import React from "react";

const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-500 bg-clip-text text-transparent">
      {children}
    </h1>
  );
};

export default PageTitle;
