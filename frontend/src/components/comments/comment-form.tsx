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
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  AlertCircleIcon,
  CalendarIcon,
  Check,
  ImageIcon,
  Loader2,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useFileUpload } from "@/hooks/use-file-upload";
import z from "zod";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "../ui/form";
import {
  useGetCommentReports,
  useUploadCommentByBeachID,
  useUploadPictureByBeachID,
} from "@/api/beach";
import { ReportsIconMap, type ReportAPIResponse } from "@/types/report";
import { toast } from "sonner";

const steps = [1, 2, 3, 4, 5];

export const NewCommentSchema = z.object({
  rating: z.number(),
  rating_conditions: z.array(z.string()), // Condition strings
  reports: z.array(z.number()), // Report IDs
  content: z.string().optional(),
  photos: z.array(
    z.object({
      file: z.instanceof(File),
      id: z.string(),
      preview: z.string().optional(),
    })
  ),
  date: z.date(),
});

export const CommentForm = ({
  setCommentOpen,
  beachId,
}: {
  setCommentOpen: React.Dispatch<React.SetStateAction<boolean>>;
  beachId: number | string;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const useUploadPicture = useUploadPictureByBeachID(beachId);
  const useUploadComment = useUploadCommentByBeachID(beachId);

  const form = useForm<z.infer<typeof NewCommentSchema>>({
    resolver: zodResolver(NewCommentSchema),
    defaultValues: {
      rating: 0,
      rating_conditions: [],
      reports: [],
      content: "",
      photos: [],
      date: new Date(),
    },
  });

  const onSubmit = (data: z.infer<typeof NewCommentSchema>) => {
    // Submit comment
    useUploadComment
      .mutateAsync({
        rating: data.rating,
        conditions: data.rating_conditions.join(","),
        reports: data.reports,
        content: data.content || "",
        timestamp: data.date.toISOString(),
      })
      .then((comment_data) => {
        // Submit photos
        data.photos.forEach((photo) => {
          useUploadPicture.mutateAsync({
            file: photo.file,
            comment_id: comment_data.id,
          });
        });
      })
      .then(() => {
        setCommentOpen(false);
        toast.success("Comment submitted successfully!");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
            disabled={
              currentStep === 1 ||
              useUploadComment.isPending ||
              useUploadPicture.isPending
            }
            aria-label="Prev step"
            type="button"
          >
            Back
          </Button>
          <Button
            className="shrink-0 select-none w-20 rounded-full cursor-pointer"
            variant={currentStep === steps.length ? "brand" : "outline"}
            onClick={() => {
              if (currentStep === steps.length) {
                form.handleSubmit(onSubmit)();
                return;
              }
              setCurrentStep((prev) => prev + 1);
            }}
            type="button" // Prevent form submission because clicking the last next button causes submit
            aria-label="Next step"
            disabled={useUploadComment.isPending || useUploadPicture.isPending}
          >
            {currentStep === steps.length ? "Submit" : "Next"}
            {(useUploadComment.isPending || useUploadPicture.isPending) && (
              <Loader2 className="animate-spin" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const RatingSelectForm = () => {
  const form = useFormContext<z.infer<typeof NewCommentSchema>>();

  const RATING_CONDITIONS: Record<number, ConditionType[]> = {
    0: [],
    1: POOR_RATING_CONDITIONS,
    2: POOR_RATING_CONDITIONS,
    3: OKAY_RATING_CONDITIONS,
    4: GOOD_RATING_CONDITIONS,
    5: GREAT_RATING_CONDITIONS,
  };

  const toggleCondition = (condition: ConditionType) => {
    const conditions = form.getValues("rating_conditions");

    form.setValue(
      "rating_conditions",
      conditions.includes(condition)
        ? conditions.filter((c) => c !== condition)
        : [...conditions, condition]
    );
  };

  return (
    <div>
      <h1 className="text-2xl mb-2">Leave a review</h1>
      <div className="flex items-center gap-2 text-primary">
        {[1, 2, 3, 4, 5].map((order) => (
          <RatingStar
            key={order}
            selectedRating={form.watch("rating")}
            setSelectedRating={(rating) => {
              if (rating === form.watch("rating")) {
                form.setValue("rating", 0);
              }
              form.setValue("rating", rating);
            }}
            order={order}
          />
        ))}
      </div>

      {form.watch("rating") ? (
        <div>
          <p className="mt-10 mb-2 text-lg font-medium">Tell us about it</p>
          <div className="flex flex-wrap gap-2">
            {(RATING_CONDITIONS[form.watch("rating")] || []).map(
              (condition) => (
                <Button
                  key={condition}
                  variant="outline"
                  type="button"
                  className={clsx(
                    form.watch("rating_conditions").includes(condition)
                      ? "border-primary transition-colors focus:ring-1 focus:ring-offset-1 focus:ring-primary/80"
                      : "",
                    "cursor-pointer hover:border-primary/50 py-6 px-5"
                  )}
                  onClick={() => {
                    toggleCondition(condition);
                  }}
                >
                  {condition}{" "}
                  {form.watch("rating_conditions").includes(condition) && (
                    <Check size={30} className="ml-2" />
                  )}
                </Button>
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const RatingStar = ({
  selectedRating,
  setSelectedRating,
  order,
}: {
  selectedRating: number;
  setSelectedRating: (number: number) => void;
  order: number;
}) => {
  return (
    <TiStar
      size={50}
      className={clsx(
        selectedRating && selectedRating >= order ? "text-primary" : "",
        "cursor-pointer text-muted-foreground/30 hover:text-primary hover:scale-120"
      )}
      type="button"
      onClick={() => {
        if (selectedRating === order) {
          setSelectedRating(0);
        } else {
          setSelectedRating(order);
        }
      }}
    />
  );
};

const ReportsSelectForm = () => {
  const form = useFormContext<z.infer<typeof NewCommentSchema>>();
  const reportsQuery = useGetCommentReports();
  const selectedReports = form.watch("reports");

  const toggleReport = (condition: ReportAPIResponse) => {
    form.setValue(
      "reports",
      selectedReports.includes(condition.id)
        ? selectedReports.filter((c) => c !== condition.id)
        : [...selectedReports, condition.id]
    );
  };

  if (reportsQuery.isLoading) return <Loader2 className="animate-spin" />;

  if (!reportsQuery.data)
    return <div>Could not load reports... move to next step or try again</div>;

  return (
    <div>
      <h1 className="text-2xl mb-2">Any conditions to report?</h1>
      <p className="text-muted-foreground">Let others know what's going on</p>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {reportsQuery.data.map((report) => {
            const Icon = ReportsIconMap[report.icon_name];

            return (
              <Button
                key={report.name}
                variant="outline"
                type="button"
                className={clsx(
                  selectedReports.includes(report.id)
                    ? "border-primary transition-colors focus:ring-1 focus:ring-offset-1 focus:ring-primary/80"
                    : "",
                  "cursor-pointer hover:border-primary/50 py-5 px-5"
                )}
                onClick={() => toggleReport(report)}
              >
                <Icon className="mr-2" size={30} />
                {report.name}
                {selectedReports.includes(report.id) && (
                  <Check size={30} className="ml-2" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CommentInputForm = () => {
  const form = useFormContext<z.infer<typeof NewCommentSchema>>();
  return (
    <div>
      <h1 className="text-2xl mb-2">Tell others about the beach</h1>
      <p className="text-muted-foreground">
        Share helpful details with the community
      </p>

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <Textarea
            className="[resize:none] mt-10 h-[300px] !text-base placeholder:text-base"
            placeholder="Consider including cool features, tips and advice"
            {...field}
          />
        )}
      />
      <p></p>
    </div>
  );
};

const PhotosInputForm = () => {
  const form = useFormContext<z.infer<typeof NewCommentSchema>>();
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB default
  const maxFiles = 6;

  const [
    { isDragging, errors },
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
    onFilesAdded(addedFiles) {
      const files = addedFiles.map((file) => {
        return {
          file: file.file,
          id: file.id,
          preview: file.preview,
        };
      });
      // @ts-expect-error Weird type match erorr
      form.setValue("photos", [...form.watch("photos"), ...files]);
    },
    onFilesChange(files) {
      form.setValue(
        "photos",
        // @ts-expect-error Weird type match erorr
        files.map((file) => ({
          file: file.file,
          id: file.id,
          preview: file.preview,
        }))
      );
    },
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
        data-files={form.watch("photos").length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {form.watch("photos").length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({form.watch("photos").length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={openFileDialog}
                disabled={form.watch("photos").length >= maxFiles}
              >
                <UploadIcon
                  className="-ms-0.5 size-3.5 opacity-60"
                  aria-hidden="true"
                />
                Add more
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {form.watch("photos").map((file) => (
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
                    type="button"
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
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={openFileDialog}
            >
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
  const id = useId();
  const form = useFormContext<z.infer<typeof NewCommentSchema>>();
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
              type="button"
              variant={"outline"}
              className="group bg-background hover:bg-background border-input w-full justify-between px-3 py-6 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            >
              <span
                className={cn(
                  "truncate",
                  !form.watch("date") && "text-muted-foreground"
                )}
              >
                {form.watch("date")
                  ? format(form.watch("date"), "PPP")
                  : "Pick a date"}
              </span>
              <CalendarIcon
                size={16}
                className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={form.watch("date")}
              onSelect={(date) => {
                if (!date) return;
                form.setValue("date", date);
              }}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
