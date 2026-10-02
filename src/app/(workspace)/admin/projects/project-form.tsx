import type { ReactNode } from "react";
import { splitProjectDescription, splitProjectLocation } from "@/lib/projects";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "@/components/ui";

type ProjectValues = {
  id?: string;
  name: string;
  location: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function ProjectForm({
  project,
  action,
  submitLabel,
}: {
  project?: ProjectValues;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const fieldClass =
    "mt-1.5 w-full rounded-md border border-[#d9e0dc] bg-white px-3 py-2.5 text-sm text-[#29332b] outline-none placeholder:text-[#8b968f] focus:border-[#4c8060] focus:ring-2 focus:ring-[#4c8060]/15";
  const labelClass = "block text-sm font-medium text-[#344138]";
  const field = (label: string, control: ReactNode) => (
    <label className={labelClass}>
      {label}
      {control}
    </label>
  );
  const { areaTown, county } = splitProjectLocation(project?.location ?? "");
  const { description, developerInfo } = splitProjectDescription(project?.description ?? null);

  return (
    <form action={action} className="space-y-6">
      {project?.id && <input type="hidden" name="project_id" value={project.id} />}
      <div className="border-b border-[#e5ebe7] pb-2">
        <h2 className="text-base font-semibold text-[#29332b]">Project information</h2>
        <p className="mt-1 text-sm text-[#718077]">A name and location are all you need to start.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "Project name",
          <input className={fieldClass} name="name" required defaultValue={project?.name} />,
        )}
        {field(
          "County",
          <input
            className={fieldClass}
            name="county"
            required
            defaultValue={county}
          />,
        )}
        {field(
          "Area/Town",
          <input className={fieldClass} name="area_town" required defaultValue={areaTown} />,
        )}
      </div>
      <Accordion type="single" collapsible className="rounded-lg border border-[#e0e6e2] bg-white px-4 sm:px-5">
        <AccordionItem value="additional-project-details" className="border-0">
          <AccordionTrigger>
            <span>
              <span className="block">Additional Project Details (Optional)</span>
              <span className="mt-1 block text-xs font-normal text-[#7b8980]">Add media and useful context now or later.</span>
            </span>
          </AccordionTrigger>
          <AccordionContent forceMount className="pb-5">
            <div className="grid gap-5 border-t border-[#edf0ed] pt-5">
              {field(
                "Cover image",
                <input
                  className={`${fieldClass} file:mr-3 file:rounded file:border-0 file:bg-[#e9eee8] file:px-3 file:py-2 file:font-medium file:text-[#315b40]`}
                  type="file"
                  name="cover_image"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                />,
              )}
              {field(
                "Description",
                <textarea
                  className={`${fieldClass} min-h-24 resize-y`}
                  name="description"
                  rows={4}
                  defaultValue={description}
                />,
              )}
              {field(
                "Developer information",
                <textarea
                  className={`${fieldClass} min-h-20 resize-y`}
                  name="developer_info"
                  rows={3}
                  defaultValue={developerInfo}
                />,
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                {field(
                  "Latitude",
                  <input
                    className={fieldClass}
                    name="latitude"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    defaultValue={project?.latitude ?? ""}
                  />,
                )}
                {field(
                  "Longitude",
                  <input
                    className={fieldClass}
                    name="longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    defaultValue={project?.longitude ?? ""}
                  />,
                )}
              </div>
              {field(
                "Gallery images",
                <input
                  className={`${fieldClass} file:mr-3 file:rounded file:border-0 file:bg-[#e9eee8] file:px-3 file:py-2 file:font-medium file:text-[#315b40]`}
                  type="file"
                  name="gallery_images"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                />,
              )}
              <p className="text-xs text-[#788078]">Use JPEG, PNG, WebP, or AVIF images. Combined image size must be 5 MB or less.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ebe7] pt-5">
        <p className="text-xs text-[#788078]">Plot prices can be added when importing inventory.</p>
        <Button type="submit" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}