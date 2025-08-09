import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export const BeachSafety = () => {
  return (
    <section
      id="safety"
      className="flex flex-wrap gap-4 items-center justify-between"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Safety Guidance
        </h2>
        <p>How to keep yourself and Florida safe anywhere and all the time</p>
      </div>

      <Link to="#">
        <Button
          className="px-20 border border-border rounded-full text-primary bg-gradient-to-r from-green-50 to-blue-100"
          size="sm"
        >
          Learn more
        </Button>
      </Link>
    </section>
  );
};
