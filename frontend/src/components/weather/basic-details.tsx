export const BasicDetails = ({
  temperature,
  description,
}: {
  temperature: number;
  description: string;
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p>
          <span className="text-2xl font-semibold">{temperature}</span>
          <span className="text-muted-foreground text-xl ml-0.5">°F</span>
        </p>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
};
