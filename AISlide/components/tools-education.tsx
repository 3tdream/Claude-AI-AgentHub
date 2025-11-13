"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ToolsEducation() {
  const AVAILABLE_TOOLS = [
    {
      name: "Get Current Slide",
      description: "Get the content of the current slide including title, description, and key points"
    },
    {
      name: "Next Slide",
      description: "Move to the next slide in the presentation",
    },
    {
      name: "Previous Slide",
      description: "Move to the previous slide in the presentation",
    },
    {
      name: "Copy to Clipboard",
      description: "Copy text to your clipboard",
    },
    {
      name: "Get Current Time",
      description: "Get the current time",
    },
    {
      name: "Update Current Slide Title",
      description: "Update the title of the current slide",
    },
    {
      name: "Update Current Slide Description",
      description: "Update the description of the current slide",
    },
    {
      name: "Update Slide Block",
      description: "Update a block's title or content in the current slide",
    },
    {
      name: "Party Mode",
      description: "Start a celebration with confetti",
    },
    {
      name: "Launch Website",
      description: "Open a website in a new tab",
    },
    {
      name: "Scrape Website",
      description: "Extract content from a website",
    },
  ] as const;

  return (
    <div className="w-full max-w-lg mt-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="tools">
          <AccordionTrigger>Available Tools</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[300px] pr-4">
              <Table>
                <TableBody>
                  {AVAILABLE_TOOLS.map((tool) => (
                    <TableRow key={tool.name}>
                      <TableCell className="font-medium">{tool.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tool.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
