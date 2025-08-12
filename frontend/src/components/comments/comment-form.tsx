import { TiStar } from "react-icons/ti";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useId, useState } from "react";
import clsx from "clsx";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "../ui/stepper";
import {
  GOOD_RATING_CONDITIONS,
  GREAT_RATING_CONDITIONS,
  OKAY_RATING_CONDITIONS,
  POOR_RATING_CONDITIONS,
  type ConditionType,
} from "@/types/conditions";
import { reportsExamples } from "@/types/report";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  AlertCircleIcon,
  CalendarIcon,
  Check,
  ImageIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useFileUpload } from "@/hooks/use-file-upload";

const steps = [1, 2, 3, 4, 5];

export const CommentForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  return (
    <div>
      <div className="min-h-[425px]">
        {currentStep === 1 && <RatingSelectForm />}
        {currentStep === 2 && <ReportsSelectForm />}
        {currentStep === 3 && <CommentInputForm />}
        {currentStep === 4 && <PhotosInputForm />}
        {currentStep === 5 && <DateInputForm />}
      </div>

      <Stepper
        value={currentStep}
        onValueChange={setCurrentStep}
        className="gap-1 mt-20"
      >
        {steps.map((step) => (
          <StepperItem key={step} step={step} className="flex-1">
            <StepperTrigger
              className="w-full flex-col items-start gap-2"
              asChild
            >
              <StepperIndicator asChild className="bg-border h-1 w-full">
                <span className="sr-only">{step}</span>
              </StepperIndicator>
            </StepperTrigger>
          </StepperItem>
        ))}
      </Stepper>

      <div className="flex items-center gap-2 justify-end mt-4">
        <Button
          className="shrink-0 select-none w-20 rounded-full cursor-pointer"
          variant="ghost"
          size="icon"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
          aria-label="Prev step"
        >
          Back
        </Button>
        <Button
          className="shrink-0 select-none w-20 rounded-full cursor-pointer"
          variant={currentStep === steps.length ? "brand" : "outline"}
          onClick={() => {
            if (currentStep === steps.length) return;
            setCurrentStep((prev) => prev + 1);
          }}
          aria-label="Next step"
        >
          {currentStep === steps.length ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
};

const RatingSelectForm = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [conditions, setConditions] = useState<ConditionType[]>([]);

  const RATING_CONDITIONS: Record<number, ConditionType[]> = {
    1: POOR_RATING_CONDITIONS,
    2: POOR_RATING_CONDITIONS,
    3: OKAY_RATING_CONDITIONS,
    4: GOOD_RATING_CONDITIONS,
    5: GREAT_RATING_CONDITIONS,
  };

  const toggleCondition = (condition: ConditionType) => {
    setConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  return (
    <div>
      <h1 className="text-2xl mb-2">Leave a review</h1>
      <div className="flex items-center gap-2 text-primary">
        {[1, 2, 3, 4, 5].map((order) => (
          <RatingStar
            key={order}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            order={order}
          />
        ))}
      </div>

      {selectedRating && (
        <div>
          <p className="mt-10 mb-2 text-lg font-medium">Tell us about it</p>
          <div className="flex flex-wrap gap-2">
            {(RATING_CONDITIONS[selectedRating] || []).map((condition) => (
              <Button
                key={condition}
                variant="outline"
                className={clsx(
                  conditions.includes(condition)
                    ? "border-primary transition-colors focus:ring-1 focus:ring-offset-1 focus:ring-primary/80"
                    : "",
                  "cursor-pointer hover:border-primary/50 py-6 px-5"
                )}
                onClick={() => {
                  toggleCondition(condition);
                }}
              >
                {condition}{" "}
                {conditions.includes(condition) && (
                  <Check size={30} className="ml-2" />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RatingStar = ({
  selectedRating,
  setSelectedRating,
  order,
}: {
  selectedRating: number | null;
  setSelectedRating: (number: number | null) => void;
  order: number;
}) => {
  return (
    <TiStar
      size={50}
      className={clsx(
        selectedRating && selectedRating >= order ? "text-primary" : "",
        "cursor-pointer text-muted-foreground/30 hover:text-primary hover:scale-120"
      )}
      onClick={() => {
        if (selectedRating === order) {
          setSelectedRating(null);
        } else {
          setSelectedRating(order);
        }
      }}
    />
  );
};

const ReportsSelectForm = () => {
  const [reports, setReports] = useState<string[]>([]);

  const toggleReport = (condition: string) => {
    setReports((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };
  return (
    <div>
      <h1 className="text-2xl mb-2">Any conditions to report?</h1>
      <p className="text-muted-foreground">Let others know what's going on</p>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {reportsExamples.map((report) => (
            <Button
              key={report.title}
              variant="outline"
              className={clsx(
                reports.includes(report.title)
                  ? "border-primary transition-colors focus:ring-1 focus:ring-offset-1 focus:ring-primary/80"
                  : "",
                "cursor-pointer hover:border-primary/50 py-5 px-5"
              )}
              onClick={() => {
                toggleReport(report.title);
              }}
            >
              <report.icon size={30} className="mr-2" /> {report.title}{" "}
              {reports.includes(report.title) && (
                <Check size={30} className="ml-2" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CommentInputForm = () => {
  return (
    <div>
      <h1 className="text-2xl mb-2">Tell others about the beach</h1>
      <p className="text-muted-foreground">
        Share helpful details with the community
      </p>
      <Textarea
        className="[resize:none] mt-10 h-[300px] !text-base placeholder:text-base"
        placeholder="Consider including cool features, tips and advice"
      />
      <p></p>
    </div>
  );
};

const PhotosInputForm = () => {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB default
  const maxFiles = 6;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    multiple: true,
    maxFiles,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Upload photos</h1>
        <p className="text-muted-foreground">
          Upload photos to share with the community
        </p>
      </div>
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({files.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={files.length >= maxFiles}
              >
                <UploadIcon
                  className="-ms-0.5 size-3.5 opacity-60"
                  aria-hidden="true"
                />
                Add more
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-accent relative aspect-square rounded-md"
                >
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="size-full rounded-[inherit] object-cover"
                  />
                  <Button
                    onClick={() => removeFile(file.id)}
                    size="icon"
                    className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                    aria-label="Remove image"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
            <p className="text-muted-foreground text-xs">
              SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
            </p>
            <Button variant="outline" className="mt-4" onClick={openFileDialog}>
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              Select images
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
};

const DateInputForm = () => {
  const [date, setDate] = useState<Date | undefined>();
  const id = useId();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Select Date</h1>
        <p className="text-muted-foreground">When did you visit this place?</p>
      </div>
      <div className="*:not-first:mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant={"outline"}
              className="group bg-background hover:bg-background border-input w-full justify-between px-3 py-6 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            >
              <span
                className={cn("truncate", !date && "text-muted-foreground")}
              >
                {date ? format(date, "PPP") : "Pick a date"}
              </span>
              <CalendarIcon
                size={16}
                className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
