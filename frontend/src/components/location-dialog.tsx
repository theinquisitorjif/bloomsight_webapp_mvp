import {
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from "@/components/ui/command";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const LocationDialog = ({ open, setOpen }: Props) => {
  return (
    <CommandResponsiveDialog onOpenChange={setOpen} open={open}>
      <CommandInput placeholder="Find a place to visit" />
      <CommandList>
        <CommandItem>Test</CommandItem>
      </CommandList>
    </CommandResponsiveDialog>
  );
};
